'use client';

import { useEffect, useRef } from 'react';
import type * as T from 'three';

/**
 * Mushroom table lamp in the top-left corner of the desk, rendered with three.js.
 *
 * Click (or Enter/Space when focused) toggles it. When on, the glass diffuser band
 * under the cap glows (emissive term injected into the fragment shader, weighted by
 * height), a warm point light under the cap lights the stem, and the CSS light pool
 * (`.desk-glow`, `.desk-lamp-halo`) fades in via `data-lamp="on|off"` on `.desk`.
 * Every click also squashes the lamp with a little jelly spring as feedback.
 *
 * The renderer only draws while something is animating (fade or squish), so the lamp
 * costs nothing while it sits still. Tunables are exposed as `window.__lamp`.
 */
const LAMP = {
  on: true, // initial state
  glow: 0.9, // emissive strength of the diffuser when on
  glowFrom: 0.81, // height fraction where the glowing band starts (0 = base, 1 = top of cap)
  glowTo: 0.94, // ...and ends; above it the cap glows at capGlow
  capGlow: 0.72, // how much the cap itself glows, relative to the band
  color: 0xffb15c, // warm light colour
  light: 15.8, // point light intensity under the cap when on
  fade: 2, // seconds for the on/off crossfade
  squish: 0.03, // how much it squashes on click (fraction of height)
  squishTime: 0.41, // seconds until the spring settles
};

const LOOK = {
  exposure: 0.7,
  envIntensity: 0.9,
  fov: 45,
  theta: 180, // orbit azimuth, degrees (seen from behind, cord runs away)
  phi: 12, // polar angle from straight above, degrees (nearly top-down)
  distance: 0.8, // multiplier on the auto-fit camera distance
  maxDpr: 2,
};

declare global {
  interface Window {
    __lamp?: typeof LAMP & {
      look: typeof LOOK;
      toggle: () => void;
      set: (on: boolean) => void;
      invalidate: () => void; // redraw after changing a tunable (the lamp only renders on demand)
      state: () => { on: boolean; level: number; scaleY: number };
    };
  }
}

