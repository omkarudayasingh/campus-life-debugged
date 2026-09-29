import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { apiFetch } from '../../utils/api';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, User, MapPin, X, MessageSquare } from 'lucide-react';

export function ComplaintsView() {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [category, setCategory] = useState('Plumbing');
  const [locationType, setLocationType] = useState('Hostel Room');
  const [locationDetails, setLocationDetails] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const categories = [
    'Plumbing',
    'Electrical',
    'Wi-Fi & Internet',
    'Carpentry & Furniture',
    'Cleanliness & Hygiene',
    'Mess & Food Quality',
    'Academic Issues',
    'Other'
  ];

  const loadComplaints = async () => {
    try {
      const data = await apiFetch('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    if (user?.hostel && user?.room_no) {
      setLocationDetails(`${user.hostel} Room ${user.room_no}`);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch('/complaints', {
        method: 'POST',
        body: {
          category,
          location_type: locationType,
          location_details: locationDetails,
          title,
          description,
          priority
        }
      });

      addToast('success', `Complaint #${res.ticketNo} lodged successfully!`, 'Ticket Registered');
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadComplaints();
    } catch (err) {
      addToast('error', err.message || 'Failed to submit complaint', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2 className="text-xl font-bold text-slate-900">Complaints & Maintenance Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time status of hostel, academic, and facility maintenance tickets with audit history.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge New Complaint</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">No Open Complaints</h3>
            <p className="text-xs text-slate-500 mt-1">You have no active maintenance issues reported.</p>
          </div>
        ) : (
          complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle hover:border-blue-200 hover:shadow-card transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    #{item.ticket_no}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                    item.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ageing: <strong className="text-slate-700">{item.ageingHours}h</strong> ({item.ageingBucket})
                  </span>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Title & Description */}
              <div className="my-3">
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
              </div>

              {/* Location & Assigned Staff */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Location: <strong className="text-slate-800">{item.location_details}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Assigned Staff: <strong className="text-slate-800">{item.assigned_to || 'Pending Assignment'}</strong></span>
                </div>
              </div>

              {/* Admin Notes & Resolution Updates */}
              {item.admin_notes && (
                <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <strong className="block text-blue-950 font-semibold mb-0.5">Admin Work Note:</strong>
                  {item.admin_notes}
                </div>
              )}

              {item.resolution_remarks && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-950 mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resolution Remarks ({new Date(item.resolved_at).toLocaleString()}):</span>
                  </div>
                  <p>{item.resolution_remarks}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Lodge Maintenance Complaint</h3>
                <p className="text-xs text-slate-500">Tickets are directly visible to Chief Warden and Facility Admins.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Low">Low (General)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Impacting Daily Life)</option>
                    <option value="Urgent">Urgent (Safety / Emergency)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Details</label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. BH-1 Room B-104 or GH-2 3rd Floor Common Washroom"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Washroom tap leaking under basin continuously"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, how long it has persisted, and any specific notes..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
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
                  {submitting ? 'Lodging Ticket...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
