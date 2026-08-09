import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users2,
  CalendarCheck,
  Package,
  ArrowLeftRight,
  FileSpreadsheet,
  ShieldCheck,
  X,
  Layers
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'Guest';

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
      ]
    },
    {
      title: 'CRM OPERATIONS',
      items: [
        { label: 'Customers', path: '/customers', icon: Users2, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
        { label: 'Follow-ups', path: '/followups', icon: CalendarCheck, roles: ['Admin', 'Sales', 'Accounts'] },
      ]
    },
    {
      title: 'INVENTORY & WAREHOUSE',
      items: [
        { label: 'Products', path: '/products', icon: Package, roles: ['Admin', 'Warehouse', 'Sales', 'Accounts'] },
        { label: 'Stock Movements', path: '/stock-movements', icon: ArrowLeftRight, roles: ['Admin', 'Warehouse', 'Sales', 'Accounts'] },
      ]
    },
    {
      title: 'SALES & DISPATCH',
      items: [
        { label: 'Sales Challans', path: '/challans', icon: FileSpreadsheet, roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
      ]
    },
    {
      title: 'SYSTEM ADMIN',
      items: [
        { label: 'User Directory', path: '/users', icon: ShieldCheck, roles: ['Admin'] },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                FundRoom <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">ERP</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Wholesale Ops Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="text-xs text-slate-400 mb-1 font-medium">Logged in as:</div>
          <div className="font-bold text-sm text-white truncate">{user?.name || 'User'}</div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant={role} size="sm">
              {role}
            </Badge>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Online
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {navSections.map((section, idx) => {
            const filteredItems = section.items.filter((item) => item.roles.includes(role));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx}>
                <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 font-semibold'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
          Mini ERP + CRM v1.0.0
        </div>
      </aside>
    </>
  );
};
