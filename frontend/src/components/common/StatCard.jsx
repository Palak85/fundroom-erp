import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => {
  const colorAccents = {
    primary: {
      bar: 'bg-[#5E72C6]',
      iconBg: 'bg-[#EEF2FC] text-[#5E72C6]',
      badge: 'text-[#5E72C6]'
    },
    tertiary: {
      bar: 'bg-[#D30F38]',
      iconBg: 'bg-[#FDF2F4] text-[#D30F38]',
      badge: 'text-[#D30F38]'
    },
    inverted: {
      bar: 'bg-[#2D3139]',
      iconBg: 'bg-[#EEF0F6] text-[#2D3139]',
      badge: 'text-[#2D3139]'
    },
    neutral: {
      bar: 'bg-[#77767D]',
      iconBg: 'bg-[#F2F3F5] text-[#77767D]',
      badge: 'text-[#77767D]'
    }
  };

  const theme = colorAccents[color] || colorAccents.primary;

  return (
    <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#77767D] uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className={`p-2.5 rounded-2xl ${theme.iconBg} transition-transform group-hover:scale-110`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-[#1E222B] tracking-tight">{value}</span>
          {trend && (
            <span className={`text-xs font-bold ${theme.badge} flex items-center`}>
              {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-[#77767D] font-medium">{subtitle}</p>
        )}
      </div>

      {/* Design System Indicator Accent Bar */}
      <div className="mt-5 w-full h-1.5 bg-[#EEF0F6] rounded-full overflow-hidden">
        <div className={`h-full ${theme.bar} rounded-full w-2/3 transition-all duration-500`} />
      </div>
    </div>
  );
};
