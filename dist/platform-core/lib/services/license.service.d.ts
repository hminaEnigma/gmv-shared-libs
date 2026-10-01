import { LicenseStatus } from '../models/session.models';
import * as i0 from "@angular/core";
export declare class LicenseService {
    private readonly _status;
    private readonly _daysOverdue;
    readonly status: import("@angular/core").Signal<LicenseStatus>;
    readonly daysOverdue: import("@angular/core").Signal<number>;
    readonly isActive: import("@angular/core").Signal<boolean>;
    readonly isGrace: import("@angular/core").Signal<boolean>;
    readonly isSuspended: import("@angular/core").Signal<boolean>;
    readonly isExpired: import("@angular/core").Signal<boolean>;
    readonly showBanner: import("@angular/core").Signal<boolean>;
    setStatus(status: LicenseStatus, daysOverdue?: number): void;
    clear(): void;
    private loadStatus;
    private loadDaysOverdue;
    static ɵfac: i0.ɵɵFactoryDeclaration<LicenseService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LicenseService>;
}
