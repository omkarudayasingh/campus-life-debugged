import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { Ticket, Plus, CheckCircle2, Clock, MapPin, X, QrCode } from 'lucide-react';

export function GatePassView({ onOpenGatePassModal }) {
  const { addToast } = useNotifications();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [purpose, setPurpose] = useState('Market / Personal');
  const [destination, setDestination] = useState('');
  const [outTime, setOutTime] = useState('04:30 PM');
  const [expectedInTime, setExpectedInTime] = useState('07:30 PM');

  const purposes = [
    'Market / Personal',
    'Medical Visit',
    'Library / Academic Project',
    'Day Outing',
    'Emergency Outing'
  ];

  const loadPasses = async () => {
    try {
      const data = await apiFetch('/gate-pass');
      setPasses(data.gatePasses || []);
    } catch (err) {
      console.error('Failed to load gate passes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch('/gate-pass', {
        method: 'POST',
        body: {
          purpose,
          destination,
          out_time: outTime,
          expected_in_time: expectedInTime
        }
      });

      addToast('success', `Gate pass request (${res.passCode}) submitted for admin approval!`, 'Request Sent');
      setShowModal(false);
      setDestination('');
      loadPasses();
    } catch (err) {
      addToast('error', err.message || 'Failed to submit gate pass', 'Request Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Approved</span>;
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Pending Review</span>;
      case 'Checked Out':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Checked Out</span>;
      case 'Checked In':
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Checked In</span>;
      default:
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Gate Passes (Digital QR)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Apply for campus exit passes with warden clearance and security gate check-in/out verification.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Apply For Gate Pass</span>
        </button>
      </div>

      {/* Gate Pass Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">Loading passes...</div>
        ) : passes.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">No Gate Passes Requested</h3>
            <p className="text-xs text-slate-500 mt-1">Apply for an outing or market pass above.</p>
          </div>
        ) : (
          passes.map((pass) => (
            <div
              key={pass.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle hover:border-blue-200 hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    {pass.pass_code}
                  </span>
                  {getStatusBadge(pass.status)}
                </div>

                <div className="my-3 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">{pass.purpose}</div>
                  <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Destination: <strong className="text-slate-800">{pass.destination}</strong></span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center space-x-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Permitted Window: <strong className="text-blue-900">{pass.out_time} → {pass.expected_in_time}</strong></span>
                  </div>
                </div>

                {pass.admin_remarks && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 my-2">
                    <strong>Warden Note:</strong> {pass.admin_remarks}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(pass.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onOpenGatePassModal(pass)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View Pass Card</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Gate Pass Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Apply for Campus Gate Pass</h3>
                <p className="text-xs text-slate-500">Requires institutional approval before campus gate checkout.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Outing Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {purposes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Address / Market</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Local Stationery Store / City Hospital"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Out Time</label>
                  <input
                    type="text"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    placeholder="e.g. 04:30 PM"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Return</label>
                  <input
                    type="text"
                    value={expectedInTime}
                    onChange={(e) => setExpectedInTime(e.target.value)}
                    placeholder="e.g. 07:45 PM"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
