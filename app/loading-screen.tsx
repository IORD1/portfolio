'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import LoaderTuner from './loader-tuner';
import { BLOOM_EVENT, FLOWER, FLOWERS } from './loader-config';

/**
 * Full-screen loading overlay: the name logo with a light sweep ("shine") over
 * the letterforms, paper flowers blooming frame by frame one after another around
 * the logo's top-right corner, a hairline progress bar and a caption. Follows the page theme
 * (light/dark) via the CSS tokens in globals.css (`.loader*`).
 *
 * Two ways in:
 *  - `DeskLoadingGate` shows it on page load until the desk assets (cutting mat,
 *    3D plant, 3D lamp) have rendered their first frame, and then until flower
 *    `FLOWER.gateFlower` (the third) is at full bloom, so the relay is never cut off mid-bud.
 *    Its overlay is opaque from the very first paint (no fade-in), so the desk never shows through.
 *  - `LoadingScreenButton` (nav) opens it on demand for previewing.
 *
 * Dev tuning: open the page with `?tune=1` (dev builds only) for a "Loader tuner"
 * panel (app/loader-tuner.tsx) with sliders for the flower and logo. In that mode the
 * gate stays open until the panel's "Dismiss" button.
 */

/* ---------- Flower bloom (frame animation) ---------- */

const frameSrc = (id: string, k: number) => `/desk/flower/${id}/step-${String(k + 1).padStart(2, '0')}.webp`;

