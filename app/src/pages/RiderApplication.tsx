import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import {
  getMyRiderApplication,
  submitRiderApplication,
  uploadFile,
  getOnboardingStatus,
  type OnboardingStatus,
} from '../services/onboardingApi';
import { RIDER_APPROVAL_STATUS } from '../constants/enums';
import { ROUTE_HOME } from '../constants/routes';

const RiderApplication: React.FC = () => {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [application, setApplication] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    drivingLicenseNumber: '',
    drivingLicenseImageUrl: '',
    vehicleNumber: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleRegistrationUrl: '',
  });

  useEffect(() => {
    Promise.all([getOnboardingStatus(), getMyRiderApplication()])
      .then(([onboarding, app]) => {
        setStatus(onboarding);
        setApplication(app);
      })
      .catch(() => toast.error('Failed to load application status'))
      .finally(() => setLoading(false));
  }, []);

  const handleDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'drivingLicenseImageUrl' | 'vehicleRegistrationUrl',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      setForm((prev) => ({ ...prev, [field]: url }));
      toast.success('Document uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const result = await submitRiderApplication(form);
      setApplication(result.application);
      toast.success('Application submitted for review');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (status?.isApprovedRider) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-green-800">You are an approved rider</h1>
          <p className="text-green-700 mt-2">You can post rides from the home page.</p>
          <Link to={ROUTE_HOME} className="inline-block mt-4 text-teal-600 font-medium">
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  const appStatus = application?.status as string | undefined;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900">Become a rider</h1>
      <p className="text-gray-600 mt-2">
        Submit your driving license and vehicle documents for admin approval.
      </p>

      {appStatus === RIDER_APPROVAL_STATUS.PENDING_RIDER_APPROVAL && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          Your application is pending admin approval.
        </div>
      )}

      {appStatus === RIDER_APPROVAL_STATUS.REJECTED_RIDER && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Application rejected: {String(application?.rejectionReason || 'No reason provided')}
          <p className="mt-2 text-sm">You may update and resubmit below.</p>
        </div>
      )}

      {appStatus !== RIDER_APPROVAL_STATUS.PENDING_RIDER_APPROVAL && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white rounded-xl shadow-sm p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driving license number</label>
            <input
              value={form.drivingLicenseNumber}
              onChange={(e) => setForm({ ...form, drivingLicenseNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driving license image</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocUpload(e, 'drivingLicenseImageUrl')} required={!form.drivingLicenseImageUrl} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle number</label>
              <input
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle type</label>
              <input
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                value={form.vehicleModel}
                onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                value={form.vehicleColor}
                onChange={(e) => setForm({ ...form, vehicleColor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle registration document</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleDocUpload(e, 'vehicleRegistrationUrl')} required={!form.vehicleRegistrationUrl} />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </form>
      )}
    </div>
  );
};

export default RiderApplication;
