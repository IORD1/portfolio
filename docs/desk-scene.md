# Desk scene: how the homepage hero is built and how to change it

The hero (`.desk` in `app/page.tsx`) is a top-down desk. Layers, bottom to top:

| z | element | what it is |
|---|---------|------------|
| 0 | `.desk` | white desk background. Declares `--mat-*` (mat size, derived from the viewport), `--lamp-*` (lamp box position/size/light pool, derived from the mat) and `--plant-*` (plant box + colour grade). `data-mat="photo"` swaps the SVG mat for the photo |
| 3 | `.hero` + `.mat` | cutting mat (`--mat-ratio` tall; the SVG is 4:3, the photo mat 0.6556), tilted `--mat-tilt: 13deg`, bottom-right corner runs `--mat-bleed: 20px` off screen. `.hero::before` = grain (overlay), `.hero::after` = mottling + edge darkening (multiply) |
| 4 | `.desk-glow` | warm pool the lamp throws on the desk (multiply in light theme, screen in dark). Fades out when the lamp is off |
| 5 | `.desk-plant` | 3D monstera, `--plant-w` square box positioned so only the pot rim shows at the bottom-left |
| 6 | `.desk-lamp-halo`, `.desk-lamp` | bright halo right around the lamp (screen), then the 3D lamp itself. Both sized from `--lamp-w` |
| 7 | `.desk-sun` | sunlight: warm cast on the left, shade on the right, blurred window-pane shadows, drifting foliage blobs |

Everything is judged visually. Read the code to orient, then screenshot to decide.

## Dev tuning panel (`app/desk-tuner.tsx`)
Open `http://localhost:3000/?tune=1` (dev server only) to get a "Desk tuner" panel
bottom-right; without `?tune=1` it is not rendered. It has sliders for everything that is
meant to be tuned by eye:
- **Mat**: switch between the drawn SVG mat and the photo (`data-mat="photo"` on `.desk`).
- **Lamp**: size/x/y (`--lamp-*`), camera (yaw = `look.theta`, pitch = `look.phi`, zoom =
  `look.distance`, fov, exposure, env light), light (bulb colour/power, shade + cap glow
  and their height range, pool colour/size/strength, halo size/strength), feel (fade,
  squish, squish time) and an on/off button.
- **Plant**: size/x/y and colour grade (`--plant-*`), camera (with separate day/night
  exposure and env light, `LOOK.exposure/envIntensity` vs `LOOK.exposureDark/envIntensityDark`,
  chosen by `data-theme` on `<html>` every frame; the group has a day/night switch), wind.

The controls write straight to what the scene already reads live: inline CSS custom
properties on `.desk`, and the `window.__lamp` / `window.__plant` objects. Changed values
are yellow and kept in `localStorage["desk-tune"]` across reloads (only the keys that were
touched, so hard-coded defaults for everything else still show through). **Reset** clears
them. **Copy config** puts a JSON of every current value on the clipboard; the `changed`
list says which ones differ from the defaults. To hard-code a config: `css.*` keys go to
the `--lamp-*` / `--plant-*` block on `.desk` in `globals.css`; `lamp.*` and `lamp.look.*`
to `LAMP` / `LOOK` in `desk-lamp-three.tsx`; `plant.wind.*` and `plant.look.*` to `WIND` /
`LOOK` in `desk-plant-three.tsx`; `mat` = `svg` or `photo` (see the mat note below).
After hard-coding, the panel drops any stored override that now equals the default, so it comes up clean on the next reload (Reset clears the rest).

The panel is rendered from `page.tsx` only when `process.env.NODE_ENV === 'development'`,
so it is compiled out of production builds.

## Mat: SVG vs photo
`page.tsx` renders two `<img class="mat">`: `mat-svg` (`public/desk/cutting-mat.svg`, the
default) and `mat-photo` (`public/desk/cutting-mat-photo.webp`, 2131×1397, 320 KB, made
from a screenshot by cropping to the green and saving WebP q82). `.desk[data-mat="photo"]`
shows the photo and sets `--mat-ratio: 0.6556` so the hero box takes the photo's aspect;
everything sized from `--mat-w` (lamp, light pool) follows. The `.hero::before/::after`
wear overlays apply to both. Once one is chosen, delete the other `<img>` and the
`.mat-photo` / `data-mat` CSS block, and set `--mat-ratio` on `.desk` directly.

## Plant animation (`app/desk-plant-three.tsx`)

### Why it is built this way
`public/desk/plant.glb` is one node, one mesh, ~33.7k vertices, no rig, no animation
clips, no per-leaf parts. Nothing can address a single leaf, so the wind is done in the
**vertex shader**: each vertex is displaced sideways by a few sines whose phase depends on
its own x/z position and whose weight depends on its height above the pot. Leaves in
different places therefore move out of step ("each leaf differently"), tips move most,
the pot does not move at all. No re-authoring of the model was needed.

