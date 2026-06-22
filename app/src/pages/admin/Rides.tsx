import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../services/adminApi';
import {
  XCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Ride {
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

interface RidesResponse {
  rides: Ride[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const AdminRides: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    loadRides();
  }, [page, statusFilter, roleFilter]);

  const loadRides = async () => {
    try {
      setLoading(true);
      const data: RidesResponse = await adminApi.getRides({
        page,
        limit: 10,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      });
      setRides(data.rides);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (ride: Ride) => {
    const reason = prompt('Enter reason for cancellation (optional):');
    try {
      await adminApi.cancelRide(ride.id, reason || undefined);
      toast.success('Ride cancelled successfully');
      loadRides();
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      toast.error('Failed to cancel ride');
    }
  };

  const handleDelete = async (ride: Ride) => {
    if (!confirm(`Are you sure you want to delete this ride from ${ride.from} to ${ride.to}?`)) return;

    try {
      await adminApi.deleteRide(ride.id);
      toast.success('Ride deleted successfully');
      loadRides();
    } catch (error) {
      console.error('Failed to delete ride:', error);
      toast.error('Failed to delete ride');
    }
  };

  const handleViewDetails = (ride: Ride) => {
    setSelectedRide(ride);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ride Management</h1>
        <p className="text-gray-600 mt-1">Manage and monitor all rides in the system</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Types</option>
            <option value="rider">Rider Posted</option>
            <option value="passenger">Passenger Posted</option>
          </select>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passengers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{ride.from}</p>
                        <p className="text-sm text-gray-500">→ {ride.to}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                        {ride.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {ride.rider?.fullname || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {ride.passengers?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ride.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(ride)}
                          className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {ride.status !== 'CANCELLED' && ride.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCancel(ride)}
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Cancel Ride"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ride)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Ride"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} rides
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-medium">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ride Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Ride Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium text-gray-900">
                    {selectedRide.from} → {selectedRide.to}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedRide.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">{selectedRide.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="font-medium text-gray-900">
                    {selectedRide.distance ? `${selectedRide.distance.toFixed(2)} km` : 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedRide.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rider</p>
                  <p className="font-medium text-gray-900">
                    {selectedRide.rider?.fullname || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passengers</p>
                  <p className="font-medium text-gray-900">
                    {selectedRide.passengers?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRide(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRides;