import React from 'react';
import { Settings, Award, Flag, Bell } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();

  const comingSoonSections = [
    {
      title: 'Karma Configuration',
      description: 'Manage karma point rewards, redemption rules, and thresholds.',
      icon: Award,
    },
    {
      title: 'Feature Flags',
      description: 'Enable or disable platform features without deploying code.',
      icon: Flag,
    },
    {
      title: 'Notifications',
      description: 'Configure email and push notification templates and triggers.',
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Platform configuration and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-teal-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Your Admin Account</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium text-gray-900">{user?.fullname || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium text-gray-900 capitalize">{user?.role || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <p className="font-medium text-gray-900">{user?.id ?? '—'}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comingSoonSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-sm p-6 border border-dashed border-gray-200"
            >
              <section.icon className="text-gray-400 mb-3" size={28} />
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{section.description}</p>
              <span className="inline-block mt-4 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