`<model-viewer>` was replaced because it does not expose the mesh. `app/desk-plant.tsx`
is the old version, still wired to the type declaration `app/model-viewer.d.ts`; both can
be deleted together once nobody wants to roll back.

### Anatomy of the component
1. **Dynamic imports** of `three`, `GLTFLoader`, `DRACOLoader`, `RoomEnvironment` inside
   `useEffect`. Keep it that way: nothing three-related may run at SSR, and the ~600 KB
   chunk should load after hydration. Types come from `import type * as T from 'three'`.
2. **Renderer**: transparent canvas, ACES tone mapping, pixel ratio capped by
   `LOOK.maxDpr`. The canvas fills the `.desk-plant` box; CSS on the box does colour
   grading and the cast shadow (`filter: brightness() saturate() hue-rotate() drop-shadow()`),
   so do not add lights or shadow maps for that.
3. **Environment**: `RoomEnvironment` through `PMREMGenerator`, intensity
   `LOOK.envIntensity`. This stands in for model-viewer's `neutral` environment.
4. **Camera**: orbit around the model's bounding-box centre, same convention as
   model-viewer's `camera-orbit="theta phi auto"`. `LOOK.theta` is azimuth, `LOOK.phi` is
   degrees from straight above, `LOOK.distance` scales the auto-fit distance
   (`radius / sin(fov/2)`). Smaller distance = bigger plant.
5. **Wind shader**: `material.onBeforeCompile` injects uniforms after `#include <common>`
   and the displacement after `#include <begin_vertex>`. The uniforms object is shared
   with the render loop, so updating `uniforms.uTime.value` etc. is all the loop does.
   `customProgramCacheKey` is set so three caches the patched program.
   `frustumCulled = false` because the displaced mesh can leave its static bounds.
6. **Loop**: `requestAnimationFrame`, own clock `t` (delta clamped to 0.1 s so a
   background tab does not jump). Runs only while the box is on screen
   (`IntersectionObserver`) and the tab is visible. Under `prefers-reduced-motion: reduce`
   it renders one frame and stops. Sets `data-loaded="1"` on the box after the first
   frame (the screenshot script waits for this).
7. **Gusts**: every `WIND.interval` s (±25%) pick a random strength in
   `[gustMin, gustMax]` and a random 2D direction; envelope is smoothstep up over
   `attack`, smoothstep down over `decay`. `uGust` = direction × strength × envelope,
   `uAmp` = idle amplitude. Both are fractions of the model height, converted in the loop.

### The shader block, annotated
```glsl
float h = clamp((position.y - uBase) / uHeight, 0.0, 1.0); // 0 at pot base, 1 at top
float w = h * h;                                            // stiffness curve: pot still, tips free
float p = position.x * 1.7 + position.z * 1.3;              // per-leaf phase from position
float s1 = sin(uTime * 1.1 + p);                            // slow main sway
float s2 = sin(uTime * 2.3 + p * 2.1 + 1.7);                // faster flutter
float s3 = sin(uTime * 0.45 + p * 0.5);                     // very slow drift
vec2 idle = vec2(s1 * 0.6 + s2 * 0.25 + s3 * 0.15,
                 sin(uTime * 0.9 + p * 1.4 + 0.8) * 0.6 + s2 * 0.2);
float flutter = 0.7 + 0.3 * sin(uTime * 3.1 + p * 2.7);     // gust is not uniform across leaves
vec2 d = idle * uAmp + uGust * flutter * (0.6 + 0.4 * s1);
transformed.xz += d * w;
```
Knobs inside the shader (edit the string in the component):
- **How different the leaves are**: the `1.7` / `1.3` phase multipliers. Bigger = more
  out of step, too big looks like noise.
- **Stiffness**: `w = h*h`. Use `h` for a floppier stem, `h*h*h` for stiffer.
- **Motion character**: the sine frequencies (1.1, 2.3, 0.45) and their mix (0.6, 0.25, 0.15).
- **Vertical bob**: not implemented; add `transformed.y += ... * w` if wanted.
Normals are not recomputed. Amplitudes are a few percent of the height, so lighting does
not visibly break. If you ever push amplitude much higher, expect flat shading artefacts.

### Tuning without reloading
`WIND` and `LOOK` at the top of the file are exposed as `window.__plant` and read every
frame. In DevTools:
```js
__plant.gustMax = 0.1          // stronger gusts
__plant.interval = 2           // more frequent
__plant.speed = 0.6            // slower, lazier motion
__plant.idle = 0.02            // more resting sway
__plant.look.distance = 0.75   // bigger plant
__plant.look.exposure = 0.7    // brighter
__plant.look.theta = 40        // rotate the view around the pot
```
Once a value looks right, write it into the constants in the file. The screenshot script
can apply the same tweaks headlessly via `TWEAK` (below). The dev tuning panel (top of this
doc) exposes the same values as sliders.

