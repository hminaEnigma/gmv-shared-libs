/*
 * Public API Surface of ui-kit
 */

export { default as AppThemeConfigurator } from './lib/theme-configurator';
export { loadRemoteStyles } from './lib/load-remote-styles';

export * from './lib/brand/brand.models';
export * from './lib/brand/brand.tokens';
export * from './lib/brand/color.utils';
export { resolveBrand, isBrandConfig } from './lib/brand/brand.resolver';
export { buildBrandCss, buildFaviconDataUri, BRAND_STYLE_ID } from './lib/brand/brand-css';
export { GmvBrandService } from './lib/brand/gmv-brand.service';
export { GmvThemePreset } from './lib/brand/gmv-theme.preset';
export { provideGmvTheme } from './lib/brand/provide-gmv-theme';
export { GmvBrandLogoComponent } from './lib/brand/brand-logo.component';
