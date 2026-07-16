import { Client as ElasticClient } from '@elastic/elasticsearch';
import { prisma } from '../config/prisma.js';

// Configure Elasticsearch client (matches JobService configuration)
const esClient = new ElasticClient({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  headers: {
    'accept': 'application/vnd.elasticsearch+json; compatible-with=8',
    'content-type': 'application/vnd.elasticsearch+json; compatible-with=8'
  }
});

const JOB_INDEX = 'corehire_jobs';

async function reindexJobs() {
  try {
    console.log('⏳ Fetching jobs from Postgres...');
    const jobs = await prisma.job.findMany();
    console.log(`Found ${jobs.length} jobs to index.`);

    if (jobs.length === 0) {
      console.log('No jobs found. Exiting.');
      return process.exit(0);
    }

    // Build bulk payload
    const body = [];
    for (const job of jobs) {
      body.push({ index: { _index: JOB_INDEX, _id: job.id } });
      body.push({
        id: job.id,
        tenantId: job.tenantId,
        title: job.title,
        description: job.description,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        tags: job.tags,
        createdAt: job.createdAt
      });
    }

    console.log('⏳ Sending bulk request to Elasticsearch...');
    const result = await esClient.bulk({ refresh: true, body });

    if (result.errors) {
      const erroredItems = result.items.filter(i => Object.values(i)[0].error);
      console.error(`⚠️ Bulk indexing completed with ${erroredItems.length} errors.`);
      for (const item of erroredItems.slice(0, 10)) {
        console.error(JSON.stringify(item, null, 2));
      }
      process.exit(1);
    }

    console.log('✅ Reindex complete. All jobs are now in Elasticsearch.');
    process.exit(0);
  } catch (error) {
    console.error('Reindex failed:', error);
    process.exit(1);
  }
}

reindexJobs();
