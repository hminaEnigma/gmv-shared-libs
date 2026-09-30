import { Injectable, signal, computed } from '@angular/core';
import { LicenseStatus } from '../models/session.models';

@Injectable({ providedIn: 'root' })
export class LicenseService {
    private readonly _status = signal<LicenseStatus>(this.loadStatus());
    private readonly _daysOverdue = signal<number>(this.loadDaysOverdue());

    readonly status = this._status.asReadonly();
    readonly daysOverdue = this._daysOverdue.asReadonly();

    readonly isActive = computed(() => this._status() === 'Active');
    readonly isGrace = computed(() => this._status() === 'Grace');
    readonly isSuspended = computed(() => this._status() === 'Suspended');
    readonly isExpired = computed(() => this._status() === 'Expired');
    readonly showBanner = computed(() => this._status() !== 'Active');

    setStatus(status: LicenseStatus, daysOverdue: number = 0): void {
        this._status.set(status);
        this._daysOverdue.set(daysOverdue);
        localStorage.setItem('licenseStatus', status);
        localStorage.setItem('licenseDaysOverdue', String(daysOverdue));
    }

    clear(): void {
        this._status.set('Active');
        this._daysOverdue.set(0);
        localStorage.removeItem('licenseStatus');
        localStorage.removeItem('licenseDaysOverdue');
    }

    private loadStatus(): LicenseStatus {
        const s = localStorage.getItem('licenseStatus');
        if (s === 'Grace' || s === 'Suspended' || s === 'Expired') return s;
        return 'Active';
    }

    private loadDaysOverdue(): number {
        const d = localStorage.getItem('licenseDaysOverdue');
        return d ? parseInt(d, 10) || 0 : 0;
    }
}
