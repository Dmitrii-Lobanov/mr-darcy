import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mr. Darcy — Reservations, properly arranged.',
  description: 'Small classes, good company, and an afternoon well spent.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="site-header">
          <div>
            <Link className="brand" href="/">
              Mr. Darcy
            </Link>
            <p className="tagline">Reservations, properly arranged.</p>
          </div>

          <nav aria-label="Main navigation">
            <Link href="/">Explore classes</Link>
          </nav>
        </header>

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <footer className="site-footer">
          <p>A little time, well spent.</p>
          <p>Demo catalog · Fictional workshops</p>
        </footer>
      </body>
    </html>
  );
}
