import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { KeyRound, Mail, CheckCircle2, ArrowLeft, X, Shield, Lock, Copy, Check } from 'lucide-react';

export function ForgotPasswordModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = Request Token, 2 = Enter Token & New Password
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  if (!isOpen) return null;

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: { identifier },
      });

      if (data.resetToken) {
        setDemoToken(data.resetToken);
        setToken(data.resetToken);
      }
      if (data.userEmail) {
        setMaskedEmail(data.userEmail);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword },
      });

      setStep(3); // Success step
    } catch (err) {
      setError(err.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(demoToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setStep(1);
    setIdentifier('');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setDemoToken('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 relative">
        <button
          onClick={resetAll}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Reset Your Password</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your Roll Number / Student ID or registered campus email. We will generate a secure, single-use 15-minute verification token.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Roll No / Admin ID / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 261062 or dibyaranjanmohanta6371@gmail.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Generating Token...' : 'Generate Reset Token'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Enter Reset Verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                A single-use verification token valid for 15 minutes has been generated
                {maskedEmail ? ` for ${maskedEmail}` : ''}.
              </p>
            </div>

            {demoToken && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                <div className="flex items-center justify-between text-blue-900 font-medium mb-1">
                  <span>Demo Environment Verification Token:</span>
                  <button
                    onClick={copyToken}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="block bg-white p-2 rounded border border-blue-200 font-mono text-[11px] text-blue-700 break-all select-all">
                  {demoToken}
                </code>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Verification Token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your 15-minute token"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Validating Token...' : 'Confirm Password Reset'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Password Reset Successfully!</h3>
            <p className="text-xs text-slate-500 mt-2">
              Your password has been securely updated in the database. The reset token is now permanently expired and invalidated.
            </p>
            <button
              onClick={() => {
                resetAll();
                if (onSuccess) onSuccess();
              }}
              className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