### Changing the model
- Export a GLB (Draco compression is fine; decoder is served from `public/draco/`, copied
  from `node_modules/three/examples/jsm/libs/draco/gltf/`; re-copy when upgrading three).
- WebP textures are supported by GLTFLoader.
- Bounding box, base and height are computed at load, so the wind scales automatically.
- If a new model has **separate leaf nodes** or an **animation clip**, the shader trick is
  no longer the only option: nodes can be rotated per leaf in the loop, and clips can be
  played with `AnimationMixer`. Inspect with:
  ```sh
  node -e 'const b=require("fs").readFileSync("public/desk/plant.glb");const j=JSON.parse(b.slice(20,20+b.readUInt32LE(12)));console.log(j.nodes.length,"nodes",j.meshes.length,"meshes",(j.animations||[]).length,"anims")'
  ```

### Placement, size, colour (`.desk-plant` in `app/globals.css`)
The box is `--plant-w` (1800px) square at `left: var(--plant-x)` (-836px) and
`bottom: var(--plant-y)` (-902px) so only the pot rim shows in the bottom-left corner. The
colour grade is `--plant-bright` / `--plant-sat` / `--plant-hue`; all six live on `.desk`
and are on the dev tuning panel. The long cast shadow to the right is the `drop-shadow` in
the same `filter`; its offset points away from the window on the left. Hidden under 700px
width.

## Lamp (`app/desk-lamp-three.tsx`)

`public/desk/lamp.glb` (Meshy "cream mushroom table lamp": cream cap, white glass diffuser
band, metal stem and base; one mesh, ~24k vertices). Made from the Meshy export with
```sh
npx -p @gltf-transform/cli gltf-transform optimize in.glb public/desk/lamp.glb --texture-compress webp --texture-size 1024 --compress draco
```
(4.3 MB → 180 KB). Same recipe for any future desk object.

The component is a sibling of the plant with the same skeleton (dynamic imports, transparent
renderer, RoomEnvironment, orbit camera from `LOOK`). Differences:
- **It only renders while something moves.** `invalidate()` starts the rAF loop; the loop
  stops when the on/off fade and the click squish are finished. A `ResizeObserver` and
  `visibilitychange` also call `invalidate()`. There is no idle animation.
- **On/off** is a `level` that eases between 0 and 1 over `LAMP.fade` seconds. It drives
  the emissive uniform `uGlow`, the `PointLight` under the cap (`LAMP.light`), and
  `data-lamp="on|off"` on the parent `.desk`, which the CSS uses to fade `.desk-glow` and
  `.desk-lamp-halo`. The React element is not re-rendered; everything is imperative.
- **Which part glows** is decided in the fragment shader by height: a varying `vLampH`
  (0 = base, 1 = top of cap) is set in the vertex shader, and after
  `#include <emissivemap_fragment>` an emissive term is added for the band
  `[glowFrom, glowTo]` plus `capGlow` × that above it. `diffuseColor.rgb` is multiplied in
  so the texture still shows through. Tune `LAMP.glowFrom/glowTo` if the model changes.
- **Click feedback**: the model sits in a `pivot` group with its base at the origin, so
  scaling the pivot squashes the lamp *down onto the desk*. The squish is a damped sine
  (`LAMP.squish` amplitude, settles in `LAMP.squishTime`): squash, small stretch, rest.
  Under `prefers-reduced-motion` there is no squish and the fade is instant.
- **Hit testing**: the `.desk-lamp` box is square and bigger than the lamp, so a click only
  counts if a ray from the camera hits the model's bounding box (`ray.intersectsBox`).
  The cursor becomes a pointer on hover over the lamp for the same reason. Keyboard
  (Enter/Space, the box is a focusable `role="button"` with `aria-pressed`) always toggles.
- **DevTools**: `__lamp.toggle()`, `__lamp.set(false)`, `__lamp.glow = 2`,
  `__lamp.look.phi = 25`, then `__lamp.invalidate()` to redraw (the tuning panel does this; or resize the
  window). Values are read every frame, but frames only happen while animating.

Placement and size live on `.desk`: `--lamp-scale` (box width as a fraction of `--mat-w`,
so the lamp stays proportional to the mat at every viewport; `--lamp-w` is derived),
`--lamp-x`, `--lamp-y`. The two light layers are centred on the same variables, so moving
the lamp moves its light; their colour and size are `--lamp-rgb` (r g b), `--lamp-pool` /
`--lamp-pool-a` (pool diameter in lamp widths, strength) and `--lamp-halo` / `--lamp-halo-a`.
The halo is a paler mix of the same colour, so one colour drives both.
`.desk-lamp`'s `filter: drop-shadow()` is its cast shadow (sun is on the left, shadow to
the right, same as the plant).

