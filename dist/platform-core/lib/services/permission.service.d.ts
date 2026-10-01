import * as i0 from "@angular/core";
export declare class PermissionService {
    private readonly session;
    private readonly cryptoKey;
    private readonly _permissions;
    readonly permissions: import("@angular/core").Signal<string[]>;
    readonly count: import("@angular/core").Signal<number>;
    /** Check if the user has a specific permission ("Resource.Action") */
    hasPermission(permission: string): boolean;
    /** Check if the user has at least one of the given permissions */
    hasAnyPermission(permissions: string[]): boolean;
    /** Replace stored permissions (called after GET /me) */
    setPermissions(permissions: string[]): void;
    clear(): void;
    private loadFromStorage;
    static ɵfac: i0.ɵɵFactoryDeclaration<PermissionService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PermissionService>;
}
