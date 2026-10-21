# Mr. Darcy

**Reservations, properly arranged.**

A workshop reservation platform built to explore full-stack
engineering, PostgreSQL correctness, and reliable background processing.

## Current scope

The current slice provides:

- An upcoming-session catalog and session details.
- A NestJS API backed by PostgreSQL.
- Explicit TypeORM migrations and synthetic session data.
- An OpenAPI-derived frontend contract.
- Loading, empty, not-found, and retryable error states.
- PostgreSQL integration tests and desktop/mobile browser tests.
- A GitHub Actions workflow for automated checks.

Reservations, authentication, simulated payments, and workers
are planned for later epics.

Displayed capacity is the total class size, not live availability.

## Stack and structure

- Next.js and React frontend.
- NestJS backend.
- TypeScript with ES modules.
- PostgreSQL 17 and TypeORM.
- npm workspaces and Docker Compose.
- Node's test runner and Playwright.

```text
apps/
  api/          Backend, migrations, fixtures, integration tests
  web/          Frontend and browser tests
packages/
  api-contract/ Generated API type declarations
docs/
  booking-rules.md
```

The frontend calls the API from server components.
Database access and business rules belong in the backend.

## Requirements

- Node.js 24.
- npm.
- Docker with Docker Compose.

The commands below assume a macOS or Linux shell.
No external service accounts or API keys are required.

## Local setup

Clone the repository and run commands from its root:

```bash
git clone https://github.com/Dmitrii-Lobanov/mr-darcy.git
cd mr-darcy

npm ci

cp .env.example .env
cp apps/web/.env.example apps/web/.env.local

docker compose up -d --wait postgres

npm run db:migrate --workspace @mr-darcy/api
npm run db:seed --workspace @mr-darcy/api
```

Start the API in one terminal:

```bash
npm run dev --workspace @mr-darcy/api
```

Start the frontend in another:

```bash
npm run dev --workspace @mr-darcy/web
```

Open:

- Frontend: http://127.0.0.1:3000
- API health: http://127.0.0.1:3001/api/health
- API documentation: http://127.0.0.1:3001/api/docs
- OpenAPI JSON: http://127.0.0.1:3001/api/docs-json

The health endpoint checks HTTP responsiveness.
It does not perform a database query on every request.

## Configuration

The root `.env` configures Docker Compose and the API.

`apps/web/.env.local` configures Next.js.
Its `API_ORIGIN` points to the NestJS server.

Both local environment files are excluded from Git.
Their `.env.example` counterparts document the required values.

The supplied database credentials are for local development.
Published database ports bind to loopback.

Default ports:

| Process                | Port  |
| ---------------------- | ----- |
| Development frontend   | 3000  |
| Development API        | 3001  |
| Development PostgreSQL | 54329 |
| Test PostgreSQL        | 54330 |
| Browser-test frontend  | 3100  |
| Browser-test API       | 3101  |

Restart the relevant server after changing environment configuration.

## Data model and migrations

Each session stores:

- A UUID, title, description, and location.
- Start and end instants, plus an IANA display timezone.
- Positive integer capacity.
- A nonnegative integer price in minor units.
- Currency and creation timestamp.

USD 48.00 is represented as 4800 cents.

Database constraints protect capacity, price, title, currency,
and the start/end relationship.

Automatic schema synchronization is disabled.
Schema changes are applied through explicit migrations.

Check migration status:

```bash
npm run db:status --workspace @mr-darcy/api
```

After an applied migration has been shared, introduce further
schema changes through new migrations.

## Synthetic sessions

The seed creates three fictional workshops with fixed IDs.

By default, they start 2, 4, and 7 days after today's UTC date,
at 15:00 UTC, displayed as 10:00 in America/Guayaquil.

Rerunning the seed skips existing IDs. It does not overwrite
edited sessions or move their dates forward.

For a repeatable date anchor on a fresh database:

```bash
SEED_ANCHOR=2030-01-01 npm run db:seed --workspace @mr-darcy/api
```

Existing rows remain unchanged even when the anchor changes.

## API contract

The frontend consumes generated declarations from
`@mr-darcy/api-contract`, rather than importing backend classes.

With the development API running:

```bash
npm run api:contract
npm run api:contract:check
```

Commit regenerated declarations when the documented API changes.
Do not edit files inside `generated/` manually.

Generated types provide compile-time agreement with OpenAPI.
They do not validate network responses at runtime.

## Checks

Start the separate test database:

```bash
docker compose --profile test up -d --wait postgres-test
```

Run static checks and PostgreSQL integration tests:

```bash
npm run format:check
npm run lint
npm run typecheck --workspace @mr-darcy/api
npm run typecheck --workspace @mr-darcy/web
npm run test:integration --workspace @mr-darcy/api
```

Check contract consistency while the development API is running:

```bash
npm run api:contract:check
```

For browser tests, stop the Next.js development server before
building. Leave ports 3100 and 3101 free:

```bash
npx playwright install chromium
npm run test:e2e
```

The browser command builds both applications and starts its own
servers. It does not require the development API to be running.

Expected test coverage:

- Six PostgreSQL integration tests covering catalog behavior,
  details, error responses, empty results, and constraints.
- Two browser journeys executed in desktop and mobile
  Chromium configurations.

Tests use a separate database and unique schemas, not development
rows. Normal shutdown removes their schemas.

Mobile emulation does not establish compatibility with every
mobile device or browser.

Failure screenshots and traces are written to `test-results/`.

To watch the desktop journey:

```bash
npm run test:e2e -- --project=desktop --headed
```

## Demonstration

1. Browse the three upcoming workshops.
2. Open a session and inspect its price, capacity, and timezone.
3. Return to the catalog.
4. Visit `/sessions/not-a-uuid` to see missing-page recovery.
5. Stop the development API and refresh the frontend.
6. Restart the API and select "Try again" to verify recovery.

Booking is intentionally unavailable in this slice.

## Stopping and resetting

Stop both application processes with Ctrl+C.

Stop containers while preserving development data:

```bash
docker compose --profile test down
```

Test database storage is temporary.

The following optional reset deletes all local development
database data. Use it only when deliberately rebuilding a
disposable demo database:

```bash
docker compose --profile test down --volumes
docker compose up -d --wait postgres
npm run db:migrate --workspace @mr-darcy/api
npm run db:seed --workspace @mr-darcy/api
```

## Continuous integration

GitHub Actions runs formatting, linting, type checks, migrations,
contract consistency, integration tests, and browser tests.

Inspect the actual workflow result in the repository's Actions
tab. On failure, available browser diagnostics and the API log
are retained as artifacts.

## Next epic

Authentication and API authorization.

The planned reservation invariants and acceptance criteria
are documented in [booking rules](docs/booking-rules.md).
