import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { Smartphone, X, Search, ShieldCheck, Ticket, AlertCircle, Wrench, CheckCircle2, Printer } from 'lucide-react';

export function KioskFallbackView({ isOpen, onClose }) {
  const [rollNo, setRollNo] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [error, setError] = useState('');

  // Emergency Kiosk Complaint State
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [compCategory, setCompCategory] = useState('Plumbing');
  const [compDesc, setCompDesc] = useState('');
  const [compSuccess, setCompSuccess] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setLookupResult(null);
    setCompSuccess('');
    setLoading(true);

    try {
      const data = await apiFetch('/kiosk/lookup', {
        method: 'POST',
        body: { roll_no: rollNo, phone_last4: phoneLast4 }
      });
      setLookupResult(data);
    } catch (err) {
      setError(err.message || 'Student not found in campus database.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickComplaint = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/kiosk/quick-complaint', {
        method: 'POST',
        body: {
          roll_no: rollNo,
          category: compCategory,
          description: compDesc
        }
      });
      setCompSuccess(`Emergency ticket #${data.ticketNo} registered with campus facilities!`);
      setCompDesc('');
      setShowComplaintForm(false);
    } catch (err) {
      setError(err.message || 'Failed to lodge emergency ticket.');
    } finally {
      setLoading(false);
    }
  };

  const resetLookup = () => {
    setRollNo('');
    setPhoneLast4('');
    setLookupResult(null);
    setError('');
    setCompSuccess('');
    setShowComplaintForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Terminal Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-base">Hostel Desk & Kiosk Terminal</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                PS07 Fallback
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Offline / Non-Smartphone reality-check terminal for gate pass verification and emergency requests.
            </p>
          </div>
        </div>

        {/* Lookup Form */}
        {!lookupResult ? (
          <div>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter Student Roll Number / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 261062, 261034, 261005"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Optional Phone Verification (Last 4 Digits)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value)}
                  placeholder="e.g. 3475"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>

              {/* Sample quick buttons for testing */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 text-[11px] block mb-1.5 font-medium">Test With Seeded Roll Numbers:</span>
                <div className="flex flex-wrap gap-2">
                  {['261062', '261034', '261005', '261054'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRollNo(r)}
                      className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 rounded-lg text-[11px] font-mono font-medium text-slate-700 transition"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Accessing Campus Database...' : 'Lookup Student Records'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Student ID Card Header */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{lookupResult.student.name}</h4>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll No: <span className="font-bold text-slate-800">{lookupResult.student.roll_no}</span> · {lookupResult.student.department}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Residential: <span className="font-medium">{lookupResult.student.hostel}</span>, Room <span className="font-medium">{lookupResult.student.room_no}</span>
                </div>
              </div>
              <button
                onClick={resetLookup}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                New Lookup
              </button>
            </div>

            {compSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                {compSuccess}
              </div>
            )}

            {/* Active Gate Pass Status */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-xs text-slate-900">Active Gate Pass Status</span>
                </div>
                {lookupResult.activeGatePass ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {lookupResult.activeGatePass.status}
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">No active pass</span>
                )}
              </div>

              {lookupResult.activeGatePass ? (
                <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Pass Code:</span>
                    <span className="font-bold text-blue-700">{lookupResult.activeGatePass.pass_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-medium text-slate-800">{lookupResult.activeGatePass.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allowed Return By:</span>
                    <span className="font-bold text-slate-900">{lookupResult.activeGatePass.expected_in_time}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active or approved gate pass found for today.</p>
              )}
            </div>

            {/* Emergency Kiosk Complaint Button / Form */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-xs text-slate-900">Hostel Desk Emergency Maintenance</span>
                </div>
                <button
                  onClick={() => setShowComplaintForm(!showComplaintForm)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  {showComplaintForm ? 'Cancel' : '+ Lodge Ticket'}
                </button>
              </div>

              {showComplaintForm && (
                <form onSubmit={handleQuickComplaint} className="mt-3 space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Issue Category</label>
                    <select
                      value={compCategory}
                      onChange={(e) => setCompCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Plumbing">Plumbing / Water Supply</option>
                      <option value="Electrical">Electrical / Fan / Light</option>
                      <option value="Carpentry & Furniture">Carpentry / Bed / Lock</option>
                      <option value="Cleanliness & Hygiene">Cleanliness / Washroom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Brief Description</label>
                    <textarea
                      rows={2}
                      value={compDesc}
                      onChange={(e) => setCompDesc(e.target.value)}
                      placeholder="e.g. Tap leaking heavily in room"
                      required
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Submit Kiosk Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
