import { getAdminAccessToken } from '../utils/adminAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalRiders: number;
  totalPassengers: number;
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
}

export interface AdminUser {
  id: number;
  fullname: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  karmaPoints: number;
  creditScore: number;
  createdAt: string;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

export interface AdminRide {
  id: number;
  from: string;
  to: string;
  role: string;
  status: string;
  timestamp: string;
  distance?: number;
  rider?: { id: number; fullname: string; email: string };
  passengers?: Array<{ id: number; fullname: string }>;
}

export interface RidesResponse {
  rides: AdminRide[];
  pagination: Pagination;
}

export interface ReportData {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  totalDistance: number;
  totalCo2Saved: number;
  totalPeopleImpacted: number;
  newUsers?: number;
  date?: string;
  month?: string;
}

export interface ActiveUser {
  id: number;
  fullname: string;
  email: string;
  role: string;
  karmaPoints: number;
  creditScore: number;
  totalRides: number;
}

export interface KarmaStats {
  topKarmaUsers: ActiveUser[];
  totalKarmaPoints: number;
  totalCreditScore: number;
}

export interface LogEntry {
  from?: string;
  to?: string;
  level: string;
  message: string;
  role?: string;
  tag: string;
  timestamp: string;
  userId?: number;
  rideId?: number;
}

export interface LogsResponse {
  logs: LogEntry[];
  pagination: Pagination;
}

class AdminApiService {
  private getAuthHeaders() {
    const token = getAdminAccessToken();
    if (!token) {
      console.error('No admin access token found');
      throw new Error('No admin access token found. Please login again.');
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error(`Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Admin API request error:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    return this.request<DashboardStats>('/admin/dashboard');
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();
    return this.request<UsersResponse>(`/admin/users?${queryString}`);
  }

  async getUserById(id: number) {
    return this.request<AdminUser>(`/admin/users/${id}`);
  }

  async updateUser(id: number, data: Partial<AdminUser>) {
    return this.request<AdminUser>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async suspendUser(id: number, reason: string) {
    return this.request<AdminUser>(`/admin/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(id: number) {
    return this.request<AdminUser>(`/admin/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deleteUser(id: number) {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getRides(params: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();
    return this.request<RidesResponse>(`/admin/rides?${queryString}`);
  }

  async getRideById(id: number) {
    return this.request<AdminRide>(`/admin/rides/${id}`);
  }

  async deleteRide(id: number) {
    return this.request<{ message: string }>(`/admin/rides/${id}`, {
      method: 'DELETE',
    });
  }

  async cancelRide(id: number, reason?: string) {
    return this.request<AdminRide>(`/admin/rides/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getDailyReports(date?: string) {
    const queryString = date ? `?date=${date}` : '';
    return this.request<ReportData>(`/admin/reports/daily${queryString}`);
  }

  async getMonthlyReports(month?: string) {
    const queryString = month ? `?month=${month}` : '';
    return this.request<ReportData>(`/admin/reports/monthly${queryString}`);
  }

  async getMostActiveUsers(params: { limit?: number; period?: string } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();
    return this.request<ActiveUser[]>(`/admin/reports/most-active-users?${queryString}`);
  }

  async getKarmaStats() {
    return this.request<KarmaStats>('/admin/reports/karma-stats');
  }

  async getTodayLogs(params: {
    page?: number;
    limit?: number;
    level?: string;
    tag?: string;
    userId?: string;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();
    return this.request<LogsResponse>(`/logs/today?${queryString}`);
  }

  async getAllLogs(params: {
    page?: number;
    limit?: number;
    level?: string;
    tag?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();
    return this.request<LogsResponse>(`/logs/all?${queryString}`);
  }

  async getEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();
    return this.request<{
      employees: Array<Record<string, unknown>>;
      pagination: Pagination;
    }>(`/admin/employees?${queryString}`);
  }

  async createEmployee(data: {
    fullname: string;
    email: string;
    temporaryPassword: string;
    employeeId?: string;
    department?: string;
    phone?: string;
  }) {
    return this.request<{
      message: string;
      user: Record<string, unknown>;
      temporaryPassword: string;
    }>('/admin/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRiderApplications(params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString();
    return this.request<{
      applications: Array<Record<string, unknown>>;
      pagination: Pagination;
    }>(`/admin/rider-applications?${queryString}`);
  }

  async approveRiderApplication(id: number) {
    return this.request<{ message: string }>(`/admin/rider-applications/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectRiderApplication(id: number, reason: string) {
    return this.request<{ message: string }>(`/admin/rider-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

export const adminApi = new AdminApiService();