export default function DeskLamp() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const desk = host.parentElement;
    let disposed = false;
    let cleanup = () => {};

    let on = LAMP.on;
    const apply = () => {
      host.setAttribute('aria-pressed', String(on));
      desk?.setAttribute('data-lamp', on ? 'on' : 'off');
    };
    apply();

    (async () => {
      const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/loaders/DRACOLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOOK.maxDpr));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = LOOK.exposure;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      scene.environmentIntensity = LOOK.envIntensity;
      pmrem.dispose();

      const camera = new THREE.PerspectiveCamera(LOOK.fov, host.clientWidth / host.clientHeight, 0.1, 100);

      const uniforms = {
        uGlow: { value: 0 },
        uLevel: { value: 0 }, // 0 = off, 1 = on (for the warm tint of the cap)
        uGlowColor: { value: new THREE.Color(LAMP.color) },
        uGlowFrom: { value: LAMP.glowFrom },
        uGlowTo: { value: LAMP.glowTo },
        uCapGlow: { value: LAMP.capGlow },
        uBase: { value: 0 },
        uHeight: { value: 1 },
      };

      const draco = new DRACOLoader();
      draco.setDecoderPath('/draco/');
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      const gltf = await loader.loadAsync('/desk/lamp.glb');
      draco.dispose();
      if (disposed) {
        renderer.dispose();
        return;
      }

      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      uniforms.uBase.value = box.min.y;
      uniforms.uHeight.value = size.y;

      // Pivot at the base so the squish scales the lamp down onto the desk, not into it.
      const pivot = new THREE.Group();
      pivot.position.set(center.x, box.min.y, center.z);
      model.position.set(-center.x, -box.min.y, -center.z);
      pivot.add(model);
      scene.add(pivot);

      // Warm bulb under the cap; lights the stem and the inside of the shade.
      const bulb = new THREE.PointLight(LAMP.color, 0, 0, 2);
      bulb.position.set(center.x, box.min.y + size.y * (LAMP.glowFrom + LAMP.glowTo) / 2, center.z);
      scene.add(bulb);

      model.traverse((obj) => {
        if (!(obj as T.Mesh).isMesh) return;
        const mesh = obj as T.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) {
          mat.customProgramCacheKey = () => 'desk-lamp-glow';
          mat.onBeforeCompile = (shader: T.WebGLProgramParametersWithUniforms) => {
            Object.assign(shader.uniforms, uniforms);
            shader.vertexShader = shader.vertexShader
              .replace(
                '#include <common>',
                `#include <common>
uniform float uBase;
uniform float uHeight;
varying float vLampH;`
              )
              .replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
vLampH = clamp((position.y - uBase) / uHeight, 0.0, 1.0);`
              );
            shader.fragmentShader = shader.fragmentShader
              .replace(
                '#include <common>',
                `#include <common>
uniform float uGlow;
uniform float uLevel;
uniform vec3 uGlowColor;
uniform float uGlowFrom;
uniform float uGlowTo;
uniform float uCapGlow;
varying float vLampH;`
              )
              .replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
{
  float band = smoothstep(uGlowFrom - 0.04, uGlowFrom + 0.04, vLampH) * (1.0 - smoothstep(uGlowTo - 0.03, uGlowTo + 0.03, vLampH));
  float cap = smoothstep(uGlowTo - 0.03, uGlowTo + 0.03, vLampH);
  // the cap is translucent: lit from inside it turns warm rather than just brighter
  diffuseColor.rgb *= mix(vec3(1.0), uGlowColor, uLevel * cap * 0.6);
  totalEmissiveRadiance += uGlowColor * uGlow * (band + cap * uCapGlow) * diffuseColor.rgb;
}`
              );
          };
          mat.needsUpdate = true;
        }
      });

      // Camera: orbit around the model centre, auto-fit distance (same convention as the plant).
      const radius = size.length() / 2;
      const placeCamera = () => {
        const fit = radius / Math.sin(THREE.MathUtils.degToRad(LOOK.fov) / 2);
        const sph = new THREE.Spherical(
          fit * LOOK.distance,
          THREE.MathUtils.degToRad(LOOK.phi),
          THREE.MathUtils.degToRad(LOOK.theta)
        );
        camera.position.setFromSpherical(sph).add(center);
        camera.lookAt(center);
        camera.fov = LOOK.fov;
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        renderer.toneMappingExposure = LOOK.exposure;
        scene.environmentIntensity = LOOK.envIntensity;
      };

      // ---- state + animation ----
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let level = on ? 1 : 0; // 0 = off, 1 = fully on
      let squishAt = -10; // clock time of the last click
      let raf = 0;
      let last = 0;
      let t = 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        t += dt;

        const target = on ? 1 : 0;
        const step = reduceMotion ? 1 : dt / Math.max(LAMP.fade, 0.001);
        level = level < target ? Math.min(level + step, 1) : Math.max(level - step, 0);

        // Jelly spring: squash first, overshoot a little, settle.
        const u = t - squishAt;
        let s = 0;
        if (!reduceMotion && u >= 0 && u < LAMP.squishTime) {
          s = LAMP.squish * Math.exp(-u * (5 / LAMP.squishTime)) * Math.sin((u / LAMP.squishTime) * Math.PI * 3);
        }
        pivot.scale.set(1 + s * 0.6, 1 - s, 1 + s * 0.6);

        uniforms.uGlow.value = LAMP.glow * level;
        uniforms.uLevel.value = level;
        uniforms.uGlowFrom.value = LAMP.glowFrom;
        uniforms.uGlowTo.value = LAMP.glowTo;
        uniforms.uCapGlow.value = LAMP.capGlow;
        uniforms.uGlowColor.value.set(LAMP.color);
        bulb.color.set(LAMP.color);
        bulb.intensity = LAMP.light * level;
        bulb.position.y = box.min.y + (size.y * (LAMP.glowFrom + LAMP.glowTo)) / 2;

        placeCamera();
        renderer.render(scene, camera);
        if (!host.dataset.loaded) host.dataset.loaded = '1';

        const animating = level !== target || (u >= 0 && u < LAMP.squishTime);
        if (animating && !document.hidden) raf = requestAnimationFrame(frame);
        else last = 0;
      };
      const invalidate = () => {
        if (!raf) raf = requestAnimationFrame(frame);
      };

      const set = (next: boolean) => {
        on = next;
        apply();
        invalidate();
      };
      const toggle = () => {
        squishAt = t;
        set(!on);
      };

      // Only count clicks that land on the lamp itself, not the empty corners of the box.
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const hits = (e: MouseEvent) => {
        const r = host.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        return ray.ray.intersectsBox(box);
      };
      const onClick = (e: MouseEvent) => {
        if (e.detail === 0 || hits(e)) toggle(); // detail 0 = keyboard/synthetic click
      };
      const onMove = (e: MouseEvent) => {
        host.style.cursor = hits(e) ? 'pointer' : '';
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      };
      host.addEventListener('click', onClick);
      host.addEventListener('mousemove', onMove);
      host.addEventListener('keydown', onKey);

      const ro = new ResizeObserver(() => {
        renderer.setSize(host.clientWidth, host.clientHeight, false);
        invalidate();
      });
      ro.observe(host);
      const onVis = () => {
        if (!document.hidden) invalidate();
      };
      document.addEventListener('visibilitychange', onVis);

      window.__lamp = Object.assign(LAMP, {
        look: LOOK,
        toggle,
        set,
        invalidate,
        state: () => ({ on, level, scaleY: pivot.scale.y }),
      });
      invalidate();

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        host.removeEventListener('click', onClick);
        host.removeEventListener('mousemove', onMove);
        host.removeEventListener('keydown', onKey);
        delete window.__lamp;
        model.traverse((obj) => {
          const mesh = obj as T.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
            mat.dispose();
          }
        });
        envTex.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        delete host.dataset.loaded;
      };
    })().catch((err) => console.error('[desk-lamp]', err));

    return () => {
      disposed = true;
      cleanup();
      desk?.removeAttribute('data-lamp');
    };
  }, []);

  return (
    <>
      <div className="desk-glow" aria-hidden="true" />
      <div className="desk-lamp-halo" aria-hidden="true" />
      <div className="desk-lamp" ref={ref} role="button" tabIndex={0} aria-label="Desk lamp" aria-pressed="true" />
    </>
  );
}
