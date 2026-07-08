import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js'; 

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Cryptographically verify the password against the database hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Mint the JSON Web Token (JWT) with the required multi-tenant payload
    const token = jwt.sign(
      { 
        userId: user.id, 
        tenantId: user.tenantId, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'corehire_super_secret_cyber_key_2026', // Bulletproof fallback
      { expiresIn: '24h' }
    );

    // 4. Strip the password hash out of the user object before sending it to the frontend
    const { passwordHash, ...safeUserData } = user;

    // 5. Send the successful payload back to the React UI
    return res.status(200).json({
      token,
      user: safeUserData
    });

  } catch (error) {
    console.error('CRITICAL LOGIN FAILURE:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};