import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const { tenant } = useTenant();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div style={{ backgroundColor: '#09090b', minHeight: '100vh', color: '#fafafa', fontFamily: 'sans-serif' }}>
      {/* Structural Thin-Border Header */}
      <header style={{ 
        padding: '1rem 2rem', 
        backgroundColor: '#09090b', 
        borderBottom: '1px solid #27272a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Dynamic Context Branding Brand Node */}
        <div style={{ fontWeight: '700', fontFamily: 'monospace', letterSpacing: '-0.05em' }}>
          {tenant ? (
            <span>
              {tenant.toUpperCase()}<span style={{ color: '#06b6d4' }}>_PORTAL</span>
            </span>
          ) : (
            <span>
              CORE<span style={{ color: '#a855f7' }}>_HIRE</span>
            </span>
          )}
        </div>

        {/* Dynamic Session Actions Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: '#fafafa', textDecoration: 'none' }}>⟩ explore_jobs</Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'RECRUITER' && (
                <Link to="/dashboard" style={{ color: '#06b6d4', textDecoration: 'none' }}>⟩ workspace</Link>
              )}
              <span style={{ color: '#a1a1aa' }}>({user?.email})</span>
              <button 
                onClick={logout}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontFamily: 'monospace', cursor: 'pointer', padding: 0 }}
              >
                ⟩ logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: '#a1a1aa', textDecoration: 'none' }}>⟩ login</Link>
          )}
        </nav>
      </header>
      
      {/* Standard Core Canvas Slot */}
      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {tenant && (
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#06b6d4', marginBottom: '1.5rem' }}>
            ℹ️ strictly_isolated: displaying positions registered exclusively by {tenant}.
          </div>
        )}
        
        {/* React Router's internal mounting slot for children components */}
        <Outlet />
      </main>
    </div>
  );
}