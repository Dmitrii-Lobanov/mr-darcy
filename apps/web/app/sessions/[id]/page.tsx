import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '../../../lib/api';

export const dynamic = 'force-dynamic';

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);

  if (session === null) {
    notFound();
  }

  const startsAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: session.timeZone,
  }).format(new Date(session.startsAt));

  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: session.currency,
  }).format(session.priceMinor / 100);

  const durationMinutes =
    (Date.parse(session.endsAt) - Date.parse(session.startsAt)) / 60000;

  return (
    <>
      <Link href="/">← All classes</Link>

      <h1>{session.title}</h1>
      <p>{session.description}</p>

      <dl className="session-facts">
        <dt>When</dt>
        <dd>
          <time dateTime={session.startsAt}>{startsAt}</time>
          {' · '}
          {session.timeZone}
        </dd>

        <dt>Duration</dt>
        <dd>{durationMinutes} minutes</dd>

        <dt>Where</dt>
        <dd>{session.location}</dd>

        <dt>Class capacity</dt>
        <dd>{session.capacity} places</dd>

        <dt>Price</dt>
        <dd>{price} per person</dd>
      </dl>

      <section className="booking-note" aria-labelledby="booking-status">
        <h2 id="booking-status">Booking opens soon</h2>
        <p>
          Reservations are not open yet. For now, explore our upcoming classes.
        </p>
      </section>
    </>
  );
}
