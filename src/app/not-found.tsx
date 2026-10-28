import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="shell flex min-h-screen flex-col items-start justify-center gap-6 py-24">
      <p className="eyebrow">404</p>
      <h1 className="page-title">
        This page
        <br />
        is not here.
      </h1>
      <Link href="/works" className="text-link mt-4">
        Back to the works
      </Link>
    </main>
  );
}
