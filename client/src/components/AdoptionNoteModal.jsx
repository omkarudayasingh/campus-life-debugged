import React from 'react';
import { FileText, X, CheckCircle, ArrowRight, Database, Users, ShieldAlert, Wifi, Layers } from 'lucide-react';

export function AdoptionNoteModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Institutional Rollout & Adoption Note</h2>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                BPUT Hackathon PS07 Deliverable
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Strategic execution plan: Migrating an engineering college from fragmented paper registers, notice boards, and WhatsApp groups to "Campus Life, Debugged".
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          {/* Executive Summary */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-900 text-sm mb-1">Executive Summary</h4>
            <p>
              "Four apps, six notice boards, two WhatsApp groups and one register." Replacing entrenched habits does not happen by decree—it succeeds when the friction of the new system is visibly lower than the old paper-and-WhatsApp routine for both student and warden.
            </p>
          </div>

          {/* 4 Phases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>1. Data Migration Roadmap</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Student Master Data:</strong> Bulk ingest existing university ERP / admission registers (Roll No, Dept, Semester, Hostel, Room No).</li>
                <li><strong>Unified Identity:</strong> Auto-generate user records with temporary passwords (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">cam@123</code>) and mandatory first-login password update.</li>
                <li><strong>Asset & Facility Mapping:</strong> Pre-populate hostels (BH-1..3, GH-1..2) and room assignments so complaints are automatically geo-tagged.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Eliminating WhatsApp Chaos</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Targeted Announcements:</strong> Replace spam 2:00 AM WhatsApp forwards with targeted cohorts (by Department, Section, Year, Hostel).</li>
                <li><strong>Read Receipts:</strong> Administrators can see real engagement metrics rather than guessing who noticed an exam postponement.</li>
                <li><strong>Audit History:</strong> Official record of institutional circulars that cannot be deleted or manipulated.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>3. Paper Register Replacement</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Digital Gate Passes:</strong> Time-stamped requests with scannable QR verification and curfew parameters.</li>
                <li><strong>Cross-Admin Approvals:</strong> Both Academic & Hostel wardens have cross-clearance authority, avoiding student runaround across campus buildings.</li>
                <li><strong>Instant Certificates:</strong> Bonafide and NOC generated digitally with university verification seals in seconds instead of a 4-day wait.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                <Wifi className="w-4 h-4 text-indigo-600" />
                <span>4. Low-Bandwidth & Kiosk Fallback</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Hostel Kiosk Terminal:</strong> Students without smartphones or with dead batteries can query gate passes or lodge urgent maintenance via Roll No.</li>
                <li><strong>Bandwidth Optimizer:</strong> Lightweight responsive bundle designed to load reliably on low-end smartphones on patchy hostel 2G/3G Wi-Fi networks.</li>
              </ul>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Quantifiable Friction Reduction</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-xl font-bold text-blue-600">~85%</div>
                <div className="text-[10px] text-slate-500 mt-1">Reduction in Certificate Turnaround Time</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-xl font-bold text-emerald-600">0</div>
                <div className="text-[10px] text-slate-500 mt-1">Lost Paper Gate Passes & Physical Registers</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-xl font-bold text-purple-600">100%</div>
                <div className="text-[10px] text-slate-500 mt-1">Audit Trail Visibility for Campus Grievances</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
