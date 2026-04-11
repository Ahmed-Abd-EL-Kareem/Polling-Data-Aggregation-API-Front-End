import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePollCardsReveal(deps) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const cards = root.querySelectorAll('[data-poll-card]');
    if (!cards.length) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
      }
    );
  }, deps);

  return containerRef;
}
