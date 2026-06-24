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

function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

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
  apiFetch<OnboardingStatus>(buildApiUrl(API_AUTH_ONBOARDING_STATUS));

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<{ message: string }>(buildApiUrl(API_AUTH_CHANGE_PASSWORD), {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const updateProfile = (data: ProfileUpdateData) =>
  apiFetch<{
    user: Record<string, unknown>;
    profileCompleteness: number;
    completedFields: string[];
    missingFields: string[];
  }>(buildApiUrl(API_AUTH_PROFILE), {
    method: 'PUT',
    body: JSON.stringify(prepareProfilePayload(data)),
  });

/** Omit blank fields so the API does not reject or overwrite with empty values. */
export function prepareProfilePayload(
  data: ProfileUpdateData,
): ProfileUpdateData {
  const payload: ProfileUpdateData = {};

  (Object.entries(data) as [keyof ProfileUpdateData, string | undefined][]).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        payload[key] = String(value).trim();
      }
    },
  );

  return payload;
}

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
  apiFetch<Record<string, unknown> | null>(
    buildApiUrl(API_RIDER_APPLICATIONS_ME),
  );

export const submitRiderApplication = (data: RiderApplicationData) =>
  apiFetch<{ message: string; application: Record<string, unknown> }>(
    buildApiUrl(API_RIDER_APPLICATIONS),
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
