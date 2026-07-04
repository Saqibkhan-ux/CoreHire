import React, { createContext, useContext, useState, useEffect } from 'react';

// Initialize the Tenant Context
const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract the active host string from the window's global address space
    const hostname = window.location.hostname; // e.g., "stripe.localhost" or "google.jobboard.com"
    const parts = hostname.split('.'); // Split string using period array delimiters
    
    let detectedTenant = null;

    // Subdomain evaluation logic for local development and production environments
    if (parts.length > 1) {
      // Internal validation check: Ignore generic "www" subdomains
      if (parts[0] !== 'www') {
        // If testing locally (e.g., "stripe.localhost"), the first index element represents the tenant slug
        // If in production (e.g., "stripe.corehire.com"), parts.length will be 3, isolating parts[0]
        detectedTenant = parts[0];
      }
    }

    // Set the state context or revert to null if it's a global root access stream
    setTenant(detectedTenant);
    setLoading(false);
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {!loading && children}
    </TenantContext.Provider>
  );
};

// Highly accessible custom hook to fetch tenant scope contexts down the tree instantly
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be executed inside a valid TenantProvider layout wrapper');
  }
  return context;
};