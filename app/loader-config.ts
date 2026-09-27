/**
 * The loading screen's paper flowers (app/loading-screen.tsx).
 *
 * All flowers bloom on one clock: every `step` ms the clock ticks and each flower shows
 * the frame for (tick - its start tick). Flower k starts `gap` ticks (frames) after flower
 * k-1, so they open one after another. Before its start a flower is hidden; after its last
 * frame it holds the bloom.
 *
 * Modes: `chain` = when the last flower reaches full bloom (plus `hold`), flower 1 starts
 * over from its bud and the rest follow at `gap`, so the relay never resets all at once.
 * `loop` = everything resets to the buds together after `hold`. `pingpong` runs the whole
 * set backwards. `once` stops at full bloom.
 *
 * Placement/size are CSS: `--flower<n>-*` on :root (globals.css). Timing is mutated live
 * by the dev tuner (app/loader-tuner.tsx) through `window.__flower`.
 * Own module so the tuner and the screen can both import it without a cycle.
 */
export const FLOWERS = [
  { id: 'teal', frames: 9 }, // public/desk/flower/teal/step-01..09.webp: closed bud -> full bloom
  { id: 'lotus', frames: 8 }, // public/desk/flower/lotus/step-01..08.webp
  { id: 'sunflower', frames: 8 }, // public/desk/flower/sunflower/step-01..08.webp (no transparent full-bloom frame yet)
  { id: 'lily', frames: 8 }, // public/desk/flower/lily/step-01..08.webp (frames padded to one canvas; no transparent full-bloom frame yet)
];

export const FLOWER = {
  step: 170, // ms per frame
  hold: 250, // ms after the last flower blooms before the cycle continues (also on the buds in pingpong)
  mode: 'chain' as 'chain' | 'loop' | 'pingpong' | 'once',
  gap: 7, // frames between one flower's bud and the next flower's bud (0 = bloom together)
  /** Restart from the buds (set by the component while mounted). */
  restart: undefined as undefined | (() => void),
};

declare global {
  interface Window {
    __flower?: typeof FLOWER;
  }
}
