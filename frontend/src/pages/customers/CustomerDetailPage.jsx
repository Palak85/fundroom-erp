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
  FileCheck2
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
            className="p-2.5 rounded-2xl bg-white border border-[#DCE0EB] text-[#2D3139] hover:bg-[#EEF0F6] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5E72C6] uppercase tracking-wider">
              Customer Profile
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E222B] flex items-center gap-3">
              {customer.customer_name}
              <Badge variant={customer.status} size="sm" />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canAddFollowup && (
            <button
              onClick={() => setIsFollowupModalOpen(true)}
              className="btn-secondary"
            >
              <Calendar className="w-4 h-4 text-[#C47D0B]" />
              <span>Log Follow-up</span>
            </button>
          )}

          {hasRole('Admin', 'Sales') && (
            <Link
              to={`/challans/new?customer_id=${customer.id}`}
              className="btn-primary"
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
        <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-xs font-bold text-[#77767D] uppercase tracking-wider">Account Overview</h3>

          <div className="space-y-3 text-sm">
            <div className="p-4 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB]">
              <span className="text-xs text-[#77767D] font-bold">Business / Enterprise</span>
              <div className="font-extrabold text-[#1E222B] text-base mt-0.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5E72C6]" />
                {customer.business_name || 'Individual Client'}
              </div>
              {customer.gst_number && (
                <div className="text-xs font-mono text-[#77767D] mt-1">
                  GSTIN: <span className="text-[#1E222B] font-bold">{customer.gst_number}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#77767D] font-semibold">Account Type</span>
                <Badge variant={customer.customer_type} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#77767D] font-semibold">Status</span>
                <Badge variant={customer.status} size="sm" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB] space-y-2">
              <span className="text-xs text-[#77767D] font-bold">Direct Contact</span>
              <div className="flex items-center gap-2 text-[#1E222B] font-extrabold">
                <Phone className="w-4 h-4 text-[#5E72C6]" />
                <span>{customer.mobile}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-[#77767D] text-xs font-semibold truncate">
                  <Mail className="w-4 h-4 text-[#5E72C6]" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB]">
              <span className="text-xs text-[#77767D] font-bold">Billing & Shipping Address</span>
              <div className="flex items-start gap-2 text-[#2D3139] text-xs mt-1 font-medium">
                <MapPin className="w-4 h-4 text-[#D30F38] flex-shrink-0 mt-0.5" />
                <span>{customer.address || 'No address specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CRM Follow-up Timeline & Notes */}
        <div className="lg:col-span-2 bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-[#1E222B] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#5E72C6]" />
                CRM Follow-up Timeline
              </h3>
              <p className="text-xs text-[#77767D] font-medium">Communication history and scheduled interactions</p>
            </div>

            <div className="flex items-center gap-2 bg-[#EEF0F6] px-3.5 py-2 rounded-xl border border-[#DCE0EB]">
              <Calendar className="w-4 h-4 text-[#C47D0B]" />
              <span className="text-xs font-bold text-[#1E222B]">
                Next: {customer.follow_up_date ? formatDate(customer.follow_up_date) : 'Not Scheduled'}
              </span>
            </div>
          </div>

          {/* Timeline List */}
          <div className="flex-1 space-y-4">
            {followups.length === 0 ? (
              <div className="py-12 text-center text-[#77767D] text-sm font-medium">
                No follow-up interactions logged yet. Click "Log Follow-up" to record communication.
              </div>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EEF0F6]">
                {followups.map((f) => (
                  <div key={f.id} className="relative group">
                    {/* Dot */}
                    <div className="absolute -left-6 top-2 w-3 h-3 rounded-full bg-[#5E72C6] ring-4 ring-white shadow-sm" />

                    <div className="p-4.5 rounded-2xl bg-[#F9FAFD] border border-[#EEF0F6] group-hover:border-[#DCE0EB] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#5E72C6]">
                            Follow-up Date: {formatDate(f.follow_up_date)}
                          </span>
                          {f.created_by_user?.name && (
                            <span className="text-[11px] text-[#77767D]">
                              by <strong className="text-[#1E222B]">{f.created_by_user.name}</strong>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#77767D]">
                          {formatDateTime(f.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-[#2D3139] leading-relaxed whitespace-pre-wrap font-medium">
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
            <label className="block text-xs font-bold text-[#49484D] uppercase mb-1.5">
              Next Scheduled Follow-up Date *
            </label>
            <input
              type="date"
              required
              value={followupForm.follow_up_date}
              onChange={(e) => setFollowupForm({ ...followupForm, follow_up_date: e.target.value })}
              className="ds-input font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#49484D] uppercase mb-1.5">
              Follow-up Discussion Notes *
            </label>
            <textarea
              required
              rows={4}
              value={followupForm.notes}
              onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
              placeholder="e.g. Discussed bulk discount pricing for drills. Client requested revised delivery quote."
              className="ds-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEF0F6]">
            <button
              type="button"
              onClick={() => setIsFollowupModalOpen(false)}
              className="btn-outlined"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFollowup}
              className="btn-primary"
            >
              {submittingFollowup ? 'Saving...' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
