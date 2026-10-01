import { InjectionToken } from '@angular/core';
/** Base URL of the GMV backend API — the consuming app must provide this (e.g. `environment.apiUrl`). */
export declare const GMV_API_URL: InjectionToken<string>;
/** AES key used to encrypt/decrypt the `PERMISOS` entry in localStorage — must match `environment.public_key_cripto`. */
export declare const GMV_PERMISSIONS_CRYPTO_KEY: InjectionToken<string>;
/** Dev-only auth bypass flag (mirrors `environment.simulateLogueo`). Defaults to false when not provided. */
export declare const GMV_SIMULATE_LOGIN: InjectionToken<boolean>;
