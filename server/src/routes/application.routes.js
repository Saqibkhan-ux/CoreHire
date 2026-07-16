import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { prisma } from '../config/prisma.js';

const router = express.Router();

/**
 * @route   GET /api/applications/me
 * @desc    Fetches all job applications for the currently authenticated user.
 * @access  Protected
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const verifiedUserId = req.user.userId;

    if (!verifiedUserId) {
      return res.status(401).json({ error: 'AUTH_ERROR: User identity not found in token.' });
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        userId: verifiedUserId,
      },
      include: {
        job: true, // Include the full job details for each application
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ status: 'success', data: applications });
  } catch (error) {
    console.error("🔴 FAILED_TO_FETCH_APPLICATIONS:", error);
    res.status(500).json({ error: 'System failure while fetching user applications.' });
  }
});

export default router;