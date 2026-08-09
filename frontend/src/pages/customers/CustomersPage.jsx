import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  Building2,
  Calendar,
  Filter,
  FileText
} from 'lucide-react';

export const CustomersPage = () => {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, customer: null, loading: false });

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile: '',
    email: '',
    business_name: '',
    gst_number: '',
    customer_type: 'Wholesale',
    address: '',
    status: 'Active',
    follow_up_date: '',
    notes: ''
  });

  const canEdit = hasRole('Admin', 'Sales');
  const canDelete = hasRole('Admin');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: {
          page,
          limit: 10,
          search,
          status,
          customer_type: customerType
        }
      });
      if (res.data.success) {
        setCustomers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      addToast('Failed to fetch customer directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, customerType, addToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      customer_name: '',
      mobile: '',
      email: '',
      business_name: '',
      gst_number: '',
      customer_type: 'Wholesale',
      address: '',
      status: 'Lead',
      follow_up_date: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      business_name: customer.business_name || '',
      gst_number: customer.gst_number || '',
      customer_type: customer.customer_type || 'Wholesale',
      address: customer.address || '',
      status: customer.status || 'Active',
      follow_up_date: customer.follow_up_date || '',
      notes: customer.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        addToast('Customer profile updated successfully', 'success');
      } else {
        await api.post('/customers', formData);
        addToast('Customer created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving customer', 'error');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteDialog.customer) return;
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await api.delete(`/customers/${deleteDialog.customer.id}`);
      addToast('Customer deleted successfully', 'success');
      setDeleteDialog({ isOpen: false, customer: null, loading: false });
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete customer', 'error');
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            CRM Core
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users2 className="w-7 h-7 text-emerald-400" />
            Customer Directory
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage wholesale, distributor & retail client accounts and sales relationships
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by customer name, phone, email, business..."
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Filters:</span>
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={customerType}
            onChange={(e) => {
              setCustomerType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Types</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
            <option value="Retail">Retail</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Fetching customer directory..." />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers match your criteria"
            description="Try modifying search keywords or status filters, or add a new customer."
            action={
              canEdit ? (
                <button
                  onClick={handleOpenAddModal}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl"
                >
                  Create First Customer
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Customer & Business</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Follow-up</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-base">
                        <Link to={`/customers/${c.id}`} className="hover:text-emerald-400 transition-colors">
                          {c.customer_name}
                        </Link>
                      </div>
                      {c.business_name && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.business_name}</span>
                        </div>
                      )}
                      {c.gst_number && (
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          GST: {c.gst_number}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{c.mobile}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[180px]">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={c.customer_type} size="sm" />
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={c.status} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-xs">
                      {c.follow_up_date ? (
                        <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(c.follow_up_date)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None scheduled</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/customers/${c.id}`}
                          title="View Details & Follow-up Timeline"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {canEdit && (
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit Customer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, customer: c, loading: false })}
                            title="Delete Customer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800">
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Record' : 'Create New Customer Account'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rajesh@hardware.com"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Business / Company Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Sharma Hardware & Supplies"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                GST Number
              </label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                placeholder="27AAACS1234A1Z5"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Customer Type *
              </label>
              <select
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
                <option value="Retail">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Billing & Delivery Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot / Street / Industrial Area / City / State / PIN"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Internal CRM Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Needs floodlights quote"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40 transition-colors"
            >
              {editingCustomer ? 'Update Customer' : 'Save Customer Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, customer: null, loading: false })}
        onConfirm={handleDeleteCustomer}
        loading={deleteDialog.loading}
        title="Delete Customer Account"
        message={`Are you sure you want to permanently delete "${deleteDialog.customer?.customer_name}"? This will also remove associated follow-up logs.`}
        confirmText="Delete Account"
        type="danger"
      />
    </div>
  );
};
