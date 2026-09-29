import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  User,
  LogOut,
  KeyRound,
  Shield,
  Wifi,
  WifiOff,
  ChevronDown,
  Menu,
  X,
  FileText,
  Smartphone,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export function Navbar({ onToggleSidebar, onOpenAdoptionNote, onOpenKioskModal, onChangePasswordModal }) {
  const { user, logout, quickSwitch, lowBandwidthMode, setLowBandwidthMode } = useAuth();
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">Super Admin</span>;
      case 'academic_admin':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">Academic Admin</span>;
      case 'hostel_admin':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">Hostel Admin</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">Student</span>;
    }
  };

  const personas = [
    { label: 'Omkar Udayasingh', sub: 'Super Admin', id: 'ADM001', role: 'super_admin', icon: '👑' },
    { label: 'Priya Ranjan das', sub: 'Hostel Admin', id: 'ADM002', role: 'hostel_admin', icon: '🏨' },
    { label: 'Priyanka P. Panda', sub: 'Academic Admin', id: 'ADM003', role: 'academic_admin', icon: '📚' },
    { label: 'Dibyaranjan Mohanta', sub: 'Student (CSE, BH-1)', id: '261062', role: 'student', icon: '🎓' },
    { label: 'Archana Pradhan', sub: 'Student (CSE, GH-2)', id: '261005', role: 'student', icon: '🎓' },
  ];

  const handleQuickSwitch = async (personaId) => {
    try {
      await quickSwitch(personaId);
      setShowPersonaMenu(false);
    } catch (e) {
      alert('Quick-switch failed. If password was altered, please login with the new password.');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-lg tracking-tighter">B</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">Campus Life</span>
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Debugged</span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">BPUT Hackathon 2026 · Problem Statement 07</p>
              </div>
            </div>
          </div>

          {/* Center: Live Demo Persona Switcher (Crucial for Evaluators) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
              title="Switch user perspective for live demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Switch Persona</span>
              <span className="text-slate-400 font-mono text-[10px]">({user?.login_id})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Personas (1-Click Switch)
                </div>
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleQuickSwitch(p.id)}
                    className={`w-full px-3 py-2 text-left flex items-center space-x-3 text-xs hover:bg-blue-50 transition ${
                      user?.login_id === p.id ? 'bg-blue-50/70 font-semibold text-blue-800' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-base">{p.icon}</span>
                    <div className="flex-1 truncate">
                      <div className="font-medium text-slate-900 truncate">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.sub} · ID: {p.id}</div>
                    </div>
                    {user?.login_id === p.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Low-Bandwidth Mode, Notifications, User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Low Bandwidth Toggle (PS07 Deliverable) */}
            <button
              onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
              className={`p-2 rounded-lg text-xs flex items-center space-x-1.5 transition border ${
                lowBandwidthMode
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Low Bandwidth / 2G Network Mode"
            >
              {lowBandwidthMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xl:inline font-semibold">Low-Bandwidth Mode ON</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xl:inline">Bandwidth Optimizer</span>
                </>
              )}
            </button>

            {/* In-App Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 overflow-hidden">
                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                    <div className="font-semibold text-sm text-slate-900">Notifications ({unreadCount} new)</div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markOneRead(notif.id)}
                          className={`p-3.5 hover:bg-slate-50 transition cursor-pointer ${
                            !notif.is_read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-semibold text-slate-900">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{getRoleBadge(user?.role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-semibold text-slate-900 truncate">{user?.name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{user?.login_id}</div>
                    <div className="mt-1">{getRoleBadge(user?.role)}</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onChangePasswordModal();
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenKioskModal();
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Kiosk / Offline Fallback</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAdoptionNote();
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>PS07 Adoption Note</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
