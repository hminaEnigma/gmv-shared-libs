export type Rgb = [number, number, number];

export const TEXT_ON_LIGHT = '#101828';
export const TEXT_ON_DARK = '#FFFFFF';

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normaliza un color hex a `#RRGGBB` en mayúsculas; `null` si no es un hex válido. */
export function parseHex(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const match = HEX_RE.exec(value.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return `#${hex.toUpperCase()}`;
}

export function toRgb(hex: string): Rgb {
  const normalized = parseHex(hex);
  if (!normalized) throw new Error(`Invalid hex color: ${hex}`);
  return [1, 3, 5].map(i => parseInt(normalized.slice(i, i + 2), 16)) as Rgb;
}

export function toHex(rgb: Rgb): string {
  return '#' + rgb.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Luminancia relativa WCAG 2.x. */
export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla `color` hacia `target`; `weight` 0 = color, 1 = target. */
export function mix(color: string, target: string, weight: number): string {
  const a = toRgb(color);
  const b = toRgb(target);
  return toHex(a.map((v, i) => v + (b[i] - v) * weight) as Rgb);
}

/** Texto (blanco o casi negro) con mayor contraste sobre `bg`. */
export function pickOnColor(bg: string): typeof TEXT_ON_DARK | typeof TEXT_ON_LIGHT {
  return contrast(bg, TEXT_ON_DARK) >= contrast(bg, TEXT_ON_LIGHT) ? TEXT_ON_DARK : TEXT_ON_LIGHT;
}

/** Umbral donde blanco y negro tienen el mismo contraste (~0.179). */
export function isLightSurface(hex: string): boolean {
  return luminance(hex) > 0.179;
}

/**
 * Ajusta `color` (hacia negro sobre superficies claras, hacia blanco sobre oscuras) en pasos de 5%
 * hasta alcanzar `min` de contraste contra `surface`. Si no lo logra al 95%, devuelve el texto por defecto.
 */
export function ensureContrast(color: string, surface: string, min = 4.5): string {
  const base = parseHex(color);
  if (!base) throw new Error(`Invalid hex color: ${color}`);
  if (contrast(base, surface) >= min) return base;
  const light = isLightSurface(surface);
  const target = light ? '#000000' : '#FFFFFF';
  for (let step = 1; step <= 19; step++) {
    const candidate = mix(base, target, step * 0.05);
    if (contrast(candidate, surface) >= min) return candidate;
  }
  return light ? TEXT_ON_LIGHT : TEXT_ON_DARK;
}
