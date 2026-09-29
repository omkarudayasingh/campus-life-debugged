import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Download, Receipt } from 'lucide-react';

export function FeesView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFees() {
      try {
        const res = await apiFetch('/students/fees');
        setData(res);
      } catch (err) {
        console.error('Failed to load fees:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFees();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading fee records...</div>;
  }

  const { summary = {}, records = [] } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Fees, Dues & Clearance Status</h2>
        <p className="text-xs text-slate-500 mt-1">
          University tuition fees, hostel & mess charges, semester exam fees, and payment receipts.
        </p>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Overall Financial Status</span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            {summary.isCleared ? 'All Dues Cleared' : `Pending Balance: ₹${(summary.pendingAmount || 0).toLocaleString()}`}
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Total Assessed: ₹{(summary.totalDues || 0).toLocaleString()} · Total Paid: ₹{(summary.totalPaid || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-xs backdrop-blur-xs">
          <div className="flex items-center space-x-2 font-bold text-white mb-1">
            <Receipt className="w-4 h-4 text-emerald-300" />
            <span>Admit Card Clearance:</span>
          </div>
          <span className={summary.isCleared ? 'text-emerald-300 font-semibold' : 'text-amber-200 font-semibold'}>
            {summary.isCleared ? 'Eligible for Examination Admit Card' : 'Pending dues must be settled before exam hall ticket generation'}
          </span>
        </div>
      </div>

      {/* Fee Breakdown List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Fee Breakdown & Payment Receipts</h3>
          <span className="text-xs text-slate-400 font-mono">Academic Year 2026</span>
        </div>

        <div className="divide-y divide-slate-100">
          {records.map((fee) => {
            const isPaid = fee.status === 'Paid';
            const isPartial = fee.status === 'Partial';
            return (
              <div key={fee.id} className="p-5 hover:bg-slate-50/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isPaid ? 'bg-emerald-50 text-emerald-700' : isPartial ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{fee.fee_type}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Due Date: <span className="font-medium text-slate-700">{fee.due_date}</span>
                      {fee.payment_date && <span> · Paid On: <strong className="text-slate-700">{fee.payment_date}</strong></span>}
                    </p>
                    {fee.receipt_no && (
                      <div className="text-[11px] font-mono text-blue-700 mt-1">
                        Receipt No: <strong>{fee.receipt_no}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-sm font-black text-slate-900">
                    ₹{fee.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Paid: <strong className="text-slate-800">₹{fee.paid_amount.toLocaleString()}</strong>
                  </div>
                  <div className="mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isPaid ? 'bg-emerald-100 text-emerald-800' : isPartial ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {fee.status}
                    </span>
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
