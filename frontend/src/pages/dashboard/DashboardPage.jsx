import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users2,
  Package,
  AlertTriangle,
  FileCheck2,
  Clock,
  IndianRupee,
  ArrowRight,
  TrendingUp,
  CalendarCheck,
  PackageCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const PIE_COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B'];

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating ERP & CRM metrics..." />;
  }

  const { kpis, charts, recentActivities } = stats || {
    kpis: {},
    charts: {},
    recentActivities: {}
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Operations Dashboard
          </div>
          <h2 className="text-2xl font-black text-white">
            Hello, {user?.name}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Role: <span className="font-semibold text-slate-200">{user?.role}</span> • Central distribution and inventory overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'Admin' || user?.role === 'Sales') && (
            <Link
              to="/challans/new"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Create Challan</span>
            </Link>
          )}
          {(user?.role === 'Admin' || user?.role === 'Warehouse') && (
            <Link
              to="/products"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <span>Manage Stock</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={kpis.totalCustomers || 0}
          subtitle={`${kpis.activeCustomers || 0} Active accounts`}
          icon={Users2}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={kpis.totalProducts || 0}
          subtitle="Catalog stock items"
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Low Stock Alerts"
          value={kpis.lowStockProducts || 0}
          subtitle="Requires replenishment"
          icon={AlertTriangle}
          color={kpis.lowStockProducts > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Confirmed Revenue"
          value={formatCurrency(kpis.totalRevenue || 0)}
          subtitle={`${kpis.confirmedChallans || 0} Confirmed Challans`}
          icon={IndianRupee}
          color="emerald"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Pending Draft Challans</div>
              <div className="text-lg font-bold text-white">{kpis.draftChallans || 0} Drafts</div>
            </div>
          </div>
          <Link to="/challans" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Today's CRM Follow-ups</div>
              <div className="text-lg font-bold text-white">{kpis.todaysFollowupsCount || 0} Due Today</div>
            </div>
          </div>
          <Link to="/followups" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
            Follow-up <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Active Dispatch Rate</div>
              <div className="text-lg font-bold text-white">100% Operational</div>
            </div>
          </div>
          <Badge variant="Active" size="sm">Healthy</Badge>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Inventory Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Inventory Stock by Category</h3>
              <p className="text-xs text-slate-400">Total units available per product line</p>
            </div>
            <Link to="/products" className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
              Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.inventoryCategoryBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="stock" fill="#10B981" radius={[8, 8, 0, 0]} name="Stock Units" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Breakdown Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Customer Distribution</h3>
            <p className="text-xs text-slate-400">Client profile by account type</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.customerTypeDist || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.customerTypeDist || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Grid: Recent Challans & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Challans */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Sales Challans</h3>
              <p className="text-xs text-slate-400">Latest generated dispatch vouchers</p>
            </div>
            <Link to="/challans" className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
              All Challans <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Challan #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(recentActivities?.recentChallans || []).map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      <Link to={`/challans/${ch.id}`} className="hover:underline">
                        {ch.challan_number}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-200 truncate max-w-[130px]">
                      {ch.customer_name || 'Customer'}
                    </td>
                    <td className="py-3 font-semibold text-white">
                      {formatCurrency(ch.total_amount)}
                    </td>
                    <td className="py-3">
                      <Badge variant={ch.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Replenishment Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Low Stock Critical Alerts
              </h3>
              <p className="text-xs text-slate-400">Products currently below threshold</p>
            </div>
            <Link to="/products?low_stock=true" className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
              Replenish <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentActivities?.lowStockProducts?.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                All inventory items are currently above threshold!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Available</th>
                    <th className="pb-3">Min Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(recentActivities?.lowStockProducts || []).map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-200 truncate max-w-[140px]">
                        <Link to={`/products/${prod.id}`} className="hover:underline">
                          {prod.product_name}
                        </Link>
                      </td>
                      <td className="py-3 font-mono text-slate-400">{prod.sku}</td>
                      <td className="py-3 font-bold text-rose-400">
                        {prod.current_stock} units
                      </td>
                      <td className="py-3 text-slate-400">{prod.minimum_stock} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Stock Movements Audit Log Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Inventory Audit Trail</h3>
            <p className="text-xs text-slate-400">Live IN / OUT stock transactions logged</p>
          </div>
          <Link to="/stock-movements" className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
            Full Audit Log <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="pb-3">Type</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Reason / Reference</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(recentActivities?.recentStockMovements || []).map((sm) => (
                <tr key={sm.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3">
                    <Badge variant={sm.movement_type} size="sm">
                      {sm.movement_type}
                    </Badge>
                  </td>
                  <td className="py-3 font-semibold text-slate-200">
                    {sm.product_name}
                  </td>
                  <td className="py-3 font-bold text-white">
                    {sm.movement_type === 'IN' ? `+${sm.quantity}` : `-${sm.quantity}`}
                  </td>
                  <td className="py-3 text-slate-300 max-w-[200px] truncate">{sm.reason}</td>
                  <td className="py-3 text-slate-400 font-mono">{formatDateTime(sm.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
