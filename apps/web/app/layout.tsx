import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Mr. Darcy',
  description: 'Reservations, properly arranged.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <p>Mr. Darcy</p>
          <p>Reservations, properly arranged.</p>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
