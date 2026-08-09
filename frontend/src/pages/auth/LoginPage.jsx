import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Layers, Lock, Mail, ArrowRight, Shield, UserCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-950/60 mb-4 border border-emerald-400/30">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            FundRoom <span className="text-emerald-400">Operations</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Mini ERP + CRM Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Quick Role Demo Switcher</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickRole('admin@example.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <div>
                  <div className="font-bold text-slate-200">Admin</div>
                  <div className="text-[10px] text-slate-400">Full Access</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickRole('sales@example.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <div className="font-bold text-slate-200">Sales</div>
                  <div className="text-[10px] text-slate-400">CRM & Challans</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickRole('warehouse@example.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <div className="font-bold text-slate-200">Warehouse</div>
                  <div className="text-[10px] text-slate-400">Stock IN / OUT</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickRole('accounts@example.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <div>
                  <div className="font-bold text-slate-200">Accounts</div>
                  <div className="text-[10px] text-slate-400">Read & Financials</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          Demo Master Password: <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 border border-slate-800 font-mono">Password@123</code>
        </div>
      </div>
    </div>
  );
};
