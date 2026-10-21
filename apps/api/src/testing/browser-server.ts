import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from '../database/database-options.js';
import { buildSessions } from '../database/session-fixtures.js';
import { SessionEntity } from '../sessions/session.entity.js';
import { SessionsModule } from '../sessions/sessions.module.js';

const databaseUrl =
  'postgresql://darcy_test:darcy_test_local@127.0.0.1:54330/mr_darcy_test';

const schema = `browser_${randomUUID().replaceAll('-', '')}`;

const options = {
  ...createDatabaseOptions(databaseUrl),
  schema,
  extra: {
    options: `-c search_path=${schema}`,
  },
};

const database = new DataSource(options);

let app: INestApplication | undefined;
let stopping = false;

async function stop(): Promise<void> {
  if (stopping) {
    return;
  }

  stopping = true;

  try {
    await app?.close();
  } finally {
    if (database.isInitialized) {
      try {
        await database.query(`DROP SCHEMA "${schema}" CASCADE`);
      } finally {
        await database.destroy();
      }
    }
  }
}

function reportFailure(error: unknown): void {
  console.error('Browser-test server failed:', error);
  process.exitCode = 1;
}

function handleSignal(): void {
  void stop().catch(reportFailure);
}

async function start(): Promise<void> {
  await database.initialize();

  await database.query(`CREATE SCHEMA "${schema}"`);
  await database.runMigrations();

  const anchorDate = new Date().toISOString().slice(0, 10);

  await database.getRepository(SessionEntity).insert(buildSessions(anchorDate));

  const module = await Test.createTestingModule({
    imports: [TypeOrmModule.forRoot(options), SessionsModule],
  }).compile();

  app = module.createNestApplication({ logger: false });
  app.setGlobalPrefix('api');

  await app.listen(3101, '127.0.0.1');

  console.log('Browser-test API: http://127.0.0.1:3101/api/sessions');
}

process.once('SIGINT', handleSignal);
process.once('SIGTERM', handleSignal);

try {
  await start();
} catch (error: unknown) {
  reportFailure(error);
  await stop();
}
