import React from 'react';
import { Menu, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const Header = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#DCE0EB] sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between no-print shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-[#77767D] hover:text-[#1E222B] hover:bg-[#EEF0F6] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-[10px] font-bold text-[#77767D] uppercase tracking-wider">Enterprise Ops</span>
          <p className="text-sm font-extrabold text-[#1E222B]">Central Hub</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-[#EEF0F6] border border-[#DCE0EB] px-3.5 py-1.5 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-[#5E72C6] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-[#1E222B] leading-tight">{user?.name}</div>
            <div className="text-[11px] text-[#77767D] font-medium">{user?.email}</div>
          </div>
          <Badge variant={user?.role || 'Admin'} size="sm">
            {user?.role}
          </Badge>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2.5 rounded-xl text-[#77767D] hover:text-[#D30F38] hover:bg-[#FDF2F4] border border-transparent hover:border-[#F9CCD4] transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
