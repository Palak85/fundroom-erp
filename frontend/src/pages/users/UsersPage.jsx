import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { ShieldCheck, Mail } from 'lucide-react';

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
        <div className="flex items-center gap-2 text-xs font-bold text-[#D30F38] uppercase tracking-wider mb-1">
          Administration & RBAC
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E222B] flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-[#D30F38]" />
          System User Directory & Roles
        </h2>
        <p className="text-sm text-[#77767D] font-medium mt-0.5">
          Restricted view of internal operators, roles, and credential assignments
        </p>
      </div>

      <div className="bg-white border border-[#DCE0EB] rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <LoadingSpinner text="Fetching operator accounts..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFD] border-b border-[#EEF0F6] text-[#77767D] text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Operator Name</th>
                  <th className="py-4 px-4">Email Address</th>
                  <th className="py-4 px-4">Assigned Role</th>
                  <th className="py-4 px-4">Permissions Scope</th>
                  <th className="py-4 px-6 text-right">Account Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F6] text-[#2D3139]">
                {users.map((u) => {
                  const scopeMap = {
                    Admin: 'Full System Superuser Access',
                    Sales: 'CRM, Follow-ups, & Sales Challans',
                    Warehouse: 'Catalog, Stock IN/OUT Adjustments',
                    Accounts: 'Read-only Financials & Invoices'
                  };

                  return (
                    <tr key={u.id} className="hover:bg-[#F9FAFD] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB] flex items-center justify-center font-extrabold text-[#5E72C6] text-sm shadow-sm">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#1E222B] text-sm">{u.name}</div>
                            <div className="text-[11px] font-mono text-[#77767D]">ID: {u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-bold text-[#1E222B]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#5E72C6]" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={u.role} size="md" />
                      </td>

                      <td className="py-4 px-4 text-xs text-[#77767D] font-medium">
                        {scopeMap[u.role] || 'Standard Access'}
                      </td>

                      <td className="py-4 px-6 text-right text-xs font-mono text-[#77767D]">
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
