import React from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function CertificateModal({ certificate, isOpen, onClose }) {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 my-8 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Actions bar (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print mb-6">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Official Institutional Document</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">Ref: {certificate.certificate_no || certificate.request_no}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div className="border-4 border-double border-slate-300 p-6 sm:p-10 rounded-xl bg-white text-slate-900 relative print:border-none print:p-0">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-7xl font-black text-slate-900 rotate-[-25deg]">BPUT ODISHA</span>
          </div>

          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="w-14 h-14 mx-auto mb-2 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-serif font-black text-2xl shadow-sm">
              B
            </div>
            <h1 className="text-lg sm:text-xl font-serif font-bold uppercase tracking-wider text-slate-900">
              Biju Patnaik University of Technology, Odisha
            </h1>
            <p className="text-[11px] text-slate-600 font-sans mt-0.5 tracking-wide">
              CAMPUS CENTRAL ADMINISTRATIVE OFFICE · ESTD 2002
            </p>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Campus Life Operations Portal · PS07 Verification
            </div>
          </div>

          {/* Document Title */}
          <div className="my-6 text-center">
            <span className="inline-block border-y-2 border-blue-900 px-6 py-1.5 font-serif font-bold uppercase text-sm sm:text-base tracking-widest text-blue-900">
              {certificate.doc_type || 'Bonafide Certificate'}
            </span>
          </div>

          {/* Certificate Metadata */}
          <div className="flex justify-between items-center text-xs text-slate-600 mb-6 font-mono border-b border-slate-200 pb-3">
            <div>
              <span className="font-semibold text-slate-800">Certificate No: </span>
              <span className="font-bold text-blue-800">{certificate.certificate_no || 'BPUT/CERT/2026/8941'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Date of Issue: </span>
              <span>{certificate.reviewed_at ? new Date(certificate.reviewed_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Main Body */}
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed text-justify space-y-4 font-serif">
            <p>
              This is to certify that <span className="font-bold underline decoration-slate-400 decoration-1 text-slate-950 uppercase">{certificate.student_name}</span>, 
              bearing University Registration / Roll Number <span className="font-bold font-mono text-slate-950">{certificate.roll_no}</span>, 
              is a bonafide full-time student of Biju Patnaik University of Technology, enrolled in the 
              Department of <span className="font-bold text-slate-950">{certificate.department}</span> 
              ({certificate.year || '1st'} Year, {certificate.semester || '1st'} Semester, Section {certificate.section || 'A'}), 
              Batch <span className="font-bold text-slate-950">{certificate.batch || '2026'}</span>.
            </p>

            <p>
              According to university residential records, the student resides at 
              <span className="font-bold text-slate-950"> {certificate.hostel || 'Hostel'}</span>, 
              Room Number <span className="font-bold text-slate-950">{certificate.room_no || 'B-104'}</span>. 
              During the period of enrollment, the student's institutional conduct has been satisfactory.
            </p>

            <p>
              This certificate is issued upon the student's request for the specific purpose of: 
              <span className="font-semibold italic text-slate-900"> "{certificate.purpose || 'Official Documentation & Scholarship'}"</span>.
            </p>
          </div>

          {/* Signature & Digital Verification */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="text-left">
              <div className="w-16 h-16 border border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 text-[10px] text-slate-400 font-mono">
                [QR CODE VERIFIED]
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">
                Scan to verify authenticity<br />
                portal.bput.ac.in/verify
              </div>
            </div>

            <div className="text-right">
              <div className="h-8 flex items-center justify-end">
                <span className="font-serif italic font-bold text-blue-900 text-sm tracking-wider">
                  Priyanka P. Panda
                </span>
              </div>
              <div className="w-40 border-t border-slate-900 ml-auto pt-1"></div>
              <div className="text-xs font-bold text-slate-900">Dean / Academic Registrar</div>
              <div className="text-[10px] text-slate-500">Biju Patnaik University of Technology</div>
              <div className="text-[9px] text-emerald-700 font-medium mt-0.5 flex items-center justify-end space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Digitally Authorized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
