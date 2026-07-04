import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';

export default function DashboardLayout() {
  const { user, isAuthenticated } = useAuth();
  const { tenant } = useTenant();

  // Security Intercept Loop: Verify structural access levels instantly
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'RECRUITER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa' }}>
      {/* Cyberpunk Workspace Sidebar Panel */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#09090b', 
        borderRight: '1px solid #27272a', 
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontWeight: '700', fontFamily: 'monospace', color: '#a855f7', marginBottom: '0.25rem' }}>
            ⚙️ CORE_CONSOLE
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '2.5rem' }}>
            scope: {tenant || 'global_root'}
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <Link to="/dashboard" style={{ color: '#06b6d4', textDecoration: 'none' }}>📁 active_listings</Link>
            <span style={{ color: '#a1a1aa', cursor: 'not-allowed' }}>📥 applications (0)</span>
            <span style={{ color: '#a1a1aa', cursor: 'not-allowed' }}>➕ post_new_job</span>
          </nav>
        </div>

        {/* Bottom Utility Profile Section */}
        <div style={{ borderTop: '1px solid #27272a', paddingTop: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          <div style={{ color: '#fafafa', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
          <Link to="/" style={{ color: '#ef4444', textDecoration: 'none', display: 'block', marginTop: '0.5rem' }}>
            ⟵ exit_console
          </Link>
        </div>
      </aside>
      
      {/* Primary Management View Workstation */}
      <main style={{ flex: 1, padding: '3rem', backgroundColor: '#09090b', overflowY: 'auto' }}>
        {/* Child features (like RecruiterConsole) inject their UI states cleanly here */}
        <Outlet />
      </main>
    </div>
  );
}