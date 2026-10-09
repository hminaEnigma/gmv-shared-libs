import * as i0 from "@angular/core";
export declare class GmvBrandLogoComponent {
    readonly variant: import("@angular/core").InputSignal<"onBrand" | "onLight">;
    readonly size: import("@angular/core").InputSignal<number>;
    protected readonly brand: import("@angular/core").Signal<import("@gmv/ui-kit").ResolvedBrand>;
    protected readonly failedSrc: import("@angular/core").WritableSignal<string | null>;
    protected readonly src: import("@angular/core").Signal<string | null>;
    protected readonly showImage: import("@angular/core").Signal<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<GmvBrandLogoComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GmvBrandLogoComponent, "gmv-brand-logo", never, { "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
