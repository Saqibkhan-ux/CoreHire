// server/src/services/job.service.js
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { prisma } from '../config/prisma.js';

// Initialize Elasticsearch Client connecting to local container bridge
// Set compatibility headers so the v9 client can talk to an ES v8/v7 cluster
const esClient = new ElasticClient({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  headers: {
    'accept': 'application/vnd.elasticsearch+json; compatible-with=8',
    'content-type': 'application/vnd.elasticsearch+json; compatible-with=8'
  }
});

const JOB_INDEX = 'corehire_jobs';

/**
 * Ensures the Elasticsearch index exists before writing documents.
 */
async function ensureIndex() {
  try {
    const exists = await esClient.indices.exists({ index: JOB_INDEX });
    if (!exists) {
      await esClient.indices.create({
        index: JOB_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              tenantId: { type: 'keyword' },
              title: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              location: { type: 'keyword' },
              salaryMin: { type: 'integer' },
              salaryMax: { type: 'integer' },
              tags: { type: 'keyword' },
              createdAt: { type: 'date' }
            }
          }
        }
      });
      console.log(`[Elasticsearch] Initialized index: ${JOB_INDEX}`);
    }
  } catch (error) {
    console.error('[Elasticsearch] Index verification error:', error.message);
  }
}

// Initialize index on startup
ensureIndex();

export const JobService = {
  /**
   * Dual-Write Pattern: Saves job to PostgreSQL first, then syncs to Elasticsearch.
   */
  async createJob(jobData, tenantId) {
    // 1. Primary Write: Commit permanently to PostgreSQL via Prisma
    const newJob = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location || 'Remote',
        salaryMin: jobData.salaryMin ? parseInt(jobData.salaryMin, 10) : null,
        salaryMax: jobData.salaryMax ? parseInt(jobData.salaryMax, 10) : null,
        tags: jobData.tags || [],
        tenantId: tenantId
      }
    });

    // 2. Search Sync: Index document into Elasticsearch
    try {
      await esClient.index({
        index: JOB_INDEX,
        id: newJob.id,
        document: {
          id: newJob.id,
          tenantId: newJob.tenantId,
          title: newJob.title,
          description: newJob.description,
          location: newJob.location,
          salaryMin: newJob.salaryMin,
          salaryMax: newJob.salaryMax,
          tags: newJob.tags,
          createdAt: newJob.createdAt
        },
        refresh: 'wait_for' // Guarantees document is immediately searchable
      });
      console.log(`[Dual-Write] Job ${newJob.id} indexed into Elasticsearch.`);
    } catch (esError) {
      console.error(`[Dual-Write Warning] Postgres write succeeded, but ES indexing failed for Job ${newJob.id}:`, esError.message);
      // In production, queue orphaned IDs to a Redis background retry worker
    }

    return newJob;
  },

  /**
   * Fast Read Path: Queries Elasticsearch strictly filtered by tenantId.
   */
  async searchJobs({ query = '', location, minSalary, tenantId }) {
    const mustClauses = [];
    const filterClauses = [];

    // Enforce Multi-Tenant Isolation
    if (tenantId) {
      filterClauses.push({ term: { tenantId: tenantId } });
    }

    // Full-Text Fuzzy Search on Title & Description
    if (query) {
      mustClauses.push({
        multi_match: {
          query: query,
          fields: ['title^3', 'description', 'tags^2'],
          fuzziness: 'AUTO'
        }
      });
    } else {
      mustClauses.push({ match_all: {} });
    }

    // Exact Location Filtering
    if (location) {
      filterClauses.push({ term: { location: location } });
    }

    // Minimum Compensation Filtering
    if (minSalary) {
      filterClauses.push({
        range: {
          salaryMax: { gte: parseInt(minSalary, 10) }
        }
      });
    }

    try {
      const response = await esClient.search({
        index: JOB_INDEX,
        body: {
          query: {
            bool: {
              must: mustClauses,
              filter: filterClauses
            }
          },
          sort: [{ createdAt: { order: 'desc' } }],
          size: 50
        }
      });

      // Extract raw document payloads from Elasticsearch hits
      return response.hits.hits.map(hit => hit._source);
    } catch (error) {
      console.error('[Elasticsearch Search Error] Falling back to Postgres:', error.message);
      
      // Fallback: Query Postgres if Elasticsearch container is offline
      const pgWhere = {
        ...(tenantId && { tenantId }),
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        })
      };
      return await prisma.job.findMany({ where: pgWhere, orderBy: { createdAt: 'desc' } });
    }
  },

  /**
   * Fetches a specific job by ID, scoped to the tenant.
   */
  async getJobById(jobId, tenantId) {
    const whereClause = { id: jobId };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return await prisma.job.findFirst({ where: whereClause });
  }
};