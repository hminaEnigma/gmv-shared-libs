import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { GMV_SIMULATE_LOGIN } from '../tokens';

export const authGuard: CanActivateFn = (route, state) => {
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
