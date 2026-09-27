'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Full-screen loading overlay: the name logo with a light sweep ("shine") over
 * the letterforms, a hairline progress bar and a caption. Follows the page theme
 * (light/dark) via the CSS tokens in globals.css (`.loader*`).
 *
 * Two ways in:
 *  - `DeskLoadingGate` shows it on page load until the desk assets (cutting mat,
 *    3D plant, 3D lamp) have rendered their first frame.
 *  - `LoadingScreenButton` (nav) opens it on demand for previewing.
 */
export function LoadingScreen({
  open,
  onClose,
  dismissible = false,
}: {
  open: boolean;
  onClose?: () => void;
  /** Click anywhere / Esc closes it and a hint says so (preview mode). */
  dismissible?: boolean;
}) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => setMounted(false), 480);
    return () => clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    if (!open || !dismissible || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissible, onClose]);

  if (!mounted) return null;

  return (
    <div
      className="loader"
      data-closing={closing || undefined}
      data-dismissible={dismissible || undefined}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      onClick={dismissible ? onClose : undefined}
    >
      <div className="loader-inner">
        <div className="loader-logo-wrap">
          <div className="loader-logo-glow" aria-hidden="true" />
          <div className="loader-logo" aria-hidden="true" />
        </div>
        <div className="loader-bar" aria-hidden="true"><span /></div>
        <div className="loader-caption">Setting up the desk</div>
      </div>
      {dismissible && <div className="loader-hint">click anywhere or press Esc to dismiss</div>}
    </div>
  );
}

/* ---------- Page-load gate ---------- */

/** Selectors of the desk assets the gate waits for. The 3D hosts set data-loaded="1"
 *  after their first rendered frame (desk-plant-three / desk-lamp-three). */
const MAT_SEL = '.desk .mat-svg';
const GL_SEL = '.desk .desk-plant, .desk .desk-lamp';

/** Shortest time the overlay stays up, so a warm cache doesn't produce a flash. */
const MIN_SHOW_MS = 700;
/** Give up waiting after this long (no WebGL, blocked asset, ...) and reveal the page. */
const MAX_WAIT_MS = 15000;

function deskAssetsReady(): boolean {
  const mat = document.querySelector<HTMLImageElement>(MAT_SEL);
  if (mat && !mat.complete) return false;
  const hosts = document.querySelectorAll<HTMLElement>(GL_SEL);
  for (const h of hosts) if (h.dataset.loaded !== '1') return false;
  return true;
}

/**
 * Renders the loading screen from the first (server) paint and hides it once the
 * desk's assets are in. Place it once, anywhere on the homepage.
 */
export function DeskLoadingGate() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t0 = performance.now();
    let done = false;
    let minTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - t0));
      minTimer = setTimeout(() => setOpen(false), wait);
    };
    const check = () => {
      if (deskAssetsReady()) finish();
    };

    // 3D hosts flip data-loaded when their first frame renders.
    const mo = new MutationObserver(check);
    const desk = document.querySelector('.desk');
    if (desk) mo.observe(desk, { subtree: true, attributes: true, attributeFilter: ['data-loaded'] });

    // The mat is a plain <img>.
    const mat = document.querySelector<HTMLImageElement>(MAT_SEL);
    mat?.addEventListener('load', check);
    mat?.addEventListener('error', check);

    const safety = setTimeout(finish, MAX_WAIT_MS);
    check();

    return () => {
      mo.disconnect();
      mat?.removeEventListener('load', check);
      mat?.removeEventListener('error', check);
      clearTimeout(safety);
      if (minTimer) clearTimeout(minTimer);
    };
  }, []);

  return <LoadingScreen open={open} />;
}

/* ---------- Nav preview button ---------- */

/** Nav button that opens the loading screen on demand (preview / testing). */
export default function LoadingScreenButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="loader-trigger"
        onClick={() => setOpen(true)}
        aria-label="Show loading screen"
        title="Show loading screen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.22-8.56" />
        </svg>
      </button>
      <LoadingScreen open={open} onClose={close} dismissible />
    </>
  );
}
