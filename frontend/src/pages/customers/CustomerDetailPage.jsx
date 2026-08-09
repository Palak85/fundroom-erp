import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users2,
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  Plus,
  MessageSquare,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Follow-up Modal
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [followupForm, setFollowupForm] = useState({
    follow_up_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  const canAddFollowup = hasRole('Admin', 'Sales');

  const fetchCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/customers/${id}/followups`)
      ]);
      if (cRes.data.success) setCustomer(cRes.data.data);
      if (fRes.data.success) setFollowups(fRes.data.data);
    } catch (err) {
      addToast('Failed to load customer profile', 'error');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    setSubmittingFollowup(true);
    try {
      const res = await api.post(`/customers/${id}/followups`, followupForm);
      if (res.data.success) {
        addToast('Follow-up note logged successfully', 'success');
        setIsFollowupModalOpen(false);
        setFollowupForm({
          follow_up_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchCustomerData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add follow-up', 'error');
    } finally {
      setSubmittingFollowup(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading customer overview & timeline..." />;
  }

  if (!customer) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/customers"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Customer Profile
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              {customer.customer_name}
              <Badge variant={customer.status} size="sm" />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canAddFollowup && (
            <button
              onClick={() => setIsFollowupModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Log Follow-up</span>
            </button>
          )}

          {hasRole('Admin', 'Sales') && (
            <Link
              to={`/challans/new?customer_id=${customer.id}`}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Create Challan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Customer Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Business Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Account Overview</h3>

          <div className="space-y-3 text-sm">
            <div className="p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Business / Enterprise</span>
              <div className="font-bold text-white text-base mt-0.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                {customer.business_name || 'Individual Client'}
              </div>
              {customer.gst_number && (
                <div className="text-xs font-mono text-slate-400 mt-1">
                  GSTIN: <span className="text-slate-200 font-bold">{customer.gst_number}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Account Type</span>
                <Badge variant={customer.customer_type} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Status</span>
                <Badge variant={customer.status} size="sm" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Direct Contact</span>
              <div className="flex items-center gap-2 text-white font-semibold">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{customer.mobile}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-slate-300 text-xs truncate">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Billing & Shipping Address</span>
              <div className="flex items-start gap-2 text-slate-300 text-xs mt-1">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{customer.address || 'No address specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CRM Follow-up Timeline & Notes */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                CRM Follow-up Timeline
              </h3>
              <p className="text-xs text-slate-400">Communication history and scheduled interactions</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">
                Next: {customer.follow_up_date ? formatDate(customer.follow_up_date) : 'Not Scheduled'}
              </span>
            </div>
          </div>

          {/* Timeline List */}
          <div className="flex-1 space-y-4">
            {followups.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No follow-up interactions logged yet. Click "Log Follow-up" to record communication.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {followups.map((f) => (
                  <div key={f.id} className="relative group">
                    {/* Dot */}
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-900" />

                    <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 group-hover:border-slate-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">
                            Follow-up Date: {formatDate(f.follow_up_date)}
                          </span>
                          {f.created_by_user?.name && (
                            <span className="text-[11px] text-slate-400">
                              by <strong className="text-slate-300">{f.created_by_user.name}</strong>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDateTime(f.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {f.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Follow-up Note Modal */}
      <Modal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        title={`Log Follow-up for ${customer.customer_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddFollowup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Next Scheduled Follow-up Date *
            </label>
            <input
              type="date"
              required
              value={followupForm.follow_up_date}
              onChange={(e) => setFollowupForm({ ...followupForm, follow_up_date: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Follow-up Discussion Notes *
            </label>
            <textarea
              required
              rows={4}
              value={followupForm.notes}
              onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
              placeholder="e.g. Discussed pricing for copper cable spools. Customer requested delivery schedule."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFollowupModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFollowup}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40 transition-colors disabled:opacity-50"
            >
              {submittingFollowup ? 'Saving...' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
