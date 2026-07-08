import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '../services/jobApi';

/**
 * Hook for the Read Path (Candidate Search)
 * Automatically fetches and caches job listings based on the active filters.
 */
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: ['jobs', filters], // Uniquely caches data based on current filters
    queryFn: () => jobApi.fetchJobs(filters),
    staleTime: 1000 * 60 * 5, // Keeps data fresh in memory for 5 minutes without re-fetching
  });
};

/**
 * Hook for the Write Path (Recruiter Dashboard)
 * Pushes new job data to the backend and forces the UI to refresh.
 */
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobData, token }) => jobApi.createJob(jobData, token),
    onSuccess: () => {
      // The moment a recruiter successfully posts a job, invalidate the old cache.
      // This forces the UI to instantly re-fetch and display the new job.
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};