export interface JwtClaims {
    sub: string;
    tenantId: string;
    email: string;
    mustChangePassword: boolean;
    superUser: boolean;
    exp: number;
    iss?: string;
    aud?: string;
}
export type LicenseStatus = 'Active' | 'Grace' | 'Suspended' | 'Expired';
