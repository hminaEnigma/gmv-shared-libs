import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { BRAND_STYLE_ID, buildBrandCss, buildFaviconDataUri } from './brand-css';
import { BrandConfig, ResolvedBrand } from './brand.models';
import { isBrandConfig, resolveBrand } from './brand.resolver';
import { BRAND_CACHE_KEY, GMV_PLATFORM_BRAND, PLATFORM_BRAND } from './brand.tokens';

@Injectable({ providedIn: 'root' })
export class GmvBrandService {
  private readonly document = inject(DOCUMENT);
  private readonly platformBrand = inject(GMV_PLATFORM_BRAND, { optional: true }) ?? PLATFORM_BRAND;
  private readonly _brand = signal<ResolvedBrand>(resolveBrand(this.platformBrand, this.platformBrand));

  /** Marca resuelta actualmente aplicada. */
  readonly brand = this._brand.asReadonly();

  apply(config: BrandConfig, opts: { persist?: boolean } = {}): void {
    const resolved = resolveBrand(config, this.platformBrand);
    this.writeStyle(buildBrandCss(resolved));
    this.document.title = resolved.tenantName;
    this.setFavicon(resolved.iconUrl ?? buildFaviconDataUri(resolved));
    if (opts.persist ?? true) this.writeCache(config);
    this._brand.set(resolved);
  }

  /** Aplica la última marca guardada (o la de plataforma) — se llama antes del primer render. */
  restoreCached(): void {
    this.apply(this.readCache() ?? this.platformBrand, { persist: false });
  }

  reset(): void {
    this.removeCache();
    this.apply(this.platformBrand, { persist: false });
  }

  private writeStyle(css: string): void {
    let style = this.document.getElementById(BRAND_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = this.document.createElement('style');
      style.id = BRAND_STYLE_ID;
      this.document.head.appendChild(style);
    }
    style.textContent = css;
  }

  private setFavicon(href: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.head.appendChild(link);
    }
    link.removeAttribute('type');
    link.href = href;
  }

  private readCache(): BrandConfig | null {
    try {
      const raw = localStorage.getItem(BRAND_CACHE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isBrandConfig(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private writeCache(config: BrandConfig): void {
    try {
      localStorage.setItem(BRAND_CACHE_KEY, JSON.stringify(config));
    } catch {
      /* localStorage no disponible: se omite la caché */
    }
  }

  private removeCache(): void {
    try {
      localStorage.removeItem(BRAND_CACHE_KEY);
    } catch {
      /* localStorage no disponible */
    }
  }
}
