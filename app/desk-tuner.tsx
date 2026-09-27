'use client';

import { useEffect, useState } from 'react';

/**
 * Dev-only tuning panel for the desk scene (rendered from page.tsx only in development,
 * and only when the URL has `?tune=1`; the screenshot script passes it with TUNE=1).
 *
 * Every control edits something the scene already reads live:
 *  - CSS custom properties on `.desk` (`--lamp-*`, `--plant-*`), set as inline styles
 *  - `window.__lamp` / `window.__plant` (the LAMP/LOOK/WIND objects, read every frame)
 *
 * Changed values are kept in localStorage (`desk-tune`) so they survive reloads while
 * experimenting; only keys the user touched are stored, so hard-coded defaults for the
 * other keys still show through. "Reset" clears them. "Copy config" puts a JSON of every
 * current value (plus the list of changed keys) on the clipboard, ready to be hard-coded
 * into globals.css / desk-lamp-three.tsx / desk-plant-three.tsx.
 */

type NumCtl = {
  kind: 'num';
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  def: number;
  get: () => number;
  set: (v: number) => void;
  clear: () => void;
};
type ColorCtl = {
  kind: 'color';
  id: string;
  label: string;
  def: string;
  get: () => string;
  set: (hex: string) => void;
  clear: () => void;
};
type Ctl = NumCtl | ColorCtl;
type Group = { title: string; ctls: Ctl[]; extra?: 'lamp' | 'theme' };

const STORE = 'desk-tune';
type Stored = Record<string, number | string>;

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

const hexOf = (n: number) => '#' + n.toString(16).padStart(6, '0');
const rgbToHex = (rgb: string) => {
  const [r, g, b] = rgb.trim().split(/[\s,]+/).map(Number);
  return hexOf(((r & 255) << 16) | ((g & 255) << 8) | (b & 255));
};
const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

// Which cutting mat is shown: 'svg' (default, page.tsx) or 'photo'. Stored under the key MAT.
const MAT = 'mat';
const applyMat = (desk: HTMLElement, st: Stored) => {
  if (st[MAT] === 'photo') desk.setAttribute('data-mat', 'photo');
  else desk.removeAttribute('data-mat');
};

// Defaults of the live JS objects, captured the first time we see each object
// (the objects are mutated in place, so the original value has to be remembered).
const jsDefaults = new WeakMap<object, Record<string, unknown>>();

