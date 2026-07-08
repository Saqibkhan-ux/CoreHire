import express from 'express';
import { JobService } from '../services/job.service.js';

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
router.post('/', async (req, res) => {
  try {
    const jobData = req.body;

    // Security Gate: Ensure a recruiter is operating within a specific corporate workspace
    if (!req.tenantId) {
      return res.status(403).json({ 
        error: 'WORKSPACE_ERROR: Cannot publish jobs outside a dedicated tenant boundary.' 
      });
    }

    // Execute the Dual-Write Pattern via our service
    const newJob = await JobService.createJob(jobData, req.tenantId);
    
    res.status(201).json({ status: 'success', data: newJob });
  } catch (error) {
    console.error('Dual-Write Execution Failed:', error);
    res.status(500).json({ error: 'Failed to execute Dual-Write job creation.' });
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