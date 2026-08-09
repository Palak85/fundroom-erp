import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Layers, Lock, Mail, ArrowRight, Shield } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}! (${user.role})`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickRole = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-[#E4E7F0] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5E72C6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D30F38]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#5E72C6] shadow-btn mb-4 text-white">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1E222B] tracking-tight">
            FundRoom <span className="text-[#5E72C6]">Portal</span>
          </h1>
          <p className="text-sm text-[#77767D] mt-1 font-medium">
            Mini ERP + CRM Operations Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#DCE0EB] rounded-3xl p-6 lg:p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#49484D] uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#77767D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#EEF0F6] border border-[#DCE0EB] focus:border-[#5E72C6] focus:bg-white rounded-xl text-sm text-[#1E222B] placeholder-[#77767D] focus:outline-none focus:ring-2 focus:ring-[#5E72C6]/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#49484D] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#77767D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-[#EEF0F6] border border-[#DCE0EB] focus:border-[#5E72C6] focus:bg-white rounded-xl text-sm text-[#1E222B] placeholder-[#77767D] focus:outline-none focus:ring-2 focus:ring-[#5E72C6]/20 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-[#5E72C6] hover:bg-[#485CB4] active:bg-[#384898] text-white font-bold rounded-xl shadow-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Role Switcher Demo Box */}
          <div className="mt-8 pt-6 border-t border-[#EEF0F6]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#77767D] uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4 text-[#5E72C6]" />
              <span>Quick Role Demo Switcher</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillQuickRole('admin@example.com')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#EEF0F6] hover:bg-[#E4E7F2] border border-[#DCE0EB] text-left transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#D30F38]" />
                <div>
                  <div className="font-bold text-xs text-[#1E222B]">Admin</div>
                  <div className="text-[10px] text-[#77767D]">Full Access</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickRole('sales@example.com')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#EEF0F6] hover:bg-[#E4E7F2] border border-[#DCE0EB] text-left transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#5E72C6]" />
                <div>
                  <div className="font-bold text-xs text-[#1E222B]">Sales</div>
                  <div className="text-[10px] text-[#77767D]">CRM & Challan</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickRole('warehouse@example.com')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#EEF0F6] hover:bg-[#E4E7F2] border border-[#DCE0EB] text-left transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#C47D0B]" />
                <div>
                  <div className="font-bold text-xs text-[#1E222B]">Warehouse</div>
                  <div className="text-[10px] text-[#77767D]">Stock IN/OUT</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickRole('accounts@example.com')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#EEF0F6] hover:bg-[#E4E7F2] border border-[#DCE0EB] text-left transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D3139]" />
                <div>
                  <div className="font-bold text-xs text-[#1E222B]">Accounts</div>
                  <div className="text-[10px] text-[#77767D]">Financials</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-[#77767D] font-medium">
          Demo Password: <code className="bg-white px-2 py-0.5 rounded text-[#5E72C6] border border-[#DCE0EB] font-bold font-mono">Password@123</code>
        </div>
      </div>
    </div>
  );
};
