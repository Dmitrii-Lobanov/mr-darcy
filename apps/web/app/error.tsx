'use client';

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <section aria-labelledby="error-title" role="alert">
      <h1 id="error-title">We couldn’t open the class book.</h1>
      <p>Please try again in a moment.</p>

      <button type="button" onClick={() => retry()}>
        Try again
      </button>
    </section>
  );
}
