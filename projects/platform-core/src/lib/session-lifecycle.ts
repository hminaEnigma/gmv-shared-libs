import { Router } from '@angular/router';
import { GMV_LOGOUT_EVENT } from '@gmv/events-contract';
import { SessionService } from './services/session.service';
import { PermissionService } from './services/permission.service';
import { LicenseService } from './services/license.service';

/**
 * Clears session/permissions/license state, navigates to login, and dispatches
 * `gmv:logout` on `window` so any federated remote mounted in the page can react.
 * Shared by the auth interceptor (401 / expired token) and the shell's own logout action,
 * so the event fires from both paths without duplicating the dispatch call.
 */
export function performLogout(
    session: SessionService,
    permissions: PermissionService,
    license: LicenseService,
    router: Router,
): void {
    session.clear();
    permissions.clear();
    license.clear();
    router.navigate(['/auth/login']);
    window.dispatchEvent(new CustomEvent(GMV_LOGOUT_EVENT));
}
