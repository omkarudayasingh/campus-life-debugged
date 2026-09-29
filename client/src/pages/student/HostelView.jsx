import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { Building2, Users, Phone, Mail, MapPin, Shield, HeartPulse, Wrench } from 'lucide-react';

export function HostelView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHostelInfo() {
      try {
        const res = await apiFetch('/hostel/info');
        setData(res);
      } catch (err) {
        console.error('Failed to load hostel info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHostelInfo();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading residential records...</div>;
  }

  const { myHostel, myRoom, roommates = [], warden = {}, emergencyContacts = [] } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hostel & Residential Life</h2>
        <p className="text-xs text-slate-500 mt-1">
          Campus residency information, room allocation, roommates directory, and facility contacts.
        </p>
      </div>

      {/* Main Room Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Current Residential Allocation</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {myHostel || 'Boys Hostel 1'}
          </h3>
          <p className="text-sm text-blue-100 mt-1">
            Room Number: <span className="font-mono font-bold text-white text-base">{myRoom || 'B-104'}</span>
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-xs backdrop-blur-xs">
          <div className="text-blue-200 font-medium">Curfew Timings:</div>
          <div className="font-bold text-white text-sm mt-0.5">08:00 PM (Weekdays) · 09:00 PM (Sundays)</div>
        </div>
      </div>

      {/* Roommates Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Roommates in {myRoom}</h3>
        </div>

        {roommates.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">No other registered roommates assigned to this room record.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roommates.map((rm) => (
              <div key={rm.roll_no} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{rm.name}</div>
                  <div className="text-[11px] font-mono text-blue-700 mt-0.5">Roll No: {rm.roll_no}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{rm.department} · {rm.year || '1st Year'}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center space-x-1.5 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rm.phone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chief Warden & Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chief Warden Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
            <Shield className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Chief Hostel Warden</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 text-base">{warden.name}</div>
            <div className="text-slate-500">{warden.department_area}</div>
            <div className="flex items-center space-x-2 text-slate-600 pt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Office: <strong>{warden.office_location}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Helpline: <strong>{warden.phone}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email: <strong>{warden.email}</strong></span>
            </div>
          </div>
        </div>

        {/* Emergency Desk Contacts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">Emergency & Campus Helplines</h3>
          </div>
          <div className="space-y-3">
            {emergencyContacts.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-800">{c.role}</span>
                <span className="font-mono font-bold text-blue-700">{c.contact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
