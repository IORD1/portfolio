'use client';

import { useEffect, useState } from 'react';
import { FLOWER, FLOWERS } from './loader-config';

/**
 * Dev-only tuning panel for the loading screen (rendered by app/loading-screen.tsx only in
 * development and only when the URL has `?tune=1`). Same idea as app/desk-tuner.tsx:
 *
 *  - `css.*` controls set `--<key>` on <html> as inline styles (the defaults live on
 *    :root in globals.css, under "Loading screen").
 *  - `flower.*` controls mutate `window.__flower` (the FLOWER object read every tick).
 *
 * Changed values are kept in localStorage (`loader-tune`) across reloads; only touched
 * keys are stored. "Copy config" puts a JSON of every current value (plus the list of
 * changed keys) on the clipboard, ready to be hard-coded into globals.css / FLOWER.
 */

type NumCtl = { kind: 'num'; id: string; label: string; min: number; max: number; step: number; unit?: string; def: number };
type SegCtl = { kind: 'seg'; id: string; label: string; options: string[]; def: string };
type Ctl = NumCtl | SegCtl;
type Group = { title: string; ctls: Ctl[] };

const STORE = 'loader-tune';
type Stored = Record<string, number | string>;

type FlowerDefs = { size: number; x: number; y: number; rot: number; opacity: number; shadow: number; z: number };
const flowerGroup = (n: number, name: string, d: FlowerDefs): Group => ({
  title: `Flower ${n} (${name})`,
  ctls: [
    { kind: 'num', id: `css.flower${n}-size`, label: 'size', min: 40, max: 480, step: 1, unit: 'px', def: d.size },
    { kind: 'num', id: `css.flower${n}-x`, label: 'x (from logo right)', min: -600, max: 600, step: 1, unit: 'px', def: d.x },
    { kind: 'num', id: `css.flower${n}-y`, label: 'y (from logo top)', min: -600, max: 600, step: 1, unit: 'px', def: d.y },
    { kind: 'num', id: `css.flower${n}-rot`, label: 'rotate', min: -180, max: 180, step: 1, unit: 'deg', def: d.rot },
    { kind: 'num', id: `css.flower${n}-opacity`, label: 'opacity', min: 0, max: 1, step: 0.01, def: d.opacity },
    { kind: 'num', id: `css.flower${n}-shadow`, label: 'shadow', min: 0, max: 1, step: 0.01, def: d.shadow },
    { kind: 'num', id: `css.flower${n}-z`, label: 'stack order', min: 0, max: 9, step: 1, def: d.z },
  ],
});

// Defaults must match the `--flower<n>-*` / `--loader-*` values on :root in globals.css.
const GROUPS: Group[] = [
  flowerGroup(1, FLOWERS[0].id, { size: 186, x: -443, y: 285, rot: 0, opacity: 1, shadow: 0.15, z: 0 }),
  flowerGroup(2, FLOWERS[1].id, { size: 170, x: -299, y: 99, rot: 0, opacity: 1, shadow: 0.15, z: 9 }),
  flowerGroup(3, FLOWERS[2].id, { size: 404, x: 310, y: -91, rot: 0, opacity: 1, shadow: 0.15, z: 9 }),
  flowerGroup(4, FLOWERS[3].id, { size: 114, x: 145, y: 127, rot: 0, opacity: 1, shadow: 0.15, z: 9 }),
  {
    title: 'Bloom',
    ctls: [
      { kind: 'num', id: 'flower.step', label: 'step', min: 40, max: 1000, step: 10, unit: 'ms', def: FLOWER.step },
      { kind: 'num', id: 'flower.hold', label: 'pause after last', min: 0, max: 4000, step: 50, unit: 'ms', def: FLOWER.hold },
      { kind: 'num', id: 'flower.gap', label: 'gap to next bud', min: 0, max: 12, step: 1, unit: ' frames', def: FLOWER.gap },
      { kind: 'seg', id: 'flower.mode', label: 'mode', options: ['chain', 'loop', 'pingpong', 'once'], def: FLOWER.mode },
    ],
  },
  {
    title: 'Logo',
    ctls: [
      { kind: 'num', id: 'css.loader-scale', label: 'logo scale', min: 0.1, max: 2, step: 0.01, def: 0.45 },
      { kind: 'num', id: 'css.loader-shine-dur', label: 'shine period', min: 0.6, max: 6, step: 0.1, unit: 's', def: 3.8 },
      { kind: 'num', id: 'css.loader-glow', label: 'halo', min: 0, max: 1, step: 0.01, def: 0.28 },
    ],
  },
];

