import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import pgPkg from 'pg';
const { Pool } = pgPkg;
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password123@localhost:5432/my_job_board?schema=public";

// 1. Initialize a single connection pool to prevent PostgreSQL from being overloaded
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Export a single, shared Prisma Client instance to use across your entire backend
export const prisma = new PrismaClient({ adapter });