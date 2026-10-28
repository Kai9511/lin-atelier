export default function Loading() {
  const heights = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-[1/1]', 'aspect-[4/5]', 'aspect-[5/4]', 'aspect-[3/4]'];
  return (
    <div className="shell pb-16 pt-12 lg:pt-20" aria-busy="true" aria-label="Loading works">
      <div className="mb-16 h-16 w-48 animate-pulse-soft bg-mat lg:mb-24" />
      <div className="columns-1 gap-x-10 sm:columns-2 lg:columns-3">
        {heights.map((h, i) => (
          <div key={i} className={`mb-14 w-full animate-pulse-soft bg-mat ${h}`} style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}
