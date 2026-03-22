const LEGACY_ACCESS_TOKEN_KEY = 'dd_access_token';

const canUseStorage = () => typeof window !== 'undefined';

export const getLegacyAccessToken = (): string | null => {
    if (!canUseStorage()) return null;
    return localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
};

export const setLegacyAccessToken = (token: string): void => {
    if (!canUseStorage()) return;
    localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, token);
};

export const clearLegacyAccessToken = (): void => {
    if (!canUseStorage()) return;
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
};
