import { BrandConfig, ResolvedBrand } from './brand.models';
export declare function resolveBrand(config: BrandConfig, platform?: BrandConfig): ResolvedBrand;
export declare function isBrandConfig(value: unknown): value is BrandConfig;
