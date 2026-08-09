import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3 py-1.5 text-sm font-bold'
  };

  const variantClasses = {
    // Status
    Active: 'bg-[#EBF7EE] text-[#1E8A38] border border-[#CBEAD2]',
    Lead: 'bg-[#EEF2FC] text-[#5E72C6] border border-[#D5DEF7]',
    Inactive: 'bg-[#F2F3F5] text-[#77767D] border border-[#DCE0EB]',

    // Challans
    DRAFT: 'bg-[#FEF6E9] text-[#C47D0B] border border-[#FDE5BE]',
    CONFIRMED: 'bg-[#EEF2FC] text-[#5E72C6] border border-[#D5DEF7]',
    CANCELLED: 'bg-[#FDF2F4] text-[#D30F38] border border-[#F9CCD4]',

    // Stock Movements
    IN: 'bg-[#EBF7EE] text-[#1E8A38] border border-[#CBEAD2]',
    OUT: 'bg-[#FEF6E9] text-[#C47D0B] border border-[#FDE5BE]',

    // Customer Types
    Wholesale: 'bg-[#F3EBFB] text-[#7B39B8] border border-[#E3CEF5]',
    Distributor: 'bg-[#EEF2FC] text-[#5E72C6] border border-[#D5DEF7]',
    Retail: 'bg-[#E6F8FB] text-[#0891B2] border border-[#C2EFF6]',

    // Roles
    Admin: 'bg-[#FDF2F4] text-[#D30F38] border border-[#F9CCD4]',
    Sales: 'bg-[#EEF2FC] text-[#5E72C6] border border-[#D5DEF7]',
    Warehouse: 'bg-[#FEF6E9] text-[#C47D0B] border border-[#FDE5BE]',
    Accounts: 'bg-[#F2F3F5] text-[#2D3139] border border-[#DCE0EB]',

    // Stock status
    low: 'bg-[#FDF2F4] text-[#D30F38] border border-[#F9CCD4] animate-pulse',
    normal: 'bg-[#EBF7EE] text-[#1E8A38] border border-[#CBEAD2]',

    primary: 'bg-[#5E72C6] text-white',
    tertiary: 'bg-[#D30F38] text-white',
    neutral: 'bg-[#77767D] text-white',
    inverted: 'bg-[#2D3139] text-white',

    default: 'bg-[#EEF0F6] text-[#2D3139] border border-[#DCE0EB]'
  };

  const selectedClass = variantClasses[variant] || variantClasses.default;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${selectedClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {children || variant}
    </span>
  );
};