function build(desk: HTMLElement, stored: Stored): Group[] {
  const groups: Group[] = [];

  // ---- CSS custom properties on .desk ----
  const cssNum = (name: string, label: string, min: number, max: number, step: number, unit = ''): NumCtl => {
    const id = `css.${name}`;
    desk.style.removeProperty(name);
    const def = parseFloat(getComputedStyle(desk).getPropertyValue(name)) || 0;
    const set = (v: number) => desk.style.setProperty(name, `${v}${unit}`);
    if (typeof stored[id] === 'number') set(stored[id] as number);
    return {
      kind: 'num',
      id,
      label,
      min,
      max,
      step,
      unit,
      def,
      get: () => parseFloat(desk.style.getPropertyValue(name) || getComputedStyle(desk).getPropertyValue(name)) || 0,
      set,
      clear: () => desk.style.removeProperty(name),
    };
  };
  const cssRgb = (name: string, label: string): ColorCtl => {
    const id = `css.${name}`;
    desk.style.removeProperty(name);
    const def = rgbToHex(getComputedStyle(desk).getPropertyValue(name) || '255 255 255');
    const set = (hex: string) => desk.style.setProperty(name, hexToRgb(hex));
    if (typeof stored[id] === 'string') set(stored[id] as string);
    return {
      kind: 'color',
      id,
      label,
      def,
      get: () => rgbToHex(desk.style.getPropertyValue(name) || getComputedStyle(desk).getPropertyValue(name)),
      set,
      clear: () => desk.style.removeProperty(name),
    };
  };

  // ---- live JS objects (window.__lamp / window.__plant) ----
  const jsNum = (
    obj: Record<string, unknown>,
    prefix: string,
    key: string,
    label: string,
    min: number,
    max: number,
    step: number,
    after?: () => void
  ): NumCtl => {
    const id = `${prefix}.${key}`;
    const d = jsDefaults.get(obj) ?? {};
    jsDefaults.set(obj, d);
    if (!(key in d)) d[key] = obj[key];
    const def = d[key] as number;
    const set = (v: number) => {
      obj[key] = v;
      after?.();
    };
    if (typeof stored[id] === 'number') set(stored[id] as number);
    return { kind: 'num', id, label, min, max, step, def, get: () => obj[key] as number, set, clear: () => set(def) };
  };
  const jsColor = (obj: Record<string, unknown>, prefix: string, key: string, label: string, after?: () => void): ColorCtl => {
    const id = `${prefix}.${key}`;
    const d = jsDefaults.get(obj) ?? {};
    jsDefaults.set(obj, d);
    if (!(key in d)) d[key] = obj[key];
    const def = hexOf(d[key] as number);
    const set = (hex: string) => {
      obj[key] = parseInt(hex.slice(1), 16);
      after?.();
    };
    if (typeof stored[id] === 'string') set(stored[id] as string);
    return { kind: 'color', id, label, def, get: () => hexOf(obj[key] as number), set, clear: () => set(def) };
  };

  // ---- Lamp ----
  groups.push({
    title: 'Lamp: place & size (CSS)',
    extra: 'lamp',
    ctls: [
      cssNum('--lamp-scale', 'size (× mat)', 0.1, 1, 0.005),
      cssNum('--lamp-x', 'x', -400, 800, 1, 'px'),
      cssNum('--lamp-y', 'y', -400, 800, 1, 'px'),
    ],
  });
  const lamp = window.__lamp as (Record<string, unknown> & { look: Record<string, unknown>; invalidate: () => void }) | undefined;
  if (lamp) {
    const redraw = () => lamp.invalidate();
    groups.push({
      title: 'Lamp: camera',
      ctls: [
        jsNum(lamp.look, 'lamp.look', 'theta', 'yaw', -180, 180, 1, redraw),
        jsNum(lamp.look, 'lamp.look', 'phi', 'pitch', 0, 89, 1, redraw),
        jsNum(lamp.look, 'lamp.look', 'distance', 'zoom (dist)', 0.3, 2, 0.01, redraw),
        jsNum(lamp.look, 'lamp.look', 'fov', 'fov', 15, 90, 1, redraw),
        jsNum(lamp.look, 'lamp.look', 'exposure', 'exposure', 0.1, 2, 0.01, redraw),
        jsNum(lamp.look, 'lamp.look', 'envIntensity', 'env light', 0, 3, 0.05, redraw),
      ],
    });
    groups.push({
      title: 'Lamp: light',
      ctls: [
        jsColor(lamp, 'lamp', 'color', 'bulb colour', redraw),
        jsNum(lamp, 'lamp', 'light', 'bulb power', 0, 20, 0.1, redraw),
        jsNum(lamp, 'lamp', 'glow', 'shade glow', 0, 5, 0.05, redraw),
        jsNum(lamp, 'lamp', 'capGlow', 'cap glow', 0, 1, 0.01, redraw),
        jsNum(lamp, 'lamp', 'glowFrom', 'glow from (h)', 0, 1, 0.01, redraw),
        jsNum(lamp, 'lamp', 'glowTo', 'glow to (h)', 0, 1, 0.01, redraw),
        cssRgb('--lamp-rgb', 'pool colour'),
        cssNum('--lamp-pool', 'pool size (× lamp)', 0.5, 8, 0.05),
        cssNum('--lamp-pool-a', 'pool strength', 0, 1, 0.01),
        cssNum('--lamp-halo', 'halo size (× lamp)', 0.3, 4, 0.05),
        cssNum('--lamp-halo-a', 'halo strength', 0, 1, 0.01),
      ],
    });
    groups.push({
      title: 'Lamp: feel',
      ctls: [
        jsNum(lamp, 'lamp', 'fade', 'on/off fade (s)', 0, 2, 0.01, redraw),
        jsNum(lamp, 'lamp', 'squish', 'squish', 0, 0.5, 0.01),
        jsNum(lamp, 'lamp', 'squishTime', 'squish time (s)', 0.1, 2, 0.01),
      ],
    });
  }

  // ---- Plant ----
  groups.push({
    title: 'Plant: place & grade (CSS)',
    ctls: [
      cssNum('--plant-w', 'size', 400, 3000, 1, 'px'),
      cssNum('--plant-x', 'x (left)', -2000, 600, 1, 'px'),
      cssNum('--plant-y', 'y (bottom)', -2000, 600, 1, 'px'),
      cssNum('--plant-bright', 'brightness', 0.3, 1.5, 0.01),
      cssNum('--plant-sat', 'saturation', 0.5, 2, 0.01),
      cssNum('--plant-hue', 'hue shift', -60, 60, 1, 'deg'),
    ],
  });
  const plant = window.__plant as (Record<string, unknown> & { look: Record<string, unknown> }) | undefined;
  if (plant) {
    groups.push({
      title: 'Plant: camera',
      ctls: [
        jsNum(plant.look, 'plant.look', 'theta', 'yaw', -180, 180, 1),
        jsNum(plant.look, 'plant.look', 'phi', 'pitch', 0, 89, 1),
        jsNum(plant.look, 'plant.look', 'distance', 'zoom (dist)', 0.3, 2, 0.01),
        jsNum(plant.look, 'plant.look', 'fov', 'fov', 15, 90, 1),
        jsNum(plant.look, 'plant.look', 'exposure', 'day exposure', 0.05, 2, 0.01),
        jsNum(plant.look, 'plant.look', 'envIntensity', 'day env light', 0, 5, 0.05),
        jsNum(plant.look, 'plant.look', 'exposureDark', 'night exposure', 0.05, 2, 0.01),
        jsNum(plant.look, 'plant.look', 'envIntensityDark', 'night env light', 0, 5, 0.05),
      ],
      extra: 'theme',
    });
    groups.push({
      title: 'Plant: wind',
      ctls: [
        jsNum(plant, 'plant.wind', 'idle', 'idle sway', 0, 0.06, 0.001),
        jsNum(plant, 'plant.wind', 'gustMin', 'gust min', 0, 0.15, 0.001),
        jsNum(plant, 'plant.wind', 'gustMax', 'gust max', 0, 0.2, 0.001),
        jsNum(plant, 'plant.wind', 'interval', 'gust every (s)', 1, 15, 0.1),
        jsNum(plant, 'plant.wind', 'attack', 'gust build (s)', 0.1, 3, 0.05),
        jsNum(plant, 'plant.wind', 'decay', 'gust fade (s)', 0.2, 6, 0.05),
        jsNum(plant, 'plant.wind', 'speed', 'speed', 0, 3, 0.05),
      ],
    });
  }
  return groups;
}

