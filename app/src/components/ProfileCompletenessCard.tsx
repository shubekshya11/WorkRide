import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { PROFILE_FIELD_LABELS, USER_ROLE } from '../constants/enums';
import {
  ROUTE_ONBOARDING_CHANGE_PASSWORD,
  ROUTE_ONBOARDING_PROFILE,
  ROUTE_RIDER_APPLICATION,
} from '../constants/routes';
import {
  getOnboardingStatus,
  updateProfile,
  uploadFile,
  type OnboardingStatus,
  type ProfileUpdateData,
} from '../services/onboardingApi';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../utils/authApi';

const ProfileCompletenessCard: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileUpdateData>({});

  const isAdmin = user?.role?.toLowerCase() === USER_ROLE.ADMIN;

  useEffect(() => {
    if (!user || isAdmin) {
      setLoading(false);
      return;
    }

    getOnboardingStatus()
      .then(setStatus)
      .catch(() => toast.error('Failed to load profile status'))
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  const loadUserData = async () => {
    try {
      const userResponse = await getCurrentUser();
      const userData = userResponse.user as typeof userResponse.user & {
        employeeId?: string;
        department?: string;
        emergencyContact?: string;
        dateOfBirth?: string;
      };

      setForm({
        fullname: userData.fullname || '',
        employeeId: userData.employeeId || '',
        department: userData.department || '',
        phone: userData.phone || '',
        address: userData.address || '',
        emergencyContact: userData.emergencyContact || '',
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().slice(0, 10)
          : '',
        profilePicture: userData.profilePicture || '',
      });
    } catch {
      toast.error('Failed to load user data');
    }
  };

  const handleEdit = () => {
    loadUserData();
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      setForm((prev) => ({ ...prev, profilePicture: url }));
      toast.success('Photo uploaded');
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await updateProfile(form);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              profileCompleteness: result.profileCompleteness,
              completedFields: result.completedFields,
              missingFields: result.missingFields,
            }
          : prev,
      );
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!user || isAdmin || loading || !status) {
    return null;
  }

  const isComplete = status.profileCompleteness >= 100;

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm dark:border-teal-700 dark:bg-dark">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-teal-950 dark:text-teal-100">
            Profile completeness
          </h2>
          <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
            {isComplete
              ? 'Your employee profile is complete.'
              : 'Complete your profile to post or request rides.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {status.profileCompleteness}%
          </span>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="rounded-full border border-teal-300 px-3 py-1 text-sm font-medium text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-teal-100 dark:bg-teal-900">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${status.profileCompleteness}%` }}
        />
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
              Profile photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-sm text-teal-700 dark:text-teal-300"
            />
            {form.profilePicture && (
              <img
                src={form.profilePicture}
                alt="Profile"
                className="mt-2 h-16 w-16 rounded-full object-cover"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
              Full name
            </label>
            <input
              value={form.fullname || ''}
              onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm dark:border-teal-600 dark:bg-dark dark:text-teal-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
                Employee ID
              </label>
              <input
                value={form.employeeId || ''}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm dark:border-teal-600 dark:bg-dark dark:text-teal-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
                Department
              </label>
              <input
                value={form.department || ''}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm dark:border-teal-600 dark:bg-dark dark:text-teal-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
                Phone
              </label>
              <input
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm dark:border-teal-600 dark:bg-dark dark:text-teal-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
                Date of birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth || ''}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm dark:border-teal-600 dark:bg-dark dark:text-teal-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
              Address
            </label>
            <input
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm dark:border-teal-600 dark:bg-dark dark:text-teal-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-teal-800 dark:text-teal-200 mb-1">
              Emergency contact
            </label>
            <input
              value={form.emergencyContact || ''}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm dark:border-teal-600 dark:bg-dark dark:text-teal-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {status.missingFields.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Missing fields
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {status.missingFields.map((field) => (
                  <li
                    key={field}
                    className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    {PROFILE_FIELD_LABELS[field] || field}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!isComplete && (
              <Link
                to={ROUTE_ONBOARDING_PROFILE}
                className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Complete profile
              </Link>
            )}
            {status.mustChangePassword && (
              <Link
                to={ROUTE_ONBOARDING_CHANGE_PASSWORD}
                className="rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950"
              >
                Change password
              </Link>
            )}
            {!status.isApprovedRider && status.riderApplicationStatus !== 'PENDING_RIDER_APPROVAL' && (
              <Link
                to={ROUTE_RIDER_APPLICATION}
                className="rounded-full border border-teal-300 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950"
              >
                Apply to become a rider
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileCompletenessCard;
