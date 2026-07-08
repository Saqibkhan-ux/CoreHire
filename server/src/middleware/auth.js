import jwt from 'jsonwebtoken';
import Redis from 'ioredis';

// Connect to the local Redis container running in your Docker Bridge Network
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Must match the secret used in auth.routes.js
const JWT_SECRET = process.env.JWT_SECRET || 'corehire_super_secret_cyber_key_2026';

export const authGuard = async (req, res, next) => {
  try {
    // 1. Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'ACCESS_DENIED: Missing or invalid authorization token.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the cryptographic signature of the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Distributed Session Check: Query Redis for token revocation (Blacklist)
    // Because Redis lives in RAM, this check takes <1 millisecond
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ 
        error: 'SESSION_REVOKED: This authentication token has been terminated.' 
      });
    }

    // 4. Attach the verified user payload to the request pipeline
    req.user = decoded;
    
    // Proceed to the next middleware or controller
    next();
  } catch (error) {
    console.error('[Auth Guard] Security interception:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED: Session has timed out.' });
    }
    
    res.status(401).json({ error: 'UNAUTHORIZED: Invalid session token.' });
  }
};