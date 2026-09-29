import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { Ticket, X, CheckCircle2, Clock, MapPin, ShieldCheck, QrCode, ArrowRight, Printer } from 'lucide-react';

export function GatePassModal({ pass, isOpen, onClose, onPassUpdated }) {
  const { addToast } = useNotifications();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !pass) return null;

  const handleGateAction = async (action) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/gate-pass/${pass.id}/gate-action`, {
        method: 'PUT',
        body: { action }
      });
      addToast('success', data.message, 'Gate Action Recorded');
      if (onPassUpdated) onPassUpdated();
    } catch (e) {
      addToast('error', e.message || 'Gate action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm sm:max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Digital Pass Card */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/60 to-white shadow-sm">
          {/* Card Top Banner */}
          <div className="bg-blue-600 px-5 py-3 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-blue-200" />
              <span className="font-bold text-xs uppercase tracking-wider">Digital Campus Gate Pass</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              pass.status === 'Approved' ? 'bg-emerald-500 text-white' :
              pass.status === 'Checked Out' ? 'bg-amber-400 text-slate-900' :
              pass.status === 'Checked In' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {pass.status}
            </span>
          </div>

          <div className="p-5 text-center">
            {/* Pass Code */}
            <div className="text-xl font-black font-mono tracking-wider text-slate-900 mb-1">
              {pass.pass_code}
            </div>
            <div className="text-[11px] text-slate-500 mb-4">
              BPUT Campus Security & Residency Protocol
            </div>

            {/* QR Simulation Card */}
            <div className="w-36 h-36 mx-auto bg-white p-3 rounded-xl border border-slate-300 shadow-inner flex flex-col items-center justify-center mb-4">
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-lg">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-xs ${i % 3 === 0 ? 'bg-white' : 'bg-blue-500'}`} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-2 font-semibold">VALIDATED QR</span>
            </div>

            {/* Student & Outing Details */}
            <div className="bg-slate-50 rounded-xl p-3 text-left border border-slate-100 text-xs space-y-2 mb-4">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-900">{pass.student_name || 'Dibyaranjan Mohanta'} ({pass.roll_no || '261062'})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Hostel & Room:</span>
                <span className="font-medium text-slate-800">{pass.hostel || 'BH-1'}, Room {pass.room_no || 'B-104'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Destination:</span>
                <span className="font-medium text-slate-800">{pass.destination}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Purpose:</span>
                <span className="font-medium text-slate-800">{pass.purpose}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">Allowed Window:</span>
                <span className="font-bold text-blue-700">{pass.out_time} → {pass.expected_in_time}</span>
              </div>
              {pass.admin_remarks && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 mt-1">
                  <strong>Warden Note:</strong> {pass.admin_remarks}
                </div>
              )}
            </div>

            {/* Gate Actions Simulator for Demo / Security Desk */}
            <div className="border-t border-slate-200 pt-3">
              <div className="text-[11px] text-slate-400 mb-2 font-medium">Campus Gate Security Action Simulator:</div>
              <div className="flex items-center space-x-2">
                {pass.status === 'Approved' && (
                  <button
                    onClick={() => handleGateAction('CHECK_OUT')}
                    disabled={loading}
                    className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    Simulate Gate Check-Out
                  </button>
                )}
                {pass.status === 'Checked Out' && (
                  <button
                    onClick={() => handleGateAction('CHECK_IN')}
                    disabled={loading}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    Simulate Gate Check-In
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
