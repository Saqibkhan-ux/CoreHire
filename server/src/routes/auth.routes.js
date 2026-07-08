import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import Redis from 'ioredis';

const router = express.Router();

// Lazy Redis initialization with error handling
let redis = null;
const initRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    redis.on('error', (err) => {
      console.warn('[Redis] Connection warning (logout functionality may be limited):', err.message);
    });
    
    redis.on('connect', () => {
      console.log('[Redis] Successfully connected');
    });
  }
  return redis;
};

// In production, this must be stored in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'corehire_super_secret_cyber_key_2026';

/**
 * @route   POST /api/auth/register
 * @desc    Hashes password and provisions a new identity in Postgres.
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const tenantId = req.tenantId; // Injected by tenant middleware

    // 1. Verify identity uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Identity already exists in system.' });
    }

    // 2. Cryptographic Stage: Hash the password with bcrypt salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Provision database record
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'CANDIDATE',
        tenantId
      }
    });

    res.status(201).json({ status: 'success', message: 'Identity provisioned successfully.' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to provision identity.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Validates hashes, scopes tenant access, issues JWT.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Locate User Entity
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    // 2. Cryptographic Validation
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials.' });

    // 4. Generate Signed JWT Session Footprint
    const token = jwt.sign(
      { userId: user.id, role: user.role, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      status: 'success',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Authentication engine failure.' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Distributed Revocation: Injects the token signature into the Redis Blacklist.
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      
      // Calculate remaining time until token naturally expires
      if (decoded && decoded.exp) {
         const ttl = decoded.exp - Math.floor(Date.now() / 1000);
         
         // Push to Redis RAM for sub-millisecond blacklist checks on future requests
         if (ttl > 0) {
            try {
              const redisClient = initRedis();
              await redisClient.setex(`blacklist:${token}`, ttl, 'revoked');
            } catch (redisErr) {
              console.warn('[Redis] Blacklist failed, but logout proceeding:', redisErr.message);
            }
         }
      }
    }
    
    res.status(200).json({ status: 'success', message: 'Session securely terminated.' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Failed to blacklist session.' });
  }
});

export default router;