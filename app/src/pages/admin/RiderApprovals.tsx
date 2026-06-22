import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

import { adminApi } from '../../services/adminApi';
import { RIDER_APPROVAL_STATUS } from '../../constants/enums';

interface RiderApp {
  id: number;
  drivingLicenseNumber: string;
  drivingLicenseImageUrl: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleRegistrationUrl: string;
  status: string;
  rejectionReason?: string;
  user: {
    id: number;
    fullname: string;
    email: string;
    employeeId?: string;
    department?: string;
  };
}

const AdminRiderApprovals: React.FC = () => {
  const [applications, setApplications] = useState<RiderApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(RIDER_APPROVAL_STATUS.PENDING_RIDER_APPROVAL);
  const [selected, setSelected] = useState<RiderApp | null>(null);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getRiderApplications({ status: statusFilter });
      setApplications(data.applications as unknown as RiderApp[]);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this rider application?')) return;
    try {
      await adminApi.approveRiderApplication(id);
      toast.success('Rider approved');
      loadApplications();
      setSelected(null);
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await adminApi.rejectRiderApplication(id, reason);
      toast.success('Application rejected');
      loadApplications();
      setSelected(null);
    } catch {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rider Approval Queue</h1>
        <p className="text-gray-600 mt-1">Review and approve rider applications</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value={RIDER_APPROVAL_STATUS.PENDING_RIDER_APPROVAL}>Pending</option>
          <option value={RIDER_APPROVAL_STATUS.APPROVED_RIDER}>Approved</option>
          <option value={RIDER_APPROVAL_STATUS.REJECTED_RIDER}>Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{app.user.fullname}</p>
                    <p className="text-sm text-gray-500">{app.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{app.drivingLicenseNumber}</td>
                  <td className="px-4 py-3 text-sm">
                    {app.vehicleNumber} — {app.vehicleType} {app.vehicleModel}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.status === RIDER_APPROVAL_STATUS.APPROVED_RIDER
                        ? 'bg-green-100 text-green-700'
                        : app.status === RIDER_APPROVAL_STATUS.REJECTED_RIDER
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelected(app)} className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                        <Eye size={16} />
                      </button>
                      {app.status === RIDER_APPROVAL_STATUS.PENDING_RIDER_APPROVAL && (
                        <>
                          <button onClick={() => handleApprove(app.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleReject(app.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">Application details</h2>
            <div className="space-y-3 text-sm">
              <p><strong>Applicant:</strong> {selected.user.fullname} ({selected.user.email})</p>
              <p><strong>License:</strong> {selected.drivingLicenseNumber}</p>
              <p><strong>Vehicle:</strong> {selected.vehicleNumber} — {selected.vehicleColor} {selected.vehicleType} {selected.vehicleModel}</p>
              {selected.rejectionReason && <p><strong>Rejection reason:</strong> {selected.rejectionReason}</p>}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <a href={selected.drivingLicenseImageUrl} target="_blank" rel="noreferrer" className="text-teal-600 underline">View license</a>
                <a href={selected.vehicleRegistrationUrl} target="_blank" rel="noreferrer" className="text-teal-600 underline">View registration</a>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="mt-6 px-4 py-2 border rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiderApprovals;
