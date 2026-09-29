import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { PlaneTakeoff, Check, X, Calendar, MapPin, Phone } from 'lucide-react';

export function AdminLeaveView() {
  const { addToast } = useNotifications();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState('Approved');
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = async () => {
    try {
      const res = await apiFetch('/leave');
      setLeaves(res.leaves || []);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setRemarks(action === 'Approved' ? 'Granted with parent consent. Report back on time.' : 'Rejected due to exam period.');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch(`/leave/${selectedLeave.id}/review`, {
        method: 'PUT',
        body: {
          status: actionType,
          admin_remarks: remarks
        }
      });

      addToast('success', `Leave request #${res.requestNo} has been ${actionType}!`, 'Leave Reviewed');
      setSelectedLeave(null);
      loadLeaves();
    } catch (err) {
      addToast('error', err.message || 'Failed to review leave');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = leaves.filter(l => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Approved</span>;
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Pending Review</span>;
      default:
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hostel Leave Requests Clearance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Authorizing student residential leave. Super, Academic, and Hostel admins hold equal cross-approval privileges.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {['ALL', 'Pending', 'Approved', 'Rejected'].map((st) => (
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

      {/* Leaves List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading leave requests...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No leave requests matching filter.</div>
          ) : (
            filtered.map((leave) => (
              <div
                key={leave.id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      #{leave.request_no}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{leave.student_name} ({leave.roll_no})</span>
                    <span className="text-xs text-slate-500">{leave.hostel || 'Hostel'} {leave.room_no || 'Room'}</span>
                    <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {leave.leave_type} · {leave.total_days} days
                    </span>
                    {getStatusBadge(leave.status)}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {leave.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{leave.from_date} to {leave.to_date}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{leave.destination_address}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact: <strong>{leave.emergency_contact}</strong></span>
                    </span>
                  </div>

                  {leave.admin_remarks && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      <strong>Remarks:</strong> {leave.admin_remarks}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {leave.status === 'Pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openReviewModal(leave, 'Approved')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      Approve Leave
                    </button>
                    <button
                      onClick={() => openReviewModal(leave, 'Rejected')}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              {actionType} Leave #{selectedLeave.request_no}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: {selectedLeave.student_name} ({selectedLeave.roll_no}) · Dates: {selectedLeave.from_date} to {selectedLeave.to_date}
            </p>

            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Approval / Warden Remarks</label>
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
                  onClick={() => setSelectedLeave(null)}
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
