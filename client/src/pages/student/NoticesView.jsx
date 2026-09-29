import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { BellRing, CheckCircle2, Clock, Filter, Tag, ShieldAlert } from 'lucide-react';

export function NoticesView() {
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

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

  const markRead = async (noticeId) => {
    try {
      await apiFetch(`/notices/${noticeId}/read`, { method: 'POST' });
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark notice read:', err);
    }
  };

  const filtered = notices.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'URGENT') return n.priority === 'Urgent';
    return n.category.toUpperCase() === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Official Campus Notices Board</h2>
          <p className="text-xs text-slate-500 mt-1">
            Targeted institutional circulars replacing cluttered 2:00 AM WhatsApp forwards.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {['ALL', 'URGENT', 'ACADEMIC', 'HOSTEL', 'EXAMINATION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading notices...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-400">
            No notices found under this filter.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`bg-white p-6 rounded-2xl border transition shadow-subtle ${
                !n.is_read ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
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
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    Target: {n.target_type} ({n.target_value})
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                  {!n.is_read && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Content */}
              <div className="my-3">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{n.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Issued by: <strong className="text-slate-700">{n.posted_by_name || 'Academic Administration'}</strong></span>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledge as Read</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
