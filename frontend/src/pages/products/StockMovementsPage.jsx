import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';
import { ArrowLeftRight, Filter } from 'lucide-react';

export const StockMovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movementType, setMovementType] = useState('');
  const [page, setPage] = useState(1);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/stock-movements', {
        params: {
          page,
          limit: 15,
          movement_type: movementType
        }
      });
      if (res.data.success) {
        setMovements(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setLoading(false);
    }
  }, [page, movementType]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Warehouse Audit
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-emerald-400" />
            Stock Movement Audit Trail
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Immutable log of all warehouse intakes, manual dispatches, and sales challan deductions
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={movementType}
            onChange={(e) => {
              setMovementType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Movement Types</option>
            <option value="IN">IN (Intake / Restock)</option>
            <option value="OUT">OUT (Dispatch / Challan)</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Fetching audit movements..." />
        ) : movements.length === 0 ? (
          <EmptyState
            title="No stock movements recorded"
            description="Stock transactions will appear here when inventory is added or challans are confirmed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Movement Type</th>
                  <th className="py-3.5 px-4">Product Name & SKU</th>
                  <th className="py-3.5 px-4">Quantity Changed</th>
                  <th className="py-3.5 px-4">Reason / Reference</th>
                  <th className="py-3.5 px-4">Handled By</th>
                  <th className="py-3.5 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 px-6">
                      <Badge variant={m.movement_type} size="sm">
                        {m.movement_type}
                      </Badge>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{m.product_name}</div>
                      <div className="text-xs font-mono text-emerald-400">{m.sku}</div>
                    </td>

                    <td className="py-4 px-4 font-black text-base">
                      <span className={m.movement_type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}>
                        {m.movement_type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-300 max-w-[250px] truncate">
                      {m.reason}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400">
                      {m.created_by_name || 'System User'}
                    </td>

                    <td className="py-4 px-6 text-right text-xs font-mono text-slate-400">
                      {formatDateTime(m.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  );
};
