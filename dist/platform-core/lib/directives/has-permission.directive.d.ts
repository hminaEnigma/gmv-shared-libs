import * as i0 from "@angular/core";
export declare class HasPermissionDirective {
    private readonly permissionService;
    private readonly templateRef;
    private readonly viewContainer;
    private hasView;
    private readonly _required;
    constructor();
    set hasPermission(value: string | string[]);
    static ɵfac: i0.ɵɵFactoryDeclaration<HasPermissionDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HasPermissionDirective, "[hasPermission]", never, { "hasPermission": { "alias": "hasPermission"; "required": false; }; }, {}, never, never, true, never>;
}
