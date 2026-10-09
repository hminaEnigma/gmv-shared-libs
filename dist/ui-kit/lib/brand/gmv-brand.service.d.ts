import { BrandConfig, ResolvedBrand } from './brand.models';
import * as i0 from "@angular/core";
export declare class GmvBrandService {
    private readonly document;
    private readonly platformBrand;
    private readonly _brand;
    /** Marca resuelta actualmente aplicada. */
    readonly brand: import("@angular/core").Signal<ResolvedBrand>;
    apply(config: BrandConfig, opts?: {
        persist?: boolean;
    }): void;
    /** Aplica la última marca guardada (o la de plataforma) — se llama antes del primer render. */
    restoreCached(): void;
    reset(): void;
    private writeStyle;
    private setFavicon;
    private readCache;
    private writeCache;
    private removeCache;
    static ɵfac: i0.ɵɵFactoryDeclaration<GmvBrandService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GmvBrandService>;
}