function configJson(groups: Group[], stored: Stored) {
  const out: Record<string, Record<string, number | string>> = {};
  for (const g of groups) {
    for (const c of g.ctls) {
      const [section, key] = c.id.startsWith('css.') ? ['css', c.id.slice(4)] : [c.id.slice(0, c.id.lastIndexOf('.')), c.id.slice(c.id.lastIndexOf('.') + 1)];
      const v = c.get();
      (out[section] ??= {})[key] = c.kind === 'num' && c.unit ? `${v}${c.unit}` : v;
    }
  }
  return JSON.stringify({ mat: stored[MAT] === 'photo' ? 'photo' : 'svg', ...out, changed: Object.keys(stored) }, null, 2);
}

const css = `
.tune { position: fixed; right: 12px; bottom: 12px; z-index: 9999; width: 330px; max-height: calc(100vh - 24px);
  overflow: auto; background: rgba(18, 18, 22, 0.94); color: #e8e8ea; border-radius: 10px; padding: 10px 12px;
  font: 12px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
.tune-pill { position: fixed; right: 12px; bottom: 12px; z-index: 9999; background: rgba(18,18,22,0.94); color: #eee;
  border: 0; border-radius: 999px; padding: 8px 14px; font: 12px ui-monospace, monospace; cursor: pointer; }
.tune-head { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.tune-head strong { flex: 1; font-weight: 600; }
.tune button { background: #2c2c33; color: #eee; border: 1px solid #45454d; border-radius: 6px; padding: 4px 8px;
  font: inherit; cursor: pointer; }
.tune button:hover { background: #3a3a42; }
.tune button.on { background: #6b4a12; border-color: #b8842a; }
.tune details { border-top: 1px solid #2e2e35; padding: 4px 0; }
.tune summary { cursor: pointer; padding: 4px 0; color: #bdbdc4; user-select: none; }
.tune summary .n { color: #ffd27a; margin-left: 6px; }
.tune-row { display: grid; grid-template-columns: 104px 1fr 62px 16px; gap: 6px; align-items: center; padding: 2px 0; }
.tune-row.changed label { color: #ffd27a; }
.tune-row label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tune-row input[type=range] { width: 100%; margin: 0; }
.tune-row input[type=number] { width: 62px; background: #111; color: inherit; border: 1px solid #3a3a42; border-radius: 4px;
  padding: 2px 4px; font: inherit; }
.tune-row input[type=color] { width: 100%; height: 22px; padding: 0; border: 1px solid #3a3a42; background: #111; border-radius: 4px; }
.tune-seg { grid-column: 2 / 5; display: flex; gap: 4px; }
.tune-seg button { flex: 1; }
.tune-row .x { background: none; border: 0; color: #777; padding: 0; cursor: pointer; }
.tune-row .x:hover { color: #fff; }
.tune textarea { width: 100%; height: 160px; margin-top: 6px; background: #111; color: #ddd; border: 1px solid #3a3a42;
  border-radius: 6px; font: 11px ui-monospace, monospace; }
.tune-note { color: #8a8a92; margin-top: 6px; }
`;

