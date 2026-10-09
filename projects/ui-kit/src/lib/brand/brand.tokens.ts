import { InjectionToken } from '@angular/core';
import { BrandConfig } from './brand.models';

export const PLATFORM_BRAND: BrandConfig = {
  tenantName: 'GMV',
  primaryColor: '#0866FF',
  secondaryColor: '#006A32',
  errorColor: '#D92D20',
};

/** Permite al shell sobrescribir la marca neutra de la plataforma. */
export const GMV_PLATFORM_BRAND = new InjectionToken<BrandConfig>('GMV_PLATFORM_BRAND');

export const BRAND_CACHE_KEY = 'gmv.brand';
export const DARK_SURFACE = '#12161F';
export const DEFAULT_FONT = 'Plus Jakarta Sans';
