import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus, Search } from 'lucide-react';

import { adminApi } from '../../services/adminApi';

interface Employee {
  id: number;
  fullname: string;
  email: string;
  role: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  mustChangePassword: boolean;
  profileCompleteness: number;
  riderApplication?: { status: string; rejectionReason?: string };
}

const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    temporaryPassword: '',
    employeeId: '',
    department: '',
    phone: '',
  });

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getEmployees({ search: search || undefined });
      setEmployees(data.employees as unknown as Employee[]);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await adminApi.createEmployee({
        fullname: form.fullname,
        email: form.email,
        temporaryPassword: form.temporaryPassword,
        employeeId: form.employeeId || undefined,
        department: form.department || undefined,
        phone: form.phone || undefined,
      });
      toast.success(`Employee created. Temp password: ${result.temporaryPassword}`);
      setShowForm(false);
      setForm({ fullname: '', email: '', temporaryPassword: '', employeeId: '', department: '', phone: '' });
      loadEmployees();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Create accounts and track onboarding progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <UserPlus size={18} />
          Add employee
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Full name" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} className="px-4 py-2 border rounded-lg" required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2 border rounded-lg" required />
          <input placeholder="Temporary password" value={form.temporaryPassword} onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })} className="px-4 py-2 border rounded-lg" required />
          <input placeholder="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="px-4 py-2 border rounded-lg" />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="px-4 py-2 border rounded-lg" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-4 py-2 border rounded-lg" />
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg">Create & send invite</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {loading ? (
          <div className="flex justify-center h-32 items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept / ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{emp.fullname}</p>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p>{emp.department || '—'}</p>
                      <p className="text-gray-500">{emp.employeeId || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${emp.profileCompleteness}%` }} />
                        </div>
                        <span className="text-sm">{emp.profileCompleteness}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {emp.riderApplication?.status || emp.role === 'RIDER' ? emp.riderApplication?.status || 'APPROVED_RIDER' : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {emp.mustChangePassword ? (
                        <span className="text-amber-600">Must change</span>
                      ) : (
                        <span className="text-green-600">Set</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmployees;