export default function DeskTuner() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [stored, setStored] = useState<Stored>({});
  const [open, setOpen] = useState(true);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState('');
  const [hidden, setHidden] = useState(true);
  const [, bump] = useState(0);
  const rerender = () => bump((n) => n + 1);

  useEffect(() => {
    // Opt-in: the panel only appears with ?tune=1 in the URL (and only in dev builds, see page.tsx).
    if (!new URLSearchParams(location.search).has('tune')) return;
    let iv = 0;
    // Deferred so the initial state setting happens outside the effect body (react-hooks lint rule).
    const timer = setTimeout(() => {
      setHidden(false);
      try {
        setOpen(localStorage.getItem(STORE + '-open') !== '0');
      } catch {}
      const desk = document.querySelector<HTMLElement>('.desk');
      if (!desk) return;
      const st = loadStored();
      setStored(st);
      applyMat(desk, st);
      let seen: { lamp?: unknown; plant?: unknown } = {};
      const rebuild = () => {
        seen = { lamp: window.__lamp, plant: window.__plant };
        const groups = build(desk, st);
        // A stored override that now equals the hard-coded default is no longer a change: drop it.
        let pruned = false;
        for (const g of groups)
          for (const c of g.ctls) {
            if (!(c.id in st)) continue;
            const same = c.kind === 'num' ? Math.abs((st[c.id] as number) - c.def) < 1e-9 : st[c.id] === c.def;
            if (same) {
              delete st[c.id];
              pruned = true;
            }
          }
        if (pruned) {
          saveStored(st);
          setStored({ ...st });
        }
        setGroups(groups);
      };
      rebuild();
      // The 3D components register their handles asynchronously (and again after HMR).
      iv = window.setInterval(() => {
        if (window.__lamp !== seen.lamp || window.__plant !== seen.plant) rebuild();
      }, 500);
    }, 0);
    return () => {
      clearTimeout(timer);
      clearInterval(iv);
    };
  }, []);

  if (hidden) return null;

  const change = (c: Ctl, v: number | string) => {
    if (c.kind === 'num') c.set(v as number);
    else c.set(v as string);
    const next = { ...stored, [c.id]: v };
    setStored(next);
    saveStored(next);
    rerender();
  };
  const clear = (c: Ctl) => {
    c.clear();
    const next = { ...stored };
    delete next[c.id];
    setStored(next);
    saveStored(next);
    rerender();
  };
  const resetAll = () => {
    for (const g of groups) for (const c of g.ctls) c.clear();
    const desk = document.querySelector<HTMLElement>('.desk');
    if (desk) applyMat(desk, {});
    setStored({});
    saveStored({});
    rerender();
  };
  const setMat = (mat: 'svg' | 'photo') => {
    const next = { ...stored };
    if (mat === 'photo') next[MAT] = 'photo';
    else delete next[MAT];
    const desk = document.querySelector<HTMLElement>('.desk');
    if (desk) applyMat(desk, next);
    setStored(next);
    saveStored(next);
  };
  const copy = async () => {
    const text = configJson(groups, stored);
    try {
      await navigator.clipboard.writeText(text);
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

  if (!open) {
    return (
      <>
        <style>{css}</style>
        <button className="tune-pill" onClick={toggleOpen}>
          ⚙ tune{Object.keys(stored).length ? ` (${Object.keys(stored).length})` : ''}
        </button>
      </>
    );
  }

  const lampOn = document.querySelector('.desk')?.getAttribute('data-lamp') !== 'off';
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

  return (
    <div className="tune">
      <style>{css}</style>
      <div className="tune-head">
        <strong>Desk tuner</strong>
        <button onClick={copy}>{copied || 'Copy config'}</button>
        <button onClick={() => setShow(!show)} title="show the config JSON">{'{}'}</button>
        <button onClick={resetAll} title="clear all changes">Reset</button>
        <button onClick={toggleOpen} title="collapse">–</button>
      </div>
      {show && <textarea readOnly value={configJson(groups, stored)} onFocus={(e) => e.currentTarget.select()} />}
      <details open>
        <summary>
          Mat
          {stored[MAT] === 'photo' && <span className="n">●1</span>}
        </summary>
        <div className="tune-row">
          <label>cutting mat</label>
          <div className="tune-seg">
            <button className={stored[MAT] !== 'photo' ? 'on' : ''} onClick={() => setMat('svg')}>
              drawn SVG
            </button>
            <button className={stored[MAT] === 'photo' ? 'on' : ''} onClick={() => setMat('photo')}>
              photo
            </button>
          </div>
        </div>
      </details>
      {groups.length === 0 && <div className="tune-note">waiting for the scene…</div>}
      {groups.map((g) => {
        const n = g.ctls.filter((c) => c.id in stored).length;
        return (
          <details key={g.title} open>
            <summary>
              {g.title}
              {n > 0 && <span className="n">●{n}</span>}
            </summary>
            {g.extra === 'lamp' && (
              <div className="tune-row">
                <label>switch</label>
                <button
                  className={lampOn ? 'on' : ''}
                  onClick={() => {
                    window.__lamp?.toggle();
                    setTimeout(rerender, 50);
                  }}
                >
                  {lampOn ? 'on' : 'off'} (click to toggle)
                </button>
              </div>
            )}
            {g.extra === 'theme' && (
              <div className="tune-row">
                <label>theme</label>
                <div className="tune-seg">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      className={theme === t ? 'on' : ''}
                      onClick={() => {
                        document.documentElement.setAttribute('data-theme', t);
                        try {
                          localStorage.setItem('theme', t);
                        } catch {}
                        rerender();
                      }}
                    >
                      {t === 'light' ? 'day' : 'night'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {g.ctls.map((c) => {
              const changed = c.id in stored;
              const v = c.get();
              return (
                <div key={c.id} className={`tune-row${changed ? ' changed' : ''}`}>
                  <label title={`${c.id} (default ${c.def}${c.kind === 'num' && c.unit ? c.unit : ''})`}>{c.label}</label>
                  {c.kind === 'num' ? (
                    <>
                      <input
                        type="range"
                        min={c.min}
                        max={c.max}
                        step={c.step}
                        value={v as number}
                        onChange={(e) => change(c, Number(e.target.value))}
                      />
                      <input
                        type="number"
                        step={c.step}
                        value={Number((v as number).toFixed(4))}
                        onChange={(e) => e.target.value !== '' && change(c, Number(e.target.value))}
                      />
                    </>
                  ) : (
                    <>
                      <input type="color" value={v as string} onChange={(e) => change(c, e.target.value)} />
                      <span>{v as string}</span>
                    </>
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
      <div className="tune-note">
        Yellow = changed (kept in localStorage until Reset). Copy config → paste it to me and I&apos;ll hard-code it.
      </div>
    </div>
  );
}
