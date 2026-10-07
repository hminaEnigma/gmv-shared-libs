import * as i0 from '@angular/core';
import { InjectionToken, signal, computed, Injectable, inject, TemplateRef, ViewContainerRef, effect, Input, Directive } from '@angular/core';
import * as i1 from '@angular/router';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { throwError, catchError } from 'rxjs';
import { GMV_LOGOUT_EVENT } from '@gmv/events-contract';

/** Base URL of the GMV backend API — the consuming app must provide this (e.g. `environment.apiUrl`). */
const GMV_API_URL = new InjectionToken('GMV_API_URL');
/** AES key used to encrypt/decrypt the `PERMISOS` entry in localStorage — must match `environment.public_key_cripto`. */
const GMV_PERMISSIONS_CRYPTO_KEY = new InjectionToken('GMV_PERMISSIONS_CRYPTO_KEY');
/** Dev-only auth bypass flag (mirrors `environment.simulateLogueo`). Defaults to false when not provided. */
const GMV_SIMULATE_LOGIN = new InjectionToken('GMV_SIMULATE_LOGIN', {
    providedIn: 'root',
    factory: () => false,
});

class SessionService {
    router;
    _token = signal(this.loadToken());
    _claims = signal(this.loadClaims());
    _selectedTenantId = signal(localStorage.getItem('selectedTenantId'));
    _selectedTenantName = signal(localStorage.getItem('selectedTenantName'));
    token = this._token.asReadonly();
    claims = this._claims.asReadonly();
    selectedTenantId = this._selectedTenantId.asReadonly();
    selectedTenantName = this._selectedTenantName.asReadonly();
    isAuthenticated = computed(() => {
        const t = this._token();
        return !!t && this.isTokenValid(t);
    });
    userId = computed(() => this._claims()?.sub ?? null);
    tenantId = computed(() => this._claims()?.tenantId ?? null);
    email = computed(() => this._claims()?.email ?? null);
    mustChangePassword = computed(() => this._claims()?.mustChangePassword ?? false);
    isSuperUser = computed(() => this._claims()?.superUser ?? false);
    constructor(router) {
        this.router = router;
    }
    /** Persist token, decode claims, update signals */
    setToken(accessToken) {
        localStorage.setItem('token', accessToken);
        const claims = this.decodeToken(accessToken);
        this._token.set(accessToken);
        this._claims.set(claims);
        if (claims) {
            localStorage.setItem('userId', claims.sub);
            localStorage.setItem('email', claims.email);
            if (!claims.superUser) {
                localStorage.setItem('tenantId', claims.tenantId);
            }
        }
    }
    /** Set the tenant the super user is impersonating */
    setSelectedTenant(tenantId, tenantName) {
        localStorage.setItem('selectedTenantId', tenantId);
        localStorage.setItem('selectedTenantName', tenantName);
        this._selectedTenantId.set(tenantId);
        this._selectedTenantName.set(tenantName);
    }
    /** Clear the selected tenant (e.g. to switch tenants) */
    clearSelectedTenant() {
        localStorage.removeItem('selectedTenantId');
        localStorage.removeItem('selectedTenantName');
        this._selectedTenantId.set(null);
        this._selectedTenantName.set(null);
    }
    /** Clear all session data and navigate to login */
    clear() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('selectedTenantId');
        localStorage.removeItem('selectedTenantName');
        localStorage.removeItem('PERMISOS');
        localStorage.removeItem('passwordChangedAt');
        localStorage.removeItem('passwordExpiresAt');
        localStorage.removeItem('inactivityDuration');
        localStorage.removeItem('passwordPolicy');
        localStorage.removeItem('licenseStatus');
        localStorage.removeItem('licenseDaysOverdue');
        this._token.set(null);
        this._claims.set(null);
        this._selectedTenantId.set(null);
    }
    /** Check if a JWT string is not expired */
    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Math.floor(Date.now() / 1000);
        }
        catch {
            return false;
        }
    }
    getToken() {
        return this._token();
    }
    // ── Password expiration helpers (local, based on localStorage) ────
    isPasswordExpired() {
        const expiresAt = localStorage.getItem('passwordExpiresAt');
        if (!expiresAt)
            return false;
        try {
            const expirationDate = new Date(expiresAt);
            if (isNaN(expirationDate.getTime()))
                return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today.getTime() >= expirationDate.getTime();
        }
        catch {
            return false;
        }
    }
    getDaysToPasswordExpire() {
        const expiresAt = localStorage.getItem('passwordExpiresAt');
        if (!expiresAt)
            return null;
        try {
            const expirationDate = new Date(expiresAt);
            if (isNaN(expirationDate.getTime()))
                return null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysRemaining = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysRemaining > 0 ? daysRemaining : 0;
        }
        catch {
            return null;
        }
    }
    isPasswordExpiringSoon(warningDays = 7) {
        const daysToExpire = this.getDaysToPasswordExpire();
        return daysToExpire !== null && daysToExpire > 0 && daysToExpire <= warningDays;
    }
    // ── Private helpers ──────────────────────────────────────────────────
    loadToken() {
        return localStorage.getItem('token');
    }
    loadClaims() {
        const token = localStorage.getItem('token');
        return token ? this.decodeToken(token) : null;
    }
    decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                sub: payload.sub,
                tenantId: payload.tenantId,
                email: payload.email,
                mustChangePassword: payload.mustChangePassword === true || payload.mustChangePassword === 'true',
                superUser: payload.superUser === true || payload.superUser === 'true',
                exp: payload.exp,
                iss: payload.iss,
                aud: payload.aud,
            };
        }
        catch {
            return null;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: SessionService, deps: [{ token: i1.Router }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: SessionService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: SessionService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Router }] });

