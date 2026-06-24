import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  getOnboardingStatus,
  updateProfile,
  uploadFile,
  type OnboardingStatus,
} from '../../services/onboardingApi';
import { PROFILE_FIELD_LABELS } from '../../constants/enums';
import { ROUTE_HOME } from '../../constants/routes';
import { getCurrentUser } from '../../utils/authApi';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullname: '',
    employeeId: '',
    department: '',
    phone: '',
    address: '',
    emergencyContact: '',
    dateOfBirth: '',
    profilePicture: '',
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const [data, userResponse] = await Promise.all([
        getOnboardingStatus(),
        getCurrentUser(),
      ]);
      setStatus(data);

      const user = userResponse.user as typeof userResponse.user & {
        employeeId?: string;
        department?: string;
        emergencyContact?: string;
        dateOfBirth?: string;
      };

      setForm({
        fullname: user.fullname || '',
        employeeId: user.employeeId || '',
        department: user.department || '',
        phone: user.phone || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
          : '',
        profilePicture: user.profilePicture || '',
      });
    } catch {
      toast.error('Failed to load profile status');
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      toast.success('Profile updated');

      if (result.profileCompleteness >= 100) {
        navigate(ROUTE_HOME);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900">Complete your profile</h1>
        <p className="text-gray-600 mt-2">
          Fill in all required employee details before using the app.
        </p>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Profile completeness</span>
            <span>{status?.profileCompleteness ?? 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all"
              style={{ width: `${status?.profileCompleteness ?? 0}%` }}
            />
          </div>
        </div>

        {status?.missingFields && status.missingFields.length > 0 && (
          <p className="text-sm text-amber-700 mt-3">
            Missing: {status.missingFields.map((f) => PROFILE_FIELD_LABELS[f] || f).join(', ')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile photo</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
            {form.profilePicture && (
              <img src={form.profilePicture} alt="Profile" className="mt-2 h-20 w-20 rounded-full object-cover" />
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              value={form.fullname}
              onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency contact</label>
            <input
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
            {(status?.profileCompleteness ?? 0) >= 100 && (
              <button
                type="button"
                onClick={() => navigate(ROUTE_HOME)}
                className="px-6 py-3 border border-gray-300 rounded-lg"
              >
                Continue to app
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
