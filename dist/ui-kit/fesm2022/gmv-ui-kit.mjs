import { definePreset, palette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import * as i0 from '@angular/core';
import { InjectionToken, inject, signal, Injectable, provideAppInitializer, input, computed, ChangeDetectionStrategy, Component } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { providePrimeNG } from 'primeng/config';

/** @deprecated Usar `provideGmvTheme()` (incluye `GmvThemePreset` y la marca en runtime). Se mantiene por compatibilidad con remotos en v1.0.x. */
const AppThemeConfigurator = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    },
    components: {
        // The default Aura toggle/select-button highlights the selected option with a plain
        // surface pill, which reads as barely-selected. Make the selected option use the
        // primary color so the active choice is obvious.
        togglebutton: {
            colorScheme: {
                light: {
                    root: { checkedColor: '{primary.contrast.color}' },
                    content: { checkedBackground: '{primary.color}' },
                    icon: { checkedColor: '{primary.contrast.color}' }
                },
                dark: {
                    root: { checkedColor: '{primary.contrast.color}' },
                    content: { checkedBackground: '{primary.color}' },
                    icon: { checkedColor: '{primary.contrast.color}' }
                }
            }
        }
    }
});

/**
 * Injects a remote's own compiled global stylesheet (e.g. its Tailwind utility
 * classes) into the host document.
 *
 * Native Federation only wires up JS module loading via the import map -- a
 * remote's `angular.json` "styles" bundle (its own `styles.css`) never reaches
 * the page on its own, since only the host's `index.html` has a `<link>` tag
 * for it. Without this, any Tailwind/global CSS class a remote uses that the
 * host doesn't *also* happen to use gets silently dropped: the host's own
 * Tailwind build only emits utilities found in the host's own templates.
 *
 * Call this once from the remote's OWN exposed entry file (its
 * `federation.config.js` `exposes` target), never from a shared/federated
 * module: `baseUrl` must be derived from that entry file's own
 * `import.meta.url`. A `shareAll({ singleton: true })` package is loaded once
 * and reused by whichever participant (host or another remote) loaded it
 * first, so `import.meta.url` read from inside a shared chunk resolves to
 * that first loader's origin, not necessarily this remote's own.
 *
 * @example
 * // remote's own remote-entry.ts (NOT a shared file)
 * import { loadRemoteStyles } from '@gmv/ui-kit';
 * loadRemoteStyles(new URL('.', import.meta.url).href);
 */