function loadStored(): Stored {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '{}');
  } catch {
    return {};
  }
}
function saveStored(s: Stored) {
  try {
    if (Object.keys(s).length) localStorage.setItem(STORE, JSON.stringify(s));
    else localStorage.removeItem(STORE);
  } catch {}
}

const valueOf = (c: Ctl, st: Stored) => (c.id in st ? st[c.id] : c.def);

/** Push one control's value into the page (CSS var on <html>, or the FLOWER object). */
function apply(c: Ctl, st: Stored) {
  const v = valueOf(c, st);
  const changed = c.id in st;
  if (c.id.startsWith('css.')) {
    const prop = `--${c.id.slice(4)}`;
    const root = document.documentElement;
    if (changed) root.style.setProperty(prop, `${v}${c.kind === 'num' && c.unit ? c.unit : ''}`);
    else root.style.removeProperty(prop);
  } else {
    const f = window.__flower ?? FLOWER;
    const key = c.id.slice('flower.'.length) as 'step' | 'hold' | 'gap' | 'mode';
    if (key === 'mode') f.mode = v as typeof f.mode;
    else f[key] = v as number;
  }
}
function applyAll(st: Stored) {
  for (const g of GROUPS) for (const c of g.ctls) apply(c, st);
}

function configJson(st: Stored) {
  const out: Record<string, Record<string, number | string>> = {};
  for (const g of GROUPS)
    for (const c of g.ctls) {
      const [section, key] = [c.id.slice(0, c.id.indexOf('.')), c.id.slice(c.id.indexOf('.') + 1)];
      const v = valueOf(c, st);
      (out[section] ??= {})[key] = c.kind === 'num' && c.unit ? `${v}${c.unit}` : v;
    }
  return JSON.stringify({ ...out, changed: Object.keys(st) }, null, 2);
}

const css = `
.ltune { position: fixed; left: 12px; bottom: 12px; z-index: 9999; width: 330px; max-height: calc(100vh - 24px);
  overflow: auto; background: rgba(18, 18, 22, 0.94); color: #e8e8ea; border-radius: 10px; padding: 10px 12px;
  font: 12px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  cursor: default; text-align: left; }
.ltune-pill { position: fixed; left: 12px; bottom: 12px; z-index: 9999; background: rgba(18,18,22,0.94); color: #eee;
  border: 0; border-radius: 999px; padding: 8px 14px; font: 12px ui-monospace, monospace; cursor: pointer; }
.ltune-head { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
.ltune-head strong { flex: 1; font-weight: 600; }
.ltune button { background: #2c2c33; color: #eee; border: 1px solid #45454d; border-radius: 6px; padding: 4px 8px;
  font: inherit; cursor: pointer; }
.ltune button:hover { background: #3a3a42; }
.ltune button.on { background: #6b4a12; border-color: #b8842a; }
.ltune details { border-top: 1px solid #2e2e35; padding: 4px 0; }
.ltune summary { cursor: pointer; padding: 4px 0; color: #bdbdc4; user-select: none; }
.ltune summary .n { color: #ffd27a; margin-left: 6px; }
.ltune-row { display: grid; grid-template-columns: 104px 1fr 62px 16px; gap: 6px; align-items: center; padding: 2px 0; }
.ltune-row.changed label { color: #ffd27a; }
.ltune-row label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ltune-row input[type=range] { width: 100%; margin: 0; }
.ltune-row input[type=number] { width: 62px; background: #111; color: inherit; border: 1px solid #3a3a42; border-radius: 4px;
  padding: 2px 4px; font: inherit; }
.ltune-seg { grid-column: 2 / 4; display: flex; gap: 4px; }
.ltune-seg button { flex: 1; padding: 4px 2px; }
.ltune-row .x { background: none; border: 0; color: #777; padding: 0; cursor: pointer; }
.ltune-row .x:hover { color: #fff; }
.ltune textarea { width: 100%; height: 160px; margin-top: 6px; background: #111; color: #ddd; border: 1px solid #3a3a42;
  border-radius: 6px; font: 11px ui-monospace, monospace; }
.ltune-note { color: #8a8a92; margin-top: 6px; }
`;

