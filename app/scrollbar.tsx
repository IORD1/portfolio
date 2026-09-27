'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom page scrollbar: a full-height track pinned to the right edge with a
 * fixed-size thumb. The native scrollbar is hidden in globals.css.
 */
export default function Scrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const doc = document.documentElement;
    let raf = 0;

    const maxScroll = () => doc.scrollHeight - window.innerHeight;
    const travel = () => track.clientHeight - thumb.offsetHeight;

    const update = () => {
      raf = 0;
      const max = maxScroll();
      if (max <= 0) {
        track.style.display = 'none';
        return;
      }
      track.style.display = '';
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      thumb.style.transform = `translateY(${p * travel()}px)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Drag the thumb
    let dragging = false;
    let startY = 0;
    let startScroll = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startY = e.clientY;
      startScroll = window.scrollY;
      thumb.setPointerCapture(e.pointerId);
      thumb.classList.add('is-dragging');
      e.preventDefault();
      e.stopPropagation();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const range = travel();
      if (range <= 0) return;
      window.scrollTo(0, startScroll + (e.clientY - startY) * (maxScroll() / range));
    };
    const onUp = () => {
      dragging = false;
      thumb.classList.remove('is-dragging');
    };

    // Click on the track jumps there
    const onTrack = (e: PointerEvent) => {
      if (e.target !== track) return;
      const range = travel();
      if (range <= 0) return;
      const y = e.clientY - track.getBoundingClientRect().top - thumb.offsetHeight / 2;
      const p = Math.min(1, Math.max(0, y / range));
      window.scrollTo({ top: p * maxScroll(), behavior: 'smooth' });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    thumb.addEventListener('pointerdown', onDown);
    thumb.addEventListener('pointermove', onMove);
    thumb.addEventListener('pointerup', onUp);
    thumb.addEventListener('pointercancel', onUp);
    track.addEventListener('pointerdown', onTrack);
    update();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      thumb.removeEventListener('pointerdown', onDown);
      thumb.removeEventListener('pointermove', onMove);
      thumb.removeEventListener('pointerup', onUp);
      thumb.removeEventListener('pointercancel', onUp);
      track.removeEventListener('pointerdown', onTrack);
    };
  }, []);

  return (
    <div className="scrollbar" ref={trackRef} aria-hidden="true">
      <div className="scrollbar-thumb" ref={thumbRef} />
    </div>
  );
}
