'use client';

import { useEffect } from 'react';

/**
 * Monstera on the desk, seen from above. Rendered with <model-viewer>, which is
 * registered on the client only (it touches `window` at import time).
 * No camera-controls: it is a static prop, not something to spin.
 */
export default function DeskPlant() {
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  return (
    <model-viewer
      class="desk-plant"
      src="/desk/plant.glb"
      alt=""
      aria-hidden="true"
      loading="eager"
      interaction-prompt="none"
      camera-orbit="30deg 12deg auto"
      shadow-intensity="0.6"
      shadow-softness="0.8"
      exposure="0.9"
      environment-image="neutral"
    />
  );
}