export default function LoaderTuner({ onDismiss }: { onDismiss?: () => void }) {
  const [stored, setStored] = useState<Stored>({});
  const [open, setOpen] = useState(true);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const st = loadStored();
    applyAll(st);
    // Deferred so the initial state setting happens outside the effect body (react-hooks lint rule).
    const timer = setTimeout(() => {
      setStored(st);
      try {
        setOpen(localStorage.getItem(STORE + '-open') !== '0');
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const update = (next: Stored) => {
    setStored(next);
    saveStored(next);
    applyAll(next);
  };
  const change = (c: Ctl, v: number | string) => {
    const next = { ...stored };
    if (v === c.def) delete next[c.id];
    else next[c.id] = v;
    update(next);
  };
  const clear = (c: Ctl) => {
    const next = { ...stored };
    delete next[c.id];
    update(next);
  };
  const resetAll = () => update({});
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(configJson(stored));
      setCopied('copied ✓');
    } catch {
      setShow(true);
      setCopied('select & copy below');
    }
    setTimeout(() => setCopied(''), 1800);
  };
  const toggleOpen = () => {
    setOpen(!open);
    try {
      localStorage.setItem(STORE + '-open', open ? '0' : '1');
    } catch {}
  };
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  if (!open) {
    return (
      <>
        <style>{css}</style>
        <button className="ltune-pill" onClick={toggleOpen} onMouseDown={stop}>
          ✿ loader{Object.keys(stored).length ? ` (${Object.keys(stored).length})` : ''}
        </button>
      </>
    );
  }

  return (
    <div className="ltune" onClick={stop} onKeyDown={stop}>
      <style>{css}</style>
      <div className="ltune-head">
        <strong>Loader tuner</strong>
        <button onClick={copy}>{copied || 'Copy config'}</button>
        <button onClick={() => setShow(!show)} title="show the config JSON">{'{}'}</button>
        <button onClick={resetAll} title="clear all changes">Reset</button>
        <button onClick={() => (window.__flower ?? FLOWER).restart?.()} title="play the bloom from the bud">↻ bloom</button>
        {onDismiss && <button onClick={onDismiss} title="close the loading screen">Dismiss</button>}
        <button onClick={toggleOpen} title="collapse">–</button>
      </div>
      {show && <textarea readOnly value={configJson(stored)} onFocus={(e) => e.currentTarget.select()} />}
      {GROUPS.map((g) => {
        const n = g.ctls.filter((c) => c.id in stored).length;
        return (
          <details key={g.title} open>
            <summary>
              {g.title}
              {n > 0 && <span className="n">●{n}</span>}
            </summary>
            {g.ctls.map((c) => {
              const changed = c.id in stored;
              const v = valueOf(c, stored);
              return (
                <div key={c.id} className={`ltune-row${changed ? ' changed' : ''}`}>
                  <label title={`${c.id} (default ${c.def}${c.kind === 'num' && c.unit ? c.unit : ''})`}>{c.label}</label>
                  {c.kind === 'num' ? (
                    <>
                      <input type="range" min={c.min} max={c.max} step={c.step} value={v as number} onChange={(e) => change(c, Number(e.target.value))} />
                      <input
                        type="number"
                        step={c.step}
                        value={Number((v as number).toFixed(4))}
                        onChange={(e) => e.target.value !== '' && change(c, Number(e.target.value))}
                      />
                    </>
                  ) : (
                    <div className="ltune-seg">
                      {c.options.map((o) => (
                        <button key={o} className={v === o ? 'on' : ''} onClick={() => change(c, o)}>
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                  <button className="x" title="reset to default" onClick={() => clear(c)} disabled={!changed}>
                    {changed ? '↺' : ''}
                  </button>
                </div>
              );
            })}
          </details>
        );
      })}
      <div className="ltune-note">
        Yellow = changed (kept in localStorage until Reset). Copy config → paste it to me and I&apos;ll hard-code it.
        Open the nav ◌ button to re-show the loader after Dismiss.
      </div>
    </div>
  );
}
