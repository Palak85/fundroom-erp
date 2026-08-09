import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) => {
  const colorSchemes = {
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400',
  };

  const currentTheme = colorSchemes[color] || colorSchemes.emerald;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${currentTheme} bg-slate-800/80 border p-5 backdrop-blur-sm shadow-lg hover:border-slate-600 transition-all duration-200 group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 flex items-center">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
};