## Sunlight (`.desk-sun*` in `app/globals.css`)
Multiply blending cannot brighten white, so the light is built as a **sheet of shade with
the window panes cut out** by `mask-image`, not as bright rays. Custom properties on
`.desk-sun` are the tunables: `--sun-angle`, `--sun-skew`, `--sun-strength`, `--sun-speed`,
`--sun-shade` (rgb), `--pane-w/h`, `--mullion`, `--soft`.
Pitfalls learned the hard way:
- `filter: blur()` and `mask-image` on the same element: filter runs first, so the mask
  edges stay hard. The blur therefore lives on the wrapper `.desk-sun-window`, the mask on
  the child `.desk-sun-panes`. Do not merge them.
- A mask rotates with the element it is on. Rotation/skew goes on the masked child.
- Soft mask ramps on two overlapping repeating gradients sum and produce jagged seams
  where mullion shadows cross; keep the mask hard-edged and blur the wrapper.
- CSS `rotate()` positive = clockwise. "Anticlockwise by 30°" means subtract 30.
- Dark theme drops `--sun-strength` and swaps the warm cast for a cool wash (screen).

## Screenshot workflow (`scripts/shot.mjs`)
Needs a local Chrome at `/usr/bin/google-chrome` and `puppeteer-core`:
```sh
npm i --no-save puppeteer-core     # once per checkout, not a project dependency
sleep 3                            # let HMR pick up your edit
timeout 170 node scripts/shot.mjs  # writes scripts/out/home.png
```
Env vars: `OUT=<png>`, `DARK=1` (dark theme), `HOLD=<ms>` (wait before the shot),
`TUNE=1` (open the page with `?tune=1` so the dev tuning panel is in the shot),
`OUT2=<png>` + `HOLD2=<ms>` (second shot from the same page, for a motion diff),
`PROBE='return __lamp.state()'` (JS evaluated after the shot, result logged),
`TWEAK='window.__plant.gustMax=0.1'` (JS run before the shot; `__lamp.set(false)` for the
lamp off, `__lamp.squish=0.4;__lamp.squishTime=2;__lamp.toggle()` + `HOLD=1500` to catch
the squish mid-way, `document.querySelector('.desk').dataset.mat='photo'` for the photo mat).
A run takes 2–3 minutes: software WebGL for two canvases plus the big blurred sun layers.
The main thread is blocked for most of that, so the script waits for `domcontentloaded`
and then polls for `data-loaded` on both `.desk-plant` and `.desk-lamp` (never
`networkidle`, it does not fire). Under software GL the page runs at ~1 fps and the
animation clocks clamp `dt` to 0.1 s, so timed captures are approximate.
Crop with PIL to inspect details; a pixel diff of `OUT` vs `OUT2` over the plant region
proves motion. Before/after comparisons are the way to evaluate any change here.

## Loading screen tuner (`app/loader-tuner.tsx`)
With `?tune=1` (dev only) the loading screen stays open and a "Loader tuner" panel sits
bottom-left (the desk tuner is bottom-right). "Dismiss" closes the loader; the nav ◌ button
re-opens it. Changes live in `localStorage["loader-tune"]`. "Copy config" JSON → where to
hard-code it:

| JSON key | Hard-code in |
| --- | --- |
| `css.flower<n>-size/x/y/rot/opacity/shadow/z` | `--flower<n>-*` on `:root`, `app/globals.css` ("Loading screen") |
| `css.loader-scale`, `css.loader-shine-dur`, `css.loader-glow` | `--loader-*` on `:root`, same block |
| `flower.step`, `flower.hold`, `flower.gap`, `flower.mode` | `FLOWER` in `app/loader-config.ts` |

Flower x/y are the flower's centre measured from the logo box's top-right corner.
Frames: `public/desk/flower/<set>/step-NN.webp` (closed bud → full bloom, WebP with alpha, made
with Pillow from the PNGs in `~/Downloads/flowers/<set>/transparent`). Sets and frame counts are
listed in `FLOWERS` (`app/loader-config.ts`); adding a set means a new entry there, a new
`--flower<n>-*` block on `:root`, a `.loader-flower-<n>` rule, and a `flowerGroup(n, ...)` in the tuner.
All flowers run on one clock; `flower.gap` is how many frames after one flower's bud the next flower's
bud appears (0 = together; 1 = flower 2 shows its bud while flower 1 shows frame 2).
`flower.mode`: `chain` (default) restarts flower 1 from its bud `hold` ms after the last flower reaches full
bloom, with the others following at `gap`; `loop` resets all flowers to buds together; `pingpong`; `once`.
