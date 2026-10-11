import { useEffect, useRef } from 'react';

interface UseTiltOptions {
  maxTilt?: number; // max tilt degrees (e.g. 4-6deg)
  perspective?: number; // perspective in px
  scale?: number; // scale on hover
}

/**
 * Custom hook providing 3D perspective card tilt following the cursor (max 4-6°)
 * with dynamic specular glare highlight positioning.
 * Automatically respects prefers-reduced-motion and touch devices.
 */
export function useTilt<T extends HTMLElement>(options: UseTiltOptions = {}) {
  const { maxTilt = 5, perspective = 1000, scale = 1.01 } = options;
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Respect user motion preferences & touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalized from -0.5 to 0.5
        const normX = x / rect.width - 0.5;
        const normY = y / rect.height - 0.5;

        const rotateY = normX * maxTilt * 2;
        const rotateX = -normY * maxTilt * 2;

        el.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`;
        el.style.setProperty('--glare-x', `${((x / rect.width) * 100).toFixed(1)}%`);
        el.style.setProperty('--glare-y', `${((y / rect.height) * 100).toFixed(1)}%`);
        el.style.setProperty('--glare-opacity', '1');
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      el.style.setProperty('--glare-opacity', '0');
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.style.transform = '';
      el.style.removeProperty('--glare-x');
      el.style.removeProperty('--glare-y');
      el.style.removeProperty('--glare-opacity');
    };
  }, [maxTilt, perspective, scale]);

  return elementRef;
}
