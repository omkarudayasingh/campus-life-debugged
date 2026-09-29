import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { Users, UserPlus, Search, Edit3, ShieldAlert, CheckCircle2, X, Building2, BookOpen } from 'lucide-react';

export function AdminStudentsView() {
  const { addToast } = useNotifications();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [hostelFilter, setHostelFilter] = useState('ALL');

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRollNo, setNewRollNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('CSE');
  const [newYear, setNewYear] = useState('1st');
  const [newSem, setNewSem] = useState('1st');
  const [newSec, setNewSec] = useState('A');
  const [newBatch, setNewBatch] = useState('2026');
  const [newHostel, setNewHostel] = useState('BH-1');
  const [newRoom, setNewRoom] = useState('B-201');
  const [newCgpa, setNewCgpa] = useState('8.50');
  const [submitting, setSubmitting] = useState(false);

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editHostel, setEditHostel] = useState('');
  const [editRoom, setEditRoom] = useState('');

  const loadStudents = async () => {
    try {
      const res = await apiFetch(`/admin/students?search=${searchTerm}&department=${deptFilter}&hostel=${hostelFilter}`);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [searchTerm, deptFilter, hostelFilter]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch('/admin/students', {
        method: 'POST',
        body: {
          roll_no: newRollNo,
          name: newName,
          email: newEmail,
          phone: newPhone,
          department: newDept,
          year: newYear,
          semester: newSem,
          section: newSec,
          batch: newBatch,
          hostel: newHostel,
          room_no: newRoom,
          cgpa: newCgpa
        }
      });

      addToast('success', res.message, 'Student Registered');
      setShowAddModal(false);
      setNewRollNo('');
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      loadStudents();
    } catch (err) {
      addToast('error', err.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch(`/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        body: {
          name: editName,
          email: editEmail,
          phone: editPhone,
          hostel: editHostel,
          room_no: editRoom
        }
      });

      addToast('success', res.message, 'Student Updated');
      setEditingStudent(null);
      loadStudents();
    } catch (err) {
      addToast('error', err.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudentStatus = async (studentId) => {
    try {
      const res = await apiFetch(`/admin/students/${studentId}/toggle-status`, {
        method: 'PUT'
      });
      addToast('info', res.message, 'Account Status');
      loadStudents();
    } catch (err) {
      addToast('error', err.message || 'Failed to toggle status');
    }
  };

  const openEditModal = (st) => {
    setEditingStudent(st);
    setEditName(st.name);
    setEditEmail(st.email);
    setEditPhone(st.phone || '');
    setEditHostel(st.hostel);
    setEditRoom(st.room_no);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Directory & Records</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage student registrations, hostel allocations, and active credential statuses.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Roll No, Name, or Email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="CSE(AI)">CSE(AI)</option>
            <option value="CSE AI">CSE AI</option>
          </select>

          <select
            value={hostelFilter}
            onChange={(e) => setHostelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
          >
            <option value="ALL">All Hostels</option>
            <option value="BH-1">BH-1</option>
            <option value="BH-2">BH-2</option>
            <option value="BH-3">BH-3</option>
            <option value="GH-1">GH-1</option>
            <option value="GH-2">GH-2</option>
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Academic Details</th>
                <th className="py-3.5 px-4">Residential</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No students found.</td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {st.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-700 whitespace-nowrap">
                      {st.roll_no}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{st.department} · {st.year} Year</div>
                      <div className="text-[11px] text-slate-400">Sem {st.semester}, Sec {st.section} (Batch {st.batch})</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded">
                        {st.hostel} · {st.room_no}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div>{st.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{st.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStudentStatus(st.id)}
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition ${
                          st.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                            : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                        title="Click to toggle active/inactive status"
                      >
                        {st.is_active ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(st)}
                        className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg font-medium inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Register New Student</h3>
                <p className="text-xs text-slate-500">Auto-configured with default password <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">cam@123</code></p>
              </div>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Roll No / Student ID</label>
                  <input
                    type="text"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    placeholder="e.g. 261099"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Soumya Ranjan"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="98765 43210"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dept</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="CSE">CSE</option>
                    <option value="CSE(AI)">CSE(AI)</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={newSem}
                    onChange={(e) => setNewSem(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="1st">1st Sem</option>
                    <option value="2nd">2nd Sem</option>
                    <option value="3rd">3rd Sem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={newSec}
                    onChange={(e) => setNewSec(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hostel</label>
                  <select
                    value={newHostel}
                    onChange={(e) => setNewHostel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="BH-1">BH-1</option>
                    <option value="BH-2">BH-2</option>
                    <option value="BH-3">BH-3</option>
                    <option value="GH-1">GH-1</option>
                    <option value="GH-2">GH-2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Room No</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. B-201"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 mt-2">
                Initial password set to <strong>cam@123</strong>. Mandatory password change is automatically enforced on their first login.
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
            <h3 className="font-bold text-slate-900 text-base mb-1">Edit Student: {editingStudent.name}</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">Roll No: {editingStudent.roll_no}</p>

            <form onSubmit={handleEditStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel</label>
                  <input
                    type="text"
                    value={editHostel}
                    onChange={(e) => setEditHostel(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room No</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
