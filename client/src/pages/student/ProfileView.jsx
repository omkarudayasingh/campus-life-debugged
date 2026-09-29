import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { User, Mail, Phone, Building2, BookOpen, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function ProfileView({ onChangePasswordModal }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch('/students/profile');
        setProfile(res.student);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const student = profile || user;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Student Identity & Profile</h2>
        <p className="text-xs text-slate-500 mt-1">
          Institutional credentials, academic standing, and residential records verified with BPUT database.
        </p>
      </div>

      {/* Main Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {student?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-lg">{student?.name}</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Active Student
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Roll No: <strong className="text-slate-800">{student?.roll_no || student?.login_id}</strong> · Batch {student?.batch || '2026'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Department of {student?.department || 'CSE'} ({student?.year || '1st'} Year, {student?.semester || '1st'} Sem, Sec {student?.section || 'A'})
            </div>
          </div>
        </div>

        <button
          onClick={onChangePasswordModal}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
        >
          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
          <span>Update Password</span>
        </button>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Academic Details</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Degree Program:</span>
              <span className="font-semibold text-slate-800">B.Tech in Computer Science & Engineering</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Academic Standing:</span>
              <span className="font-bold text-emerald-700">CGPA: {student?.cgpa || '8.40'} / 10.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Current Semester:</span>
              <span className="font-semibold text-slate-800">{student?.semester || '1st'} Semester (Odd 2026)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Class Section:</span>
              <span className="font-semibold text-slate-800">Section {student?.section || 'A'}</span>
            </div>
          </div>
        </div>

        {/* Residential & Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Residential & Contact</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Hostel Allocation:</span>
              <span className="font-semibold text-slate-800">{student?.hostel || 'BH-1'}, Room {student?.room_no || 'B-104'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Institutional Email:</span>
              <span className="font-mono text-slate-800">{student?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Student Contact:</span>
              <span className="font-mono text-slate-800">{student?.phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Guardian Contact:</span>
              <span className="font-mono text-slate-800">{student?.guardian_contact || student?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
