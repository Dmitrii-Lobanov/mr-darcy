import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, beforeEach, test } from 'node:test';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from '../database/database-options.js';
import { UserEntity } from './user.entity.js';

const databaseUrl =
  'postgresql://darcy_test:darcy_test_local@127.0.0.1:54330/mr_darcy_test';

const schema = `users_${randomUUID().replaceAll('-', '')}`;

const database = new DataSource({
  ...createDatabaseOptions(databaseUrl),
  schema,
  extra: {
    options: `-c search_path=${schema}`,
  },
});

const repository = database.getRepository(UserEntity);

// A storage fixture only; password hashing is tested in a later step.
const passwordHash = 'test-only-password-hash';

before(async () => {
  await database.initialize();
  await database.query(`CREATE SCHEMA "${schema}"`);
  await database.runMigrations();
});

beforeEach(async () => {
  await repository.clear();
});

after(async () => {
  if (database.isInitialized) {
    try {
      await database.query(`DROP SCHEMA "${schema}" CASCADE`);
    } finally {
      await database.destroy();
    }
  }
});

void test('users default to customer and receive timestamps', async () => {
  const id = randomUUID();

  await repository.insert({
    id,
    email: 'ada@example.com',
    passwordHash,
  });

  const user = await repository.findOneByOrFail({ id });

  assert.equal(user.email, 'ada@example.com');
  assert.equal(user.role, 'customer');
  assert.ok(user.createdAt instanceof Date);
  assert.ok(user.updatedAt instanceof Date);
  assert.ok(Number.isFinite(user.createdAt.getTime()));
  assert.ok(Number.isFinite(user.updatedAt.getTime()));
});

void test('ordinary user queries omit the password hash', async () => {
  const id = randomUUID();

  await repository.insert({
    id,
    email: 'ada@example.com',
    passwordHash,
  });

  const ordinaryUser = await repository.findOneByOrFail({ id });

  assert.equal(ordinaryUser.passwordHash, undefined);
  assert.equal(JSON.stringify(ordinaryUser).includes(passwordHash), false);

  const loginUser = await repository
    .createQueryBuilder('user')
    .addSelect('user.passwordHash')
    .where('user.id = :id', { id })
    .getOneOrFail();

  assert.equal(loginUser.passwordHash, passwordHash);
});

void test('concurrent inserts cannot create duplicate emails', async () => {
  const results = await Promise.allSettled([
    repository.insert({
      id: randomUUID(),
      email: 'ada@example.com',
      passwordHash,
    }),
    repository.insert({
      id: randomUUID(),
      email: 'ada@example.com',
      passwordHash,
    }),
  ]);

  const successes = results.filter((result) => result.status === 'fulfilled');
  const failures = results.filter((result) => result.status === 'rejected');

  assert.equal(successes.length, 1);
  assert.equal(failures.length, 1);

  const failure = failures[0];
  assert.ok(failure);

  const reason: unknown = failure.reason;
  assert.ok(reason instanceof Error);

  await assert.rejects(Promise.reject(reason), {
    code: '23505',
    constraint: 'users_email_unique',
  });

  assert.equal(await repository.count(), 1);
});

void test('database checks reject invalid user data', async () => {
  const invalidCases = [
    {
      email: 'Ada@example.com',
      passwordHash,
      role: 'customer',
      constraint: 'users_email_normalized',
    },
    {
      email: ' ada@example.com ',
      passwordHash,
      role: 'customer',
      constraint: 'users_email_normalized',
    },
    {
      email: 'ada\t@example.com',
      passwordHash,
      role: 'customer',
      constraint: 'users_email_normalized',
    },
    {
      email: '',
      passwordHash,
      role: 'customer',
      constraint: 'users_email_nonblank',
    },
    {
      email: 'adá@example.com',
      passwordHash,
      role: 'customer',
      constraint: 'users_email_ascii',
    },
    {
      email: 'ada@example.com',
      passwordHash,
      role: 'admin',
      constraint: 'users_role_valid',
    },
    {
      email: 'ada@example.com',
      passwordHash: '   ',
      role: 'customer',
      constraint: 'users_password_hash_nonblank',
    },
  ];

  for (const invalid of invalidCases) {
    await assert.rejects(
      database.query(
        `INSERT INTO "users" ("id", "email", "password_hash", "role")
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), invalid.email, invalid.passwordHash, invalid.role],
      ),
      {
        code: '23514',
        constraint: invalid.constraint,
      },
    );
  }

  assert.equal(await repository.count(), 0);
});
