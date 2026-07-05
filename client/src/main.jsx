import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Core Application Entry Nodes
import App from './App';

// Custom Multi-Tenant State Context Providers
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';

// Global styles index link
import './index.css';

// Initialize the master caching layer client config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive background re-fetching on tab switches
      retry: 1,                    // Limit retries on network dropouts to look clean
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Layer 1: Server Caching Engine */}
    <QueryClientProvider client={queryClient}>
      {/* Layer 2: Browser History Routing Context */}
      <BrowserRouter>
        {/* Layer 3: Dynamic Subdomain Interceptor Context */}
        <TenantProvider>
          {/* Layer 4: Corporate Identity Access State Gate */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);