import type { HTMLAttributes } from 'react';

type ModelViewerAttrs = HTMLAttributes<HTMLElement> & {
  class?: string;
  src?: string;
  alt?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  'interaction-prompt'?: 'auto' | 'none';
  'camera-orbit'?: string;
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  exposure?: string;
  'environment-image'?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttrs;
    }
  }
}
