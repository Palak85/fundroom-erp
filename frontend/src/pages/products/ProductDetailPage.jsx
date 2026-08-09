import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Package,
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  MapPin,
  History
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Modal
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockType, setStockType] = useState('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [submittingStock, setSubmittingStock] = useState(false);

  const canAdjustStock = hasRole('Admin', 'Warehouse');

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/stock-movements`)
      ]);
      if (pRes.data.success) setProduct(pRes.data.data);
      if (mRes.data.success) setMovements(mRes.data.data);
    } catch (err) {
      addToast('Failed to load product details', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleOpenStockModal = (type) => {
    setStockType(type);
    setQuantity(1);
    setReason(type === 'IN' ? 'Warehouse Stock Intake' : 'Manual Dispatch / Correction');
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setSubmittingStock(true);
    try {
      const endpoint = stockType === 'IN' ? 'stock-in' : 'stock-out';
      const res = await api.post(`/products/${id}/${endpoint}`, {
        quantity,
        reason
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setIsStockModalOpen(false);
        fetchProductData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Stock adjustment failed', 'error');
    } finally {
      setSubmittingStock(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading product inventory metrics..." />;
  }

  if (!product) return null;

  const isLow = product.current_stock <= product.minimum_stock;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2.5 rounded-2xl bg-white border border-[#DCE0EB] text-[#2D3139] hover:bg-[#EEF0F6] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#5E72C6] uppercase tracking-wider">
              Product SKU Overview
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E222B] flex items-center gap-3">
              {product.product_name}
              <Badge variant={isLow ? 'low' : 'normal'} size="sm">
                {isLow ? 'Low Stock Warning' : 'In Stock'}
              </Badge>
            </h2>
          </div>
        </div>

        {canAdjustStock && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenStockModal('IN')}
              className="btn-primary"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Stock IN</span>
            </button>

            <button
              onClick={() => handleOpenStockModal('OUT')}
              className="btn-secondary"
            >
              <ArrowUpCircle className="w-4 h-4 text-[#C47D0B]" />
              <span>Stock OUT</span>
            </button>
          </div>
        )}
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Details Card */}
        <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-xs font-bold text-[#77767D] uppercase tracking-wider">Specifications</h3>

          {product.image_url && (
            <div className="rounded-2xl overflow-hidden border border-[#DCE0EB] h-44 bg-[#EEF0F6] flex items-center justify-center">
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB] space-y-2.5 text-xs font-medium">
            <div className="flex items-center justify-between">
              <span className="text-[#77767D]">SKU Code</span>
              <span className="font-mono font-bold text-[#5E72C6]">{product.sku}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#77767D]">Category</span>
              <span className="text-[#1E222B] font-bold">{product.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#77767D]">Unit Price</span>
              <span className="text-base font-black text-[#1E222B]">{formatCurrency(product.unit_price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#77767D]">Warehouse Bin / Bay</span>
              <span className="text-[#1E222B] font-semibold">{product.warehouse_location || 'Unassigned'}</span>
            </div>
          </div>

          {/* Stock Health Box */}
          <div className={`p-5 rounded-2xl border ${isLow ? 'bg-[#FDF2F4] border-[#F9CCD4]' : 'bg-[#EEF2FC] border-[#D5DEF7]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#49484D]">Live Available Stock</span>
              <span className={`text-xl font-black ${isLow ? 'text-[#D30F38]' : 'text-[#5E72C6]'}`}>
                {product.current_stock} Units
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#77767D] font-medium">
              <span>Min Alert: {product.minimum_stock} units</span>
              <span>{isLow ? 'Replenish urgently' : 'Healthy inventory'}</span>
            </div>
          </div>
        </div>

        {/* Stock Movement Audit Log for this product */}
        <div className="lg:col-span-2 bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1E222B] flex items-center gap-2">
                <History className="w-5 h-5 text-[#5E72C6]" />
                Product Stock Movement History
              </h3>
              <p className="text-xs text-[#77767D] font-medium">Audit log of intake, adjustments, and challan deductions</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {movements.length === 0 ? (
              <div className="p-12 text-center text-[#77767D] text-sm font-medium">
                No stock transactions recorded for this product yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EEF0F6] text-[#77767D] font-bold uppercase">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Reason / Challan Reference</th>
                    <th className="pb-3">Handled By</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F6]">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F9FAFD] transition-colors">
                      <td className="py-3">
                        <Badge variant={m.movement_type} size="sm">
                          {m.movement_type}
                        </Badge>
                      </td>
                      <td className="py-3 font-extrabold text-[#1E222B] text-sm">
                        <span className={m.movement_type === 'IN' ? 'text-[#1E8A38]' : 'text-[#C47D0B]'}>
                          {m.movement_type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                        </span>
                      </td>
                      <td className="py-3 text-[#49484D] max-w-[220px] truncate font-medium">{m.reason}</td>
                      <td className="py-3 text-[#77767D]">{m.created_by_name || 'System'}</td>
                      <td className="py-3 text-[#77767D] font-mono">{formatDateTime(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`${stockType === 'IN' ? 'Stock IN (Restock)' : 'Stock OUT (Deduct)'}: ${product.product_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB] flex items-center justify-between text-xs font-bold">
            <span className="text-[#77767D]">Current Stock:</span>
            <span className="font-extrabold text-[#1E222B] text-sm">{product.current_stock} units</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#49484D] uppercase mb-1.5">
              Quantity to {stockType === 'IN' ? 'Add' : 'Remove'} *
            </label>
            <input
              type="number"
              min="1"
              max={stockType === 'OUT' ? product.current_stock : undefined}
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="ds-input font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#49484D] uppercase mb-1.5">
              Reason / Reference *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Factory Batch Receipt or Manual Adjustment"
              className="ds-input font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEF0F6]">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="btn-outlined"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStock}
              className={stockType === 'IN' ? 'btn-primary' : 'btn-secondary'}
            >
              {submittingStock ? 'Recording...' : `Confirm Stock ${stockType}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
