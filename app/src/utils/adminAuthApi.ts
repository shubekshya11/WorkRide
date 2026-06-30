const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    fullname: string;
    role: string;
    employeeId?: string | null;
    phone?: string | null;
    address?: string | null;
    profilePicture?: string | null;
  };
  accessToken: string;
  refreshToken: string;
  mustChangePassword?: boolean;
}

export interface AdminLogoutRequest {
  refreshToken: string;
}

/**
 * Admin login API call - uses direct fetch (no auth required)
 */
export const adminLogin = async (
  credentials: AdminLoginRequest,
): Promise<AdminLoginResponse> => {
  const url = `${API_BASE_URL}/auth/admin/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = (error as { message?: string | string[] }).message;
    const detail = Array.isArray(message) ? message.join(', ') : message;
    throw new Error(detail || 'Admin login failed');
  }

  return response.json();
};

/**
 * Admin logout API call - uses direct fetch with admin token
 */
export const adminLogoutUser = async (): Promise<void> => {
  const url = `${API_BASE_URL}/auth/admin/logout`;
  const refreshToken = localStorage.getItem('admin_refresh_token');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = (error as { message?: string | string[] }).message;
    const detail = Array.isArray(message) ? message.join(', ') : message;
    throw new Error(detail || 'Admin logout failed');
  }
};
