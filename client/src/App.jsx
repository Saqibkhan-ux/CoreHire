import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// 1. Structural Layout Shells (Styled to mirror openclaw.ai)
const PublicLayout = () => {
  return (
    <div style={{ backgroundColor: '#09090b', minHeight: '100vh', color: '#fafafa' }}>
      {/* Crisp, thin border navbar without blurry drop shadows */}
      <header style={{ 
        padding: '1rem 2rem', 
        backgroundColor: '#09090b', 
        borderBottom: '1px solid #27272a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: '700', letterSpacing: '-0.05em', fontFamily: 'monospace' }}>
          CLAW<span style={{ color: '#06b6d4' }}>_BOARD</span>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: '#fafafa', textDecoration: 'none' }}>⟩ explore</Link>
          <Link to="/login" style={{ color: '#a1a1aa', textDecoration: 'none' }}>⟩ login</Link>
        </nav>
      </header>
      
      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Your actual page content will render here */}
        <div style={{ border: '1px dashed #27272a', padding: '2rem', borderRadius: '6px' }}>
          Public Layout Connected (Dark Theme Active)
        </div>
      </main>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa' }}>
      {/* Internal Recruiter Command Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#09090b', 
        borderRight: '1px solid #27272a', 
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontWeight: '700', fontFamily: 'monospace', marginBottom: '2.5rem' }}>
          ⚙️ CONSOLE
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <span style={{ color: '#06b6d4', cursor: 'pointer' }}>📁 active_positions</span>
          <span style={{ color: '#a1a1aa', cursor: 'pointer' }}>📥 applications</span>
          <span style={{ color: '#a1a1aa', cursor: 'pointer' }}>➕ post_job</span>
        </nav>
      </aside>
      
      <main style={{ flex: 1, padding: '3rem', backgroundColor: '#09090b' }}>
        <div style={{ border: '1px dashed #27272a', padding: '2rem', borderRadius: '6px' }}>
          Recruiter Workspace Dashboard (Dark Theme Active)
        </div>
      </main>
    </div>
  );
};

// 2. Feature Component Views (Placeholders)
const JobExplorer = () => <div><h3>🔍 Open Jobs Engine</h3></div>;
const AuthPage = () => <div><h3>🔑 Gateway Portal</h3></div>;
const RecruiterConsole = () => <div><h3>📊 Management Overview</h3></div>;

// 3. Routing Map Blueprint (Unchanged Logic, Themed Shells)
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<JobExplorer />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
      </Route>

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<RecruiterConsole />} />
      </Route>

      <Route path="/404" element={
        <div style={{ padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#09090b', color: '#fafafa', height: '100vh' }}>
          <h2 style={{ fontFamily: 'monospace', color: '#ef4444' }}>404 // WORKSPACE_NOT_FOUND</h2>
        </div>
      } />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}