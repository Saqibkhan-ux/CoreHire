import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { tenantName } = useTenant();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR CONSOLE */}
      <aside style={styles.sidebar}>
        <div style={styles.header}>
          <h2 style={styles.tenantName}>{tenantName}_CONSOLE</h2>
          <p style={styles.authBadge}>[AUTH: {user?.role}]</p>
        </div>

        <nav style={styles.nav}>
          <button style={styles.navButton} className="active">
            {'>'} ACTIVE_DEPLOYMENTS
          </button>
          <button style={styles.navButton}>
            {'>'} CANDIDATE_LOGS
          </button>
          <button style={styles.navButton}>
            {'>'} SYS_SETTINGS
          </button>
        </nav>

        <div style={styles.footer}>
          <p style={styles.userEmail}>{user?.email}</p>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            [ TERMINATE_SESSION ]
          </button>
        </div>
      </aside>

      {/* MAIN DATA GRID PORT */}
      <main style={styles.mainContent}>
        <div style={styles.topBar}>
          <span style={styles.status}>STATUS: SECURE_UPLINK_ESTABLISHED</span>
          <span style={styles.time}>{new Date().toISOString()}</span>
        </div>
        
        {/* Child routes (like JobExplorer) render inside this Outlet */}
        <div style={styles.outletWrapper}>
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}

// --- OPENCLAW STYLING DICTIONARY ---
const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#050508', // Deep Void Black
    color: '#a9b1d6',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid #1a1b26',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #1a1b26',
  },
  tenantName: {
    color: '#00ff41', // Terminal Green
    fontSize: '1.2rem',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  authBadge: {
    color: '#ff007c', // Neon Pink
    fontSize: '0.8rem',
    margin: 0,
  },
  nav: {
    flex: 1,
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navButton: {
    background: 'none',
    border: 'none',
    color: '#7aa2f7', // Cyber Blue
    textAlign: 'left',
    padding: '12px 24px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  footer: {
    padding: '24px',
    borderTop: '1px solid #1a1b26',
  },
  userEmail: {
    fontSize: '0.8rem',
    color: '#565f89',
    marginBottom: '16px',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #ff003c',
    color: '#ff003c',
    padding: '8px 16px',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    cursor: 'pointer',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    height: '40px',
    borderBottom: '1px solid #1a1b26',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    fontSize: '0.75rem',
    color: '#565f89',
  },
  outletWrapper: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
  }
};