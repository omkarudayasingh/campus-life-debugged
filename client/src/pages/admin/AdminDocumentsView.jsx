import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { FileCheck2, Printer, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export function AdminDocumentsView({ onOpenCertModal }) {
  const { addToast } = useNotifications();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [newStatus, setNewStatus] = useState('Ready for Download');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDocuments = async () => {
    try {
      const res = await apiFetch('/documents');
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const openProcessModal = (doc) => {
    setSelectedDoc(doc);
    setNewStatus(doc.status === 'Submitted' ? 'Processing' : 'Ready for Download');
    setRemarks(doc.admin_remarks || 'Verified with admission records. Authorized for digital issue.');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch(`/documents/${selectedDoc.id}/status`, {
        method: 'PUT',
        body: {
          status: newStatus,
          admin_remarks: remarks
        }
      });

      addToast('success', `Certificate #${res.requestNo} status set to ${newStatus}!`, 'Document Processed');
      setSelectedDoc(null);
      loadDocuments();
    } catch (err) {
      addToast('error', err.message || 'Failed to update document status');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = documents.filter(d => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready for Download':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Ready to Issue</span>;
      case 'Processing':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Processing</span>;
      case 'Submitted':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Submitted</span>;
      default:
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Certificate & Document Issuance Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional verification, digital signing, and issuance of Bonafide, NOC, and transcripts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {['ALL', 'Submitted', 'Processing', 'Ready for Download'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading document requests...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No document requests matching filter.</div>
          ) : (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      #{doc.request_no}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{doc.student_name} ({doc.roll_no})</span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {doc.doc_type}
                    </span>
                    {getStatusBadge(doc.status)}
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Purpose:</strong> {doc.purpose}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Department: <strong className="text-slate-700">{doc.department}</strong></span>
                    <span>·</span>
                    <span>Requested: {new Date(doc.created_at).toLocaleDateString()}</span>
                    {doc.certificate_no && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                          {doc.certificate_no}
                        </span>
                      </>
                    )}
                  </div>

                  {doc.admin_remarks && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      <strong>Remarks:</strong> {doc.admin_remarks}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openProcessModal(doc)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    Process / Sign
                  </button>

                  {doc.status === 'Ready for Download' && (
                    <button
                      onClick={() => onOpenCertModal(doc)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Document</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Process Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Process {selectedDoc.doc_type}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: {selectedDoc.student_name} ({selectedDoc.roll_no}) · Purpose: {selectedDoc.purpose}
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Processing">Processing (Under Verification)</option>
                  <option value="Ready for Download">Ready for Download (Sign & Issue Cert No)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Endorsement Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Verified with admissions database. Digital signature endorsed."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Endorse & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
