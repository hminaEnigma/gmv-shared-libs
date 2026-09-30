import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { JwtClaims } from '../models/session.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private readonly _token = signal<string | null>(this.loadToken());
    private readonly _claims = signal<JwtClaims | null>(this.loadClaims());
    private readonly _selectedTenantId = signal<string | null>(localStorage.getItem('selectedTenantId'));
    private readonly _selectedTenantName = signal<string | null>(localStorage.getItem('selectedTenantName'));

    readonly token = this._token.asReadonly();
    readonly claims = this._claims.asReadonly();
    readonly selectedTenantId = this._selectedTenantId.asReadonly();
    readonly selectedTenantName = this._selectedTenantName.asReadonly();
    readonly isAuthenticated = computed(() => {
        const t = this._token();
        return !!t && this.isTokenValid(t);
    });
    readonly userId = computed(() => this._claims()?.sub ?? null);
    readonly tenantId = computed(() => this._claims()?.tenantId ?? null);
    readonly email = computed(() => this._claims()?.email ?? null);
    readonly mustChangePassword = computed(() => this._claims()?.mustChangePassword ?? false);
    readonly isSuperUser = computed(() => this._claims()?.superUser ?? false);

    constructor(private router: Router) {}

    /** Persist token, decode claims, update signals */
    setToken(accessToken: string): void {
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
    setSelectedTenant(tenantId: string, tenantName: string): void {
        localStorage.setItem('selectedTenantId', tenantId);
        localStorage.setItem('selectedTenantName', tenantName);
        this._selectedTenantId.set(tenantId);
        this._selectedTenantName.set(tenantName);
    }

    /** Clear the selected tenant (e.g. to switch tenants) */
    clearSelectedTenant(): void {
        localStorage.removeItem('selectedTenantId');
        localStorage.removeItem('selectedTenantName');
        this._selectedTenantId.set(null);
        this._selectedTenantName.set(null);
    }

    /** Clear all session data and navigate to login */
    clear(): void {
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
    isTokenValid(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Math.floor(Date.now() / 1000);
        } catch {
            return false;
        }
    }

    getToken(): string | null {
        return this._token();
    }

    // ── Password expiration helpers (local, based on localStorage) ────

    isPasswordExpired(): boolean {
        const expiresAt = localStorage.getItem('passwordExpiresAt');
        if (!expiresAt) return false;
        try {
            const expirationDate = new Date(expiresAt);
            if (isNaN(expirationDate.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today.getTime() >= expirationDate.getTime();
        } catch {
            return false;
        }
    }

    getDaysToPasswordExpire(): number | null {
        const expiresAt = localStorage.getItem('passwordExpiresAt');
        if (!expiresAt) return null;
        try {
            const expirationDate = new Date(expiresAt);
            if (isNaN(expirationDate.getTime())) return null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysRemaining = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysRemaining > 0 ? daysRemaining : 0;
        } catch {
            return null;
        }
    }

    isPasswordExpiringSoon(warningDays: number = 7): boolean {
        const daysToExpire = this.getDaysToPasswordExpire();
        return daysToExpire !== null && daysToExpire > 0 && daysToExpire <= warningDays;
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private loadToken(): string | null {
        return localStorage.getItem('token');
    }

    private loadClaims(): JwtClaims | null {
        const token = localStorage.getItem('token');
        return token ? this.decodeToken(token) : null;
    }

    private decodeToken(token: string): JwtClaims | null {
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
        } catch {
            return null;
        }
    }
}
