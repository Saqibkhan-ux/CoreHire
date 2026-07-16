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
      <aside style={styles.sidebar}>
        <div style={styles.header}>
          <h2 style={styles.tenantName}>{tenantName}_CONSOLE</h2>
          <p style={styles.authBadge}>[AUTH: {user?.role}]</p>
        </div>

        <nav style={styles.nav}>
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

      <main style={styles.mainContent}>
        <div style={styles.topBar}>
          <span style={styles.status}>STATUS: SECURE_UPLINK_ESTABLISHED</span>
          <span style={styles.time}>{new Date().toISOString()}</span>
        </div>
        <div style={styles.outletWrapper}>
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-surface)',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  tenantName: {
    color: 'var(--accent-dark)',
    fontSize: '1.2rem',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  authBadge: {
    color: 'var(--accent-green)',
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
    display: 'block',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    padding: '14px 24px',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'background 0.2s ease',
  },
  footer: {
    padding: '24px',
    borderTop: '1px solid var(--border-subtle)',
  },
  userEmail: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--accent-dark)',
    color: 'var(--accent-dark)',
    padding: '10px 16px',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    cursor: 'pointer',
    width: '100%',
    borderRadius: '10px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-main)',
  },
  topBar: {
    height: '48px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  outletWrapper: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
  }
};