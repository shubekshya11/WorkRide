import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAdminAuth } from '../../hooks/useAdminAuth';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.fullname}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome to the Admin Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You are logged in as an administrator. Use the navigation to access
            different admin functions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-teal-900 dark:text-teal-100 mb-2">
                Users
              </h3>
              <p className="text-sm text-teal-700 dark:text-teal-300 mb-4">
                Manage user accounts and permissions
              </p>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
              >
                Manage Users →
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Rides
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                View and manage ride activities
              </p>
              <button
                onClick={() => navigate('/admin/rides')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Manage Rides →
              </button>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
                Analytics
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                View system analytics and reports
              </p>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                View Analytics →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
