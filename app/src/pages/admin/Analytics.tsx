import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Car,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  Leaf,
  Route,
  Award,
} from 'lucide-react';

import { adminApi } from '../../services/adminApi';

type Tab = 'daily' | 'monthly' | 'active' | 'karma';

interface ReportData {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  totalDistance: number;
  totalCo2Saved: number;
  totalPeopleImpacted: number;
  newUsers?: number;
  date?: string;
  month?: string;
}

interface ActiveUser {
  id: number;
  fullname: string;
  email: string;
  role: string;
  karmaPoints: number;
  creditScore: number;
  totalRides: number;
}

interface KarmaStats {
  topKarmaUsers: ActiveUser[];
  totalKarmaPoints: number;
  totalCreditScore: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <Icon className="text-gray-400" size={28} />
    </div>
  </div>
);

const AdminAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [loading, setLoading] = useState(true);
  const [dailyDate, setDailyDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [period, setPeriod] = useState('month');
  const [report, setReport] = useState<ReportData | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [karmaStats, setKarmaStats] = useState<KarmaStats | null>(null);

  useEffect(() => {
    loadTabData();
  }, [activeTab, dailyDate, monthDate, period]);

  const loadTabData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'daily') {
        const data = await adminApi.getDailyReports(dailyDate);
        setReport(data);
      } else if (activeTab === 'monthly') {
        const data = await adminApi.getMonthlyReports(`${monthDate}-01`);
        setReport(data);
      } else if (activeTab === 'active') {
        const data = await adminApi.getMostActiveUsers({ limit: 10, period });
        setActiveUsers(Array.isArray(data) ? data : []);
      } else if (activeTab === 'karma') {
        const data = await adminApi.getKarmaStats();
        setKarmaStats(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'active', label: 'Active Users' },
    { id: 'karma', label: 'Karma' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Reports and platform insights</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-2 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-teal-50 text-teal-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'daily' || activeTab === 'monthly') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'daily' ? (
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          ) : (
            <input
              type="month"
              value={monthDate}
              onChange={(e) => setMonthDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      ) : (
        <>
          {(activeTab === 'daily' || activeTab === 'monthly') && report && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Rides" value={report.totalRides} icon={Car} color="border-teal-500" />
                <StatCard title="Completed" value={report.completedRides} icon={CheckCircle} color="border-green-500" />
                <StatCard title="Active" value={report.activeRides} icon={Activity} color="border-blue-500" />
                <StatCard title="Cancelled" value={report.cancelledRides} icon={XCircle} color="border-red-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Distance (km)"
                  value={report.totalDistance.toFixed(1)}
                  icon={Route}
                  color="border-indigo-500"
                />
                <StatCard
                  title="CO₂ Saved (kg)"
                  value={report.totalCo2Saved.toFixed(1)}
                  icon={Leaf}
                  color="border-emerald-500"
                />
                <StatCard
                  title="People Impacted"
                  value={report.totalPeopleImpacted}
                  icon={Users}
                  color="border-purple-500"
                />
              </div>
              {activeTab === 'monthly' && report.newUsers !== undefined && (
                <StatCard
                  title="New Users"
                  value={report.newUsers}
                  icon={Users}
                  color="border-pink-500"
                />
              )}
            </>
          )}

          {activeTab === 'active' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rides</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karma</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{user.fullname}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.role}</td>
                        <td className="px-6 py-4 text-gray-700">{user.totalRides}</td>
                        <td className="px-6 py-4 text-gray-700">{user.karmaPoints}</td>
                        <td className="px-6 py-4 text-gray-700">{user.creditScore}</td>
                      </tr>
                    ))}
                    {activeUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No active users found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'karma' && karmaStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  title="Total Karma Points"
                  value={karmaStats.totalKarmaPoints}
                  icon={Award}
                  color="border-amber-500"
                />
                <StatCard
                  title="Total Credit Score"
                  value={karmaStats.totalCreditScore}
                  icon={Award}
                  color="border-teal-500"
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Top Karma Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karma</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {karmaStats.topKarmaUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{user.fullname}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{user.role}</td>
                          <td className="px-6 py-4 text-gray-700">{user.karmaPoints}</td>
                          <td className="px-6 py-4 text-gray-700">{user.creditScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
