/** Dispatched on `window` when the session ends (explicit logout or a 401 from the API). */
export const GMV_LOGOUT_EVENT = 'gmv:logout' as const;

/** Dispatched on `window` after every successful `GET /me` (login, or a manual permissions refresh). */
export const GMV_SESSION_REFRESHED_EVENT = 'gmv:session-refreshed' as const;

export interface GmvSessionRefreshedDetail {
    permissions: string[];
}

export type GmvLogoutCustomEvent = CustomEvent<void>;
export type GmvSessionRefreshedCustomEvent = CustomEvent<GmvSessionRefreshedDetail>;
