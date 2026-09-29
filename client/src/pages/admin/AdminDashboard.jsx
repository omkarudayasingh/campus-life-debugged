import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Ticket,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Building2,
  CalendarCheck,
  PlaneTakeoff,
  FileCheck2,
  History,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function AdminDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiFetch('/admin/dashboard-stats');
        setStats(res);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading campus intelligence dashboard...</div>;
  }

  const { metrics = {}, ageing = {}, categoryFreq = [], hostelBreakdown = [], recentActivities = [] } = stats || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Administrative Command Suite</span>
            <span>·</span>
            <span className="font-mono">{user?.login_id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {user?.department_area || 'Central Administration'} · <strong className="text-emerald-400">Full Cross-Department Access Enabled</strong>
          </p>
          <div className="mt-3 text-[11px] text-blue-200 bg-white/10 px-3 py-1 rounded-lg border border-white/15 w-fit">
            BPUT PS07 Requirement: Super, Academic & Hostel Admins have cross-clearance authority.
          </div>
        </div>

        {/* Quick Review Queues Shortcut */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => onNavigate('admin-complaints')}
            className="flex-1 md:flex-none px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Complaints ({metrics.openComplaints})</span>
          </button>
          <button
            onClick={() => onNavigate('admin-gatepass')}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Gate Passes ({metrics.pendingGatePasses})</span>
          </button>
        </div>
      </div>

      {/* Real Database KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('admin-students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Enrolled Students</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalStudents}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{metrics.activeStudents} active accounts</span>
            <span className="text-blue-600 font-semibold">Directory →</span>
          </div>
        </div>

        {/* Total Pending Requests */}
        <div
          onClick={() => onNavigate('admin-gatepass')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Pending Requests Queue</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{metrics.totalPendingRequests}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{metrics.pendingGatePasses} passes · {metrics.pendingLeaves} leaves · {metrics.pendingDocuments} certs</span>
            <span className="text-blue-600 font-semibold">Review →</span>
          </div>
        </div>

        {/* Open vs Resolved Complaints */}
        <div
          onClick={() => onNavigate('admin-complaints')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Complaints Status</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.openComplaints} <span className="text-xs font-normal text-slate-400">open</span> / {metrics.resolvedComplaints} <span className="text-xs font-normal text-slate-400">resolved</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{metrics.totalComplaints} total campus tickets</span>
            <span className="text-blue-600 font-semibold">Manage →</span>
          </div>
        </div>

        {/* Resolution Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Avg Resolution Time</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.avgResolutionHours} <span className="text-sm font-semibold text-slate-500">Hours</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target: &lt; 24h SLA</span>
          </div>
        </div>
      </div>

      {/* PS07 Core Analytics: Complaint Ageing & Recurring Issue Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaint Ageing Breakdown (PS07 Deliverable) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Complaint Ageing Matrix</h3>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  PS07 Core Metric
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of pending complaints by elapsed hours.</p>
            </div>
            <button
              onClick={() => onNavigate('admin-complaints')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Action Queue →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-2xl font-black text-emerald-800">{ageing.under24h}</div>
              <div className="text-[11px] font-bold text-emerald-900 mt-1">&lt; 24 Hours</div>
              <span className="text-[10px] text-emerald-700">Fresh / On Track</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-2xl font-black text-amber-800">{ageing.between24and48h}</div>
              <div className="text-[11px] font-bold text-amber-900 mt-1">24 - 48 Hours</div>
              <span className="text-[10px] text-amber-700">Attention Required</span>
            </div>

            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-center">
              <div className="text-2xl font-black text-orange-800">{ageing.between48and72h}</div>
              <div className="text-[11px] font-bold text-orange-900 mt-1">48 - 72 Hours</div>
              <span className="text-[10px] text-orange-700">Escalated</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <div className="text-2xl font-black text-rose-800">{ageing.over72h}</div>
              <div className="text-[11px] font-bold text-rose-900 mt-1">&gt; 72 Hours</div>
              <span className="text-[10px] text-rose-700 font-bold">Critical Overdue</span>
            </div>
          </div>

          {/* Ageing explanation */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Critical tickets older than 72 hours automatically trigger alerts to Chief Warden and Dean.</span>
            <span className="font-bold text-slate-800">Auto-Escalation Active</span>
          </div>
        </div>

        {/* Recurring / Repeated Issue Categories Hotspots (PS07 Deliverable) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Recurring Issue Hotspots</h3>
            </div>

            <div className="space-y-3">
              {categoryFreq.slice(0, 4).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat.category}</span>
                    <span className="font-semibold text-blue-700">{cat.count} reports</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / Math.max(1, metrics.totalComplaints)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Pinpoints recurring contractor bottlenecks (e.g. plumbing in BH-1).
          </div>
        </div>
      </div>

      {/* Recent Institutional Activity Stream (Audit Trail) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Campus Audit Trail</h3>
          </div>
          <button
            onClick={() => onNavigate('admin-audit')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Full Audit Log →
          </button>
        </div>

        <div className="space-y-3">
          {recentActivities.slice(0, 5).map((act) => (
            <div key={act.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{act.user_name}</span>
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">
                    {act.action}
                  </span>
                </div>
                <p className="text-slate-600">{act.details}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-3">
                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
