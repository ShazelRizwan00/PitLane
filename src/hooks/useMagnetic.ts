import { useEffect, useRef } from 'react';

interface UseMagneticOptions {
  strength?: number; // max pull factor, e.g. 0.25 (moves a few pixels)
  maxDistance?: number; // max displacement in pixels (default 5px)
}

/**
 * Custom hook providing magnetic attraction toward the cursor on hover.
 * Applied to interactive triggers like '?' shortcut button, 'Time:' toggle, etc.
 */
export function useMagnetic<T extends HTMLElement>(options: UseMagneticOptions = {}) {
  const { strength = 0.25, maxDistance = 5 } = options;
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
        const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

        el.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = 'translate3d(0, 0, 0)';
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.style.transform = '';
    };
  }, [strength, maxDistance]);

  return elementRef;
}
