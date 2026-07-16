import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RecruiterConsole from './features/jobs/components/RecruiterConsole';

// Layout Canvas Ingress Wrappers
import PublicLayout from './routes/PublicLayout';
import DashboardLayout from './routes/DashboardLayout';

// Standalone Functional Core Feature Views
import JobExplorer from './features/jobs/components/JobExplorer';
import PublicJobBoard from './features/jobs/components/PublicJobBoard'; // <-- 1. Successfully Imported!
import MyApplicationsPage from './features/applications/components/MyApplicationsPage';
import AuthPage from './features/auth/AuthPage';

// Route protection utility
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public Candidate Access Pipeline */}
      <Route path="/" element={<PublicLayout />}>
        
        {/* 👇 2. THIS IS THE FIX: The public index now loads the PublicJobBoard! */}
        <Route index element={<PublicJobBoard />} />
        
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />

        {/* 👇 Add a protected route for candidates to see their applications */}
        <Route element={<ProtectedRoute />}>
          <Route path="my-applications" element={<MyApplicationsPage />} />
        </Route>
      </Route>

      {/* --- Protected Recruiter Routes --- */}
      {/* This route acts as a guard. It will only render its children (the Outlet) 
          if the user is an authenticated RECRUITER. */}
      <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default route when clicking Dashboard */}
          <Route index element={<RecruiterConsole />} />
          {/* Recruiter Terminal UI */}
          <Route path="jobs" element={<JobExplorer />} />
        </Route>
      </Route>

      {/* Fallback Catch-All Route */}
      <Route path="/404" element={
        <div style={{ padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#050508', color: '#fff', height: '100vh' }}>
          <div style={{ display: 'inline-block', maxWidth: '640px', backgroundColor: '#0a0a0f', padding: '3rem', borderRadius: '12px', border: '1px solid #1a1a2e', boxShadow: '0 0 20px rgba(0,255,204,0.1)' }}>
            <h2 style={{ fontFamily: 'monospace', color: '#ff3333', margin: 0, fontSize: '2rem' }}>404 // CONTEXT_NOT_FOUND</h2>
            <p style={{ color: '#888', marginTop: '1rem', fontSize: '1rem' }}>The requested pathway does not exist.</p>
          </div>
        </div>
      } />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}