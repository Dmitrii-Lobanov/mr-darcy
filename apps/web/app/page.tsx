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
        <ul className="catalog-grid">
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
                <article className="session-card">
                  <section className="intro">
                    <p className="eyebrow">Small classes. Good company.</p>
                    <h1>Make room for a lovely afternoon.</h1>
                    <p>
                      Hands in clay. Flour on the table. Discover something
                      worth making time for.
                    </p>
                  </section>

                  <h3>Upcoming classes</h3>
                  <p>{session.location}</p>

                  <p>
                    <time dateTime={session.startsAt}>{startsAt}</time>
                    {' · '}
                    {session.timeZone}
                  </p>

                  <p className="price">
                    <strong>{price}</strong> per person
                  </p>
                  <p>Class capacity: {session.capacity} places</p>
                  <p className="booking-status">Booking opens soon.</p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
