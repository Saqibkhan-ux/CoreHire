// server/src/middleware/tenant.js
import { prisma } from '../config/prisma.js';
export const tenantMiddleware = async (req, res, next) => {
  // Skip tenant middleware for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    // 1. Check for explicit header first (useful for API testing/mobile clients)
    let tenantIdentifier = req.headers['x-tenant-id'];

    // 2. If no header, extract subdomain from browser hostname (e.g., stripe.localhost)
    if (!tenantIdentifier) {
      const host = req.hostname || req.headers.host || '';
      const parts = host.split('.');
      
      // If hostname has subdomains (and isn't just 'localhost' or an IP)
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'api') {
        tenantIdentifier = parts[0];
      }
    }

    // 3. Global Root Fallback: If browsing globally, proceed without scoping
    if (!tenantIdentifier || tenantIdentifier === 'localhost' || tenantIdentifier === '127') {
      req.tenant = null;
      req.tenantId = null;
      return next();
    }

    // 4. Validate tenant existence against PostgreSQL
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantIdentifier.toLowerCase() }
    });

    if (!tenant) {
      return res.status(404).json({
        status: 'CONTEXT_NOT_FOUND',
        error: `Tenant workspace '${tenantIdentifier}' does not exist in CoreHire index.`
      });
    }

    // 5. Attach verified tenant context to the request pipeline
    req.tenant = tenant;
    req.tenantId = tenant.id;
    next();
  } catch (error) {
    console.error('CoreHire Tenant Resolution Error:', error);
    res.status(500).json({ error: 'Internal system error during tenant resolution.' });
  }
};