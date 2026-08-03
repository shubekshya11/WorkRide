import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  Building2,
} from 'lucide-react';

import { useAdminAuth } from '../hooks/useAdminAuth';

import {
  ROUTE_ADMIN_DASHBOARD,
  ROUTE_ADMIN_EMPLOYEES,
  ROUTE_ADMIN_RIDES,
  ROUTE_ADMIN_ANALYTICS,
  ROUTE_ADMIN_LOGS,
  ROUTE_ADMIN_SETTINGS,
  ROUTE_ADMIN_RIDER_APPROVALS,
  ROUTE_ADMIN_LOGIN,
  ROUTE_ADMIN_USERS,
} from '../constants/routes';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: ROUTE_ADMIN_DASHBOARD, icon: LayoutDashboard },
    { name: 'Employees', href: ROUTE_ADMIN_EMPLOYEES, icon: Building2 },
    { name: 'Rider Approvals', href: ROUTE_ADMIN_RIDER_APPROVALS, icon: UserCheck },
    { name: 'Users', href: ROUTE_ADMIN_USERS, icon: Users },
    { name: 'Rides', href: ROUTE_ADMIN_RIDES, icon: Car },
    { name: 'Analytics', href: ROUTE_ADMIN_ANALYTICS, icon: TrendingUp },
    { name: 'Logs', href: ROUTE_ADMIN_LOGS, icon: FileText },
    { name: 'Settings', href: ROUTE_ADMIN_SETTINGS, icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTE_ADMIN_LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-teal-600">Admin Panel</h1>
            <p className="text-sm text-gray-500">Workride Management</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
