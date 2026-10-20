import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <>
      <h1>That page could not be found.</h1>
      <p>Explore our upcoming classes to find something lovely.</p>
      <Link href="/">Explore classes</Link>
    </>
  );
}
