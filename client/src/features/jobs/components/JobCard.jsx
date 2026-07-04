import React from 'react';

export default function OpenClawJobCard({ job }) {
  return (
    <div style={{
      backgroundColor: '#18181b',
      border: '1px solid #27272a',
      borderRadius: '6px',
      padding: '1.5rem',
      transition: 'all 0.2s ease'
    }}>
      {/* Monospace Metadata Subdomain Header */}
      <div className="mono-spec" style={{ color: '#06b6d4', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
        ⟩ {job?.tenantSubdomain || 'global'}.jobboard.com
      </div>

      <h3 style={{ color: '#fafafa', margin: '0 0 0.5rem 0' }}>{job?.title || 'Software Engineer'}</h3>
      <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>{job?.description || 'Position details...'}</p>

      {/* Modern crisp horizontal line splits */}
      <hr style={{ borderColor: '#27272a', margin: '1rem 0' }} />

      {/* Terminal pill tags */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <span className="mono-spec" style={{ background: '#27272a', color: '#fafafa', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
          $ {job?.salary || '120k'}
        </span>
        <span className="mono-spec" style={{ background: '#27272a', color: '#a855f7', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
          # {job?.location || 'Remote'}
        </span>
      </div>
    </div>
  );
}