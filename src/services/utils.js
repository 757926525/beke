import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * High-aesthetic SVG fallback placeholder image
 * Used when external images (e.g. Unsplash) fail to load due to network/CORS/dead links
 */
export const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="foxGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>
  <circle cx="400" cy="210" r="160" fill="url(#foxGlow)"/>

  <!-- Fox Emblem -->
  <g transform="translate(340, 150) scale(2.5)" stroke="#34d399" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <circle cx="12" cy="12" r="4"/>
  </g>

  <text x="400" y="320" fill="#a7f3d0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" text-anchor="middle" letter-spacing="3">白狐意象 · 静水深流</text>
  <text x="400" y="350" fill="#6ee7b7" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" opacity="0.6" text-anchor="middle" letter-spacing="1">WHITEFOX AESTHETICS</text>
</svg>
`);

import { handleKernelImageError } from './mediaStorageKernel';

/**
 * Handle img onError to gracefully swap to fallback placeholder without infinite loops
 * @param {Event} e
 * @param {string} fallbackUrl
 */
export const handleImageError = (e, fallbackUrl = DEFAULT_FALLBACK_IMAGE) => {
  if (e && e.target && e.target.src !== fallbackUrl) {
    e.target.onerror = null; // Prevent infinite loop
    handleKernelImageError(e, fallbackUrl);
  }
};
