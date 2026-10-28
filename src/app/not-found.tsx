import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="shell flex min-h-screen flex-col items-start justify-center gap-6 py-24">
      <p className="eyebrow">404</p>
      <h1 className="page-title">
        <span className="block">此页不在。</span>
        <span className="block text-[0.45em] tracking-normal font-sans font-normal mt-2">This page is not here.</span>
      </h1>
      <Link href="/works" className="text-link mt-4">
        <span className="block">返回作品</span>
        <span className="block text-[11px]">Back to the works</span>
      </Link>
    </main>
  );
}
