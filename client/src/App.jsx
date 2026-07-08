import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RecruiterConsole from './features/jobs/components/RecruiterConsole';

// Layout Canvas Ingress Wrappers
import PublicLayout from './routes/PublicLayout';
import DashboardLayout from './routes/DashboardLayout';

// Standalone Functional Core Feature Views
import JobExplorer from './features/jobs/components/JobExplorer';
import AuthPage from './features/auth/AuthPage';




export default function App() {
  return (
    <Routes>
      {/* Public Candidate Access Pipeline */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<JobExplorer />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
      </Route>

      {/* Private Workspace Recruiter Console (Protected Access) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<RecruiterConsole />} />
      </Route>

      {/* Fallback Catch-All Route */}
      <Route path="/404" element={
        <div style={{ padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#09090b', color: '#fafafa', height: '100vh' }}>
          <h2 style={{ fontFamily: 'monospace', color: '#ef4444', margin: 0 }}>404 // CONTEXT_NOT_FOUND</h2>
          <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>The requested tenant domain pathway does not exist.</p>
        </div>
      } />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}