# Portfolio (Next.js 16, App Router)

Personal portfolio for Prathmesh Ingole. Plain CSS in `app/globals.css`, light/dark theme
via `data-theme` on `<html>`.

## Working rules
- The dev server is usually already running on port 3000. Check before starting another.
- Homepage visuals are judged by screenshot, not by reading code. Use `scripts/shot.mjs`
  (see `docs/desk-scene.md`) after every visual change and look at the PNG.
- Do not commit unless asked. Visual work is iterated many times before it lands.
- `npx tsc --noEmit` and `npx next build` must stay clean: Vercel runs the build with type checking.
- Node: `engines.node` in `package.json` (24.x) is what Vercel uses; keep it on a supported major.

## Homepage desk scene
The hero is a top-down desk: white desk, tilted cutting mat, a 3D monstera in the
bottom-left corner, a 3D mushroom lamp in the top-left, and CSS "sun through a window"
shadows over everything.
Full notes, tunables and pitfalls: `docs/desk-scene.md`.

- Plant rendering + wind animation: `app/desk-plant-three.tsx` (three.js, vertex shader).
- Dev tuning panel (sliders for lamp/plant placement, camera, light, wind, mat switch; "Copy config"
  gives a JSON to hard-code): `app/desk-tuner.tsx`, dev builds only, opt-in via `?tune=1` in the URL.
  When the user pastes a config from it, hard-code the `changed` keys (mapping in `docs/desk-scene.md`).
- Plant placement, size and colour grade: `--plant-*` on `.desk` in `app/globals.css`.
- Cutting mat: `public/desk/cutting-mat.svg` (default) or `cutting-mat-photo.webp`, switched by
  `data-mat="photo"` on `.desk` (tuner "Mat" group). `--mat-ratio` on `.desk` is the mat's h/w.
- Lamp (click to switch on/off, squish feedback, glowing shade): `app/desk-lamp-three.tsx`.
  Its light on the desk is CSS: `.desk-glow`, `.desk-lamp-halo`, toggled by `data-lamp` on `.desk`.
  Size/position/light-pool colour come from `--lamp-*` on `.desk`, derived from the mat width `--mat-w`.
- New GLB assets: compress with gltf-transform (recipe in `docs/desk-scene.md`) into `public/desk/`.
- Sunlight layers: `.desk-sun*` in `app/globals.css`. Mat wear: `.hero::before/::after`.
- `app/desk-plant.tsx` is the old `<model-viewer>` version, kept for rollback only.

## Loading screen
`app/loading-screen.tsx`: full-screen overlay (theme-aware) with the shining name logo and a
paper flowers blooming frame by frame, one after another (`public/desk/flower/<set>/step-NN.webp`,
sets listed in `FLOWERS` in `app/loader-config.ts`). `DeskLoadingGate`
shows it until the mat, plant and lamp have rendered; the nav ◌ button previews it.
Dev tuner for it (flower size/position/timing, logo scale, shine): `app/loader-tuner.tsx`, same
`?tune=1` opt-in, panel bottom-left. Hard-code pasted configs into `--flower<n>-*` / `--loader-*`
on `:root` in `app/globals.css` and `FLOWER` in `app/loader-config.ts` (see `docs/desk-scene.md`).
