import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

export default function MyApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState('INITIALIZING_UPLINK'); // INITIALIZING, SUCCESS, ERROR, NO_DATA

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        if (!token) {
          setStatus('ERROR');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/applications/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });

        if (response.data.data.length === 0) {
          setStatus('NO_DATA');
        } else {
          setApplications(response.data.data);
          setStatus('SUCCESS');
        }
      } catch (error) {
        console.error('🔴 DATA_FETCH_CRASH:', error);
        setStatus('ERROR');
      }
    };

    if (token) {
      fetchMyApplications();
    }
  }, [token]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⟩ my_applications_</h2>
      <p style={styles.subtitle}>// SECURE_DATA_STREAM: CANDIDATE_ARCHIVE</p>

      <div style={styles.terminalBox}>
        <span style={{ color: status === 'ERROR' ? '#ff3366' : '#00ffcc' }}>
          {status === 'INITIALIZING_UPLINK' && 'Establishing connection to matrix...'}
          {status === 'NO_DATA' && 'No application records found for this identity.'}
          {status === 'ERROR' && '🔴 SYSTEM_FAILURE: Unable to retrieve application data.'}
          {status === 'SUCCESS' && `✅ Connection secure. Displaying ${applications.length} records.`}
        </span>
        <span style={styles.cursor}>_</span>
      </div>

      <div style={styles.grid}>
        {applications.map((app) => (
          <div key={app.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.jobId}>{app.job?.title || `JOB_ID: ${app.jobId}`}</span>
              <span style={styles.statusBadge}>{app.status}</span>
            </div>
            <div style={styles.cardBody}>
              <p style={styles.label}>{">"} RESUME_PAYLOAD:</p>
              <p style={styles.data}>{app.resumeLink.split('/').pop() || 'Encrypted File'}</p>
              
              {app.coverLetter && (
                <>
                  <p style={styles.label}>{">"} ATTACHED_MESSAGE:</p>
                  <p style={styles.data}>{app.coverLetter}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 OpenClaw Terminal Aesthetic Dictionary
const styles = {
  container: {
    padding: '40px',
    backgroundColor: '#050508',
    minHeight: '100vh',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    color: '#fff'
  },
  title: {
    color: '#00ffcc',
    fontSize: '2rem',
    margin: '0 0 5px 0',
    fontWeight: '700'
  },
  subtitle: {
    color: '#888',
    fontSize: '0.9rem',
    marginBottom: '30px'
  },
  terminalBox: {
    backgroundColor: '#0a0a0f',
    border: '1px dashed #333',
    padding: '16px',
    marginBottom: '30px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center'
  },
  cursor: {
    color: '#00ffcc',
    animation: 'blink 1s step-end infinite',
    marginLeft: '4px'
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #1a1a2e',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 0 20px rgba(0, 255, 204, 0.02)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px dashed #333',
    paddingBottom: '15px',
    marginBottom: '15px'
  },
  jobId: {
    color: '#00ffcc',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    color: '#00ffcc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#888',
    fontSize: '0.8rem',
    margin: 0
  },
  data: {
    color: '#fff',
    fontSize: '0.95rem',
    margin: '0 0 10px 0',
    backgroundColor: '#050508',
    padding: '10px',
    border: '1px solid #111',
    borderRadius: '4px'
  }
};