import { ResolvedBrand } from './brand.models';
import { pickOnColor } from './color.utils';

export const BRAND_STYLE_ID = 'gmv-brand-vars';

function safeFont(font: string): string {
  return font.replace(/[^\p{L}\p{N} \-]/gu, '').trim() || 'Plus Jakarta Sans';
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
}

/**
 * CSS que aplica la marca. Sobrescribe la paleta primaria de PrimeNG (sus tokens son
 * `var(--p-primary-N)`, así que toda la UI la sigue) y define las variables --gmv-* dinámicas.
 * `:root:root:root` (0,3,0) gana a los `:root`/`:root.app-dark` que genera PrimeNG.
 */
export function buildBrandCss(r: ResolvedBrand): string {
  const scale = Object.entries(r.palette).map(([k, v]) => `--p-primary-${k}:${v};`).join('');
  const vars: Record<string, string> = {
    '--gmv-brand': r.primary,
    '--gmv-on-brand': r.onBrand,
    '--gmv-brand-text-light': r.brandTextLight,
    '--gmv-brand-text-dark': r.brandTextDark,
    '--gmv-brand-soft-light': r.brandSoftLight,
    '--gmv-brand-soft-dark': r.brandSoftDark,
    '--gmv-sidebar-bg-light': r.sidebarBg,
    '--gmv-sidebar-fg-light': r.sidebarFg,
    '--gmv-sidebar-fg-muted-light': r.sidebarFgMuted,
    '--gmv-sidebar-active-bg-light': r.sidebarActiveBg,
    '--gmv-secondary': r.secondary,
    '--gmv-error': r.error,
    '--gmv-font': `'${safeFont(r.fontFamily)}'`,
  };
  const gmv = Object.entries(vars).map(([k, v]) => `${k}:${v};`).join('');
  return `:root:root:root{${scale}--p-primary-contrast-color:${r.onBrand};${gmv}}`
    + `:root:root.app-dark{--p-primary-contrast-color:${pickOnColor(r.palette[400])};}`;
}

export function buildFaviconDataUri(r: ResolvedBrand): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>`
    + `<rect width='64' height='64' rx='14' fill='${r.primary}'/>`
    + `<text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Arial,sans-serif' font-size='34' font-weight='700' fill='${r.onBrand}'>${escapeXml(r.initial)}</text>`
    + `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
