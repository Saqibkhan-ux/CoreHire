import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  // 1. Intercept the Authorization Header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED: Missing or invalid token' });
  }

  // 2. Extract the physical token string
  const token = authHeader.split(' ')[1];

  try {
    // 3. Cryptographically verify the signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'corehire_super_secret_cyber_key_2026');
    
    // 4. Attach the decoded payload (userId, tenantId, role) to the request
    req.user = decoded; 
    
    // 5. Grant Access: Pass control to the controller
    next(); 
  } catch (err) {
    return res.status(403).json({ error: 'FORBIDDEN: Token expired or tampered with' });
  }
};