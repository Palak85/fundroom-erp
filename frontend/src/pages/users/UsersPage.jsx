import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { ShieldCheck, Mail, UserCheck } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load user directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
          Administration & RBAC
        </div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-rose-400" />
          System User Directory & Roles
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Restricted view of internal operators, roles, and credential assignments
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Fetching operator accounts..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Operator Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Permissions Scope</th>
                  <th className="py-3.5 px-6 text-right">Account Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => {
                  const scopeMap = {
                    Admin: 'Full System Superuser Access',
                    Sales: 'CRM, Follow-ups, & Sales Challans',
                    Warehouse: 'Catalog, Stock IN/OUT Adjustments',
                    Accounts: 'Read-only Financials & Invoices'
                  };

                  return (
                    <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{u.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">ID: {u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={u.role} size="md" />
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-400">
                        {scopeMap[u.role] || 'Standard Access'}
                      </td>

                      <td className="py-4 px-6 text-right text-xs font-mono text-slate-400">
                        {formatDateTime(u.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
