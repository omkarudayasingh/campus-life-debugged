import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { FileCheck2, Plus, CheckCircle2, Clock, Printer, X, Download, ShieldCheck } from 'lucide-react';

export function DocumentsView({ onOpenCertModal }) {
  const { addToast } = useNotifications();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [docType, setDocType] = useState('Bonafide Certificate');
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState(1);

  const documentTypes = [
    'Bonafide Certificate',
    'Hostel NOC',
    'Character Certificate',
    'Fee Dues Clearance / Receipt',
    'Grade Transcript / Marksheet Verification',
    'College ID Card Replacement'
  ];

  const loadDocuments = async () => {
    try {
      const data = await apiFetch('/documents');
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch('/documents', {
        method: 'POST',
        body: {
          doc_type: docType,
          purpose,
          copies: parseInt(copies, 10)
        }
      });

      addToast('success', `Certificate application #${res.requestNo} submitted for processing!`, 'Request Queued');
      setShowModal(false);
      setPurpose('');
      loadDocuments();
    } catch (err) {
      addToast('error', err.message || 'Failed to submit document request', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready for Download':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Ready to Print</span>;
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
          <h2 className="text-xl font-bold text-slate-900">Documents & Certificate Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Apply for Bonafide, NOC, Character Certificates, and Transcripts with digital authorization and instant printouts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Request Certificate</span>
        </button>
      </div>

      {/* Document Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading document requests...</div>
        ) : documents.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">No Document Requests</h3>
            <p className="text-xs text-slate-500 mt-1">Request official university certificates above.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle hover:border-blue-200 hover:shadow-card transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    #{doc.request_no}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{doc.doc_type}</span>
                  {getStatusBadge(doc.status)}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Purpose:</strong> {doc.purpose}
                </p>

                {doc.certificate_no && (
                  <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Official Cert No: <strong>{doc.certificate_no}</strong></span>
                  </div>
                )}

                {doc.admin_remarks && (
                  <div className="text-[11px] text-slate-500 mt-1">
                    <strong>Admin Note:</strong> {doc.admin_remarks}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                {doc.status === 'Ready for Download' ? (
                  <button
                    onClick={() => onOpenCertModal(doc)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4" />
                    <span>View & Print Certificate</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-mono italic">
                    {doc.status === 'Processing' ? 'Under Digital Signing' : 'In Approval Queue'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Certificate Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Official Document</h3>
                <p className="text-xs text-slate-500">Processed digitally by Academic & Hostel Dean offices.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {documentTypes.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Purpose / Institutional Submission</label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. State Scholarship Portal / Passport Application / Bank Loan Verification"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Certified Copies</label>
                <select
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={1}>1 Original Copy</option>
                  <option value={2}>2 Copies</option>
                  <option value={3}>3 Copies</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
