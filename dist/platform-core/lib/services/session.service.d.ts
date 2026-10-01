import { Router } from '@angular/router';
import { JwtClaims } from '../models/session.models';
import * as i0 from "@angular/core";
export declare class SessionService {
    private router;
    private readonly _token;
    private readonly _claims;
    private readonly _selectedTenantId;
    private readonly _selectedTenantName;
    readonly token: import("@angular/core").Signal<string | null>;
    readonly claims: import("@angular/core").Signal<JwtClaims | null>;
    readonly selectedTenantId: import("@angular/core").Signal<string | null>;
    readonly selectedTenantName: import("@angular/core").Signal<string | null>;
    readonly isAuthenticated: import("@angular/core").Signal<boolean>;
    readonly userId: import("@angular/core").Signal<string | null>;
    readonly tenantId: import("@angular/core").Signal<string | null>;
    readonly email: import("@angular/core").Signal<string | null>;
    readonly mustChangePassword: import("@angular/core").Signal<boolean>;
    readonly isSuperUser: import("@angular/core").Signal<boolean>;
    constructor(router: Router);
    /** Persist token, decode claims, update signals */
    setToken(accessToken: string): void;
    /** Set the tenant the super user is impersonating */
    setSelectedTenant(tenantId: string, tenantName: string): void;
    /** Clear the selected tenant (e.g. to switch tenants) */
    clearSelectedTenant(): void;
    /** Clear all session data and navigate to login */
    clear(): void;
    /** Check if a JWT string is not expired */
    isTokenValid(token: string): boolean;
    getToken(): string | null;
    isPasswordExpired(): boolean;
    getDaysToPasswordExpire(): number | null;
    isPasswordExpiringSoon(warningDays?: number): boolean;
    private loadToken;
    private loadClaims;
    private decodeToken;
    static ɵfac: i0.ɵɵFactoryDeclaration<SessionService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SessionService>;
}
