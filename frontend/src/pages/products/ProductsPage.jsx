import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import {
  Package,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Edit2,
  Eye,
  AlertTriangle,
  Filter,
  MapPin,
  Tag
} from 'lucide-react';

export const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const initialLowStock = searchParams.get('low_stock') === 'true';

  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(initialLowStock);
  const [page, setPage] = useState(1);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    product: null,
    type: 'IN', // IN or OUT
    quantity: 1,
    reason: ''
  });

  // Product Form
  const [productForm, setProductForm] = useState({
    product_name: '',
    sku: '',
    category: 'Hardware & Tools',
    unit_price: '',
    current_stock: 0,
    minimum_stock: 5,
    warehouse_location: '',
    image_url: ''
  });

  const canManageProducts = hasRole('Admin', 'Warehouse');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          page,
          limit: 10,
          search,
          category,
          low_stock: lowStockFilter ? 'true' : ''
        }
      });
      if (res.data.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      addToast('Failed to fetch inventory catalog', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, lowStockFilter, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      product_name: '',
      sku: '',
      category: 'Hardware & Tools',
      unit_price: '',
      current_stock: 0,
      minimum_stock: 5,
      warehouse_location: '',
      image_url: ''
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      product_name: product.product_name,
      sku: product.sku,
      category: product.category,
      unit_price: product.unit_price,
      current_stock: product.current_stock,
      minimum_stock: product.minimum_stock,
      warehouse_location: product.warehouse_location || '',
      image_url: product.image_url || ''
    });
    setIsProductModalOpen(true);
  };

  const handleOpenStockModal = (product, type) => {
    setStockAdjustment({
      product,
      type,
      quantity: 1,
      reason: type === 'IN' ? 'Warehouse Stock Intake' : 'Manual Stock Adjustment'
    });
    setIsStockModalOpen(true);
  };

  const handleSubmitProductForm = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productForm);
        addToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', productForm);
        addToast('Product added to catalog successfully', 'success');
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  const handleSubmitStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      const endpoint = stockAdjustment.type === 'IN' ? 'stock-in' : 'stock-out';
      const res = await api.post(`/products/${stockAdjustment.product.id}/${endpoint}`, {
        quantity: stockAdjustment.quantity,
        reason: stockAdjustment.reason
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setIsStockModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Stock adjustment failed', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Warehouse & Logistics
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-400" />
            Product & Inventory Catalog
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitor real-time warehouse inventory, SKU pricing, and stock replenishment
          </p>
        </div>

        {canManageProducts && (
          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by product name, SKU, category..."
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Filters:</span>
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="Hardware & Tools">Hardware & Tools</option>
            <option value="Electrical">Electrical</option>
            <option value="Safety Gear">Safety Gear</option>
            <option value="Machinery">Machinery</option>
            <option value="Chemicals">Chemicals</option>
            <option value="Packaging">Packaging</option>
          </select>

          <button
            onClick={() => {
              setLowStockFilter(!lowStockFilter);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              lowStockFilter
                ? 'bg-rose-600/20 text-rose-400 border-rose-500/50 shadow-md shadow-rose-950/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Fetching product inventory..." />
        ) : products.length === 0 ? (
          <EmptyState
            title="No inventory products found"
            description="Adjust search keywords or add a new product item to the catalog."
            action={
              canManageProducts ? (
                <button
                  onClick={handleOpenAddProduct}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl"
                >
                  Create First Product
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((p) => {
                  const isLow = p.current_stock <= p.minimum_stock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-base">
                          <Link to={`/products/${p.id}`} className="hover:text-emerald-400 transition-colors">
                            {p.product_name}
                          </Link>
                        </div>
                        <div className="text-xs font-mono text-emerald-400 mt-0.5">
                          SKU: {p.sku}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-white text-base">
                        {formatCurrency(p.unit_price)}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-extrabold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {p.current_stock}
                          </span>
                          <span className="text-xs text-slate-400">units</span>
                          <Badge variant={isLow ? 'low' : 'normal'} size="sm">
                            {isLow ? 'Low Alert' : 'In Stock'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Min Alert: {p.minimum_stock}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-400">
                        {p.warehouse_location ? (
                          <div className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>{p.warehouse_location}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageProducts && (
                            <>
                              <button
                                onClick={() => handleOpenStockModal(p, 'IN')}
                                title="Stock IN"
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <ArrowDownCircle className="w-3.5 h-3.5" />
                                <span>IN</span>
                              </button>

                              <button
                                onClick={() => handleOpenStockModal(p, 'OUT')}
                                title="Stock OUT"
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <ArrowUpCircle className="w-3.5 h-3.5" />
                                <span>OUT</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                title="Edit Product"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <Link
                            to={`/products/${p.id}`}
                            title="Product Details & Audit Trail"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Item' : 'Add New Inventory Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitProductForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productForm.product_name}
                onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
                placeholder="e.g. Heavy Duty Drill 750W"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                SKU (Stock Keeping Unit) *
              </label>
              <input
                type="text"
                required
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                placeholder="TOOL-DRL-750"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Category *
              </label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Hardware & Tools">Hardware & Tools</option>
                <option value="Electrical">Electrical</option>
                <option value="Safety Gear">Safety Gear</option>
                <option value="Machinery">Machinery</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={productForm.unit_price}
                onChange={(e) => setProductForm({ ...productForm, unit_price: e.target.value })}
                placeholder="2450.00"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editingProduct && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={productForm.current_stock}
                  onChange={(e) => setProductForm({ ...productForm, current_stock: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Minimum Stock Alert Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={productForm.minimum_stock}
                onChange={(e) => setProductForm({ ...productForm, minimum_stock: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Warehouse Location
              </label>
              <input
                type="text"
                value={productForm.warehouse_location}
                onChange={(e) => setProductForm({ ...productForm, warehouse_location: e.target.value })}
                placeholder="e.g. Aisle 2 - Shelf 4"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Product Image URL (Optional)
              </label>
              <input
                type="url"
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40 transition-colors"
            >
              {editingProduct ? 'Update Product' : 'Add Product to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock IN / OUT Adjustment Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`${stockAdjustment.type === 'IN' ? 'Stock IN (Add Inventory)' : 'Stock OUT (Remove Inventory)'}: ${stockAdjustment.product?.product_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitStockAdjustment} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Available Stock:</span>
            <span className="font-extrabold text-white text-sm">
              {stockAdjustment.product?.current_stock} units
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Quantity to {stockAdjustment.type === 'IN' ? 'Add' : 'Deduct'} *
            </label>
            <input
              type="number"
              min="1"
              max={stockAdjustment.type === 'OUT' ? stockAdjustment.product?.current_stock : undefined}
              required
              value={stockAdjustment.quantity}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value, 10) || 1 })}
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
              value={stockAdjustment.reason}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
              placeholder={stockAdjustment.type === 'IN' ? 'e.g. Factory Batch PO-9912' : 'e.g. Damaged Goods Return'}
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
              className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-colors ${
                stockAdjustment.type === 'IN'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
              }`}
            >
              Confirm Stock {stockAdjustment.type}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
