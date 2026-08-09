import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  FileSpreadsheet,
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  MapPin
} from 'lucide-react';

export const ChallanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const canManage = hasRole('Admin', 'Sales');

  const fetchChallan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err) {
      addToast('Failed to load delivery challan', 'error');
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchChallan();
  }, [fetchChallan]);

  const handleConfirmChallan = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/challans/${id}/confirm`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setConfirmDialog(false);
        fetchChallan();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Challan confirmation failed due to stock issues', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/challans/${id}/cancel`);
      if (res.data.success) {
        addToast('Challan cancelled successfully', 'success');
        setCancelDialog(false);
        fetchChallan();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel challan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving delivery voucher..." />;
  }

  if (!challan) return null;

  const customer = challan.customer || {};
  const isDraft = challan.status === 'DRAFT';
  const isConfirmed = challan.status === 'CONFIRMED';
  const isCancelled = challan.status === 'CANCELLED';

  return (
    <div className="space-y-6 pb-16">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/challans"
            className="p-2.5 rounded-2xl bg-white border border-[#DCE0EB] text-[#2D3139] hover:bg-[#EEF0F6] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5E72C6] uppercase tracking-wider">
              Sales Dispatch Voucher
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E222B] flex items-center gap-3">
              {challan.challan_number}
              <Badge variant={challan.status} size="sm" />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn-outlined"
          >
            <Printer className="w-4 h-4 text-[#5E72C6]" />
            <span>Print / Save PDF</span>
          </button>

          {canManage && isDraft && (
            <button
              onClick={() => setConfirmDialog(true)}
              className="btn-primary"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Deduct Stock</span>
            </button>
          )}

          {canManage && !isCancelled && (
            <button
              onClick={() => setCancelDialog(true)}
              className="px-4 py-2.5 bg-[#FDF2F4] hover:bg-[#F9CCD4] text-[#D30F38] border border-[#F9CCD4] font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Voucher</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Challan Document Card */}
      <div className="printable-card bg-white border border-[#DCE0EB] rounded-3xl p-8 sm:p-10 shadow-card space-y-8">
        {/* Document Company Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#EEF0F6]">
          <div>
            <div className="flex items-center gap-2.5 text-[#5E72C6] font-black text-xl tracking-tight">
              <span className="p-2 rounded-2xl bg-[#5E72C6] text-white shadow-btn">
                <FileSpreadsheet className="w-6 h-6" />
              </span>
              FundRoom Wholesale Enterprises
            </div>
            <p className="text-xs text-[#77767D] font-medium mt-1.5 max-w-sm">
              Central Distribution Hub, Industrial Zone Phase 2, Bangalore, KA - 560058
            </p>
            <p className="text-xs text-[#77767D] font-mono mt-0.5">
              GSTIN: <strong className="text-[#1E222B]">29AAAAF1234F1Z8</strong> • CIN: U74999KA2026PTC012345
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77767D]">
              Delivery Challan
            </span>
            <div className="text-2xl font-black font-mono text-[#5E72C6]">
              {challan.challan_number}
            </div>
            <div className="text-xs text-[#49484D]">
              Date: <strong className="font-bold text-[#1E222B]">{formatDate(challan.created_at)}</strong>
            </div>
            <div className="mt-2">
              <Badge variant={challan.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Billed / Shipped To Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB]">
          <div>
            <span className="text-xs font-bold text-[#77767D] uppercase tracking-wider">
              Consignee / Customer Details:
            </span>
            <div className="mt-2 font-extrabold text-[#1E222B] text-base">
              {customer.customer_name || challan.customer_name}
            </div>
            {customer.business_name && (
              <div className="text-sm font-bold text-[#49484D] flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#5E72C6]" />
                <span>{customer.business_name}</span>
              </div>
            )}
            {customer.gst_number && (
              <div className="text-xs font-mono text-[#77767D] mt-1">
                GSTIN: <span className="text-[#1E222B] font-bold">{customer.gst_number}</span>
              </div>
            )}
            <div className="text-xs text-[#77767D] mt-1 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#5E72C6]" />
              <span>{customer.mobile}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-[#77767D] uppercase tracking-wider">
              Shipping & Delivery Destination:
            </span>
            <div className="mt-2 text-xs text-[#2D3139] flex items-start gap-2 font-medium">
              <MapPin className="w-4 h-4 text-[#D30F38] flex-shrink-0 mt-0.5" />
              <span>{customer.address || 'Address registered on master file'}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DCE0EB] text-xs text-[#77767D] space-y-1">
              <div>Created By: <strong className="text-[#1E222B]">{challan.created_by_name || 'Sales Staff'}</strong></div>
              <div>Dispatch Status: <strong className="text-[#5E72C6] font-bold">{challan.status}</strong></div>
            </div>
          </div>
        </div>

        {/* Product Snapshot Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FAFD] border-b border-[#EEF0F6] text-[#77767D] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Item Description (Snapshot)</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4 text-right">Unit Price</th>
                <th className="py-3.5 px-4 text-center">Dispatched Qty</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F6] text-[#2D3139]">
              {(challan.items || []).map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-4 px-4 text-center text-xs font-mono text-[#77767D]">
                    {idx + 1}
                  </td>
                  <td className="py-4 px-4 font-bold text-[#1E222B]">
                    {item.product_name}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-[#5E72C6]">
                    {item.sku}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-[#49484D]">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold text-[#1E222B] text-base">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-[#1E222B] text-base">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-[#EEF0F6]">
          <div className="text-xs text-[#77767D] max-w-sm font-medium">
            <span className="font-bold text-[#1E222B]">Terms & Dispatch Notice:</span>
            <p className="mt-1">
              Goods received in good condition. This is an authentic computerized sales delivery challan. Historical product pricing and descriptions are preserved as immutable snapshots.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB] space-y-2 min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-[#49484D] font-bold">
              <span>Total Quantity:</span>
              <span className="font-extrabold text-[#1E222B] text-sm">{challan.total_quantity} units</span>
            </div>
            <div className="pt-2 border-t border-[#DCE0EB] flex items-baseline justify-between">
              <span className="text-sm font-bold text-[#1E222B]">Grand Total:</span>
              <span className="text-2xl font-black text-[#5E72C6]">
                {formatCurrency(challan.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatory Box */}
        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-[#EEF0F6] text-xs text-[#77767D] text-center font-medium">
          <div className="border-t border-dashed border-[#DCE0EB] pt-3">
            Receiver's Signature & Stamp
          </div>
          <div className="border-t border-dashed border-[#DCE0EB] pt-3">
            Authorized Signatory for FundRoom Wholesale
          </div>
        </div>
      </div>

      {/* Confirm Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleConfirmChallan}
        loading={actionLoading}
        title="Confirm Sales Delivery Challan"
        message={`Confirming challan ${challan.challan_number} will atomically verify inventory availability, deduct ${challan.total_quantity} units from warehouse stock, and log OUT movements. Are you sure?`}
        confirmText="Confirm & Deduct Inventory"
        type="info"
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelDialog}
        onClose={() => setCancelDialog(false)}
        onConfirm={handleCancelChallan}
        loading={actionLoading}
        title="Cancel Delivery Challan"
        message={`Are you sure you want to mark challan ${challan.challan_number} as CANCELLED? If already confirmed, products will be restocked.`}
        confirmText="Cancel Challan"
        type="danger"
      />
    </div>
  );
};
