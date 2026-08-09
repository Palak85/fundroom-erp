import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({ title = 'No records found', description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#F9FAFD] rounded-3xl border border-dashed border-[#DCE0EB] my-4">
      <div className="p-4 rounded-2xl bg-white text-[#5E72C6] border border-[#DCE0EB] mb-4 shadow-sm">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-[#1E222B] mb-1">{title}</h4>
      {description && <p className="text-sm text-[#77767D] max-w-sm mb-4 font-medium">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
