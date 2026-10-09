import { ResolvedBrand } from './brand.models';
export declare const BRAND_STYLE_ID = "gmv-brand-vars";
/**
 * CSS que aplica la marca. Sobrescribe la paleta primaria de PrimeNG (sus tokens son
 * `var(--p-primary-N)`, así que toda la UI la sigue) y define las variables --gmv-* dinámicas.
 * `:root:root:root` (0,3,0) gana a los `:root`/`:root.app-dark` que genera PrimeNG.
 */
export declare function buildBrandCss(r: ResolvedBrand): string;
export declare function buildFaviconDataUri(r: ResolvedBrand): string;
