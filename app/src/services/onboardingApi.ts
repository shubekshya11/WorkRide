import { getAccessToken } from '../utils/auth';
import { apiFetch } from '../utils/api';

import {
  API_AUTH_CHANGE_PASSWORD,
  API_AUTH_ONBOARDING_STATUS,
  API_AUTH_PROFILE,
  API_UPLOAD,
  API_RIDER_APPLICATIONS,
  API_RIDER_APPLICATIONS_ME,
} from '../constants/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface OnboardingStatus {
  mustChangePassword: boolean;
  isSuspended: boolean;
  profileCompleteness: number;
  completedFields: string[];
  missingFields: string[];
  riderApplicationStatus: string | null;
  rejectionReason: string | null;
  role: string;
  isApprovedRider: boolean;
}

export interface ProfileUpdateData {
  fullname?: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  employeeId?: string;
  department?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
}

export interface RiderApplicationData {
  drivingLicenseNumber: string;
  drivingLicenseImageUrl: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleRegistrationUrl: string;
}

export const getOnboardingStatus = () =>
  apiFetch<OnboardingStatus>(API_AUTH_ONBOARDING_STATUS);

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<{ message: string }>(API_AUTH_CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const updateProfile = (data: ProfileUpdateData) =>
  apiFetch<{
    user: Record<string, unknown>;
    profileCompleteness: number;
    completedFields: string[];
    missingFields: string[];
  }>(API_AUTH_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const uploadFile = async (file: File): Promise<string> => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${API_UPLOAD}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  const result = await response.json();
  return `${API_BASE_URL}${result.url}`;
};

export const getMyRiderApplication = () =>
  apiFetch<Record<string, unknown> | null>(API_RIDER_APPLICATIONS_ME);

export const submitRiderApplication = (data: RiderApplicationData) =>
  apiFetch<{ message: string; application: Record<string, unknown> }>(
    API_RIDER_APPLICATIONS,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
