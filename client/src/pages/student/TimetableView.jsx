import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

export function TimetableView() {
  const [data, setData] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    async function loadTimetable() {
      try {
        const res = await apiFetch('/students/timetable');
        setData(res);

        // Pre-select today if weekday
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = dayNames[new Date().getDay()];
        if (days.includes(today)) {
          setActiveDay(today);
        }
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Loading weekly timetable...
      </div>
    );
  }

  const schedule = data?.schedule || {};
  const currentSlots = schedule[activeDay] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Timetable</h2>
          <p className="text-xs text-slate-500 mt-1">
            Department of {data?.department || 'CSE'} · {data?.semester || '1st'} Semester · Section {data?.section || 'A'}
          </p>
        </div>

        {/* Day of Week Selector */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeDay === d
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Class Schedule Grid */}
      <div className="space-y-3">
        {currentSlots.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-400">
            No classes scheduled for {activeDay}.
          </div>
        ) : (
          currentSlots.map((slot, idx) => (
            <div
              key={slot.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:border-blue-200 hover:shadow-card transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex flex-col items-center justify-center font-bold">
                  <span className="text-[10px] uppercase text-blue-500 font-semibold">Slot</span>
                  <span className="text-sm">{idx + 1}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {slot.subject_code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{slot.subject_name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{slot.faculty_name}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-blue-800">{slot.room_no}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{slot.time_slot}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
