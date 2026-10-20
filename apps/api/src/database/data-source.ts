import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './database-options.js';

const envPath = fileURLToPath(new URL('../../../../.env', import.meta.url));

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be configured');
}

export default new DataSource(createDatabaseOptions(databaseUrl));