function loadRemoteStyles(baseUrl, fileName = 'styles.css') {
    const href = new URL(fileName, baseUrl).href;
    if (document.querySelector(`link[href="${href}"]`)) {
        return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

const PLATFORM_BRAND = {
    tenantName: 'GMV',
    primaryColor: '#0866FF',
    secondaryColor: '#006A32',
    errorColor: '#D92D20',
};
/** Permite al shell sobrescribir la marca neutra de la plataforma. */
const GMV_PLATFORM_BRAND = new InjectionToken('GMV_PLATFORM_BRAND');
const BRAND_CACHE_KEY = 'gmv.brand';
const DARK_SURFACE = '#12161F';
const DEFAULT_FONT = 'Plus Jakarta Sans';

const TEXT_ON_LIGHT = '#101828';
const TEXT_ON_DARK = '#FFFFFF';
const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** Normaliza un color hex a `#RRGGBB` en mayúsculas; `null` si no es un hex válido. */
function parseHex(value) {
    if (typeof value !== 'string')
        return null;
    const match = HEX_RE.exec(value.trim());
    if (!match)
        return null;
    let hex = match[1];
    if (hex.length === 3)
        hex = hex.split('').map(c => c + c).join('');
    return `#${hex.toUpperCase()}`;
}
function toRgb(hex) {
    const normalized = parseHex(hex);
    if (!normalized)
        throw new Error(`Invalid hex color: ${hex}`);
    return [1, 3, 5].map(i => parseInt(normalized.slice(i, i + 2), 16));
}
function toHex(rgb) {
    return '#' + rgb.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}
/** Luminancia relativa WCAG 2.x. */
function luminance(hex) {
    const [r, g, b] = toRgb(hex).map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}
/** Mezcla `color` hacia `target`; `weight` 0 = color, 1 = target. */
function mix(color, target, weight) {
    const a = toRgb(color);
    const b = toRgb(target);
    return toHex(a.map((v, i) => v + (b[i] - v) * weight));
}
/** Texto (blanco o casi negro) con mayor contraste sobre `bg`. */
function pickOnColor(bg) {
    return contrast(bg, TEXT_ON_DARK) >= contrast(bg, TEXT_ON_LIGHT) ? TEXT_ON_DARK : TEXT_ON_LIGHT;
}
/** Umbral donde blanco y negro tienen el mismo contraste (~0.179). */
function isLightSurface(hex) {
    return luminance(hex) > 0.179;
}
/**
 * Ajusta `color` (hacia negro sobre superficies claras, hacia blanco sobre oscuras) en pasos de 5%
 * hasta alcanzar `min` de contraste contra `surface`. Si no lo logra al 95%, devuelve el texto por defecto.
 */
function ensureContrast(color, surface, min = 4.5) {
    const base = parseHex(color);
    if (!base)
        throw new Error(`Invalid hex color: ${color}`);
    if (contrast(base, surface) >= min)
        return base;
    const light = isLightSurface(surface);
    const target = light ? '#000000' : '#FFFFFF';
    for (let step = 1; step <= 19; step++) {
        const candidate = mix(base, target, step * 0.05);
        if (contrast(candidate, surface) >= min)
            return candidate;
    }
    return light ? TEXT_ON_LIGHT : TEXT_ON_DARK;
}

const PAGE_BG_LIGHT = '#F5F6F8';
const SCALES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
function resolveColor(field, value, fallback) {
    const parsed = parseHex(value);
    if (value != null && value !== '' && !parsed)
        console.warn('[gmv-brand] invalid color', field, value);
    return parsed ?? parseHex(fallback) ?? '#0866FF';
}
function buildPalette(primary) {
    const raw = palette(primary);
    return SCALES.reduce((acc, scale) => {
        acc[scale] = parseHex(raw[scale]) ?? raw[scale];
        return acc;
    }, {});
}
function resolveBrand(config, platform = PLATFORM_BRAND) {
    const tenantName = config.tenantName?.trim() || platform.tenantName;
    const initial = (tenantName.match(/[\p{L}\p{N}]/u)?.[0] ?? 'G').toUpperCase();
    const primary = resolveColor('primaryColor', config.primaryColor, platform.primaryColor);
    const sidebarBg = config.sidebarColor ? resolveColor('sidebarColor', config.sidebarColor, primary) : primary;
    const sidebarFg = pickOnColor(sidebarBg);
    const lightSidebarText = sidebarFg === TEXT_ON_DARK;
    const brandSoftLight = mix(primary, '#FFFFFF', 0.88);
    const brandSoftDark = mix(primary, DARK_SURFACE, 0.82);
    // El texto de marca se dibuja sobre blanco, el fondo de página y los chips "soft": debe cumplir en todos.
    const brandTextLight = ensureContrast(ensureContrast(primary, brandSoftLight), PAGE_BG_LIGHT);
    const brandTextDark = ensureContrast(ensureContrast(primary, brandSoftDark), DARK_SURFACE);
    return {
        tenantName,
        initial,
        primary,
        palette: buildPalette(primary),
        onBrand: pickOnColor(primary),
        brandTextLight,
        brandTextDark,
        brandSoftLight,
        brandSoftDark,
        sidebarBg,
        sidebarFg,
        // Atenuado = sidebarFg mezclado un 25% hacia el fondo, ajustado hasta 4.5:1 sobre el sidebar.
        sidebarFgMuted: ensureContrast(mix(sidebarFg, sidebarBg, 0.25), sidebarBg),
        sidebarActiveBg: lightSidebarText ? 'rgba(255,255,255,.16)' : 'rgba(16,24,40,.10)',
        secondary: resolveColor('secondaryColor', config.secondaryColor, platform.secondaryColor ?? '#006A32'),
        error: resolveColor('errorColor', config.errorColor, platform.errorColor ?? '#D92D20'),
        logoOnLight: config.logoUrl || null,
        logoOnBrand: config.logoDarkUrl || null,
        iconUrl: config.iconUrl || null,
        fontFamily: config.fontFamily?.trim() || DEFAULT_FONT,
    };
}
function isBrandConfig(value) {
    if (!value || typeof value !== 'object')
        return false;
    const v = value;
    return typeof v['tenantName'] === 'string' && typeof v['primaryColor'] === 'string' && parseHex(v['primaryColor']) !== null;
}

const BRAND_STYLE_ID = 'gmv-brand-vars';
function safeFont(font) {
    return font.replace(/[^\p{L}\p{N} \-]/gu, '').trim() || 'Plus Jakarta Sans';
}
function escapeXml(value) {
    return value.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);
}
/**
 * CSS que aplica la marca. Sobrescribe la paleta primaria de PrimeNG (sus tokens son
 * `var(--p-primary-N)`, así que toda la UI la sigue) y define las variables --gmv-* dinámicas.
 * `:root:root:root` (0,3,0) gana a los `:root`/`:root.app-dark` que genera PrimeNG.
 */
function buildBrandCss(r) {
    const scale = Object.entries(r.palette).map(([k, v]) => `--p-primary-${k}:${v};`).join('');
    const vars = {
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
function buildFaviconDataUri(r) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>`
        + `<rect width='64' height='64' rx='14' fill='${r.primary}'/>`
        + `<text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Arial,sans-serif' font-size='34' font-weight='700' fill='${r.onBrand}'>${escapeXml(r.initial)}</text>`
        + `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

class GmvBrandService {
    document = inject(DOCUMENT);
    platformBrand = inject(GMV_PLATFORM_BRAND, { optional: true }) ?? PLATFORM_BRAND;
    _brand = signal(resolveBrand(this.platformBrand, this.platformBrand));
    /** Marca resuelta actualmente aplicada. */
    brand = this._brand.asReadonly();
    apply(config, opts = {}) {
        const resolved = resolveBrand(config, this.platformBrand);
        this.writeStyle(buildBrandCss(resolved));
        this.document.title = resolved.tenantName;
        this.setFavicon(resolved.iconUrl ?? buildFaviconDataUri(resolved));
        if (opts.persist ?? true)
            this.writeCache(config);
        this._brand.set(resolved);
    }
    /** Aplica la última marca guardada (o la de plataforma) — se llama antes del primer render. */
    restoreCached() {
        this.apply(this.readCache() ?? this.platformBrand, { persist: false });
    }
    reset() {
        this.removeCache();
        this.apply(this.platformBrand, { persist: false });
    }
    writeStyle(css) {
        let style = this.document.getElementById(BRAND_STYLE_ID);
        if (!style) {
            style = this.document.createElement('style');
            style.id = BRAND_STYLE_ID;
            this.document.head.appendChild(style);
        }
        style.textContent = css;
    }
    setFavicon(href) {
        let link = this.document.querySelector('link[rel="icon"]');
        if (!link) {
            link = this.document.createElement('link');
            link.rel = 'icon';
            this.document.head.appendChild(link);
        }
        link.removeAttribute('type');
        link.href = href;
    }
    readCache() {
        try {
            const raw = localStorage.getItem(BRAND_CACHE_KEY);
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            return isBrandConfig(parsed) ? parsed : null;
        }
        catch {
            return null;
        }
    }
    writeCache(config) {
        try {
            localStorage.setItem(BRAND_CACHE_KEY, JSON.stringify(config));
        }
        catch {
            /* localStorage no disponible: se omite la caché */
        }
    }
    removeCache() {
        try {
            localStorage.removeItem(BRAND_CACHE_KEY);
        }
        catch {
            /* localStorage no disponible */
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: GmvBrandService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: GmvBrandService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: GmvBrandService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Preset "suave" de GMV. El primario queda en azul provisional: en runtime lo reemplaza
 * GmvBrandService sobrescribiendo --p-primary-* (no se usa updatePrimaryPalette).
 */
const GmvThemePreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}', 100: '{blue.100}', 200: '{blue.200}', 300: '{blue.300}', 400: '{blue.400}', 500: '{blue.500}',
            600: '{blue.600}', 700: '{blue.700}', 800: '{blue.800}', 900: '{blue.900}', 950: '{blue.950}',
        },
        formField: { borderRadius: '10px' },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff', 50: '#f9fafb', 100: '#f5f6f8', 200: '#eaecf0', 300: '#d0d5dd', 400: '#98a2b3',
                    500: '#667085', 600: '#475467', 700: '#344054', 800: '#1d2939', 900: '#101828', 950: '#0c111d',
                },
            },
            dark: {
                surface: {
                    0: '#ffffff', 50: '#eceef2', 100: '#d5d9e0', 200: '#a3acbd', 300: '#7d879a', 400: '#5d6678',
                    500: '#3f4757', 600: '#2a303c', 700: '#1f2430', 800: '#181d28', 900: '#12161f', 950: '#0b0e14',
                },
            },
        },
    },
    components: {
        button: { root: { borderRadius: '10px' } },
        card: { root: { borderRadius: '14px', shadow: 'var(--gmv-card-shadow)' } },
        // Mismo ajuste que AppThemeConfigurator: la opción seleccionada usa el primario.
        togglebutton: {
            colorScheme: {
                light: {
                    root: { checkedColor: '{primary.contrast.color}' },
                    content: { checkedBackground: '{primary.color}' },
                    icon: { checkedColor: '{primary.contrast.color}' },
                },
                dark: {
                    root: { checkedColor: '{primary.contrast.color}' },
                    content: { checkedBackground: '{primary.color}' },
                    icon: { checkedColor: '{primary.contrast.color}' },
                },
            },
        },
    },
});

/** Reemplaza providePrimeNG(...) en el shell: preset GMV + modo oscuro + marca restaurada antes del primer render. */
function provideGmvTheme(opts = {}) {
    return [
        providePrimeNG({ theme: { preset: GmvThemePreset, options: { darkModeSelector: '.app-dark' } } }),
        { provide: GMV_PLATFORM_BRAND, useValue: opts.platformBrand ?? PLATFORM_BRAND },
        provideAppInitializer(() => inject(GmvBrandService).restoreCached()),
    ];
}

class GmvBrandLogoComponent {
    variant = input('onBrand');
    size = input(36);
    brand = inject(GmvBrandService).brand;
    failedSrc = signal(null);
    src = computed(() => (this.variant() === 'onBrand' ? this.brand().logoOnBrand : this.brand().logoOnLight));
    showImage = computed(() => !!this.src() && this.src() !== this.failedSrc());
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: GmvBrandLogoComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.25", type: GmvBrandLogoComponent, isStandalone: true, selector: "gmv-brand-logo", inputs: { variant: { classPropertyName: "variant", publicName: "variant", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "gmv-brand-logo" }, ngImport: i0, template: `
    @if (showImage()) {
      <img class="gmv-brand-logo-img" [src]="src()" [alt]="brand().tenantName" [style.height.px]="size()" (error)="failedSrc.set(src())" />
    } @else {
      <span class="gmv-brand-logo-initial" aria-hidden="true" [class.on-brand]="variant() === 'onBrand'"
            [style.width.px]="size()" [style.height.px]="size()" [style.font-size.px]="size() * 0.45">{{ brand().initial }}</span>
    }
  `, isInline: true, styles: [":host{display:inline-flex;align-items:center;flex-shrink:0}.gmv-brand-logo-img{display:block;width:auto;max-width:168px;object-fit:contain}.gmv-brand-logo-initial{display:inline-grid;place-items:center;border-radius:var(--gmv-radius-md, 10px);font-weight:800;line-height:1;background:var(--gmv-brand);color:var(--gmv-on-brand)}.gmv-brand-logo-initial.on-brand{background:var(--gmv-sidebar-fg);color:var(--gmv-sidebar-bg)}:host-context(.app-dark) .gmv-brand-logo-initial.on-brand{background:var(--gmv-brand);color:var(--gmv-on-brand)}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: GmvBrandLogoComponent, decorators: [{
            type: Component,
            args: [{ selector: 'gmv-brand-logo', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'gmv-brand-logo' }, template: `
    @if (showImage()) {
      <img class="gmv-brand-logo-img" [src]="src()" [alt]="brand().tenantName" [style.height.px]="size()" (error)="failedSrc.set(src())" />
    } @else {
      <span class="gmv-brand-logo-initial" aria-hidden="true" [class.on-brand]="variant() === 'onBrand'"
            [style.width.px]="size()" [style.height.px]="size()" [style.font-size.px]="size() * 0.45">{{ brand().initial }}</span>
    }
  `, styles: [":host{display:inline-flex;align-items:center;flex-shrink:0}.gmv-brand-logo-img{display:block;width:auto;max-width:168px;object-fit:contain}.gmv-brand-logo-initial{display:inline-grid;place-items:center;border-radius:var(--gmv-radius-md, 10px);font-weight:800;line-height:1;background:var(--gmv-brand);color:var(--gmv-on-brand)}.gmv-brand-logo-initial.on-brand{background:var(--gmv-sidebar-fg);color:var(--gmv-sidebar-bg)}:host-context(.app-dark) .gmv-brand-logo-initial.on-brand{background:var(--gmv-brand);color:var(--gmv-on-brand)}\n"] }]
        }] });

/*
 * Public API Surface of ui-kit
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AppThemeConfigurator, BRAND_CACHE_KEY, BRAND_STYLE_ID, DARK_SURFACE, DEFAULT_FONT, GMV_PLATFORM_BRAND, GmvBrandLogoComponent, GmvBrandService, GmvThemePreset, PLATFORM_BRAND, TEXT_ON_DARK, TEXT_ON_LIGHT, buildBrandCss, buildFaviconDataUri, contrast, ensureContrast, isBrandConfig, isLightSurface, loadRemoteStyles, luminance, mix, parseHex, pickOnColor, provideGmvTheme, resolveBrand, toHex, toRgb };
//# sourceMappingURL=gmv-ui-kit.mjs.map
