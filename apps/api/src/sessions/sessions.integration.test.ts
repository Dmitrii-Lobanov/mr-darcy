import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, beforeEach, test } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from '../database/database-options.js';
import { SessionEntity } from './session.entity.js';
import type { SessionResponseDto } from './session-response.dto.js';
import { SessionsModule } from './sessions.module.js';

const databaseUrl =
  'postgresql://darcy_test:darcy_test_local@127.0.0.1:54330/mr_darcy_test';

const schema = `integration_${randomUUID().replaceAll('-', '')}`;

const options = {
  ...createDatabaseOptions(databaseUrl),
  schema,
  extra: {
    options: `-c search_path=${schema}`,
  },
};

const database = new DataSource(options);

let app: INestApplication | undefined;
let baseUrl: string;

before(async () => {
  await database.initialize();

  await database.query(`CREATE SCHEMA "${schema}"`);
  await database.runMigrations();

  const module = await Test.createTestingModule({
    imports: [TypeOrmModule.forRoot(options), SessionsModule],
  }).compile();

  app = module.createNestApplication({ logger: false });
  app.setGlobalPrefix('api');

  await app.listen(0, '127.0.0.1');

  baseUrl = await app.getUrl();
});

beforeEach(async () => {
  await database.getRepository(SessionEntity).clear();
});

after(async () => {
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
});

function exampleSession(id: string, startsAt: Date) {
  return {
    id,
    title: `Workshop ${id.slice(0, 8)}`,
    description: 'A synthetic workshop for integration testing.',
    location: 'Test Studio, Quito',
    startsAt,
    endsAt: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000),
    timeZone: 'America/Guayaquil',
    capacity: 10,
    priceMinor: 4800,
    currency: 'USD' as const,
  };
}

await test('catalog excludes past sessions and orders upcoming sessions', async () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const earlier = exampleSession(
    '11111111-1111-4111-8111-111111111111',
    new Date(now + day),
  );

  const later = exampleSession(
    '22222222-2222-4222-8222-222222222222',
    new Date(now + 2 * day),
  );

  const past = exampleSession(
    '33333333-3333-4333-8333-333333333333',
    new Date(now - day),
  );

  await database.getRepository(SessionEntity).insert([later, past, earlier]);

  const response = await fetch(`${baseUrl}/api/sessions`);

  assert.equal(response.status, 200);

  const body = (await response.json()) as SessionResponseDto[];

  assert.deepEqual(
    body.map((session) => session.id),
    [earlier.id, later.id],
  );

  assert.equal(body[0]?.startsAt, earlier.startsAt.toISOString());
  assert.equal(body[0]?.timeZone, 'America/Guayaquil');
  assert.equal(body[0]?.priceMinor, 4800);
  assert.equal(body[0]?.currency, 'USD');
});
