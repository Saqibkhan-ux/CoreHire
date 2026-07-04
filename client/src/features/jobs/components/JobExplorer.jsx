import React, { useState } from 'react';
import { useTenant } from '../../../context/TenantContext';

export default function JobExplorer() {
  const { tenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');

  // Local sandbox data model to trace your UI card layouts before API hooks go live
  const mockJobs = [
    { id: 1, title: 'Senior Infrastructure Engineer', tags: ['Docker', 'Go'], salary: '$160k', location: 'Remote' },
    { id: 2, title: 'Staff Full-Stack Architect', tags: ['React', 'Postgres'], salary: '$185k', location: 'Hybrid' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Search Interface Row */}
      <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#18181b', padding: '1.5rem', borderRadius: '6px', border: '1px solid #27272a' }}>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tenant ? `Search open positions at ${tenant}...` : "Search across global multi-tenant index..."}
          style={{
            flex: 1, padding: '0.75rem 1rem', backgroundColor: '#09090b', color: '#fafafa',
            border: '1px solid #3f3f46', borderRadius: '4px', fontFamily: 'monospace'
          }}
        />
        <button style={{ backgroundColor: '#a855f7', color: '#fafafa', border: 'none', padding: '0 1.5rem', borderRadius: '4px', fontFamily: 'monospace', cursor: 'pointer' }}>
          QUERY
        </button>
      </div>

      {/* Split Workstation: Sidebar Filters + Card Streams */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar Filters */}
        <aside style={{ width: '250px', backgroundColor: '#18181b', border: '1px solid #27272a', padding: '1.5rem', borderRadius: '6px', height: 'fit-content' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontFamily: 'monospace', color: '#fafafa' }}>// ENG_FILTERS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a1a1aa' }}>
            <div>⏱️ commit_type: Remote (2)</div>
            <div>💰 min_compensation: $100k+</div>
          </div>
        </aside>

        {/* Results Container Stream */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mockJobs.map((job) => (
            <div key={job.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#06b6d4', marginBottom: '0.5rem' }}>
                ⟩ {tenant || 'global_root'}.corehire.app
              </div>
              <h3 style={{ margin: '0 0 0.75rem 0', color: '#fafafa' }}>{job.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ backgroundColor: '#27272a', color: '#fafafa', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {job.salary}
                </span>
                <span style={{ backgroundColor: '#27272a', color: '#a855f7', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {job.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}