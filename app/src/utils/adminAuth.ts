const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_USER_KEY = 'admin_user';

export interface StoredAdminUserData {
  id: number;
  email: string;
  fullname: string;
  role: string;
  employeeId?: string | null;
  phone?: string | null;
  address?: string | null;
  profilePicture?: string | null;
}

/**
 * Store admin authentication tokens
 */
export const setAdminTokens = (
  accessToken: string,
  refreshToken: string,
): void => {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get admin access token
 */
export const getAdminAccessToken = (): string | null => {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
};

/**
 * Get admin refresh token
 */
export const getAdminRefreshToken = (): string | null => {
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
};

/**
 * Store admin user data
 */
export const setStoredAdminUser = (user: StoredAdminUserData): void => {
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
};

/**
 * Get stored admin user data
 */
export const getStoredAdminUser = (): StoredAdminUserData | null => {
  const userStr = localStorage.getItem(ADMIN_USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as StoredAdminUserData;
  } catch {
    return null;
  }
};

/**
 * Check if admin is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAdminAccessToken();
  const user = getStoredAdminUser();
  return !!token && !!user && user.role?.toLowerCase() === 'admin';
};

/**
 * Clear admin authentication data
 */
export const clearAdminAuth = (): void => {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};
