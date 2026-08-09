import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({ value, onChange, placeholder = 'Search...', debounceMs = 300 }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange, debounceMs, value]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="w-4 h-4 text-[#77767D] absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-[#EEF0F6] border border-[#DCE0EB] focus:border-[#5E72C6] focus:bg-white rounded-xl text-sm text-[#1E222B] placeholder-[#77767D] focus:outline-none focus:ring-2 focus:ring-[#5E72C6]/20 transition-all font-medium"
      />
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77767D] hover:text-[#1E222B] p-0.5 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