class PermissionService {
    session = inject(SessionService);
    cryptoKey = inject(GMV_PERMISSIONS_CRYPTO_KEY);
    _permissions = signal(this.loadFromStorage());
    permissions = this._permissions.asReadonly();
    count = computed(() => this._permissions().length);
    /**
     * A super-user bypasses permission checks only outside a tenant. Inside a selected tenant it is
     * evaluated against its stored permissions like any user, so it only sees that tenant's modules
     * (the host loads them from `GET /permissions/available` after selecting the tenant).
     */
    bypassesChecks() {
        return this.session.isSuperUser() && !this.session.selectedTenantId();
    }
    /** Check if the user has a specific permission ("Resource.Action") */
    hasPermission(permission) {
        if (this.bypassesChecks())
            return true;
        return this._permissions().includes(permission);
    }
    /** Check if the user has at least one of the given permissions */
    hasAnyPermission(permissions) {
        if (this.bypassesChecks())
            return true;
        const perms = this._permissions();
        return permissions.some(p => perms.includes(p));
    }
    /** Replace stored permissions (called after GET /me) */
    setPermissions(permissions) {
        this._permissions.set(permissions);
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(permissions), this.cryptoKey).toString();
        localStorage.setItem('PERMISOS', encrypted);
    }
    clear() {
        this._permissions.set([]);
        localStorage.removeItem('PERMISOS');
    }
    loadFromStorage() {
        const enc = localStorage.getItem('PERMISOS');
        if (!enc)
            return [];
        try {
            const bytes = CryptoJS.AES.decrypt(enc, this.cryptoKey);
            const parsed = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            if (!Array.isArray(parsed))
                return [];
            // Guard against corrupted format (objects instead of strings)
            if (parsed.length > 0 && typeof parsed[0] !== 'string') {
                localStorage.removeItem('PERMISOS');
                return [];
            }
            return parsed;
        }
        catch {
            return [];
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: PermissionService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: PermissionService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: PermissionService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class LicenseService {
    _status = signal(this.loadStatus());
    _daysOverdue = signal(this.loadDaysOverdue());
    status = this._status.asReadonly();
    daysOverdue = this._daysOverdue.asReadonly();
    isActive = computed(() => this._status() === 'Active');
    isGrace = computed(() => this._status() === 'Grace');
    isSuspended = computed(() => this._status() === 'Suspended');
    isExpired = computed(() => this._status() === 'Expired');
    showBanner = computed(() => this._status() !== 'Active');
    setStatus(status, daysOverdue = 0) {
        this._status.set(status);
        this._daysOverdue.set(daysOverdue);
        localStorage.setItem('licenseStatus', status);
        localStorage.setItem('licenseDaysOverdue', String(daysOverdue));
    }
    clear() {
        this._status.set('Active');
        this._daysOverdue.set(0);
        localStorage.removeItem('licenseStatus');
        localStorage.removeItem('licenseDaysOverdue');
    }
    loadStatus() {
        const s = localStorage.getItem('licenseStatus');
        if (s === 'Grace' || s === 'Suspended' || s === 'Expired')
            return s;
        return 'Active';
    }
    loadDaysOverdue() {
        const d = localStorage.getItem('licenseDaysOverdue');
        return d ? parseInt(d, 10) || 0 : 0;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: LicenseService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: LicenseService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: LicenseService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

const authGuard = (route, state) => {
    const session = inject(SessionService);
    const router = inject(Router);
    const simulateLogin = inject(GMV_SIMULATE_LOGIN);
    const isLoggedIn = simulateLogin || session.isAuthenticated();
    const redirectIfAuthenticated = route.data['redirectIfAuthenticated'] ?? false;
    const skipTenantCheck = route.data['skipTenantCheck'] ?? false;
    if (isLoggedIn && redirectIfAuthenticated) {
        router.navigateByUrl('/dashboard');
        return false;
    }
    if (!isLoggedIn && !redirectIfAuthenticated) {
        router.navigateByUrl('/auth/login');
        return false;
    }
    // Force password change if JWT says mustChangePassword
    if (isLoggedIn && !state.url.includes('change-password') && session.mustChangePassword()) {
        router.navigate(['/auth/change-password'], { queryParams: { reason: 'forced' } });
        return false;
    }
    // Super user must select a tenant before accessing the app
    if (isLoggedIn && session.isSuperUser() && !session.selectedTenantId() && !skipTenantCheck) {
        router.navigateByUrl('/tenant-selector');
        return false;
    }
    return true;
};

const permissionGuard = (route) => {
    const permissionService = inject(PermissionService);
    const licenseService = inject(LicenseService);
    const router = inject(Router);
    // Suspended license → block all permission-guarded routes
    if (licenseService.isSuspended() || licenseService.isExpired()) {
        router.navigate(['/dashboard']);
        return false;
    }
    const required = route.data['permission'];
    if (!required)
        return true;
    const perms = Array.isArray(required) ? required : [required];
    if (permissionService.hasAnyPermission(perms))
        return true;
    router.navigate(['/dashboard']);
    return false;
};

const superAdminGuard = () => {
    const session = inject(SessionService);
    const router = inject(Router);
    if (!session.isSuperUser()) {
        router.navigateByUrl('/dashboard');
        return false;
    }
    return true;
};

class HasPermissionDirective {
    permissionService = inject(PermissionService);
    templateRef = inject((TemplateRef));
    viewContainer = inject(ViewContainerRef);
    hasView = false;
    _required = signal([]);
    constructor() {
        effect(() => {
            const required = this._required();
            const hasAccess = this.permissionService.hasAnyPermission(required);
            if (hasAccess && !this.hasView) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.hasView = true;
            }
            else if (!hasAccess && this.hasView) {
                this.viewContainer.clear();
                this.hasView = false;
            }
        });
    }
    set hasPermission(value) {
        this._required.set(Array.isArray(value) ? value : [value]);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: HasPermissionDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.25", type: HasPermissionDirective, isStandalone: true, selector: "[hasPermission]", inputs: { hasPermission: "hasPermission" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.25", ngImport: i0, type: HasPermissionDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[hasPermission]',
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { hasPermission: [{
                type: Input
            }] } });

/**
 * Clears session/permissions/license state, navigates to login, and dispatches
 * `gmv:logout` on `window` so any federated remote mounted in the page can react.
 * Shared by the auth interceptor (401 / expired token) and the shell's own logout action,
 * so the event fires from both paths without duplicating the dispatch call.
 */
function performLogout(session, permissions, license, router) {
    session.clear();
    permissions.clear();
    license.clear();
    router.navigate(['/auth/login']);
    window.dispatchEvent(new CustomEvent(GMV_LOGOUT_EVENT));
}

const authInterceptor = (req, next) => {
    const session = inject(SessionService);
    const permissions = inject(PermissionService);
    const license = inject(LicenseService);
    const router = inject(Router);
    const apiUrl = inject(GMV_API_URL);
    const token = session.getToken();
    // Skip requests outside our API
    if (!req.url.startsWith(apiUrl)) {
        return next(req);
    }
    if (token && !session.isTokenValid(token)) {
        performLogout(session, permissions, license, router);
        return throwError(() => new Error('Token expired'));
    }
    const headers = {};
    if (token && session.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const selectedTenant = session.selectedTenantId();
    if (session.isSuperUser() && selectedTenant) {
        headers['X-Tenant-Id'] = selectedTenant;
    }
    const authReq = Object.keys(headers).length > 0
        ? req.clone({ setHeaders: headers })
        : req;
    return next(authReq).pipe(catchError((error) => {
        if (error.status === 401) {
            performLogout(session, permissions, license, router);
        }
        return throwError(() => error);
    }));
};

/*
 * Public API Surface of platform-core
 */

/**
 * Generated bundle index. Do not edit.
 */

export { GMV_API_URL, GMV_PERMISSIONS_CRYPTO_KEY, GMV_SIMULATE_LOGIN, HasPermissionDirective, LicenseService, PermissionService, SessionService, authGuard, authInterceptor, performLogout, permissionGuard, superAdminGuard };
//# sourceMappingURL=gmv-platform-core.mjs.map