/** All flowers, stepped by one shared clock (see FLOWER in loader-config.ts). */
function LoaderFlowers() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    window.__flower = FLOWER;
    const sets = Array.from(host.querySelectorAll<HTMLElement>('.loader-flower')).map((el) =>
      Array.from(el.querySelectorAll('img'))
    );
    let t = 0;
    let dir = 1;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const startOf = (k: number) => k * Math.max(0, Math.round((window.__flower ?? FLOWER).gap));
    const lastTick = () => Math.max(...sets.map((imgs, k) => startOf(k) + imgs.length - 1));
    // chain: each flower repeats with this period, so flower 1 buds again `hold` after the last bloom
    const periodOf = (f: typeof FLOWER) => Math.max(1, lastTick() + Math.max(0, Math.round(f.hold / f.step)));
    const draw = (chain: boolean) => {
      const f = window.__flower ?? FLOWER;
      const gateAt = Math.min(Math.max(1, Math.round(f.gateFlower)), sets.length) - 1;
      let bloomed = false;
      sets.forEach((imgs, k) => {
        let local = t - startOf(k); // < 0: not started yet
        if (chain && local >= 0) local %= periodOf(f);
        local = Math.min(local, imgs.length - 1);
        imgs.forEach((im, i) => im.toggleAttribute('data-on', i === local));
        if (k === gateAt) bloomed = local === imgs.length - 1;
      });
      // The page-load gate waits for this before revealing the page.
      const was = FLOWER.bloomed;
      FLOWER.bloomed = bloomed;
      if (bloomed && !was) document.dispatchEvent(new Event(BLOOM_EVENT));
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      t = lastTick();
      draw(false);
      return;
    }

    const tick = () => {
      const f = window.__flower ?? FLOWER;
      const end = lastTick();
      let wait = f.step;
      if (f.mode === 'chain') {
        draw(true);
        t++;
      } else {
        t = Math.min(t, end);
        draw(false);
        if (f.mode === 'once') {
          if (t === end) return;
          t++;
        } else if (f.mode === 'pingpong') {
          if (t === end) dir = -1;
          else if (t === 0) dir = 1;
          if (t === end || t === 0) wait = f.hold;
          t += dir;
        } else {
          if (t === end) {
            wait = f.hold;
            t = 0;
          } else t++;
        }
      }
      timer = setTimeout(tick, wait);
    };
    FLOWER.restart = () => {
      clearTimeout(timer);
      t = 0;
      dir = 1;
      tick();
    };
    tick();
    return () => {
      clearTimeout(timer);
      FLOWER.restart = undefined;
      FLOWER.bloomed = false;
    };
  }, []);

  return (
    <div className="loader-flowers" ref={ref} aria-hidden="true">
      {FLOWERS.map((fl, k) => (
        <div key={fl.id} className={`loader-flower loader-flower-${k + 1}`}>
          {Array.from({ length: fl.frames }, (_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={frameSrc(fl.id, i)} alt="" draggable={false} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Overlay ---------- */

export function LoadingScreen({
  open,
  onClose,
  dismissible = false,
  instant = false,
}: {
  open: boolean;
  onClose?: () => void;
  /** Click anywhere / Esc closes it and a hint says so (preview mode). */
  dismissible?: boolean;
  /** Opaque from the first frame instead of fading in (page-load gate). */
  instant?: boolean;
}) {
  // Stays mounted for the fade-out after `open` flips false; "closing" is derived from that.
  const [mounted, setMounted] = useState(open);
  const [tune, setTune] = useState(false);
  if (open && !mounted) setMounted(true);
  const closing = mounted && !open;

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => setMounted(false), 480);
    return () => clearTimeout(t);
  }, [closing]);

  useEffect(() => {
    if (!open || !dismissible || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissible, onClose]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !new URLSearchParams(location.search).has('tune')) return;
    const t = setTimeout(() => setTune(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="loader"
      data-closing={closing || undefined}
      data-dismissible={dismissible || undefined}
      data-instant={instant || undefined}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      onClick={dismissible ? onClose : undefined}
    >
      <div className="loader-inner">
        <div className="loader-logo-wrap">
          <div className="loader-logo-glow" aria-hidden="true" />
          <div className="loader-logo" aria-hidden="true" />
          <LoaderFlowers />
        </div>
        <div className="loader-bar" aria-hidden="true"><span /></div>
        <div className="loader-caption">Setting up the desk</div>
      </div>
      {dismissible && <div className="loader-hint">click anywhere or press Esc to dismiss</div>}
      {tune && <LoaderTuner onDismiss={onClose} />}
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
/** Once the assets are in, give up waiting for the gate flower's bloom after this long. */
const MAX_BLOOM_WAIT_MS = 8000;

function deskAssetsReady(): boolean {
  const mat = document.querySelector<HTMLImageElement>(MAT_SEL);
  if (mat && !mat.complete) return false;
  const hosts = document.querySelectorAll<HTMLElement>(GL_SEL);
  for (const h of hosts) if (h.dataset.loaded !== '1') return false;
  return true;
}

/**
 * Renders the loading screen from the first (server) paint, opaque straight away, and hides
 * it once the desk's assets are in and flower `FLOWER.gateFlower` is at full bloom (so the
 * reveal lands on a bloom, never mid-relay). If the assets take longer, the relay keeps
 * cycling and the reveal lands on that flower's next bloom. Place it once on the homepage.
 */
export function DeskLoadingGate() {
  const [open, setOpen] = useState(true);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    // Tuning mode: stay open so the loader can be styled; the panel's "Dismiss" closes it.
    if (process.env.NODE_ENV === 'development' && new URLSearchParams(location.search).has('tune')) return;

    const t0 = performance.now();
    let done = false;
    let closed = false;
    let minTimer: ReturnType<typeof setTimeout> | undefined;
    let bloomTimer: ReturnType<typeof setTimeout> | undefined;

    const reveal = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener(BLOOM_EVENT, reveal);
      setOpen(false);
    };
    // Assets are in: wait out the minimum show time, then for the gate flower's bloom
    // (reveal at once if it is showing its bloom frame right now).
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - t0));
      minTimer = setTimeout(() => {
        if (FLOWER.bloomed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return reveal();
        document.addEventListener(BLOOM_EVENT, reveal);
        bloomTimer = setTimeout(reveal, MAX_BLOOM_WAIT_MS);
      }, wait);
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

    const safety = setTimeout(reveal, MAX_WAIT_MS);
    check();

    return () => {
      mo.disconnect();
      mat?.removeEventListener('load', check);
      mat?.removeEventListener('error', check);
      document.removeEventListener(BLOOM_EVENT, reveal);
      clearTimeout(safety);
      if (minTimer) clearTimeout(minTimer);
      if (bloomTimer) clearTimeout(bloomTimer);
    };
  }, []);

  return <LoadingScreen open={open} onClose={close} instant />;
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
