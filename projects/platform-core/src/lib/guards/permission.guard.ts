import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { LicenseService } from '../services/license.service';

export const permissionGuard: CanActivateFn = (route) => {
    const permissionService = inject(PermissionService);
    const licenseService = inject(LicenseService);
    const router = inject(Router);

    // Suspended license → block all permission-guarded routes
    if (licenseService.isSuspended() || licenseService.isExpired()) {
        router.navigate(['/dashboard']);
        return false;
    }

    const required = route.data['permission'] as string | string[] | undefined;
    if (!required) return true;

    const perms = Array.isArray(required) ? required : [required];
    if (permissionService.hasAnyPermission(perms)) return true;

    router.navigate(['/dashboard']);
    return false;
};
