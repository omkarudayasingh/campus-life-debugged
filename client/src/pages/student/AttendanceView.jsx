import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { CalendarCheck, AlertTriangle, CheckCircle2, BookOpen, Clock, Info } from 'lucide-react';

export function AttendanceView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await apiFetch('/students/attendance');
        setData(res);
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Loading attendance records...
      </div>
    );
  }

  const { overall, subjects } = data || { overall: {}, subjects: [] };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Attendance & Academic Eligibility</h2>
        <p className="text-xs text-slate-500 mt-1">
          BPUT University requirement: Minimum 75% aggregate attendance required to be eligible for End-Semester examinations.
        </p>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl border ${
            overall.percentage >= 75
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {overall.percentage}%
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-base">Aggregate Attendance</h3>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                overall.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {overall.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Attended <span className="font-semibold text-slate-800">{overall.totalAttended}</span> out of{' '}
              <span className="font-semibold text-slate-800">{overall.totalClasses}</span> total delivered classes across 5 subjects.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-sm flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>
            {overall.percentage >= 75
              ? 'Your overall academic attendance is well above the mandatory criteria. Keep it up!'
              : 'Attendance is below 75%. Please meet your faculty advisor or improve attendance immediately to prevent exam debarment.'}
          </span>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Subject-Wise Breakdown</h3>
          <span className="text-xs text-slate-400 font-mono">Odd Semester 2026</span>
        </div>

        <div className="divide-y divide-slate-100">
          {subjects.map((sub) => {
            const isSafe = sub.percentage >= 75;
            return (
              <div key={sub.id} className="p-5 hover:bg-slate-50/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {sub.subject_code}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{sub.subject_name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Faculty: <span className="font-medium text-slate-700">{sub.faculty_name}</span></p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                      <span>Attended: <strong className="text-slate-800">{sub.attended_classes}</strong>/{sub.total_classes}</span>
                      <span>·</span>
                      <span className={`font-semibold ${isSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {sub.recommendation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-48 text-right flex flex-col items-end">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-slate-900">{sub.percentage}%</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isSafe ? 'Good' : 'Shortage'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
