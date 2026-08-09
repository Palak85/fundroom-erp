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
        <div className="flex items-center gap-2 text-xs font-bold text-[#5E72C6] uppercase tracking-wider mb-1">
          CRM Operations
        </div>
        <h2 className="text-2xl font-extrabold text-[#1E222B] flex items-center gap-2">
          <CalendarCheck className="w-7 h-7 text-[#5E72C6]" />
          Scheduled Client Follow-ups
        </h2>
        <p className="text-sm text-[#77767D] font-medium mt-0.5">
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
                className={`p-6 rounded-3xl bg-white border transition-all flex flex-col justify-between shadow-card hover:shadow-card-hover ${
                  isToday
                    ? 'border-[#5E72C6] ring-2 ring-[#5E72C6]/20'
                    : isOverdue
                    ? 'border-[#F9CCD4]'
                    : 'border-[#DCE0EB]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isToday
                          ? 'bg-[#EEF2FC] text-[#5E72C6] border border-[#D5DEF7]'
                          : isOverdue
                          ? 'bg-[#FDF2F4] text-[#D30F38] border border-[#F9CCD4]'
                          : 'bg-[#EEF0F6] text-[#2D3139]'
                      }`}
                    >
                      {isToday ? 'Due Today' : isOverdue ? 'Overdue' : formatDate(c.follow_up_date)}
                    </span>
                    <Badge variant={c.status} size="sm" />
                  </div>

                  <h3 className="font-extrabold text-[#1E222B] text-base truncate">{c.customer_name}</h3>
                  {c.business_name && (
                    <div className="flex items-center gap-1.5 text-xs text-[#77767D] font-medium mt-0.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#5E72C6]" />
                      <span>{c.business_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-[#1E222B] mt-2.5 font-bold">
                    <Phone className="w-3.5 h-3.5 text-[#5E72C6]" />
                    <span>{c.mobile}</span>
                  </div>

                  {c.notes && (
                    <p className="mt-3 text-xs text-[#49484D] bg-[#EEF0F6] p-3 rounded-2xl border border-[#DCE0EB] italic line-clamp-2 font-medium">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#EEF0F6] flex items-center justify-between">
                  <span className="text-[11px] text-[#77767D] font-bold uppercase">{c.customer_type}</span>
                  <Link
                    to={`/customers/${c.id}`}
                    className="text-xs font-bold text-[#5E72C6] hover:underline flex items-center gap-1"
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
