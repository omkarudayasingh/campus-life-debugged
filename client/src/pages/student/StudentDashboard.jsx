import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import {
  CalendarCheck,
  Ticket,
  Wrench,
  FileCheck2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  CreditCard,
  BellRing
} from 'lucide-react';

export function StudentDashboard({ onNavigate, onOpenGatePassModal, onOpenCertModal }) {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [activePass, setActivePass] = useState(null);
  const [openComplaints, setOpenComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Attendance
        const attData = await apiFetch('/students/attendance');
        setAttendance(attData.overall);

        // Gate passes
        const passData = await apiFetch('/gate-pass');
        const approvedOrPending = (passData.gatePasses || []).find(p => p.status === 'Approved' || p.status === 'Pending' || p.status === 'Checked Out');
        setActivePass(approvedOrPending || null);

        // Complaints
        const compData = await apiFetch('/complaints');
        const activeTickets = (compData.complaints || []).filter(c => c.status !== 'Resolved' && c.status !== 'Rejected');
        setOpenComplaints(activeTickets);

        // Notices
        const notifData = await apiFetch('/notices');
        setNotices((notifData.notices || []).slice(0, 3));

        // Timetable for current day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        const effectiveDay = todayName === 'Sunday' || todayName === 'Saturday' ? 'Monday' : todayName;
        const ttData = await apiFetch('/students/timetable');
        setTodaySchedule(ttData.schedule[effectiveDay] || []);

        // Fees
        const feeData = await apiFetch('/students/fees');
        setFeeSummary(feeData.summary);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Welcome back</span>
            <span>·</span>
            <span>Academic Year 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Roll No: <span className="font-mono font-semibold text-white">{user?.roll_no || user?.login_id}</span> · Department of {user?.department || 'CSE'} ({user?.section ? `Sec ${user?.section}` : '1st Year'})
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="bg-blue-600/70 border border-blue-400/30 px-3 py-1 rounded-full font-medium flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-200" />
              <span>Residential: {user?.hostel || 'Hostel BH-1'}, Room {user?.room_no || 'B-104'}</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full font-medium">
              Active Full-Time Student
            </span>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto">
          <button
            onClick={() => onNavigate('complaints')}
            className="flex-1 md:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition flex items-center justify-center space-x-2"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Lodge Complaint</span>
          </button>
          <button
            onClick={() => onNavigate('gatepass')}
            className="flex-1 md:flex-none px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Apply Gate Pass</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance KPI */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Overall Attendance</span>
            <div className={`p-2 rounded-xl ${attendance?.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {attendance ? `${attendance.percentage}%` : '85.7%'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={`font-semibold ${attendance?.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {attendance?.percentage >= 75 ? 'Safe (>75% rule)' : 'Attendance Shortage!'}
            </span>
            <span className="text-slate-400">View details →</span>
          </div>
        </div>

        {/* Gate Pass KPI */}
        <div
          onClick={() => onNavigate('gatepass')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Gate Pass</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {activePass ? activePass.pass_code : 'No Active Pass'}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            {activePass ? (
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                activePass.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {activePass.status}
              </span>
            ) : (
              <span className="text-slate-400">Need to leave campus?</span>
            )}
            <span className="text-blue-600 font-semibold">Request →</span>
          </div>
        </div>

        {/* Complaints Desk KPI */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Hostel Complaints</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {openComplaints.length}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {openComplaints.length === 0 ? 'All tickets resolved' : 'In review / progress'}
            </span>
            <span className="text-blue-600 font-semibold">Track →</span>
          </div>
        </div>

        {/* Fees & Dues KPI */}
        <div
          onClick={() => onNavigate('fees')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Fee Clearance</span>
            <div className={`p-2 rounded-xl ${feeSummary?.isCleared ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            {feeSummary?.pendingAmount > 0 ? `₹${feeSummary.pendingAmount.toLocaleString()}` : 'Cleared ₹0'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={feeSummary?.isCleared ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
              {feeSummary?.isCleared ? 'All dues cleared' : 'Dues pending'}
            </span>
            <span className="text-blue-600 font-semibold">Receipts →</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Targeted Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Academic Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                <span>Today's Academic Schedule</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Section {user?.section || 'A'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time room numbers and faculty allocations</p>
            </div>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Full Week →
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No classes scheduled for today.
              </div>
            ) : (
              todaySchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/60 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {slot.subject_code}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{slot.subject_name}</h4>
                      <p className="text-[11px] text-slate-500">{slot.faculty_name} · Room: <span className="font-semibold text-slate-700">{slot.room_no}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-slate-700 shadow-2xs">
                      {slot.time_slot}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Targeted Notices (replacing WhatsApp groups) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <BellRing className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Notice Board</h3>
              </div>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onNavigate('notices')}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      notice.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                      notice.priority === 'Important' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{notice.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Filtered specifically for {user?.department || 'CSE'} & {user?.hostel || 'Hostel'}
          </div>
        </div>
      </div>
    </div>
  );
}
