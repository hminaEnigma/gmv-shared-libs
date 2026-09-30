import { Injectable, inject, signal, computed } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { SessionService } from './session.service';
import { GMV_PERMISSIONS_CRYPTO_KEY } from '../tokens';

@Injectable({ providedIn: 'root' })
export class PermissionService {
    private readonly session = inject(SessionService);
    private readonly cryptoKey = inject(GMV_PERMISSIONS_CRYPTO_KEY);
    private readonly _permissions = signal<string[]>(this.loadFromStorage());

    readonly permissions = this._permissions.asReadonly();
    readonly count = computed(() => this._permissions().length);

    /** Check if the user has a specific permission ("Resource.Action") */
    hasPermission(permission: string): boolean {
        if (this.session.isSuperUser()) return true;
        return this._permissions().includes(permission);
    }

    /** Check if the user has at least one of the given permissions */
    hasAnyPermission(permissions: string[]): boolean {
        if (this.session.isSuperUser()) return true;
        const perms = this._permissions();
        return permissions.some(p => perms.includes(p));
    }

    /** Replace stored permissions (called after GET /me) */
    setPermissions(permissions: string[]): void {
        this._permissions.set(permissions);
        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(permissions),
            this.cryptoKey
        ).toString();
        localStorage.setItem('PERMISOS', encrypted);
    }

    clear(): void {
        this._permissions.set([]);
        localStorage.removeItem('PERMISOS');
    }

    private loadFromStorage(): string[] {
        const enc = localStorage.getItem('PERMISOS');
        if (!enc) return [];
        try {
            const bytes = CryptoJS.AES.decrypt(enc, this.cryptoKey);
            const parsed: unknown[] = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            if (!Array.isArray(parsed)) return [];
            // Guard against corrupted format (objects instead of strings)
            if (parsed.length > 0 && typeof parsed[0] !== 'string') {
                localStorage.removeItem('PERMISOS');
                return [];
            }
            return parsed as string[];
        } catch {
            return [];
        }
    }
}
