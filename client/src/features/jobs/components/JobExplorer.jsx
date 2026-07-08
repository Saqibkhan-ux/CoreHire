import { useState } from 'react';

export default function JobExplorer() {
  // We will connect this to your Node.js backend shortly!
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>// ACTIVE_DEPLOYMENTS</h1>
          <p style={styles.subtitle}>Execute queries against the indexed job matrix.</p>
        </div>
        <button style={styles.createBtn}>+ INJECT_NEW_JOB</button>
      </div>

      {/* TERMINAL SEARCH BAR */}
      <div style={styles.searchConsole}>
        <span style={styles.prompt}>{'>'} grep --search</span>
        <input 
          type="text" 
          placeholder='"Software Engineer"'
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* DATA GRID */}
      <div style={styles.grid}>
        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>[ NO_DATA_FOUND: 0 EXECUTING DEPLOYMENTS ]</p>
            <p style={{ color: '#565f89', fontSize: '0.85rem', marginTop: '8px' }}>
              Awaiting data injection from recruiter...
            </p>
          </div>
        ) : (
          // Job Cards will map here in the next step
          <div>Data loaded...</div>
        )}
      </div>
    </div>
  );
}

// --- OPENCLAW STYLING DICTIONARY ---
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  title: {
    color: '#fff',
    fontSize: '1.5rem',
    margin: '0 0 8px 0',
    fontWeight: 'normal',
  },
  subtitle: {
    color: '#565f89',
    fontSize: '0.9rem',
    margin: 0,
  },
  createBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #00ff41',
    color: '#00ff41',
    padding: '10px 20px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.2s',
  },
  searchConsole: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #1a1b26',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  prompt: {
    color: '#ff007c',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#7aa2f7',
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
  },
  grid: {
    border: '1px dashed #1a1b26',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.5)',
  },
  emptyState: {
    textAlign: 'center',
    color: '#ff9e64', // Warning Orange
  }
};