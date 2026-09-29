import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Building2,
  FileText,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export function LoginPage({ onOpenForgotPassword, onOpenKiosk, onOpenAdoptionNote }) {
  const { login } = useAuth();
  const { addToast } = useNotifications();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { roleName: 'Super Admin', name: 'Omkar Udayasingh', id: 'ADM001', icon: '👑', color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900' },
    { roleName: 'Hostel Admin', name: 'Priya Ranjan das', id: 'ADM002', icon: '🏨', color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900' },
    { roleName: 'Academic Admin', name: 'Priyanka P. Panda', id: 'ADM003', icon: '📚', color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900' },
    { roleName: 'Student (BH-1)', name: 'Dibyaranjan Mohanta', id: '261062', icon: '🎓', color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900' },
    { roleName: 'Student (GH-2)', name: 'Archana Pradhan', id: '261005', icon: '🎓', color: 'border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-900' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(loginId, password);
      addToast('success', `Welcome, ${data.user.name}!`, 'Authentication Successful');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (id) => {
    setLoginId(id);
    setPassword('cam@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-xl tracking-tighter">B</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">Campus Life</span>
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Debugged</span>
            </div>
            <p className="text-xs text-slate-500">BPUT Hackathon 2026 · Problem Statement 07</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={onOpenKiosk}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium transition flex items-center space-x-1.5 shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Kiosk / Offline Fallback</span>
          </button>

          <button
            onClick={onOpenAdoptionNote}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 font-semibold transition flex items-center space-x-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">PS07 Adoption Note</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Campus Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Universal student and administrator gateway for BPUT operations.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Login ID / Roll No / Admin ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 261062 or ADM001"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Persona Selectors (Hackathon Convenience) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>1-Click Test Personas (Auto-fills ID & Default Password):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleDemoFill(acc.id)}
                  className={`p-2 rounded-xl border text-left text-[11px] transition ${acc.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{acc.roleName}</span>
                    <span>{acc.icon}</span>
                  </div>
                  <div className="text-[10px] opacity-80 truncate">{acc.name} ({acc.id})</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Initial password for all accounts: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">cam@123</code>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400">
        BPUT Hackathon 2026 · Problem Statement 07 · "Campus Life, Debugged" · Connected Operations Platform
      </div>
    </div>
  );
}
