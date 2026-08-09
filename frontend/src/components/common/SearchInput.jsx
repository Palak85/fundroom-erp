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
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
      />
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
