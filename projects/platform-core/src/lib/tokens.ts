import { InjectionToken } from '@angular/core';

/** Base URL of the GMV backend API — the consuming app must provide this (e.g. `environment.apiUrl`). */
export const GMV_API_URL = new InjectionToken<string>('GMV_API_URL');

/** AES key used to encrypt/decrypt the `PERMISOS` entry in localStorage — must match `environment.public_key_cripto`. */
export const GMV_PERMISSIONS_CRYPTO_KEY = new InjectionToken<string>('GMV_PERMISSIONS_CRYPTO_KEY');

/** Dev-only auth bypass flag (mirrors `environment.simulateLogueo`). Defaults to false when not provided. */
export const GMV_SIMULATE_LOGIN = new InjectionToken<boolean>('GMV_SIMULATE_LOGIN', {
    providedIn: 'root',
    factory: () => false,
});
