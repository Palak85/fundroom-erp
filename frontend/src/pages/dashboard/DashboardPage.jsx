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

const PIE_COLORS = ['#5E72C6', '#2D3139', '#77767D', '#B0BCE9', '#D30F38'];

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
    return <LoadingSpinner text="Aggregating ERP & CRM operations metrics..." />;
  }

  const { kpis, charts, recentActivities } = stats || {
    kpis: {},
    charts: {},
    recentActivities: {}
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#DCE0EB] shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#5E72C6] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#5E72C6] animate-pulse" />
            Live Operations Dashboard
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E222B]">
            Hello, {user?.name}
          </h2>
          <p className="text-sm text-[#77767D] font-medium mt-0.5">
            Role: <span className="font-bold text-[#1E222B]">{user?.role}</span> • Central distribution and inventory overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'Admin' || user?.role === 'Sales') && (
            <Link
              to="/challans/new"
              className="btn-primary"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Create Challan</span>
            </Link>
          )}
          {(user?.role === 'Admin' || user?.role === 'Warehouse') && (
            <Link
              to="/products"
              className="btn-secondary"
            >
              <PackageCheck className="w-4 h-4 text-[#5E72C6]" />
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
          subtitle={`${kpis.activeCustomers || 0} Active client accounts`}
          icon={Users2}
          color="primary"
        />
        <StatCard
          title="Total Products"
          value={kpis.totalProducts || 0}
          subtitle="Catalog stock items"
          icon={Package}
          color="inverted"
        />
        <StatCard
          title="Low Stock Alerts"
          value={kpis.lowStockProducts || 0}
          subtitle="Requires replenishment"
          icon={AlertTriangle}
          color={kpis.lowStockProducts > 0 ? 'tertiary' : 'primary'}
        />
        <StatCard
          title="Confirmed Revenue"
          value={formatCurrency(kpis.totalRevenue || 0)}
          subtitle={`${kpis.confirmedChallans || 0} Confirmed Challans`}
          icon={IndianRupee}
          color="primary"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#DCE0EB] shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#FEF6E9] text-[#C47D0B]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#77767D] font-bold">Pending Draft Challans</div>
              <div className="text-lg font-extrabold text-[#1E222B]">{kpis.draftChallans || 0} Drafts</div>
            </div>
          </div>
          <Link to="/challans" className="text-xs text-[#5E72C6] hover:underline flex items-center gap-1 font-bold">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DCE0EB] shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#EEF2FC] text-[#5E72C6]">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#77767D] font-bold">Today's CRM Follow-ups</div>
              <div className="text-lg font-extrabold text-[#1E222B]">{kpis.todaysFollowupsCount || 0} Due Today</div>
            </div>
          </div>
          <Link to="/followups" className="text-xs text-[#5E72C6] hover:underline flex items-center gap-1 font-bold">
            Follow-up <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DCE0EB] shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#EBF7EE] text-[#1E8A38]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#77767D] font-bold">Operations Status</div>
              <div className="text-lg font-extrabold text-[#1E222B]">100% Active</div>
            </div>
          </div>
          <Badge variant="Active" size="sm">Operational</Badge>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Inventory Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-[#1E222B]">Inventory Stock by Category</h3>
              <p className="text-xs text-[#77767D] font-medium">Total available units per product line</p>
            </div>
            <Link to="/products" className="text-xs text-[#5E72C6] hover:underline font-bold flex items-center gap-1">
              Full Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.inventoryCategoryBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="category"
                  stroke="#77767D"
                  fontSize={11}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#77767D" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE0EB', borderRadius: '16px', color: '#1E222B', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: 'rgba(94, 114, 198, 0.06)' }}
                />
                <Bar dataKey="stock" fill="#5E72C6" radius={[8, 8, 0, 0]} name="Stock Units" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Breakdown Pie Chart */}
        <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-base font-extrabold text-[#1E222B]">Customer Distribution</h3>
            <p className="text-xs text-[#77767D] font-medium">Account profiles by customer type</p>
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE0EB', borderRadius: '16px', color: '#1E222B', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-[#2D3139] font-bold">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Grid: Recent Challans & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Challans */}
        <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1E222B]">Recent Sales Challans</h3>
              <p className="text-xs text-[#77767D] font-medium">Latest delivery dispatches generated</p>
            </div>
            <Link to="/challans" className="text-xs text-[#5E72C6] hover:underline font-bold flex items-center gap-1">
              All Challans <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EEF0F6] text-[#77767D] font-bold uppercase">
                  <th className="pb-3">Challan #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F6]">
                {(recentActivities?.recentChallans || []).map((ch) => (
                  <tr key={ch.id} className="hover:bg-[#F9FAFD] transition-colors">
                    <td className="py-3 font-mono font-bold text-[#5E72C6]">
                      <Link to={`/challans/${ch.id}`} className="hover:underline">
                        {ch.challan_number}
                      </Link>
                    </td>
                    <td className="py-3 text-[#1E222B] font-bold truncate max-w-[130px]">
                      {ch.customer_name || 'Customer'}
                    </td>
                    <td className="py-3 font-extrabold text-[#1E222B]">
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
        <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1E222B] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D30F38]" />
                Low Stock Critical Alerts
              </h3>
              <p className="text-xs text-[#77767D] font-medium">Products currently below threshold</p>
            </div>
            <Link to="/products?low_stock=true" className="text-xs text-[#5E72C6] hover:underline font-bold flex items-center gap-1">
              Replenish <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentActivities?.lowStockProducts?.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-center text-[#77767D] text-xs font-medium">
                All inventory items are currently above threshold!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EEF0F6] text-[#77767D] font-bold uppercase">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Available</th>
                    <th className="pb-3">Min Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F6]">
                  {(recentActivities?.lowStockProducts || []).map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#F9FAFD] transition-colors">
                      <td className="py-3 font-bold text-[#1E222B] truncate max-w-[140px]">
                        <Link to={`/products/${prod.id}`} className="hover:underline hover:text-[#5E72C6]">
                          {prod.product_name}
                        </Link>
                      </td>
                      <td className="py-3 font-mono text-[#77767D]">{prod.sku}</td>
                      <td className="py-3 font-extrabold text-[#D30F38]">
                        {prod.current_stock} units
                      </td>
                      <td className="py-3 text-[#77767D] font-medium">{prod.minimum_stock} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Stock Movements Audit Log Preview */}
      <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#1E222B]">Recent Inventory Audit Trail</h3>
            <p className="text-xs text-[#77767D] font-medium">Live IN / OUT stock transactions logged</p>
          </div>
          <Link to="/stock-movements" className="text-xs text-[#5E72C6] hover:underline font-bold flex items-center gap-1">
            Full Audit Log <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EEF0F6] text-[#77767D] font-bold uppercase">
                <th className="pb-3">Type</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Reason / Reference</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F6]">
              {(recentActivities?.recentStockMovements || []).map((sm) => (
                <tr key={sm.id} className="hover:bg-[#F9FAFD] transition-colors">
                  <td className="py-3">
                    <Badge variant={sm.movement_type} size="sm">
                      {sm.movement_type}
                    </Badge>
                  </td>
                  <td className="py-3 font-bold text-[#1E222B]">
                    {sm.product_name}
                  </td>
                  <td className="py-3 font-extrabold text-sm">
                    <span className={sm.movement_type === 'IN' ? 'text-[#1E8A38]' : 'text-[#C47D0B]'}>
                      {sm.movement_type === 'IN' ? `+${sm.quantity}` : `-${sm.quantity}`}
                    </span>
                  </td>
                  <td className="py-3 text-[#49484D] max-w-[200px] truncate font-medium">{sm.reason}</td>
                  <td className="py-3 text-[#77767D] font-mono">{formatDateTime(sm.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
