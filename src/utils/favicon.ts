export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function generateFaviconSvg(accentHex: string): string {
  let color1 = '#0284c7';
  let color2 = '#0061a4';
  let color3 = '#1e3a8a';
  let colorBadge1 = '#38bdf8';
  let colorBadge2 = '#0284c7';
  let bar1 = '#0284c7';
  let bar2 = '#3b82f6';
  let bar3 = '#6366f1';

  if (accentHex && accentHex !== 'default') {
    const { h, s, l } = hexToHsl(accentHex);
    color1 = `hsl(${h}, ${Math.min(100, s + 10)}%, ${Math.min(75, l + 12)}%)`;
    color2 = `hsl(${h}, ${s}%, ${l}%)`;
    color3 = `hsl(${h}, ${Math.min(100, s + 15)}%, ${Math.max(15, l - 22)}%)`;
    colorBadge1 = `hsl(${h}, ${Math.min(100, s + 10)}%, ${Math.min(80, l + 20)}%)`;
    colorBadge2 = `hsl(${h}, ${s}%, ${l}%)`;
    bar1 = `hsl(${h}, ${s}%, ${Math.min(65, l + 8)}%)`;
    bar2 = `hsl(${(h + 15) % 360}, ${s}%, ${l}%)`;
    bar3 = `hsl(${(h + 30) % 360}, ${s}%, ${Math.max(25, l - 10)}%)`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="50%" stop-color="${color2}" />
      <stop offset="100%" stop-color="${color3}" />
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
    <linearGradient id="clockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorBadge1}" />
      <stop offset="100%" stop-color="${colorBadge2}" />
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.25" />
    </filter>
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />
  <rect x="4" y="4" width="504" height="504" rx="124" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.2" />
  <g filter="url(#dropShadow)">
    <rect x="76" y="86" width="360" height="350" rx="44" fill="#ffffff" />
    <path d="M 76 130 Q 76 86 120 86 L 392 86 Q 436 86 436 130 L 436 176 L 76 176 Z" fill="url(#headerGrad)" />
  </g>
  <rect x="156" y="58" width="32" height="58" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="6" />
  <rect x="324" y="58" width="32" height="58" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="6" />
  <circle cx="216" cy="131" r="6" fill="#ffffff" fill-opacity="0.6" />
  <circle cx="256" cy="131" r="6" fill="#ffffff" fill-opacity="0.9" />
  <circle cx="296" cy="131" r="6" fill="#ffffff" fill-opacity="0.6" />
  <rect x="116" y="214" width="76" height="32" rx="16" fill="${bar1}" />
  <rect x="206" y="214" width="186" height="32" rx="16" fill="#e2e8f0" />
  <rect x="116" y="268" width="76" height="32" rx="16" fill="${bar2}" />
  <rect x="206" y="268" width="140" height="32" rx="16" fill="#e2e8f0" />
  <rect x="116" y="322" width="76" height="32" rx="16" fill="${bar3}" />
  <rect x="206" y="322" width="110" height="32" rx="16" fill="#e2e8f0" />
  <g filter="url(#badgeShadow)">
    <circle cx="380" cy="374" r="68" fill="#ffffff" />
    <circle cx="380" cy="374" r="56" fill="url(#clockGrad)" />
    <path d="M 380 374 L 380 342" stroke="#ffffff" stroke-width="9" stroke-linecap="round" />
    <path d="M 380 374 L 404 360" stroke="#ffffff" stroke-width="9" stroke-linecap="round" />
    <circle cx="380" cy="374" r="6" fill="#ffffff" />
  </g>
</svg>`;
}

export function updateFavicon(accentHex: string): void {
  const svg = generateFaviconSvg(accentHex);
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/svg+xml';
    document.head.appendChild(faviconLink);
  }
  faviconLink.href = dataUrl;

  let appleLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (!appleLink) {
    appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    document.head.appendChild(appleLink);
  }
  appleLink.href = dataUrl;

  let metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.content = accentHex === 'default' ? '#0061a4' : accentHex;
}
