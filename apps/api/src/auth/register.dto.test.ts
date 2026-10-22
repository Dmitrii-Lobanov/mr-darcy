import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { RegisterDto } from './register.dto.js';
import { RegistrationValidationPipe } from './registration-validation.pipe.js';

const pipe = new RegistrationValidationPipe();
const password = '  Café workshop 🔑 passphrase  ';

async function parse(body: unknown): Promise<RegisterDto> {
  const result: unknown = await pipe.transform(body, {
    type: 'body',
    metatype: RegisterDto,
  });

  assert.ok(result instanceof RegisterDto);

  return result;
}

void test('registration normalizes email and preserves the password', async () => {
  const result = await parse({
    email: '  Ada+Workshop@Example.COM  ',
    password,
  });

  assert.equal(result.email, 'ada+workshop@example.com');
  assert.equal(result.password, password);
});

void test('registration rejects fields that could assign identity or role', async () => {
  for (const extra of [
    { role: 'organizer' },
    { role: 'customer' },
    { id: '11111111-1111-4111-8111-111111111111' },
  ]) {
    await assert.rejects(
      parse({
        email: 'ada@example.com',
        password,
        ...extra,
      }),
      BadRequestException,
    );
  }
});

void test('registration rejects invalid email and missing or non-string input', async () => {
  const invalidBodies = [
    { email: 'not-an-email', password },
    { email: 'adá@example.com', password },
    { email: 123, password },
    { email: 'ada@example.com', password: 123 },
    { email: 'ada@example.com' },
    { password },
    {},
  ];

  for (const body of invalidBodies) {
    await assert.rejects(parse(body), BadRequestException);
  }
});

void test('password length uses Unicode code points and includes both boundaries', async () => {
  for (const length of [15, 128]) {
    const candidate = '🔑'.repeat(length);

    const result = await parse({
      email: 'ada@example.com',
      password: candidate,
    });

    assert.equal(result.password, candidate);
  }

  for (const candidate of [
    '🔑'.repeat(14),
    '🔑'.repeat(129),
    `${'a'.repeat(128)}\n`,
  ]) {
    await assert.rejects(
      parse({
        email: 'ada@example.com',
        password: candidate,
      }),
      BadRequestException,
    );
  }
});
