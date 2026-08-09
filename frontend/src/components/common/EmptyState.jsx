import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({ title = 'No records found', description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 my-4">
      <div className="p-4 rounded-2xl bg-slate-800/80 text-slate-400 border border-slate-700/60 mb-4">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-white mb-1">{title}</h4>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
