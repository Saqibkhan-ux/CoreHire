import express from 'express';
import { JobService } from '../services/job.service.js';
import { requireAuth } from '../middleware/auth.middleware.js'; // <-- 1. Import the JWT Gatekeeper


const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    Fast Read Path: Queries Elasticsearch strictly scoped to the tenant.
 * @access  Public (Candidate) or Recruiter
 */
router.get('/', async (req, res) => {
  try {
    const { query, location, minSalary } = req.query;
    
    // req.tenantId is automatically injected by our tenantMiddleware in app.js
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
 * @desc    Write Path: Dual-Writes to PostgreSQL and Elasticsearch.
 * @access  Protected (Recruiter only)
 */
// 👇 2. Inject `requireAuth` right here!
console.log("DEBUG_TRACE: Checking JobService status...");
console.log("JobService value is:", JobService);
router.post('/', requireAuth, async (req, res) => {
  try {
    const jobData = req.body;

    // 3. Security Gate: Extract the tenantId directly from the verified JWT payload
    const verifiedTenantId = req.user.tenantId;

    if (!verifiedTenantId) {
      return res.status(403).json({ 
        error: 'WORKSPACE_ERROR: Cannot publish jobs outside a dedicated tenant boundary.' 
      });
    }

    // Execute the Dual-Write Pattern via our service
    const newJob = await JobService.createJob(jobData, verifiedTenantId);
    
    res.status(201).json({ status: 'success', data: newJob });
  } catch (error) {
    console.error('🔴 DATABASE_CRASH_FULL_DETAILS:', error);
    const errorMessage = error.message || JSON.stringify(error);
    if (errorMessage.includes('description') || errorMessage.includes('required')) {
      return res.status(400).json({ error: 'INVALID_PAYLOAD: description is required.' });
    }
    res.status(500).json({ error: 'CRASH: ' + errorMessage });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update an existing job scoped to the active tenant.
 * @access  Protected (Recruiter only)
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
    console.error('Job Update Failed:', error);
    const errorMessage = error.message || JSON.stringify(error);
    if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
      return res.status(404).json({ error: 'Job not found or access denied.' });
    }
    res.status(500).json({ error: 'Failed to update job.' });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Fetches specific job details scoped to the active tenant.
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await JobService.getJobById(req.params.id, req.tenantId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found in this workspace.' });
    }

    res.status(200).json({ status: 'success', data: job });
  } catch (error) {
    console.error('Job Fetch Failed:', error);
    res.status(500).json({ error: 'Failed to fetch job details.' });
  }
});

export default router;