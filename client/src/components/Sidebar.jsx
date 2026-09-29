import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Wrench,
  Ticket,
  PlaneTakeoff,
  FileCheck2,
  Building2,
  UtensilsCrossed,
  BellRing,
  CreditCard,
  UserSquare2,
  Users,
  ShieldCheck,
  History,
  Send,
  HelpCircle,
  FileText,
  Smartphone,
  ChevronRight
} from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab, isOpen, onClose, onOpenAdoptionNote, onOpenKioskModal }) {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'academic_admin', 'hostel_admin'].includes(user?.role);

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, badge: '75% Rule' },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'complaints', label: 'Complaints Desk', icon: Wrench },
    { id: 'gatepass', label: 'Gate Pass (QR)', icon: Ticket },
    { id: 'leave', label: 'Leave Requests', icon: PlaneTakeoff },
    { id: 'documents', label: 'Certificates & Docs', icon: FileCheck2 },
    { id: 'hostel', label: 'Hostel & Room', icon: Building2 },
    { id: 'mess', label: 'Mess Menu & Rating', icon: UtensilsCrossed },
    { id: 'notices', label: 'Notices Board', icon: BellRing },
    { id: 'fees', label: 'Fees & Dues', icon: CreditCard },
    { id: 'profile', label: 'My Profile', icon: UserSquare2 },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard, badge: 'PS07' },
    { id: 'admin-complaints', label: 'Complaints Queue', icon: Wrench },
    { id: 'admin-gatepass', label: 'Gate Passes Desk', icon: Ticket },
    { id: 'admin-leave', label: 'Leave Requests', icon: PlaneTakeoff },
    { id: 'admin-documents', label: 'Document Issuance', icon: FileCheck2 },
    { id: 'admin-students', label: 'Student Directory', icon: Users },
    { id: 'admin-attendance', label: 'Attendance Roster', icon: CalendarCheck },
    { id: 'admin-notices', label: 'Notice Publisher', icon: Send },
    { id: 'admin-mess', label: 'Mess Operations', icon: UtensilsCrossed },
    { id: 'admin-audit', label: 'Campus Audit Trail', icon: History },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Administrative Suite' : 'Student Portal'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Quick Links (PS07 Deliverables) */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-1 text-xs">
          <button
            onClick={() => {
              onOpenKioskModal();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition border border-transparent hover:border-slate-200"
          >
            <div className="flex items-center space-x-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-[11px]">Kiosk / Offline Fallback</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => {
              onOpenAdoptionNote();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition border border-transparent hover:border-slate-200"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-[11px]">PS07 Adoption Note</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
}
