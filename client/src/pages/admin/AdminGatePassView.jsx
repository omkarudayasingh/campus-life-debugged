import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { Ticket, Check, X, Clock, MapPin, QrCode, ShieldCheck } from 'lucide-react';

export function AdminGatePassView({ onOpenGatePassModal }) {
  const { addToast } = useNotifications();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPass, setSelectedPass] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState('Approved');
  const [submitting, setSubmitting] = useState(false);

  const loadPasses = async () => {
    try {
      const res = await apiFetch('/gate-pass');
      setPasses(res.gatePasses || []);
    } catch (err) {
      console.error('Failed to load gate passes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const openReviewModal = (pass, action) => {
    setSelectedPass(pass);
    setActionType(action);
    setRemarks(action === 'Approved' ? 'Permitted. Return strictly before hostel curfew.' : 'Denied due to academic hours.');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch(`/gate-pass/${selectedPass.id}/review`, {
        method: 'PUT',
        body: {
          status: actionType,
          admin_remarks: remarks
        }
      });

      addToast('success', `Gate pass #${res.passCode} has been ${actionType}!`, 'Pass Reviewed');
      setSelectedPass(null);
      loadPasses();
    } catch (err) {
      addToast('error', err.message || 'Failed to review pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGateSimulation = async (passId, gateAction) => {
    try {
      const res = await apiFetch(`/gate-pass/${passId}/gate-action`, {
        method: 'PUT',
        body: { action: gateAction }
      });
      addToast('success', res.message, 'Gate Security');
      loadPasses();
    } catch (err) {
      addToast('error', err.message || 'Failed');
    }
  };

  const filtered = passes.filter(p => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Approved</span>;
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Pending</span>;
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
          <h2 className="text-xl font-bold text-slate-900">Campus Gate Passes Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review and clear student exit requests. All three admin roles hold cross-clearance permissions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {['ALL', 'Pending', 'Approved', 'Checked Out', 'Checked In'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Passes List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading passes...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No gate passes matching filter.</div>
          ) : (
            filtered.map((pass) => (
              <div
                key={pass.id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      {pass.pass_code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{pass.student_name} ({pass.roll_no})</span>
                    <span className="text-xs text-slate-500">{pass.hostel || 'BH-1'} {pass.room_no || 'B-104'}</span>
                    {getStatusBadge(pass.status)}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span>Purpose: <strong className="text-slate-800">{pass.purpose}</strong></span>
                    <span>·</span>
                    <span>Destination: <strong className="text-slate-800">{pass.destination}</strong></span>
                    <span>·</span>
                    <span className="font-mono text-blue-800">Timing: {pass.out_time} → {pass.expected_in_time}</span>
                  </div>

                  {pass.admin_remarks && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      <strong>Remarks:</strong> {pass.admin_remarks}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenGatePassModal(pass)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    View Pass
                  </button>

                  {pass.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => openReviewModal(pass, 'Approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openReviewModal(pass, 'Rejected')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {pass.status === 'Approved' && (
                    <button
                      onClick={() => handleGateSimulation(pass.id, 'CHECK_OUT')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      Gate Check-Out
                    </button>
                  )}

                  {pass.status === 'Checked Out' && (
                    <button
                      onClick={() => handleGateSimulation(pass.id, 'CHECK_IN')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      Gate Check-In
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              {actionType} Gate Pass #{selectedPass.pass_code}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: {selectedPass.student_name} ({selectedPass.roll_no}) · Destination: {selectedPass.destination}
            </p>

            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Warden / Admin Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPass(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2 text-white rounded-xl text-xs font-bold shadow-md transition ${
                    actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Confirming...' : `Confirm ${actionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
