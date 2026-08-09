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
  Tag,
  AlertTriangle,
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
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Product SKU Overview
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
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
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Stock IN</span>
            </button>

            <button
              onClick={() => handleOpenStockModal('OUT')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Stock OUT</span>
            </button>
          </div>
        )}
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Specifications</h3>

          {product.image_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 h-44 bg-slate-950 flex items-center justify-center">
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SKU Code</span>
              <span className="font-mono font-bold text-emerald-400">{product.sku}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Category</span>
              <span className="text-slate-200 font-semibold">{product.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Unit Price</span>
              <span className="text-base font-extrabold text-white">{formatCurrency(product.unit_price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Warehouse Bin / Bay</span>
              <span className="text-slate-200 font-medium">{product.warehouse_location || 'Unassigned'}</span>
            </div>
          </div>

          {/* Stock Health Box */}
          <div className={`p-4 rounded-2xl border ${isLow ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">Live Available Stock</span>
              <span className={`text-xl font-black ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                {product.current_stock} Units
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Minimum Threshold Alert: {product.minimum_stock} units</span>
              <span>{isLow ? 'Replenish urgently' : 'Healthy inventory'}</span>
            </div>
          </div>
        </div>

        {/* Stock Movement Audit Log for this product */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Product Stock Movement History
              </h3>
              <p className="text-xs text-slate-400">Complete audit log of intake, adjustments, and challan deductions</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {movements.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No stock transactions recorded for this product yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Reason / Challan Reference</th>
                    <th className="pb-3">Handled By</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3">
                        <Badge variant={m.movement_type} size="sm">
                          {m.movement_type}
                        </Badge>
                      </td>
                      <td className="py-3 font-bold text-white text-sm">
                        {m.movement_type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="py-3 text-slate-300 max-w-[220px] truncate">{m.reason}</td>
                      <td className="py-3 text-slate-400">{m.created_by_name || 'System'}</td>
                      <td className="py-3 text-slate-400 font-mono">{formatDateTime(m.created_at)}</td>
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
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Stock:</span>
            <span className="font-extrabold text-white text-sm">{product.current_stock} units</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Quantity to {stockType === 'IN' ? 'Add' : 'Remove'} *
            </label>
            <input
              type="number"
              min="1"
              max={stockType === 'OUT' ? product.current_stock : undefined}
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Reason / Reference *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Factory Batch Receipt or Manual Adjustment"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStock}
              className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-colors disabled:opacity-50 ${
                stockType === 'IN'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
              }`}
            >
              {submittingStock ? 'Recording...' : `Confirm Stock ${stockType}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
