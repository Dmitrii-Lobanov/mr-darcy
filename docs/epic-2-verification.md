# Epic 2 verification

## Environment

- Date: YYYY-MM-DD
- Tested commit: COMMIT_HASH
- Operating system: OS_AND_VERSION
- Node.js: VERSION
- npm: VERSION
- PostgreSQL: 17, Docker Compose
- GitHub Actions run: RUN_URL

## Results

- Fresh-clone installation: RESULT
- Initial migrations and seed: RESULT
- Migration rerun: RESULT
- Repeated seed preserves three sessions: RESULT
- Formatting: RESULT
- ESLint: RESULT
- Backend and frontend type checks: RESULT
- PostgreSQL integration tests: RESULT
- Desktop and mobile Chromium browser tests: RESULT
- Production builds: RESULT
- Generated API contract consistency: RESULT
- Manual navigation and API-error recovery: RESULT
- Keyboard navigation and narrow viewport: RESULT

## Implemented

A PostgreSQL-backed session catalog with detail pages,
explicit migrations, reusable fixtures, generated API types,
page recovery states, integration tests, browser tests, and CI.

## Limitations

- Authentication and reservations are not implemented.
- Capacity is total class size, not live availability.
- Browser automation currently covers Chromium only.
- Mobile emulation is not real-device testing.
- No load testing or production-readiness claim.

## Interview explanation

The browser requests a Next.js page. Its server component calls
NestJS through an OpenAPI-typed client. NestJS queries PostgreSQL
through TypeORM and maps entities to public response DTOs.

Migrations control schema changes. Database constraints protect
individual session rows. Tests use a separate database and
isolated schemas to avoid modifying development data.
