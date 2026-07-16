import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Your context function to save the user session

  // 1. Detect if we are on the /login or /register route
  const [isLoginMode, setIsLoginMode] = useState(location.pathname === '/login');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [status, setStatus] = useState('IDLE'); // IDLE, TRANSMITTING, SUCCESS, ERROR
  const [sysLog, setSysLog] = useState('SYSTEM_READY // Awaiting input...');

  // Update mode if the URL changes dynamically
  useEffect(() => {
    setIsLoginMode(location.pathname === '/login');
    setSysLog(location.pathname === '/login' 
      ? 'Ready for authorization credentials.' 
      : 'Ready for new candidate registration.'
    );
    setStatus('IDLE');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('TRANSMITTING');
    setSysLog('EXECUTING_PROTOCOL... establishing secure connection.');

    if (isLoginMode) {
      // --- LOGIN LOGIC ---
      try {
        const result = await login(formData.email, formData.password);

        if (result.success) {
          setSysLog('✅ [ACCESS_GRANTED] Handshake successful.');
          setStatus('SUCCESS');

          // Route the user based on their clearance level
          setTimeout(() => {
            if (result.role === 'RECRUITER') {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }, 1000);
        } else {
          // Handle login failure from context
          setStatus('ERROR');
          setSysLog(`🔴 [ACCESS_DENIED] ${result.error}`);
        }
      } catch (error) {
        setStatus('ERROR');
        const errorMsg = error.response?.data?.error || error.message || 'Network transmission failed.';
        setSysLog(`🔴 [ACCESS_DENIED] ${errorMsg}`);
      }
    } else {
      // --- REGISTRATION LOGIC ---
      try {
        const payload = { ...formData, role: 'CANDIDATE' };
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, payload);

        setSysLog('✅ [REGISTRATION_SUCCESS] Identity provisioned. Please log in.');
        setStatus('SUCCESS');
        setTimeout(() => navigate('/login'), 1500);

      } catch (error) {
        setStatus('ERROR');
        const errorMsg = error.response?.data?.error || 'Network transmission failed.';
        setSysLog(`🔴 [REGISTRATION_FAILED] ${errorMsg}`);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.authConsole}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isLoginMode ? '⟩ authenticate_' : '⟩ register_identity_'}
          </h2>
          <p style={styles.subtitle}>
            {isLoginMode 
              ? '// IDENTITY_ACCESS_PROTOCOL' 
              : '// NEW_CANDIDATE_INITIALIZATION'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Only show the Name field if we are Registering */}
          {!isLoginMode && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>{">"} ALIAS (FULL NAME)</label>
              <input
                type="text"
                required
                style={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Neo"
                disabled={status === 'TRANSMITTING' || status === 'SUCCESS'}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>{">"} COMM_CHANNEL (EMAIL)</label>
            <input
              type="email"
              required
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={isLoginMode ? "recruiter@stripe.com or user@global.com" : "user@network.com"}
              disabled={status === 'TRANSMITTING' || status === 'SUCCESS'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{">"} ENCRYPTION_KEY (PASSWORD)</label>
            <input
              type="password"
              required
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              disabled={status === 'TRANSMITTING' || status === 'SUCCESS'}
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.transmitBtn,
              opacity: (status === 'TRANSMITTING' || status === 'SUCCESS') ? 0.5 : 1
            }}
            disabled={status === 'TRANSMITTING' || status === 'SUCCESS'}
          >
            {isLoginMode ? '[ EXECUTE_LOGIN ]' : '[ INJECT_IDENTITY ]'}
          </button>
        </form>

        <div style={styles.terminalBox}>
          <span style={{ 
            color: status === 'ERROR' ? '#ff3366' : status === 'SUCCESS' ? '#00ffcc' : '#aaa' 
          }}>
            {sysLog}
          </span>
          <span style={styles.cursor}>_</span>
        </div>

        <div style={styles.footer}>
          {isLoginMode ? (
            <p style={styles.switchText}>
              No identity matrix found? <Link to="/register" style={styles.link}>[ Register Here ]</Link>
            </p>
          ) : (
             <p style={styles.switchText}>
              Already established in the matrix? <Link to="/login" style={styles.link}>[ Login Here ]</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// 🎨 OpenClaw Terminal Aesthetic Dictionary
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#050508', // Deep void black
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace" // Core terminal font
  },
  authConsole: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #1a1a2e', // Modular border accent
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    borderRadius: '12px',
    boxShadow: '0 0 30px rgba(0, 255, 204, 0.05)'
  },
  header: {
    marginBottom: '30px',
    borderBottom: '1px solid #1a1a2e',
    paddingBottom: '20px'
  },
  title: {
    color: '#00ffcc', // Neon cyan accent
    fontSize: '1.5rem',
    margin: '0 0 10px 0',
    fontWeight: '700'
  },
  subtitle: {
    color: '#888',
    fontSize: '0.85rem',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#00ffcc',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#050508',
    border: '1px solid #333',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  transmitBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #00ffcc',
    color: '#00ffcc',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 'bold',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '10px',
    transition: 'all 0.2s',
    textTransform: 'uppercase'
  },
  terminalBox: {
    backgroundColor: '#050508',
    border: '1px dashed #333',
    padding: '16px',
    marginTop: '30px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center'
  },
  cursor: {
    color: '#00ffcc',
    animation: 'blink 1s step-end infinite', // Blinking terminal cursor
    marginLeft: '4px'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center'
  },
  switchText: {
    color: '#888',
    fontSize: '0.9rem'
  },
  link: {
    color: '#00ffcc',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

// Global style for the blinking cursor (injects automatically)
const cursorStyle = document.createElement('style');
cursorStyle.innerHTML = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;
document.head.appendChild(cursorStyle);