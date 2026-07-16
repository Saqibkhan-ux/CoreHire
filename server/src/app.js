// server/src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tenantMiddleware } from './middleware/tenant.js';
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';

dotenv.config();

const app = express();

// 1. Global Security & Gateway Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'http://stripe.localhost:5173' // <-- Add your tenant subdomains!
    // 'http://10.197.247.82:5173' <-- Uncomment and add your IP if accessing via network
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  maxAge: 86400 // Cache preflight for 24 hours
}));
app.use(express.json());

// 2. Attach Multi-Tenant Isolation Interceptor
app.use(tenantMiddleware);


// 3. Health Check Telemetry Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    system: 'CORE_HIRE_BACKEND',
    status: 'ONLINE',
    active_tenant: req.tenant ? req.tenant.subdomain : 'GLOBAL_ROOT_MODE',
    timestamp: new Date().toISOString()
  });
});

// 4. API Route Mounts (We will link these next!)
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// 5. Global 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not recognized by CoreHire Gateway.' });
});

export default app;