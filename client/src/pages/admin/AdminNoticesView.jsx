import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { BellRing, Plus, Send, Users, Eye, X, CheckCircle2 } from 'lucide-react';

export function AdminNoticesView() {
  const { addToast } = useNotifications();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('Normal');
  const [targetType, setTargetType] = useState('All');
  const [targetValue, setTargetValue] = useState('ALL');

  const categories = ['Academic', 'Hostel', 'Mess', 'Examination', 'Placement', 'Urgent Alert'];

  const loadNotices = async () => {
    try {
      const res = await apiFetch('/notices');
      setNotices(res.notices || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch('/notices', {
        method: 'POST',
        body: {
          title,
          content,
          category,
          priority,
          target_type: targetType,
          target_value: targetValue
        }
      });

      addToast('success', 'Targeted notice published and broadcasted to matching cohorts!', 'Notice Published');
      setShowModal(false);
      setTitle('');
      setContent('');
      loadNotices();
    } catch (err) {
      addToast('error', err.message || 'Failed to publish notice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Notice Publisher & Targeting</h2>
          <p className="text-xs text-slate-500 mt-1">
            Publish targeted circulars by Batch, Department, Section, or Hostel with real-time read receipt tracking.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Notices List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No published notices found.</div>
          ) : (
            notices.map((n) => (
              <div
                key={n.id}
                className="p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      n.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                      n.priority === 'Important' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {n.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {n.category}
                    </span>
                    <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      Audience: {n.target_type} ({n.target_value})
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Issued by: <strong className="text-slate-700">{n.posted_by_name}</strong></span>
                    <span>·</span>
                    <span>Date: {new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Read Tracker Metric */}
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-center min-w-[110px]">
                  <div className="flex items-center justify-center space-x-1 text-slate-500 text-[10px] font-semibold uppercase">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Read Count</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{n.read_count || 0}</div>
                  <div className="text-[10px] text-slate-400">Student Receipts</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Notice Modal */}
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
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Campus Notice</h3>
                <p className="text-xs text-slate-500">Replaces chaotic WhatsApp forwards with targeted delivery.</p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Mid-Term Lab Examinations"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Alert</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent (Triggers Instant In-App Alert)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience Targeting</label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value);
                      if (e.target.value === 'All') setTargetValue('ALL');
                      else if (e.target.value === 'Department') setTargetValue('CSE');
                      else if (e.target.value === 'Hostel') setTargetValue('BH-1');
                      else if (e.target.value === 'Section') setTargetValue('Section A');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="All">All Students</option>
                    <option value="Department">By Department</option>
                    <option value="Hostel">By Hostel</option>
                    <option value="Section">By Section</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Cohort</label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g. CSE or BH-1"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter official circular text..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Broadcasting...' : 'Publish & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
