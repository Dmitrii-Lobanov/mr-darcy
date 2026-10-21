import dataSource from './data-source.js';
import { SessionEntity } from '../sessions/session.entity.js';
import { buildSessions } from './session-fixtures.js';

async function seed(): Promise<void> {
  const anchorDate =
    process.env.SEED_ANCHOR ?? new Date().toISOString().slice(0, 10);

  const sessions = buildSessions(anchorDate);

  await dataSource.initialize();

  try {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(SessionEntity)
      .values(sessions)
      .orIgnore()
      .execute();

    console.log(`Seed completed using anchor ${anchorDate}.`);
    console.log('Existing sessions were preserved.');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error('Session seed failed:', error);
  process.exitCode = 1;
});
