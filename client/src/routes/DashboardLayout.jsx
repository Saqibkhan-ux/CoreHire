import { Outlet, useNavigate, Link } from 'react-router-dom';
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
          {/* WE REPLACED THE BUTTONS WITH ROUTER LINKS */}
          <Link to="/dashboard/jobs" style={styles.navButton}>
            {'>'} ACTIVE_DEPLOYMENTS
          </Link>
          <Link to="/dashboard/candidates" style={styles.navButton}>
            {'>'} CANDIDATE_LOGS
          </Link>
          <Link to="/dashboard/settings" style={styles.navButton}>
            {'>'} SYS_SETTINGS
          </Link>
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
    backgroundColor: '#050508', 
    color: '#a9b1d6',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid #1a1b26',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000000',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #1a1b26',
  },
  tenantName: {
    color: '#00ff41', 
    fontSize: '1.2rem',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  authBadge: {
    color: '#ff007c', 
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
    display: 'block',          // Added so the Link behaves like a button
    textDecoration: 'none',    // Removes the default blue underline from Links
    background: 'none',
    border: 'none',
    color: '#7aa2f7', 
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