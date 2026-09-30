import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const superAdminGuard: CanActivateFn = () => {
    const session = inject(SessionService);
    const router  = inject(Router);
    if (!session.isSuperUser()) {
        router.navigateByUrl('/dashboard');
        return false;
    }
    return true;
};
