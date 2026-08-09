import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import {
  FileSpreadsheet,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Package
} from 'lucide-react';

export const CreateChallanPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customer_id') || '';

  const navigate = useNavigate();
  const { addToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId);
  const [items, setItems] = useState([
    { product_id: '', quantity: 1, unit_price: 0, current_stock: 0, sku: '' }
  ]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100')
        ]);
        if (cRes.data.success) setCustomers(cRes.data.data);
        if (pRes.data.success) setProducts(pRes.data.data);
      } catch (err) {
        addToast('Failed to load initial metadata', 'error');
      } finally {
        setLoadingInitial(false);
      }
    };
    loadMetadata();
  }, [addToast]);

  const handleProductChange = (index, productId) => {
    const selectedProd = products.find((p) => p.id === productId);
    const updated = [...items];
    if (selectedProd) {
      updated[index] = {
        ...updated[index],
        product_id: productId,
        unit_price: selectedProd.unit_price,
        current_stock: selectedProd.current_stock,
        sku: selectedProd.sku,
        product_name: selectedProd.product_name
      };
    } else {
      updated[index] = {
        product_id: '',
        quantity: 1,
        unit_price: 0,
        current_stock: 0,
        sku: ''
      };
    }
    setItems(updated);
  };

  const handleQuantityChange = (index, qty) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, parseInt(qty, 10) || 1);
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { product_id: '', quantity: 1, unit_price: 0, current_stock: 0, sku: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      addToast('Challan must contain at least one item', 'error');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const totalQuantity = items.reduce((sum, item) => sum + (item.product_id ? item.quantity : 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product_id ? item.quantity * item.unit_price : 0), 0);

  // Check if any product has insufficient stock
  const hasInsufficientStock = items.some(
    (item) => item.product_id && item.quantity > item.current_stock
  );

  const handleSubmit = async (status = 'DRAFT') => {
    if (!selectedCustomerId) {
      addToast('Please select a customer', 'error');
      return;
    }

    const validItems = items.filter((i) => i.product_id);
    if (validItems.length === 0) {
      addToast('Please add at least one valid product item', 'error');
      return;
    }

    if (status === 'CONFIRMED' && hasInsufficientStock) {
      addToast('Cannot confirm challan with items exceeding current stock', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id: selectedCustomerId,
        status,
        items: validItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity
        }))
      };

      const res = await api.post('/challans', payload);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create challan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/challans"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Sales & Delivery
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
            Generate Delivery Challan
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Item Table Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              1. Customer Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Select Client Account *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name} {c.business_name ? `(${c.business_name})` : ''} • {c.customer_type}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomerObj && (
              <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="font-bold text-white text-sm">{selectedCustomerObj.customer_name}</div>
                {selectedCustomerObj.business_name && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{selectedCustomerObj.business_name}</span>
                  </div>
                )}
                {selectedCustomerObj.gst_number && (
                  <div className="font-mono text-[11px] text-emerald-400">
                    GSTIN: {selectedCustomerObj.gst_number}
                  </div>
                )}
                <div className="text-slate-400 mt-1">
                  Deliver to: {selectedCustomerObj.address || 'Address on file'}
                </div>
              </div>
            )}
          </div>

          {/* Product Items Table Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                2. Challan Product Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const isInsufficient = item.product_id && item.quantity > item.current_stock;
                const rowTotal = (item.quantity || 0) * (item.unit_price || 0);

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isInsufficient
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : 'bg-slate-850/60 border-slate-800'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Product Selector */}
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Product Item #{idx + 1}
                        </label>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} (Stock: {p.current_stock}) - {formatCurrency(p.unit_price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Unit Price
                        </label>
                        <div className="px-3 py-2 bg-slate-800/80 border border-slate-700/50 rounded-xl text-xs font-semibold text-white">
                          {formatCurrency(item.unit_price)}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Row Total & Delete */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-white">
                            {formatCurrency(rowTotal)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Alert Info */}
                    {item.product_id && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          SKU: <strong className="text-slate-300 font-mono">{item.sku}</strong> • Available Warehouse Stock:{' '}
                          <strong className="text-slate-200">{item.current_stock} units</strong>
                        </span>

                        {isInsufficient && (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Exceeds stock by {item.quantity - item.current_stock} units!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary & Actions Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 sticky top-24">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Challan Voucher Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Line Items:</span>
                <span className="font-bold text-white">{items.filter((i) => i.product_id).length} items</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Total Units / Quantity:</span>
                <span className="font-bold text-white">{totalQuantity} units</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-200">Total Valuation:</span>
                <span className="text-2xl font-black text-emerald-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {hasInsufficientStock && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Insufficient Inventory:</strong> One or more items exceed current stock. You can save as a <strong>DRAFT</strong>, but confirmation will be rejected until restocked.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('CONFIRMED')}
                className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  hasInsufficientStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Challan & Deduct Stock</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('DRAFT')}
                className="w-full py-3.5 px-4 font-bold text-sm bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>Save as Draft (No Stock Change)</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-center leading-relaxed">
              Automatic Challan Number <code className="text-emerald-400 font-mono">CH-2026-XXXX</code> will be issued on creation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
