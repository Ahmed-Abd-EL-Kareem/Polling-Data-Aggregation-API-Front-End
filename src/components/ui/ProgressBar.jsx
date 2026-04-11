import * as React from 'react';
import gsap from 'gsap';
import { cn } from '../../utils/cn';

export function ProgressBar({
  value,
  className,
  trackClassName,
  barClassName,
  highlight,
}) {
  const barRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    gsap.to(el, {
      width: `${Math.min(100, Math.max(0, value))}%`,
      duration: 0.85,
      ease: 'power2.out',
    });
  }, [value]);

  return (
    <div className={cn('relative h-3 w-full overflow-hidden rounded-full bg-surface-container-highest', trackClassName, className)}>
      <div
        ref={barRef}
        className={cn(
          'absolute start-0 top-0 h-full rounded-full bg-gradient-to-r from-secondary to-primary shadow-[0_0_12px_rgba(78,222,163,0.35)]',
          highlight && 'ring-2 ring-secondary/80',
          barClassName
        )}
        style={{ width: 0 }}
      />
    </div>
  );
}
