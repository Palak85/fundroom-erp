import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { CalendarCheck, Phone, ArrowRight, Building2 } from 'lucide-react';

export const FollowupsPage = () => {
  const [customersWithFollowup, setCustomersWithFollowup] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const res = await api.get('/customers?limit=50');
        if (res.data.success) {
          const withDate = res.data.data
            .filter((c) => c.follow_up_date)
            .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
          setCustomersWithFollowup(withDate);
        }
      } catch (err) {
        console.error('Failed to load followups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          CRM Operations
        </div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <CalendarCheck className="w-7 h-7 text-emerald-400" />
          Scheduled Client Follow-ups
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Master pipeline of scheduled customer communications, quote check-ins, and renewals
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading scheduled follow-ups..." />
      ) : customersWithFollowup.length === 0 ? (
        <EmptyState
          title="No scheduled follow-ups found"
          description="Schedule follow-ups on customer profiles to track them in this pipeline."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customersWithFollowup.map((c) => {
            const isToday = c.follow_up_date === todayStr;
            const isOverdue = c.follow_up_date < todayStr;

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : isOverdue
                    ? 'border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isToday
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isOverdue
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isToday ? 'Due Today' : isOverdue ? 'Overdue' : formatDate(c.follow_up_date)}
                    </span>
                    <Badge variant={c.status} size="sm" />
                  </div>

                  <h3 className="font-bold text-white text-base truncate">{c.customer_name}</h3>
                  {c.business_name && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 truncate">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{c.business_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2 font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{c.mobile}</span>
                  </div>

                  {c.notes && (
                    <p className="mt-3 text-xs text-slate-400 bg-slate-850 p-2.5 rounded-xl border border-slate-800 italic line-clamp-2">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{c.customer_type}</span>
                  <Link
                    to={`/customers/${c.id}`}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    Open CRM Profile <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
