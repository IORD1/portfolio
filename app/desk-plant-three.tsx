'use client';

import { useEffect, useRef } from 'react';
import type * as T from 'three';

/**
 * Monstera on the desk, seen from above, rendered with three.js.
 *
 * The GLB is a single unrigged mesh, so the "wind" lives in the vertex shader:
 * every vertex is pushed sideways by a few sines whose phase depends on where the
 * vertex sits, weighted by its height above the pot. Leaves in different places
 * therefore move out of step, tips move most, and the pot stays put.
 *
 * Tunables below are also exposed as `window.__plant` so they can be tweaked live
 * from DevTools while experimenting (values are read every frame).
 */
const WIND = {
  idle: 0.002, // resting sway, as a fraction of the model's height (barely moving)
  gustMin: 0.004, // gust strength range, fraction of height (mostly faint, sometimes big)
  gustMax: 0.085,
  interval: 10.8, // seconds between gusts (randomised ±25%)
  attack: 2.6, // seconds for a gust to build
  decay: 4.7, // seconds for it to die down
  speed: 0.45, // time multiplier for the whole motion (slow, lazy)
};

const LOOK = {
  // Day (data-theme="light") and night (dark) have their own exposure / environment light;
  // the theme attribute on <html> is read every frame, so the switch is live.
  exposure: 0.36,
  envIntensity: 0.85,
  exposureDark: 0.39, // night: a touch brighter exposure but much less ambient, so the lamp does the lighting
  envIntensityDark: 0.2,
  fov: 15, // narrow lens: almost orthographic, leaves keep their size across the box
  theta: -31, // orbit azimuth, degrees
  phi: 0, // polar angle from straight above, degrees (0 = straight down)
  distance: 0.69, // multiplier on the auto-fit camera distance
  maxDpr: 1.5,
};

declare global {
  interface Window {
    __plant?: typeof WIND & { look: typeof LOOK };
  }
}

export default function DeskPlant() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/loaders/DRACOLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (disposed) return;

      window.__plant = Object.assign(WIND, { look: LOOK });

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

      // Wind uniforms, shared with the patched material below.
      const uniforms = {
        uTime: { value: 0 },
        uAmp: { value: 0 },
        uGust: { value: new THREE.Vector2(0, 0) },
        uBase: { value: 0 },
        uHeight: { value: 1 },
      };

      const draco = new DRACOLoader();
      draco.setDecoderPath('/draco/');
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      const gltf = await loader.loadAsync('/desk/plant.glb');
      draco.dispose();
      if (disposed) {
        renderer.dispose();
        return;
      }

      const model = gltf.scene;
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      uniforms.uBase.value = box.min.y;
      uniforms.uHeight.value = size.y;

      model.traverse((obj) => {
        if (!(obj as T.Mesh).isMesh) return;
        const mesh = obj as T.Mesh;
        mesh.frustumCulled = false; // bounds move with the wind; never let it pop
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) {
          mat.customProgramCacheKey = () => 'desk-plant-wind';
          mat.onBeforeCompile = (shader: T.WebGLProgramParametersWithUniforms) => {
            Object.assign(shader.uniforms, uniforms);
            shader.vertexShader = shader.vertexShader
              .replace(
                '#include <common>',
                `#include <common>
uniform float uTime;
uniform float uAmp;
uniform vec2 uGust;
uniform float uBase;
uniform float uHeight;`
              )
              .replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
{
  float h = clamp((position.y - uBase) / uHeight, 0.0, 1.0);
  float w = h * h;                                   // pot still, tips free
  float p = position.x * 1.7 + position.z * 1.3;     // per-leaf phase
  float s1 = sin(uTime * 1.1 + p);
  float s2 = sin(uTime * 2.3 + p * 2.1 + 1.7);
  float s3 = sin(uTime * 0.45 + p * 0.5);
  vec2 idle = vec2(s1 * 0.6 + s2 * 0.25 + s3 * 0.15,
                   sin(uTime * 0.9 + p * 1.4 + 0.8) * 0.6 + s2 * 0.2);
  float flutter = 0.7 + 0.3 * sin(uTime * 3.1 + p * 2.7);
  vec2 d = idle * uAmp + uGust * flutter * (0.6 + 0.4 * s1);
  transformed.xz += d * w;
}`
              );
          };
          mat.needsUpdate = true;
        }
      });

      // Camera: model-viewer style orbit around the model's centre, auto-fit distance.
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
        camera.updateProjectionMatrix();
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        renderer.toneMappingExposure = dark ? LOOK.exposureDark : LOOK.exposure;
        scene.environmentIntensity = dark ? LOOK.envIntensityDark : LOOK.envIntensity;
      };
      placeCamera();

      // ---- animation ----
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let visible = true;
      let raf = 0;
      let last = 0;
      let t = 0;
      let nextGustAt = 1.5;
      const gust = { start: -10, strength: 0, dir: new THREE.Vector2(1, 0) };

      const smooth = (x: number) => {
        const c = Math.min(Math.max(x, 0), 1);
        return c * c * (3 - 2 * c);
      };

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        t += dt * WIND.speed;

        if (t >= nextGustAt) {
          gust.start = t;
          gust.strength = WIND.gustMin + Math.random() * (WIND.gustMax - WIND.gustMin);
          const a = Math.random() * Math.PI * 2;
          gust.dir.set(Math.cos(a), Math.sin(a));
          nextGustAt = t + WIND.interval * (0.75 + Math.random() * 0.5);
        }
        const u = t - gust.start;
        const env =
          u < WIND.attack ? smooth(u / WIND.attack) : 1 - smooth((u - WIND.attack) / WIND.decay);

        uniforms.uTime.value = t;
        uniforms.uAmp.value = WIND.idle * size.y;
        uniforms.uGust.value.copy(gust.dir).multiplyScalar(gust.strength * size.y * env);

        placeCamera();
        renderer.render(scene, camera);
        if (!host.dataset.loaded) host.dataset.loaded = '1';

        if (!reduceMotion && visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      const start = () => {
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      };

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
      });
      io.observe(host);
      const onVis = () => {
        if (!document.hidden) start();
      };
      document.addEventListener('visibilitychange', onVis);
      start();

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
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
    })().catch((err) => console.error('[desk-plant]', err));

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div className="desk-plant" ref={ref} aria-hidden="true" />;
}
