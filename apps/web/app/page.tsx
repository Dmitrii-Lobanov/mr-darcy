import { getSessions } from '../lib/api';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const sessions = await getSessions();

  return (
    <>
      <h1>Upcoming classes</h1>
      <p>Find your next afternoon well spent.</p>

      {sessions.length === 0 ? (
        <p>There are no upcoming classes. Please check back soon.</p>
      ) : (
        <ul>
          {sessions.map((session) => {
            const startsAt = new Intl.DateTimeFormat('en-US', {
              dateStyle: 'full',
              timeStyle: 'short',
              timeZone: session.timeZone,
            }).format(new Date(session.startsAt));

            const price = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: session.currency,
            }).format(session.priceMinor / 100);

            return (
              <li key={session.id}>
                <article>
                  <h2>
                    <Link href={`/sessions/${session.id}`}>
                      {session.title}
                    </Link>
                  </h2>
                  <p>{session.description}</p>
                  <p>{session.location}</p>

                  <p>
                    <time dateTime={session.startsAt}>{startsAt}</time>
                    {' · '}
                    {session.timeZone}
                  </p>

                  <p>{price} per person</p>
                  <p>Class capacity: {session.capacity} places</p>
                  <p>Booking opens soon.</p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
