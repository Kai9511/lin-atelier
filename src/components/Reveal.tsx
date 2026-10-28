'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fades content up as it scrolls into view.
 * The server renders it fully visible, so nothing is ever hidden without JavaScript.
 * Only elements that start below the fold are hidden, then revealed.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'server' | 'hidden' | 'shown'>('server');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      setState('shown');
      return;
    }
    setState('hidden');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('shown');
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: state === 'shown' ? `${delay}ms` : undefined }}
      className={`transition-[opacity,transform] duration-[900ms] ease-gallery ${
        state === 'hidden' ? 'translate-y-7 opacity-0' : 'translate-y-0 opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
