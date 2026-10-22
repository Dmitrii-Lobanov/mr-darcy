import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PasswordService } from './password.service.js';

const service = new PasswordService();

void test('a password can be hashed and verified', async () => {
  const password = 'a sufficiently long passphrase';
  const passwordHash = await service.hash(password);

  assert.ok(passwordHash.startsWith('$argon2id$'));
  assert.equal(await service.verify(passwordHash, password), true);
  assert.equal(
    await service.verify(passwordHash, 'a different long passphrase'),
    false,
  );
});

void test('hashing the same password produces independently salted hashes', async () => {
  const password = 'another sufficiently long passphrase';

  const first = await service.hash(password);
  const second = await service.hash(password);

  assert.notEqual(first, second);
  assert.equal(await service.verify(first, password), true);
  assert.equal(await service.verify(second, password), true);
});

void test('password verification preserves whitespace and Unicode', async () => {
  const password = '  Café workshop 🔑 passphrase  ';
  const passwordHash = await service.hash(password);

  assert.equal(await service.verify(passwordHash, password), true);
  assert.equal(await service.verify(passwordHash, password.trim()), false);
  assert.equal(
    await service.verify(passwordHash, password.toLowerCase()),
    false,
  );
  assert.equal(
    await service.verify(passwordHash, password.normalize('NFD')),
    false,
  );
});

void test('a malformed stored hash raises an error', async () => {
  await assert.rejects(
    service.verify('not-an-encoded-hash', 'a sufficiently long passphrase'),
    Error,
  );
});
