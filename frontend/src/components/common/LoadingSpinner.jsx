import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading operations data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#77767D] gap-3">
      <Loader2 className="w-8 h-8 text-[#5E72C6] animate-spin" />
      <span className="text-sm font-semibold text-[#2D3139]">{text}</span>
    </div>
  );
};
