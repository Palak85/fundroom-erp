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
          className="fixed inset-0 bg-[#1E222B]/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-[#DCE0EB] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print shadow-sm`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#EEF0F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#5E72C6] flex items-center justify-center shadow-btn text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-[#1E222B] flex items-center gap-1.5">
                FundRoom <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EEF2FC] text-[#5E72C6] font-bold border border-[#D5DEF7]">ERP</span>
              </h1>
              <p className="text-[10px] text-[#77767D] font-medium">Operations Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-[#77767D] hover:text-[#1E222B] hover:bg-[#EEF0F6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-[#EEF0F6] border border-[#DCE0EB]">
          <div className="text-xs text-[#77767D] mb-0.5 font-semibold">Active Session</div>
          <div className="font-bold text-sm text-[#1E222B] truncate">{user?.name || 'User'}</div>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant={role} size="sm">
              {role}
            </Badge>
            <span className="text-[11px] text-[#5E72C6] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5E72C6] animate-ping" />
              Online
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navSections.map((section, idx) => {
            const filteredItems = section.items.filter((item) => item.roles.includes(role));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx}>
                <div className="px-3 text-[10px] font-bold text-[#77767D] tracking-wider mb-1.5 uppercase">
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
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-[#5E72C6] text-white shadow-btn'
                              : 'text-[#49484D] hover:text-[#1E222B] hover:bg-[#EEF0F6]'
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
        <div className="p-4 border-t border-[#EEF0F6] text-[11px] text-[#77767D] text-center font-medium">
          Mini ERP + CRM • Design System
        </div>
      </aside>
    </>
  );
};
