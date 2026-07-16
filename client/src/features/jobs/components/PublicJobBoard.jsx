import { useState, useEffect, useRef } from 'react';
import { useTenant } from "../../../context/TenantContext";
import { useAuth } from "../../../context/AuthContext";
import axios from 'axios';
// 👇 NEW: Import navigation tools to route to your AuthPage
import { useNavigate } from 'react-router-dom'; 

export default function PublicJobBoard() {
  const { user, logout, token } = useAuth(); 
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [formData, setFormData] = useState({ file: null, coverLetter: '' });
  const [applyStatus, setApplyStatus] = useState('IDLE'); 

  const [logs, setLogs] = useState([
    { id: 1, text: 'Guest connection established.', type: 'system' },
    { id: 2, text: 'Fetching active public deployments...', type: 'system' }
  ]);
  const logEndRef = useRef(null);

  const printLog = (text, type = 'info') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    fetchDeployments();
  }, []);

  // NEW: Fallback disconnect handler
  const handleDisconnect = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('corehire_jwt');
      window.location.reload();
    }
  };

  const formatSalaryOutput = (salaryValue) => {
    if (salaryValue == null || salaryValue === '') return 'N/A';
    return new Intl.NumberFormat('en-IN').format(salaryValue);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleExpand = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      printLog(`> Closing deployment details...`, 'system');
    } else {
      setExpandedJobId(jobId);
      printLog(`> Executing [READ_FILE] protocol for ID: ${jobId.substring(0,8)}...`, 'command');
    }
  };

  const fetchDeployments = async (query = '') => {
    setIsSearching(true);
    if (query) printLog(`> grep --search "${query}"`, 'command');

    try {
      const url = query 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/jobs?query=${query}` 
        : `${import.meta.env.VITE_API_BASE_URL}/api/jobs`;

      const response = await axios.get(url);
      setJobs(response.data.data || response.data || []);
      
      if (query) printLog(`✅ Found ${response.data.data?.length || 0} matching deployments.`, 'success');
      else printLog('✅ Grid populated with latest deployments.', 'success');
    } catch (error) {
      printLog(`❌ NETWORK_ERROR: Cannot reach gateway.`, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDeployments(searchQuery);
  };

  const handleApplyClick = (e, job) => {
    e.stopPropagation(); 

    // 1. Authentication Guard: Check if a user is logged in before showing the modal.
    if (!token) {
      printLog('🔴 AUTH_REQUIRED: Please log in or register to apply.', 'error');
      navigate('/login'); // Redirect to login page
      return;
    }

    // 2. If authenticated, proceed to open the application modal.
    setActiveJob(job);
    setApplyStatus('IDLE');
    setFormData({ file: null, coverLetter: '' }); 
    setIsModalOpen(true);
    printLog(`> Executing [APPLY_PROTOCOL] for deployment: ${job.title}...`, 'command');
  };

  // ==========================================
  // MULTIPART FORM TRANSMISSION (CANDIDATE) 
  // ==========================================
  const submitApplication = async (e) => {
    e.preventDefault();
    
    // Safety Check: Ensure a file was actually selected
    if (!formData.file) {
      printLog('🔴 [SYSTEM_ERROR] Resume upload is mandatory.', 'error');
      return;
    }

    setApplyStatus('SUBMITTING');
    printLog(`> Executing [UPLINK]... transmitting encrypted resume to server.`, 'command');

    try {
      // 1. Package the file into a FormData matrix (JSON will not work for files)
      const payload = new FormData();
      
      // CRITICAL: The backend 'multer' configuration is specifically looking for the word 'resume'
      payload.append('resume', formData.file); 
      payload.append('coverLetter', formData.coverLetter);

      // Fire the payload to the backend, using the token from AuthContext.
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/jobs/${activeJob.id}/apply`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // The Security Gatekeeper Key
          },
          withCredentials: true // Synchronize with login API call to handle CORS
        }
      );

      setApplyStatus('SUCCESS');
      printLog(`✅ [SUCCESS] Application successfully injected into the matrix.`, 'system');
      
      // Automatically close the modal after a short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setActiveJob(null);
        setFormData({ file: null, coverLetter: '' }); // Reset form
      }, 2000);

    } catch (error) {
      setApplyStatus('ERROR');
      const errorMsg = error.response?.data?.error || error.message || 'Transmission failed.';
      printLog(`🔴 [TRANSMISSION_FAILED] ${errorMsg}`, 'error');
    }
  };

  return (
    <div style={styles.container}>
      {/* ---------------- TOP HEADER & AUTH NAVIGATION ---------------- */}
      <div style={styles.topHeaderContainer}>
        <div>
          <h1 style={styles.title}>// CORE_HIRE : PUBLIC_GATEWAY</h1>
          <p style={styles.subtitle}>Open-access terminal to browse active corporate deployments.</p>
        </div>

        {/* 🔒 AUTHENTICATION TERMINAL */}
        <div style={styles.authBox}>
          {user ? (
            <>
              <span style={styles.userLabel}>
                SYS_ID: {user.role === 'RECRUITER' ? 'ADMIN' : 'CANDIDATE'}
              </span>
              {user.role === 'CANDIDATE' && (
                <button onClick={() => navigate('/my-applications')} style={styles.navBtn}>[ MY_APPLICATIONS ]</button>
              )}
              {user.role === 'RECRUITER' && (
                <button onClick={() => navigate('/dashboard')} style={styles.navBtn}>[ DASHBOARD ]</button>
              )}
              <button onClick={handleDisconnect} style={styles.navBtn}>[ DISCONNECT ]</button>
            </>
          ) : (
            <>
              <span style={styles.userLabel}>SYS_ID: GUEST</span>
              <button onClick={() => navigate('/login')} style={styles.navBtn}>[ LOGIN ]</button>
              <button onClick={() => navigate('/register')} style={styles.navBtn}>[ REGISTER ]</button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} style={styles.searchConsole}>
        <span style={styles.prompt}>{'>'} grep --search</span>
        <input type="text" placeholder="e.g. 'Engineer', 'Remote'" style={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <button type="submit" style={styles.searchBtn} disabled={isSearching}>
          {isSearching ? 'SCANNING...' : 'EXECUTE'}
        </button>
      </form>

      <div style={jobs.length === 0 ? styles.gridEmpty : styles.gridPopulated}>
        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>[ NO_ACTIVE_DEPLOYMENTS_FOUND ]</p>
          </div>
        ) : (
          jobs.map((job, index) => {
            const isExpanded = expandedJobId === job.id;
            return (
              <div 
                key={job.id || index} 
                style={{
                  ...styles.jobCard, 
                  borderColor: isExpanded ? '#00ffcc' : '#1a1a2e',
                  cursor: 'pointer'
                }}
                onClick={() => toggleExpand(job.id)}
              >
                <div>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <span style={styles.jobId}>ID: {job.id?.substring(0,8)}</span>
                  </div>
                  <div style={styles.cardBody}>
                    <p><strong>[COMP_PACKAGE]:</strong> {formatSalaryOutput(job.salaryMin ?? job.salaryMax ?? job.salary)}</p>
                    <p><strong>[NODE_LOC]:</strong> {job.location}</p>
                    <p style={{ marginTop: '10px', color: '#888' }}>
                      {isExpanded ? job.description : truncateText(job.description, 120)}
                    </p>

                    {/* --- RENDER TAGS ON EXPAND --- */}
                    {job.tags && job.tags.length > 0 && isExpanded && (
                      <div style={styles.tagsContainer}>
                        {job.tags.map((tag, i) => (
                          <span key={i} style={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
                <div style={styles.cardFooter}>
                  <button style={styles.applyBtn} onClick={(e) => handleApplyClick(e, job)}>APPLY_NOW</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div style={styles.terminalBox}>
        {logs.map((log) => (
          <div key={log.id} style={{ color: log.type === 'command' ? '#ffffff' : log.type === 'success' ? '#00ffcc' : '#ff3333', fontSize: '13px' }}>
            {log.text}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.2rem' }}>
              {">>"} INITIATE_APPLICATION : {activeJob?.title}
            </h3>
            
            {applyStatus === 'SUCCESS' ? (
              <p style={{ color: '#00ffcc' }}>[ DATA UPLOADED SECURELY ]</p>
            ) : (
              <form onSubmit={submitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <label style={{ color: '#00ffcc', fontSize: '0.8rem' }}>UPLOAD RESUME (PDF):</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  
                  onChange={e => setFormData({...formData, file: e.target.files[0]})}
                  style={{ ...styles.modalInput, border: '1px dashed #333' }}
                  required
                />

                <textarea 
                  placeholder="Cover Letter (Optional)" 
                  style={{...styles.modalInput, height: '100px', resize: 'none'}}
                  value={formData.coverLetter}
                  onChange={e => setFormData({...formData, coverLetter: e.target.value})}
                />
                
                {applyStatus === 'ERROR' && (
                  <p style={{ color: '#ff3333', fontSize: '0.9rem' }}>ERR: UPLOAD FAILED. Check auth status.</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={styles.abortBtn}>ABORT</button>
                  <button type="submit" style={styles.transmitBtn} disabled={applyStatus === 'SUBMITTING'}>
                    {applyStatus === 'SUBMITTING' ? 'TRANSMITTING...' : 'TRANSMIT'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", paddingBottom: '50px' },
  
  // NEW: Top Header Layout
  topHeaderContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
  authBox: { display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#0a0a0f', border: '1px solid #1a1a2e', padding: '10px 16px', borderRadius: '8px' },
  userLabel: { color: '#888', fontSize: '0.85rem', marginRight: '8px' },
  navBtn: { backgroundColor: 'transparent', border: 'none', color: '#00ffcc', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', transition: 'color 0.2s', padding: 0 },

  title: { color: '#00ffcc', fontSize: '2rem', margin: '0 0 10px 0', fontWeight: '700', textShadow: '0 0 10px rgba(0,255,204,0.3)' },
  subtitle: { color: '#888', fontSize: '1rem', margin: 0 },
  searchConsole: { backgroundColor: '#0a0a0f', border: '1px solid #1a1a2e', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', borderRadius: '12px' },
  prompt: { color: '#00ffcc', fontWeight: 'bold' },
  searchInput: { flex: 1, backgroundColor: '#050508', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '1rem', outline: 'none', padding: '12px 14px' },
  searchBtn: { backgroundColor: '#00ffcc', border: 'none', color: '#050508', padding: '10px 20px', fontFamily: 'inherit', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px' },
  gridEmpty: { border: '1px dashed #333', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' },
  gridPopulated: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  emptyState: { color: '#555' },
  jobCard: { backgroundColor: '#0a0a0f', border: '1px solid #1a1a2e', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '12px', minHeight: '250px', transition: 'border-color 0.2s ease-in-out' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a2e', paddingBottom: '12px', marginBottom: '16px' },
  jobTitle: { color: '#fff', fontSize: '1.2rem', margin: 0 },
  jobId: { color: '#555', fontSize: '0.8rem' },
  cardBody: { color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px',
  },
  tag: {
    backgroundColor: '#1a1a2e',
    color: '#888',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.75rem',
  },
  cardFooter: { marginTop: 'auto' },
  applyBtn: { width: '100%', backgroundColor: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', padding: '10px', fontFamily: 'inherit', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' },
  terminalBox: { height: '150px', backgroundColor: '#050508', border: '1px solid #1a1a2e', padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '12px', marginTop: '40px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modalContent: { backgroundColor: '#0a0a0f', border: '1px solid #1a1a2e', padding: '30px', width: '100%', maxWidth: '450px', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,255,204,0.1)' },
  modalInput: { backgroundColor: '#050508', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%', outline: 'none' },
  abortBtn: { backgroundColor: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold', padding: '10px 15px' },
  transmitBtn: { backgroundColor: '#00ffcc', border: 'none', color: '#050508', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold', padding: '10px 20px', borderRadius: '8px' }
};