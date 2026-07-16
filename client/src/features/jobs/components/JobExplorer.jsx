import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function JobExplorer() {
  // --- STATE MANAGEMENT ---
  const [jobs, setJobs] = useState([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Injection Form State
  const [jobForm, setJobForm] = useState({ title: '', salary: '', location: '', description: '' });
  const [isInjecting, setIsInjecting] = useState(false);

  // Edit Job State
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', salary: '', location: '', description: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // --- 1. THE COMMAND LOG STATE ---
  const [logs, setLogs] = useState([
    { id: 1, text: 'corehire_os v1.0.4 initialized.', type: 'system' },
    { id: 2, text: 'Connected to primary database cluster.', type: 'system' },
    { id: 3, text: 'Awaiting recruiter input...', type: 'info' }
  ]);
  const logEndRef = useRef(null);

  // Helper to push new logs to the terminal UI
  const printLog = (text, type = 'info') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  // Auto-scroll to the newest log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchDeployments();
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('corehire_jwt');
    return { 
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true // Synchronize with AuthContext's login method for CORS
    };
  };

  const normalizeSalaryInput = (salary) => {
    if (!salary) return null;
    const digitsOnly = salary.toString().replace(/[^0-9]/g, '');
    return digitsOnly ? parseInt(digitsOnly, 10) : null;
  };

  const formatSalaryOutput = (salaryValue) => {
    if (salaryValue == null || salaryValue === '') return 'N/A';
    const numeric = typeof salaryValue === 'string' ? normalizeSalaryInput(salaryValue) : salaryValue;
    return numeric == null ? 'N/A' : new Intl.NumberFormat('en-IN').format(numeric);
  };

  // --- GET: FETCH / SEARCH JOBS (ELASTICSEARCH) ---
  const fetchDeployments = async (query = '') => {
    setIsSearching(true);
    
    if (query) {
      printLog(`> grep --search "${query}"`, 'command');
      printLog('Executing sub-millisecond Elasticsearch query...', 'info');
    }

    try {
      const config = getAuthConfig();
      if (query) config.params = { query: query };

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/jobs`, config);
      setJobs(response.data.data || response.data || []);
      
      if (query) printLog(`✅ Status 200: Search engine returned results.`, 'success');
      
    } catch (error) {
      printLog(`❌ FETCH_ERROR: ${error.message}`, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDeployments(searchQuery);
  };

  const startEditingJob = (job) => {
    setEditingJobId(job.id);
    setEditForm({
      title: job.title || '',
      salary: job.salary ?? job.salaryMax ?? job.salaryMin ?? '',
      location: job.location || '',
      description: job.description || ''
    });
  };

  const cancelEditing = () => {
    setEditingJobId(null);
    setEditForm({ title: '', salary: '', location: '', description: '' });
  };

  const handleEditSave = async () => {
    if (!editForm.title || !editForm.salary || !editForm.location || !editForm.description) {
      printLog('❌ SYSTEM_WARNING: All fields are required to save an edit.', 'error');
      return;
    }

    printLog(`> Executing PUT update on Job ID: ${editingJobId.substring(0,8)}...`, 'command');
    setIsSavingEdit(true);
    
    try {
      const config = getAuthConfig();
      if (!config.headers.Authorization.includes('Bearer ey')) {
        printLog('❌ ACCESS_DENIED: No valid JWT found.', 'error');
        setIsSavingEdit(false);
        return;
      }

      const normalizedSalary = normalizeSalaryInput(editForm.salary);
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/${editingJobId}`, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        salaryMin: normalizedSalary,
        salaryMax: normalizedSalary
      }, config);

      printLog('✅ Status 200: Job deployment successfully updated.', 'success');
      cancelEditing();
      await fetchDeployments();
    } catch (error) {
      printLog(`❌ EDIT_FAILED: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- POST: DUAL-WRITE INJECTION (POSTGRES + ELASTIC) ---
  const handleInjectJob = async (e) => {
    e.preventDefault();
    
    if (!jobForm.title || !jobForm.salary || !jobForm.location || !jobForm.description) {
      printLog("❌ SYSTEM_WARNING: All payload fields must be populated.", "error");
      return;
    }

    printLog('> Executing [POSTGRES_UPLINK] payload...', 'command');
    printLog('Authenticating JWT Gatekeeper...', 'info');
    setIsInjecting(true);
    
    try {
      const config = getAuthConfig();
      if (!config.headers.Authorization.includes('Bearer ey')) {
        printLog("❌ ACCESS_DENIED: No valid JWT found.", "error");
        setIsInjecting(false);
        return; 
      }

      const normalizedSalary = normalizeSalaryInput(jobForm.salary);
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/jobs`, {
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        salaryMin: normalizedSalary,
        salaryMax: normalizedSalary
      }, config);
      
      printLog('✅ Status 201: Dual-Write Complete. Payload Injected.', 'success');
      
      setJobForm({ title: '', salary: '', location: '', description: '' });
      await fetchDeployments();

    } catch (error) {
      printLog(`❌ DATABASE_CRASH: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>// ACTIVE_DEPLOYMENTS</h1>
          <p style={styles.subtitle}>Execute queries against the indexed job matrix.</p>
        </div>
      </div>

      {/* MODULE A: DUAL-WRITE INJECTION PANEL */}
      <form onSubmit={handleInjectJob} style={styles.injectionConsole}>
        <span style={styles.prompt}>[POSTGRES_UPLINK]</span>
        <input type="text" placeholder="Job Title" style={styles.formInput} value={jobForm.title} onChange={(e) => setJobForm({...jobForm, title: e.target.value})} />
        <input type="text" placeholder="Compensation" style={styles.formInput} value={jobForm.salary} onChange={(e) => setJobForm({...jobForm, salary: e.target.value})} />
        <input type="text" placeholder="Job Location" style={styles.formInput} value={jobForm.location} onChange={(e) => setJobForm({...jobForm, location: e.target.value})} />
        <input type="text" placeholder="Job Description" style={styles.formInput} value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})} />
        <button type="submit" style={styles.createBtn} disabled={isInjecting}>
          {isInjecting ? '[ INJECTING... ]' : '+ INJECT_DATA'}
        </button>
      </form>

      {/* MODULE B: ELASTICSEARCH TERMINAL BAR */}
      <form onSubmit={handleSearch} style={styles.searchConsole}>
        <span style={styles.prompt}>{'>'} grep --search</span>
        <input type="text" placeholder='"Software Engineer"' style={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <button type="submit" style={styles.searchBtn} disabled={isSearching}>
          {isSearching ? 'SCANNING...' : 'EXECUTE'}
        </button>
      </form>

      {/* MODULE C: DATA GRID */}
      <div style={jobs.length === 0 ? styles.gridEmpty : styles.gridPopulated}>
        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>[ NO_DATA_FOUND: 0 EXECUTING DEPLOYMENTS ]</p>
            <p style={{ color: '#565f89', fontSize: '0.85rem', marginTop: '8px' }}>
              Awaiting data injection from recruiter or adjust search parameters...
            </p>
          </div>
        ) : (
          jobs.map((job, index) => (
            <div key={job.id || index} style={styles.jobCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <span style={styles.jobId}>ID: {job.id?.substring(0,8) || 'SYS_01'}</span>
              </div>
              <div style={styles.cardBody}>
                <p><strong>[COMP_PACKAGE]:</strong> {formatSalaryOutput(job.salary ?? job.salaryMax ?? job.salaryMin)}</p>
                <p><strong>[NODE_LOC]:</strong> {job.location}</p>
              </div>
              <div style={styles.cardFooter}>
                <span style={styles.statusBadge}>STATUS: ACTIVE</span>
                <div style={styles.editActions}>
                  <button style={styles.editBtn} onClick={() => startEditingJob(job)}>EDIT</button>
                </div>
              </div>
              
              {/* EDIT PANEL EXPANSION */}
              {editingJobId === job.id && (
                <div style={styles.editPanel}>
                  <input type="text" placeholder="Job Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={styles.formInput} />
                  <input type="text" placeholder="Compensation" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} style={styles.formInput} />
                  <input type="text" placeholder="Job Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} style={styles.formInput} />
                  <input type="text" placeholder="Job Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={styles.formInput} />
                  <div style={styles.editPanelActions}>
                    <button style={styles.saveBtn} onClick={handleEditSave} disabled={isSavingEdit}>
                      {isSavingEdit ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button style={styles.cancelBtn} onClick={cancelEditing} disabled={isSavingEdit}>CANCEL</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 2. MODULE D: THE NEW COMMAND LOG TERMINAL */}
      <div style={styles.terminalBox}>
        {logs.map((log) => (
          <div key={log.id} style={{ 
            color: log.type === 'command' ? '#ffffff' : 
                   log.type === 'success' ? '#00ffcc' : 
                   log.type === 'error' ? '#ff3333' : '#888888',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            {log.text}
          </div>
        ))}
        <div ref={logEndRef} /> {/* Auto-scroll target */}
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
    marginBottom: '24px',
  },
  title: {
    color: 'var(--accent-dark)',
    fontSize: '1.75rem',
    margin: '0 0 8px 0',
    fontWeight: '700',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    margin: 0,
  },
  injectionConsole: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderLeft: '4px solid var(--accent-green)',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    borderRadius: '18px',
    boxShadow: '0 18px 55px rgba(22, 43, 23, 0.08)'
  },
  formInput: {
    flex: 1,
    minWidth: '150px',
    backgroundColor: '#f8fbf4',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    outline: 'none',
    padding: '12px 14px'
  },
  createBtn: {
    backgroundColor: 'var(--accent-green)',
    border: 'none',
    color: '#ffffff',
    padding: '12px 20px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.2s',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(31, 185, 112, 0.18)'
  },
  searchConsole: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
    borderRadius: '18px',
    boxShadow: '0 10px 30px rgba(22, 43, 23, 0.06)'
  },
  prompt: {
    color: 'var(--accent-dark)',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8fbf4',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    padding: '12px 14px'
  },
  searchBtn: {
    backgroundColor: 'var(--accent-dark)',
    border: 'none',
    color: '#ffffff',
    padding: '10px 18px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    borderRadius: '12px',
  },
  editActions: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  editBtn: {
    backgroundColor: 'var(--accent-green)',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '10px',
  },
  editPanel: {
    marginTop: '16px',
    padding: '20px',
    backgroundColor: 'var(--bg-surface-alt)',
    border: '1px solid var(--border-subtle)',
    display: 'grid',
    gap: '14px',
    borderRadius: '18px'
  },
  editPanelActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px'
  },
  saveBtn: {
    backgroundColor: 'var(--accent-green)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '10px',
  },
  cancelBtn: {
    backgroundColor: '#c13a3a',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '10px',
  },
  gridEmpty: {
    border: '1px dashed var(--border-subtle)',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 185, 112, 0.08)',
    borderRadius: '18px'
  },
  gridPopulated: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--accent-dark)', 
  },
  jobCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderLeft: '4px solid var(--accent-green)',
    borderRadius: '18px',
    boxShadow: '0 20px 45px rgba(22, 43, 23, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  jobTitle: {
    color: 'var(--text-primary)',
    fontSize: '1.2rem',
    margin: 0,
  },
  jobId: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  cardBody: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    lineHeight: '1.7',
    marginBottom: '18px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    backgroundColor: 'rgba(31, 185, 112, 0.14)',
    color: 'var(--accent-dark)',
    padding: '6px 10px',
    fontSize: '0.75rem',
    borderRadius: '999px',
  },
  // --- THE NEW TERMINAL STYLES ---
  terminalBox: {
    height: '200px',
    backgroundColor: '#050508', // Deep void black
    border: '1px solid #1a1a2e',
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderRadius: '12px',
    marginTop: '40px', // Space between grid and terminal
    boxShadow: 'inset 0 0 20px rgba(0,255,204,0.03)'
  }
};