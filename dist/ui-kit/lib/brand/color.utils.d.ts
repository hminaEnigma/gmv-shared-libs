export type Rgb = [number, number, number];
export declare const TEXT_ON_LIGHT = "#101828";
export declare const TEXT_ON_DARK = "#FFFFFF";
/** Normaliza un color hex a `#RRGGBB` en mayúsculas; `null` si no es un hex válido. */
export declare function parseHex(value: string | null | undefined): string | null;
export declare function toRgb(hex: string): Rgb;
export declare function toHex(rgb: Rgb): string;
/** Luminancia relativa WCAG 2.x. */
export declare function luminance(hex: string): number;
export declare function contrast(a: string, b: string): number;
/** Mezcla `color` hacia `target`; `weight` 0 = color, 1 = target. */
export declare function mix(color: string, target: string, weight: number): string;
/** Texto (blanco o casi negro) con mayor contraste sobre `bg`. */
export declare function pickOnColor(bg: string): typeof TEXT_ON_DARK | typeof TEXT_ON_LIGHT;
/** Umbral donde blanco y negro tienen el mismo contraste (~0.179). */
export declare function isLightSurface(hex: string): boolean;
/**
 * Ajusta `color` (hacia negro sobre superficies claras, hacia blanco sobre oscuras) en pasos de 5%
 * hasta alcanzar `min` de contraste contra `surface`. Si no lo logra al 95%, devuelve el texto por defecto.
 */
export declare function ensureContrast(color: string, surface: string, min?: number): string;
