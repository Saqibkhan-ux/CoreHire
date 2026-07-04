import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('SYSTEM_READY');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusText('EXECUTING_AUTHENTICATION_STREAM...');

    try {
      // Ingest input fields directly into the context state wrapper loop
      const result = await login(email, password);
      if (result.success) {
        setStatusText('ACCESS_GRANTED // REDIRECTING');
        if (result.role === 'RECRUITER') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || 'GATEWAY_REJECTION: Invalid credentials.');
      setStatusText('STREAM_TERMINATED_WITH_ERRORS');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a855f7', marginBottom: '1rem' }}>
          // IDENTITY_ACCESS_PROTOCOL
        </div>
        
        <h2 style={{ fontFamily: 'monospace', color: '#fafafa', margin: '0 0 1.5rem 0' }}>⟩ authenticate_</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              email_address:
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recruiter@stripe.com or user@global.com"
              style={{
                width: '100%', padding: '0.75rem', backgroundColor: '#09090b', color: '#fafafa',
                border: '1px solid #3f3f46', borderRadius: '4px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              secure_cipher_pass:
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.75rem', backgroundColor: '#09090b', color: '#fafafa',
                border: '1px solid #3f3f46', borderRadius: '4px', boxSizing: 'border-box'
              }}
            />
          </div>

          <button type="submit" style={{
            backgroundColor: '#06b6d4', color: '#09090b', fontFamily: 'monospace',
            fontWeight: 'bold', border: 'none', padding: '0.75rem', borderRadius: '4px',
            cursor: 'pointer', marginTop: '0.5rem'
          }}>
            EXECUTE_SUBMIT
          </button>
        </form>

        <hr style={{ borderColor: '#27272a', margin: '1.5rem 0' }} />

        {/* Terminal status line metrics */}
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          <span style={{ color: '#a1a1aa' }}>status: </span>
          <span style={{ color: error ? '#ef4444' : '#06b6d4' }}>{statusText}</span>
          {error && <p style={{ color: '#ef4444', margin: '0.5rem 0 0 0' }}> {error}</p>}
        </div>
      </div>
    </div>
  );
}