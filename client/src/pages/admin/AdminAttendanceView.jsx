import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { CalendarCheck, Search, CheckCircle2, AlertTriangle, Edit3, X } from 'lucide-react';

export function AdminAttendanceView() {
  const { addToast } = useNotifications();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAtt, setStudentAtt] = useState([]);
  const [updatingSubject, setUpdatingSubject] = useState(null);
  const [attendedClasses, setAttendedClasses] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    try {
      const res = await apiFetch('/admin/students');
      setStudents(res.students || []);
      if (res.students && res.students.length > 0) {
        loadStudentAttendance(res.students[0]);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAttendance = async (st) => {
    setSelectedStudent(st);
    try {
      const res = await apiFetch(`/students/attendance?studentId=${st.id}`);
      setStudentAtt(res.subjects || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openUpdate = (sub) => {
    setUpdatingSubject(sub);
    setAttendedClasses(sub.attended_classes);
    setTotalClasses(sub.total_classes);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiFetch('/admin/attendance/mark', {
        method: 'POST',
        body: {
          student_id: selectedStudent.id,
          subject_code: updatingSubject.subject_code,
          attended_classes: parseInt(attendedClasses, 10),
          total_classes: parseInt(totalClasses, 10)
        }
      });

      addToast('success', `Attendance updated for ${updatingSubject.subject_code}!`, 'Roster Updated');
      setUpdatingSubject(null);
      loadStudentAttendance(selectedStudent);
    } catch (err) {
      addToast('error', err.message || 'Failed to update attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Attendance Roster Management</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review subject-wise class attendance records, mark daily attendance, and manage 75% exam eligibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selector List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle flex flex-col h-[600px]">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Select Student</h3>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {students.map((st) => (
              <button
                key={st.id}
                onClick={() => loadStudentAttendance(st)}
                className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between text-xs ${
                  selectedStudent?.id === st.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium truncate">{st.name}</div>
                  <div className={`text-[10px] font-mono ${selectedStudent?.id === st.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    {st.roll_no} · {st.department}
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  selectedStudent?.id === st.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Sec {st.section}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Student Attendance Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          {selectedStudent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedStudent.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Roll No: <strong>{selectedStudent.roll_no}</strong> · {selectedStudent.department} (Sec {selectedStudent.section})
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Odd Semester 2026
                </span>
              </div>

              <div className="space-y-3">
                {studentAtt.map((sub) => {
                  const isSafe = sub.percentage >= 75;
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                            {sub.subject_code}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{sub.subject_name}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Attended: <strong className="text-slate-800">{sub.attended_classes}</strong> / {sub.total_classes} classes
                          <span className="mx-2">·</span>
                          <span className={`font-semibold ${isSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {sub.percentage}% ({isSafe ? 'Eligible' : 'Debarment Risk'})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openUpdate(sub)}
                        className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-300 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Attendance</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">Select a student to view records.</div>
          )}
        </div>
      </div>

      {/* Update Attendance Modal */}
      {updatingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Update Attendance</h3>
            <p className="text-xs text-slate-500 mb-4">{updatingSubject.subject_name} ({updatingSubject.subject_code})</p>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attended Classes</label>
                <input
                  type="number"
                  value={attendedClasses}
                  onChange={(e) => setAttendedClasses(e.target.value)}
                  required
                  min={0}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Classes Conducted</label>
                <input
                  type="number"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(e.target.value)}
                  required
                  min={1}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setUpdatingSubject(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {submitting ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
