import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminApi } from '../../services/adminApi';
import {
  Users,
  Car,
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

import {
  ROUTE_ADMIN_USERS,
  ROUTE_ADMIN_RIDES,
  ROUTE_ADMIN_ANALYTICS,
} from '../../constants/routes';

interface DashboardStats {
  totalUsers: number;
  totalRiders: number;
  totalPassengers: number;
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('border', 'bg').replace('-500', '-100')}`}>
          <Icon size={24} className={color.replace('border-', 'text-').replace('-500', '-600')} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of system statistics and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="border-blue-500"
        />
        <StatCard
          title="Total Rides"
          value={stats.totalRides}
          icon={Car}
          color="border-teal-500"
        />
        <StatCard
          title="Active Rides"
          value={stats.activeRides}
          icon={Activity}
          color="border-green-500"
        />
        <StatCard
          title="Completed Rides"
          value={stats.completedRides}
          icon={CheckCircle}
          color="border-purple-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Riders"
          value={stats.totalRiders}
          icon={Users}
          color="border-indigo-500"
        />
        <StatCard
          title="Total Passengers"
          value={stats.totalPassengers}
          icon={Users}
          color="border-pink-500"
        />
        <StatCard
          title="Cancelled Rides"
          value={stats.cancelledRides}
          icon={XCircle}
          color="border-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={ROUTE_ADMIN_USERS}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <Users className="text-teal-600" />
            <span className="font-medium text-gray-700">Manage Users</span>
          </Link>
          <Link
            to={ROUTE_ADMIN_RIDES}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <Car className="text-teal-600" />
            <span className="font-medium text-gray-700">Manage Rides</span>
          </Link>
          <Link
            to={ROUTE_ADMIN_ANALYTICS}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <TrendingUp className="text-teal-600" />
            <span className="font-medium text-gray-700">View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;