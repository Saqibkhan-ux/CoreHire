import axios from 'axios';

// The direct line to your Express Gateway
const API_BASE_URL = 'http://localhost:3000/api';

// Create a dedicated Axios instance for job telemetry
const jobClient = axios.create({
  baseURL: `${API_BASE_URL}/jobs`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobApi = {
  /**
   * 1. Public Search Path (GET /api/jobs)
   * This request completely bypasses PostgreSQL.
   * It queries your Elasticsearch cluster to return sub-millisecond search results.
   */
  fetchJobs: async (filters = {}) => {
    const response = await jobClient.get('/', { params: filters });
    return response.data;
  },

  /**
   * 2. Fetch Single Job Details (GET /api/jobs/:id)
   * Retrieves complete, localized metadata for a specific job ID.
   */
  fetchJobById: async (id) => {
    const response = await jobClient.get(`/${id}`);
    return response.data;
  },

  /**
   * 3. Secure Recruiter Write Path (POST /api/jobs)
   * Executes the Dual-Write Pattern. 
   * Requires a valid Bearer JWT. It saves permanently to PostgreSQL, 
   * then instantly indexes the data into Elasticsearch.
   */
  createJob: async (jobData, token) => {
    const response = await jobClient.post('/', jobData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateJob: async (jobId, jobData, token) => {
    const response = await jobClient.put(`/${jobId}`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};