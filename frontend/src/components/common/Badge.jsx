import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const variantClasses = {
    // Status
    Active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    Lead: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    Inactive: 'bg-slate-700/40 text-slate-400 border border-slate-600/40',

    // Challans
    DRAFT: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    CONFIRMED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    CANCELLED: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',

    // Stock Movements
    IN: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    OUT: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',

    // Customer Types
    Wholesale: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    Distributor: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    Retail: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',

    // Roles
    Admin: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    Sales: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    Warehouse: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    Accounts: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',

    // Stock status
    low: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse',
    normal: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',

    default: 'bg-slate-800 text-slate-300 border border-slate-700'
  };

  const selectedClass = variantClasses[variant] || variantClasses.default;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${selectedClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children || variant}
    </span>
  );
};
