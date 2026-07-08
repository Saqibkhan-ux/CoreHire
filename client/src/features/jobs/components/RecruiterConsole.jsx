import React, { useState } from 'react';
import { useCreateJob } from '../hooks/useJobs';
import { useAuth } from '../../../context/AuthContext';
import { useTenant } from '../../../context/TenantContext';

export default function RecruiterConsole() {
  const { token } = useAuth();
  const { tenant } = useTenant();
  const createJobMutation = useCreateJob();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    tags: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert comma-separated string into an array for Elasticsearch
    const jobPayload = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    // Execute the network mutation!
    createJobMutation.mutate({ jobData: jobPayload, token });
  };

  return (
    <div className="p-8 font-mono text-[#fafafa] max-w-4xl">
      <div className="mb-8 border-b border-[#232635] pb-6">
        <h1 className="text-2xl font-bold mb-2">
          <span className="text-cyan-500">⟩</span> INITIATE_NODE_DEPLOYMENT
        </h1>
        <p className="text-zinc-500 text-sm">
          Target Workspace: <span className="text-amber-500">{tenant ? tenant.toUpperCase() : 'GLOBAL'}</span>
        </p>
      </div>

      <div className="bg-[#11131C] border border-[#232635] p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs text-cyan-500 block">{'//'} NODE_TITLE (JOB ROLE)</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-[#090A0F] border border-[#232635] text-cyan-50 px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="e.g. Senior React Architect..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 block">{'//'} LOCATION_VECTOR</label>
              <input 
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#090A0F] border border-[#232635] text-cyan-50 px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Remote, NYC, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 block">{'//'} COMPENSATION_BAND</label>
              <input 
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full bg-[#090A0F] border border-[#232635] text-cyan-50 px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="$120k - $150k"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500 block">{'//'} METADATA_TAGS (COMMA SEPARATED)</label>
            <input 
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full bg-[#090A0F] border border-[#232635] text-cyan-50 px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="React, Node.js, Docker..."
            />
          </div>

          <div className="pt-4 border-t border-[#232635] flex items-center justify-between">
            
            {/* Status Indicators */}
            <div className="text-sm">
              {createJobMutation.isPending && <span className="text-amber-500 animate-pulse">[ EXECUTING_DUAL_WRITE... ]</span>}
              {createJobMutation.isSuccess && <span className="text-green-500">[ NODE_DEPLOYED_SUCCESSFULLY ]</span>}
              {createJobMutation.isError && <span className="text-[#FF4500]">[!] NETWORK_REJECTION: UNAUTHORIZED.</span>}
            </div>

            <button 
              type="submit" 
              disabled={createJobMutation.isPending}
              className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 px-6 py-2 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
            >
              DEPLOY_NODE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}