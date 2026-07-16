import express from 'express';
import multer from 'multer'; // 1. Import multer
import { JobService } from '../services/job.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { prisma } from '../config/prisma.js';

const router = express.Router();

// 2. Configure Multer (save files to the 'uploads/' directory)
const upload = multer({ dest: 'uploads/' });

/**
 * @route   GET /api/jobs
 * @desc    Fast Read Path
 */
router.get('/', async (req, res) => {
  try {
    const { query, location, minSalary } = req.query;
    const jobs = await JobService.searchJobs({
      query,
      location,
      minSalary,
      tenantId: req.tenantId
    });
    res.status(200).json({ status: 'success', data: jobs });
  } catch (error) {
    console.error('Job Search Execution Failed:', error);
    res.status(500).json({ error: 'Search execution failed.' });
  }
});

/**
 * @route   POST /api/jobs
 * @desc    Write Path
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const jobData = req.body;
    const verifiedTenantId = req.user.tenantId;

    if (!verifiedTenantId) {
      return res.status(403).json({ 
        error: 'WORKSPACE_ERROR: Cannot publish jobs outside a dedicated tenant boundary.' 
      });
    }

    const newJob = await JobService.createJob(jobData, verifiedTenantId);
    res.status(201).json({ status: 'success', data: newJob });
  } catch (error) {
    console.error('🔴 DATABASE_CRASH_FULL_DETAILS:', error);
    res.status(500).json({ error: 'CRASH: ' + error.message });
  }
});

/**
 * @route   PUT /api/jobs/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const jobData = req.body;
    const verifiedTenantId = req.user.tenantId;

    if (!verifiedTenantId) {
      return res.status(403).json({ error: 'WORKSPACE_ERROR: Cannot update jobs outside a dedicated tenant boundary.' });
    }

    const updatedJob = await JobService.updateJob(req.params.id, jobData, verifiedTenantId);
    res.status(200).json({ status: 'success', data: updatedJob });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job.' });
  }
});

/**
 * @route   GET /api/jobs/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await JobService.getJobById(req.params.id, req.tenantId);
    if (!job) return res.status(404).json({ error: 'Job not found in this workspace.' });
    res.status(200).json({ status: 'success', data: job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job details.' });
  }
});

/**
 * @route   POST /api/jobs/:jobId/apply
 * @desc    Candidate submits application with file upload
 * @access  Protected (Candidate)
 */
// 3. Inject `upload.single('resume')` middleware
router.post('/:jobId/apply', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    
    // Extract ID from the JWT decoded payload
    const verifiedUserId = req.user.userId; 

    // Safety Checks
    if (!req.file) {
      return res.status(400).json({ error: 'TRANSMISSION_FAILED: No resume file uploaded.' });
    }
    if (!verifiedUserId) {
      return res.status(401).json({ error: 'AUTH_ERROR: Candidate identity missing from token.' });
    }

    // 1. Check if the candidate has already applied for this specific job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        userId: verifiedUserId,
      },
    });

    // 2. If an application exists, reject the request to prevent duplicates
    if (existingApplication) {
      return res.status(409).json({ error: 'DUPLICATE_ENTRY: You have already applied for this position.' });
    }

    // req.file.path contains the local path to the saved file in /uploads
    const resumePath = req.file.path;

    // 3. Inject the clean payload into PostgreSQL
    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobId,
        userId: verifiedUserId,
        resume: resumePath, 
        coverLetter: coverLetter || '',
      },
    });

    res.status(201).json({ 
      status: 'success', 
      message: "✅ Application successfully injected into the matrix.", 
      // The 'application' object is not used by the frontend and can cause serialization
      // errors. Returning only the ID is safer and avoids potential crashes.
      applicationId: application.id
    });
    
  } catch (error) {
    console.error("🔴 APPLICATION_CRASH:", error);
    res.status(500).json({ error: "System failure during application submission." });
  }
});

export default router;