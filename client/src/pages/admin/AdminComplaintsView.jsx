import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { Wrench, CheckCircle2, Clock, AlertTriangle, User, MapPin, X, Filter } from 'lucide-react';

export function AdminComplaintsView() {
  const { addToast } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Update Modal State
  const [newStatus, setNewStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  const loadComplaints = async () => {
    try {
      const res = await apiFetch('/complaints');
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setAssignedTo(ticket.assigned_to || '');
    setAdminNotes(ticket.admin_notes || '');
    setResolutionRemarks(ticket.resolution_remarks || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch(`/complaints/${selectedTicket.id}/status`, {
        method: 'PUT',
        body: {
          status: newStatus,
          assigned_to: assignedTo,
          admin_notes: adminNotes,
          resolution_remarks: resolutionRemarks
        }
      });

      addToast('success', `Complaint #${res.ticketNo} status updated to ${newStatus}!`, 'Ticket Updated');
      setSelectedTicket(null);
      loadComplaints();
    } catch (err) {
      addToast('error', err.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = complaints.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Submitted</span>;
      case 'Under Review':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Under Review</span>;
      case 'In Progress':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">In Progress</span>;
      case 'Resolved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Resolved</span>;
      default:
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Complaints & Maintenance Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Authorized admin resolution desk: Assign contractors, record notes, and resolve campus tickets.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {['ALL', 'Submitted', 'In Progress', 'Resolved'].map((st) => (
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

      {/* Complaints Table/Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No complaints matching filter.</div>
          ) : (
            filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      #{ticket.ticket_no}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{ticket.title}</span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {ticket.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ticket.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                      ticket.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ticket.priority}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{ticket.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Student: <strong className="text-slate-800">{ticket.student_name}</strong> ({ticket.roll_no})</span>
                    <span>·</span>
                    <span>Location: <strong className="text-slate-800">{ticket.location_details}</strong></span>
                    <span>·</span>
                    <span className="font-mono">Ageing: <strong className="text-slate-800">{ticket.ageingHours}h</strong> ({ticket.ageingBucket})</span>
                  </div>

                  {ticket.assigned_to && (
                    <div className="text-[11px] text-blue-900 bg-blue-50/60 p-1.5 rounded-lg border border-blue-100 inline-block">
                      Assigned: <strong>{ticket.assigned_to}</strong>
                    </div>
                  )}
                </div>

                {/* Manage Ticket Button */}
                <div>
                  <button
                    onClick={() => openUpdateModal(ticket)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition whitespace-nowrap"
                  >
                    Action Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Ticket #{selectedTicket.ticket_no}
                </h3>
                <p className="text-xs text-slate-500">
                  Student: {selectedTicket.student_name} ({selectedTicket.roll_no}) · {selectedTicket.location_details}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Submitted">Submitted (Queued)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress (Staff Assigned)</option>
                  <option value="Resolved">Resolved (Work Completed)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Maintenance Technician / Staff</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Ramesh Kumar (Plumber) / Electrical Wing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Internal Work Note</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Pipe valve ordered from store. Scheduled for inspection tomorrow 10am."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {newStatus === 'Resolved' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    Student-Facing Resolution Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    placeholder="e.g. Tap washer replaced, water pressure checked and verified normal."
                    required={newStatus === 'Resolved'}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save & Notify Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
