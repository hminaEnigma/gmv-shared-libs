import { EnvironmentProviders, Provider, inject, provideAppInitializer } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { BrandConfig } from './brand.models';
import { GMV_PLATFORM_BRAND, PLATFORM_BRAND } from './brand.tokens';
import { GmvBrandService } from './gmv-brand.service';
import { GmvThemePreset } from './gmv-theme.preset';

/** Reemplaza providePrimeNG(...) en el shell: preset GMV + modo oscuro + marca restaurada antes del primer render. */
export function provideGmvTheme(opts: { platformBrand?: BrandConfig } = {}): (Provider | EnvironmentProviders)[] {
  return [
    providePrimeNG({ theme: { preset: GmvThemePreset, options: { darkModeSelector: '.app-dark' } } }),
    { provide: GMV_PLATFORM_BRAND, useValue: opts.platformBrand ?? PLATFORM_BRAND },
    provideAppInitializer(() => inject(GmvBrandService).restoreCached()),
  ];
}
