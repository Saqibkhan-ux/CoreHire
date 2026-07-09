import { useState, useEffect } from 'react';
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

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchDeployments();
  }, []);

  // Helper to attach the cryptographic token to every request
  const getAuthConfig = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('corehire_jwt');
    return {
      headers: { Authorization: `Bearer ${token}` }
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
    try {
      const config = getAuthConfig();
      // If a query exists, pass it as a URL parameter to hit the Elasticsearch filter
      if (query) {
        config.params = { search: query };
      }

      const response = await axios.get('http://127.0.0.1:3000/api/jobs', config);
      // Ensure we map the response correctly based on your backend structure
      setJobs(response.data.data || response.data || []);
    } catch (error) {
      console.error('FETCH_ERROR:', error);
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
      alert('SYSTEM_WARNING: All fields are required to save an edit.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const config = getAuthConfig();
      if (!config.headers.Authorization.includes('Bearer ey')) {
        alert('ACCESS_DENIED: No valid local token found. Are you logged in?');
        setIsSavingEdit(false);
        return;
      }

      const normalizedSalary = normalizeSalaryInput(editForm.salary);
      await axios.put(`http://127.0.0.1:3000/api/jobs/${editingJobId}`, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        salaryMin: normalizedSalary,
        salaryMax: normalizedSalary
      }, config);

      cancelEditing();
      await fetchDeployments();
    } catch (error) {
      console.error('EDIT_SAVE_FAILED:', error);
      alert('EDIT_FAILED: ' + (error.response?.data?.error || 'Unknown Error'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- POST: DUAL-WRITE INJECTION (POSTGRES + ELASTIC) ---
  const handleInjectJob = async (e) => {
    e.preventDefault();
    
    if (!jobForm.title || !jobForm.salary || !jobForm.location || !jobForm.description) {
      alert("SYSTEM_WARNING: All payload fields must be populated.");
      return;
    }

    setIsInjecting(true);
    try {
      const config = getAuthConfig();
      if (!config.headers.Authorization.includes('Bearer ey')) {
        alert("ACCESS_DENIED: No valid local token found. Are you logged in?");
        setIsInjecting(false);
        return; 
      }

      // Execute Dual-Write using the dynamic form state
      const normalizedSalary = normalizeSalaryInput(jobForm.salary);
      await axios.post('http://127.0.0.1:3000/api/jobs', {
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        salaryMin: normalizedSalary,
        salaryMax: normalizedSalary
      }, config);
      
      // Clear the form and refresh the grid immediately
      setJobForm({ title: '', salary: '', location: '', description: '' });
      await fetchDeployments();

    } catch (error) {
      console.error('INJECTION_FAILED:', error);
      alert('ACCESS_DENIED: ' + (error.response?.data?.error || 'Unknown Error'));
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
        <input 
          type="text" 
          placeholder="Job Title"
          style={styles.formInput}
          value={jobForm.title}
          onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Compensation"
          style={styles.formInput}
          value={jobForm.salary}
          onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Job Location"
          style={styles.formInput}
          value={jobForm.location}
          onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Job Description"
          style={styles.formInput}
          value={jobForm.description}
          onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
        />
        <button 
          type="submit"
          style={styles.createBtn} 
          disabled={isInjecting}
        >
          {isInjecting ? '[ INJECTING... ]' : '+ INJECT_DATA'}
        </button>
      </form>

      {/* MODULE B: ELASTICSEARCH TERMINAL BAR */}
      <form onSubmit={handleSearch} style={styles.searchConsole}>
        <span style={styles.prompt}>{'>'} grep --search</span>
        <input 
          type="text" 
          placeholder='"Software Engineer"'
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
                  <button
                    style={styles.editBtn}
                    onClick={() => startEditingJob(job)}
                  >
                    EDIT
                  </button>
                </div>
              </div>
              {editingJobId === job.id && (
                <div style={styles.editPanel}>
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Compensation"
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    style={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Job Location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    style={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Job Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={styles.formInput}
                  />
                  <div style={styles.editPanelActions}>
                    <button
                      style={styles.saveBtn}
                      onClick={handleEditSave}
                      disabled={isSavingEdit}
                    >
                      {isSavingEdit ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button
                      style={styles.cancelBtn}
                      onClick={cancelEditing}
                      disabled={isSavingEdit}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
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
    marginBottom: '24px',
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
  injectionConsole: {
    backgroundColor: '#050508',
    border: '1px solid #1a1b26',
    borderLeft: '4px solid #00ff41',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  formInput: {
    flex: 1,
    minWidth: '150px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid #1a1b26',
    color: '#a9b1d6',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    padding: '8px 4px'
  },
  createBtn: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    padding: '8px 16px',
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
  searchBtn: {
    backgroundColor: 'transparent',
    border: '1px dashed #7aa2f7',
    color: '#7aa2f7',
    padding: '6px 12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  editActions: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  editBtn: {
    backgroundColor: '#1d4ed8',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  editPanel: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#0b0b12',
    border: '1px solid #1d1f2a',
    display: 'grid',
    gap: '12px'
  },
  editPanelActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px'
  },
  saveBtn: {
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  cancelBtn: {
    backgroundColor: '#7f1d1d',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  gridEmpty: {
    border: '1px dashed #1a1b26',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.5)',
  },
  gridPopulated: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#ff9e64', 
  },
  jobCard: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #1a1b26',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderLeft: '4px solid #7aa2f7', 
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #1a1b26',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  jobTitle: {
    color: '#fff',
    fontSize: '1.1rem',
    margin: 0,
  },
  jobId: {
    color: '#565f89',
    fontSize: '0.75rem',
  },
  cardBody: {
    color: '#a9b1d6',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    color: '#00ff41',
    padding: '4px 8px',
    fontSize: '0.7rem',
    borderRadius: '2px',
  }
};