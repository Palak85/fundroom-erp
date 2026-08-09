import React from 'react';
import { Menu, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const Header = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</span>
          <p className="text-sm font-bold text-white">Central Operations Center</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{user?.name}</div>
            <div className="text-[11px] text-slate-400">{user?.email}</div>
          </div>
          <Badge variant={user?.role || 'Admin'} size="sm">
            {user?.role}
          </Badge>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
