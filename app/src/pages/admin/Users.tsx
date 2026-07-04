import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '../../services/adminApi';
import {
  Search,
  Ban,
  UserCheck,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface User {
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

interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data: UsersResponse = await adminApi.getUsers({
        page,
        limit: 10,
        role: roleFilter || undefined,
        search: search || undefined,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (user: User) => {
    const reason = prompt('Enter reason for suspension:');
    if (!reason) return;

    try {
      await adminApi.suspendUser(user.id, reason);
      toast.success('User suspended successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleActivate = async (user: User) => {
    try {
      await adminApi.activateUser(user.id);
      toast.success('User activated successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      toast.error('Failed to activate user');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.fullname}?`)) return;

    try {
      await adminApi.deleteUser(user.id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Roles</option>
            <option value="rider">Rider</option>
            <option value="passenger">Passenger</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
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
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Karma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.fullname}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.karmaPoints}</td>
                    <td className="px-6 py-4 text-gray-700">{user.creditScore}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {user.address?.includes('[SUSPENDED') ? (
                          <button
                            onClick={() => handleActivate(user)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activate User"
                          >
                            <UserCheck size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(user)}
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Suspend User"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
              {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{selectedUser.fullname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Karma Points</p>
                  <p className="font-medium text-gray-900">{selectedUser.karmaPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Credit Score</p>
                  <p className="font-medium text-gray-900">{selectedUser.creditScore}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
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

export default AdminUsers;