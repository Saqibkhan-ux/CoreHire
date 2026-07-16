import React from 'react';

export default function OpenClawJobCard({ job }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '24px',
      padding: '1.75rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 20px 45px rgba(22, 43, 23, 0.08)'
    }}>
      <div className="mono-spec" style={{ color: 'var(--accent-dark)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
        ⟩ {job?.tenantSubdomain || 'global'}.jobboard.com
      </div>

      <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>{job?.title || 'Software Engineer'}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{job?.description || 'Position details...'}</p>

      <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.25rem 0' }} />

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span className="mono-spec" style={{ background: '#edf6ee', color: 'var(--accent-dark)', fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderRadius: '999px' }}>
          $ {job?.salary || '120k'}
        </span>
        <span className="mono-spec" style={{ background: '#edf6ee', color: 'var(--accent-green)', fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderRadius: '999px' }}>
          # {job?.location || 'Remote'}
        </span>
      </div>
    </div>
  );
}