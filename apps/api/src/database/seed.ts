import dataSource from './data-source.js';
import { SessionEntity } from '../sessions/session.entity.js';

function buildSessions(anchorDate: string) {
  const anchor = new Date(`${anchorDate}T15:00:00.000Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(anchorDate) ||
    Number.isNaN(anchor.getTime()) ||
    anchor.toISOString().slice(0, 10) !== anchorDate
  ) {
    throw new Error('SEED_ANCHOR must be a valid YYYY-MM-DD date');
  }

  const examples = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      title: 'A turn at the pottery wheel',
      description:
        'Learn to shape a small clay vessel. Materials and firing included.',
      location: 'The Clay Room, Quito',
      capacity: 10,
      priceMinor: 4800,
      daysAfterAnchor: 2,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      title: 'Pasta, made with patience',
      description:
        'Make fresh pasta and a seasonal sauce, then enjoy the results together.',
      location: 'Kitchen No. 4, Quito',
      capacity: 8,
      priceMinor: 6500,
      daysAfterAnchor: 4,
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      title: 'Flowers for an ordinary day',
      description:
        'Arrange seasonal flowers and take your creation home. Vase included.',
      location: 'The Garden Studio, Quito',
      capacity: 12,
      priceMinor: 4200,
      daysAfterAnchor: 7,
    },
  ];

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const durationMilliseconds = 2 * 60 * 60 * 1000;

  return examples.map(({ daysAfterAnchor, ...details }) => {
    const startsAt = new Date(
      anchor.getTime() + daysAfterAnchor * millisecondsPerDay,
    );

    return {
      ...details,
      startsAt,
      endsAt: new Date(startsAt.getTime() + durationMilliseconds),
      timeZone: 'America/Guayaquil',
      currency: 'USD' as const,
    };
  });
}

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
