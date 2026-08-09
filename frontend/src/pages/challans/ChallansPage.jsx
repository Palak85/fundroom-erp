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
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
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
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Sales & Delivery
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
            Sales Delivery Challans
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage dispatch vouchers, draft orders, and confirmed inventory deductions
          </p>
        </div>

        {canCreate && (
          <Link
            to="/challans/new"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Challan</span>
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by challan number, customer..."
        />

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => { setStatus(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              status === ''
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => { setStatus('DRAFT'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              status === 'DRAFT'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Draft</span>
          </button>
          <button
            onClick={() => { setStatus('CONFIRMED'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              status === 'CONFIRMED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </button>
          <button
            onClick={() => { setStatus('CANCELLED'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              status === 'CANCELLED'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </button>
        </div>
      </div>

      {/* Challan Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
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
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl"
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
              <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Challan Number</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Total Qty</th>
                  <th className="py-3.5 px-4">Total Value</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="font-mono font-bold text-emerald-400 hover:underline text-base"
                      >
                        {ch.challan_number}
                      </Link>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">
                        {ch.customer_name}
                      </div>
                      {ch.business_name && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{ch.business_name}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-white">
                      {ch.total_quantity} <span className="text-xs text-slate-400 font-normal">items</span>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-white text-base">
                      {formatCurrency(ch.total_amount)}
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={ch.status} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-slate-400">
                      {formatDateTime(ch.created_at)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Voucher</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  );
};
