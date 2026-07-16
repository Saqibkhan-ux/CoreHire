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
    <div className="p-8 font-mono text-slate-900 max-w-4xl">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold mb-2">
          <span className="text-emerald-700">⟩</span> INITIATE_NODE_DEPLOYMENT
        </h1>
        <p className="text-slate-500 text-sm">
          Target Workspace: <span className="text-emerald-600">{tenant ? tenant.toUpperCase() : 'GLOBAL'}</span>
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-6 shadow-[0_0_20px_rgba(15,23,42,0.08)] rounded-[30px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs text-emerald-700 block">{'//'} NODE_TITLE (JOB ROLE)</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors rounded-2xl"
              placeholder="e.g. Senior React Architect..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-500 block">{'//'} LOCATION_VECTOR</label>
              <input 
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors rounded-2xl"
                placeholder="Remote, NYC, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-slate-500 block">{'//'} COMPENSATION_BAND</label>
              <input 
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors rounded-2xl"
                placeholder="$120k - $150k"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-500 block">{'//'} METADATA_TAGS (COMMA SEPARATED)</label>
            <input 
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors rounded-2xl"
              placeholder="React, Node.js, Docker..."
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            
            <div className="text-sm">
              {createJobMutation.isPending && <span className="text-amber-600 animate-pulse">[ EXECUTING_DUAL_WRITE... ]</span>}
              {createJobMutation.isSuccess && <span className="text-emerald-600">[ NODE_DEPLOYED_SUCCESSFULLY ]</span>}
              {createJobMutation.isError && <span className="text-red-600">[!] NETWORK_REJECTION: UNAUTHORIZED.</span>}
            </div>

            <button 
              type="submit" 
              disabled={createJobMutation.isPending}
              className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-2 hover:bg-emerald-100 hover:shadow-[0_0_15px_rgba(16,185,129,0.18)] transition-all disabled:opacity-50 rounded-2xl"
            >
              DEPLOY_NODE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}