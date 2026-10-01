import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';
import { PermissionService } from '../services/permission.service';
import { LicenseService } from '../services/license.service';
import { GMV_API_URL } from '../tokens';
import { performLogout } from '../session-lifecycle';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
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

    const headers: Record<string, string> = {};

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

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                performLogout(session, permissions, license, router);
            }
            return throwError(() => error);
        })
    );
};
