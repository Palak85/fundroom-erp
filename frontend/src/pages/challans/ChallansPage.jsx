import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Plus,
  Eye,
  Building2,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const ChallansPage = () => {
  const { hasRole } = useAuth();

  const [challans, setChallans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const canCreate = hasRole('Admin', 'Sales');

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/challans', {
        params: {
          page,
          limit: 10,
          search,
          status
        }
      });
      if (res.data.success) {
        setChallans(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load challans:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#5E72C6] uppercase tracking-wider mb-1">
            Sales & Delivery
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E222B] flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-[#5E72C6]" />
            Sales Delivery Challans
          </h2>
          <p className="text-sm text-[#77767D] font-medium mt-0.5">
            Manage dispatch vouchers, draft orders, and confirmed inventory deductions
          </p>
        </div>

        {canCreate && (
          <Link
            to="/challans/new"
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Challan</span>
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[#DCE0EB] shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by challan number, customer..."
        />

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#EEF0F6] p-1.5 rounded-2xl border border-[#DCE0EB] w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => { setStatus(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              status === ''
                ? 'bg-white text-[#1E222B] shadow-sm'
                : 'text-[#77767D] hover:text-[#1E222B]'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => { setStatus('DRAFT'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              status === 'DRAFT'
                ? 'bg-white text-[#C47D0B] shadow-sm border border-[#FDE5BE]'
                : 'text-[#77767D] hover:text-[#C47D0B]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Draft</span>
          </button>
          <button
            onClick={() => { setStatus('CONFIRMED'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              status === 'CONFIRMED'
                ? 'bg-white text-[#5E72C6] shadow-sm border border-[#D5DEF7]'
                : 'text-[#77767D] hover:text-[#5E72C6]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </button>
          <button
            onClick={() => { setStatus('CANCELLED'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              status === 'CANCELLED'
                ? 'bg-white text-[#D30F38] shadow-sm border border-[#F9CCD4]'
                : 'text-[#77767D] hover:text-[#D30F38]'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </button>
        </div>
      </div>

      {/* Challan Table */}
      <div className="bg-white border border-[#DCE0EB] rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <LoadingSpinner text="Fetching delivery challans..." />
        ) : challans.length === 0 ? (
          <EmptyState
            title="No delivery challans found"
            description="Create your first draft or confirmed sales challan to initiate dispatches."
            action={
              canCreate ? (
                <Link
                  to="/challans/new"
                  className="mt-2 inline-flex items-center gap-2 btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Challan</span>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFD] border-b border-[#EEF0F6] text-[#77767D] text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Challan Number</th>
                  <th className="py-4 px-4">Customer Account</th>
                  <th className="py-4 px-4">Total Qty</th>
                  <th className="py-4 px-4">Total Value</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Date Created</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F6] text-[#2D3139]">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-[#F9FAFD] transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="font-mono font-extrabold text-[#5E72C6] hover:underline text-base"
                      >
                        {ch.challan_number}
                      </Link>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-[#1E222B] text-sm">
                        {ch.customer_name}
                      </div>
                      {ch.business_name && (
                        <div className="text-xs text-[#77767D] flex items-center gap-1 mt-0.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-[#5E72C6]" />
                          <span>{ch.business_name}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-[#1E222B]">
                      {ch.total_quantity} <span className="text-xs text-[#77767D] font-normal">items</span>
                    </td>

                    <td className="py-4 px-4 font-black text-[#1E222B] text-base">
                      {formatCurrency(ch.total_amount)}
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={ch.status} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-[#77767D]">
                      {formatDateTime(ch.created_at)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF0F6] hover:bg-[#E4E7F2] text-[#2D3139] hover:text-[#5E72C6] text-xs font-bold border border-[#DCE0EB] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#5E72C6]" />
                        <span>View Voucher</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-[#EEF0F6]">
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  );
};
