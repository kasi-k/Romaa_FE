import {  useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Printer, RefreshCw, Filter, FileText, CheckCircle2
} from "lucide-react";
import { 
  useSupplierLedger, 
  useSupplierBalance,
  useSupplierStatement 
} from "./hooks/useLedger";
import Loader from "../../../components/Loader";

/* ── Financial Formatting ────────────────────────────────────────────────── */
const fmt = (n) => 
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── Voucher Meta ───────────────────────────────────────────────────────── */
const VCH_META = {
  PurchaseBill: { label: "Purchase",    code: "PUR", color: "text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" },
  WeeklyBill:   { label: "Weekly Bill", code: "W-B", color: "text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300" },
  ClientBill:   { label: "Client RA",   code: "R-A", color: "text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300" },
  CreditNote:   { label: "Credit Note", code: "C/N", color: "text-teal-700 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-300" },
  DebitNote:    { label: "Debit Note",  code: "D/N", color: "text-violet-700 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-300" },
  Payment:      { label: "Payment",     code: "PMT", color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300" },
  Receipt:      { label: "Receipt",     code: "RCT", color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
  Journal:      { label: "Journal",     code: "J/V", color: "text-slate-500 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400" },
};

/* ── Component Fragments ────────────────────────────────────────────────── */
const BalanceDisplay = ({ balance }) => {
  if (balance === 0) return <span className="tabular-nums font-semibold text-slate-400">NIL</span>;
  const isPos = balance > 0;
  return (
    <span className={`tabular-nums font-bold ${isPos ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
      {fmt(Math.abs(balance))}
      <span className="ml-1 text-[9px] font-extrabold uppercase opacity-80">
        {isPos ? "Cr" : "Dr"}
      </span>
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const ViewLedgerEntry = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ── URL Filters ── */
  const fromDate = searchParams.get("from") || "";
  const toDate   = searchParams.get("to") || "";
  const supplierType = searchParams.get("type") || "Vendor";
  const tenderId = searchParams.get("tender_id") || "";

  /* ── API Hooks ── */
  const { 
    data: entries = [], 
    isLoading: entriesLoading, 
    isFetching, 
    refetch: refetchLedger 
  } = useSupplierLedger(supplierId, { 
    from_date: fromDate, 
    to_date: toDate, 
    supplier_type: supplierType,
    tender_id: tenderId
  });

  const { data: balance, isLoading: balanceLoading } = useSupplierBalance(supplierId, { supplier_type: supplierType, tender_id: tenderId });
  const { data: statement, isLoading: statementLoading } = useSupplierStatement(supplierId, { supplier_type: supplierType, tender_id: tenderId });

  /* ── Derived Metrics ── */
  const openingBalance = useMemo(() => entries.find(e => e.is_opening_balance)?.balance || 0, [entries]);
  const closingBalance = useMemo(() => entries.length > 0 ? entries[entries.length - 1].balance : 0, [entries]);
  const periodTxns = useMemo(() => entries.filter(e => !e.is_opening_balance), [entries]);
  
  const totals = useMemo(() => ({
    debit: periodTxns.reduce((s, e) => s + (e.debit_amt || 0), 0),
    credit: periodTxns.reduce((s, e) => s + (e.credit_amt || 0), 0),
  }), [periodTxns]);

  return (
    <div 
      className="h-full overflow-y-auto bg-slate-100 dark:bg-[#080b12] pb-12 font-sans print:h-auto print:overflow-visible print:bg-white print:text-black print:pb-0"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      
      {/* ── Top App Bar ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Ledger Report</h1>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{supplierType} Account</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => refetchLedger()}
               className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500"
               title="Refresh Ledger"
             >
               <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
             </button>
             <button 
                onClick={() => window.print()}
                className="p-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 shadow-sm"
             >
               <Printer size={14} />
               <span className="text-[11px] font-bold uppercase tracking-wider">Print</span>
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 print:max-w-none print:w-full print:px-0 print:py-0">
        {(entriesLoading || balanceLoading || statementLoading) ? (
          <div className="py-32 flex justify-center"><Loader /></div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none print:shadow-none print:border-none">
            
            {/* ── Letterhead Header ── */}
            <div className="p-6 md:p-8 border-b-4 border-slate-800 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:p-0 print:pb-4 print:border-b-2 print:mb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                  {balance?.supplier_name || supplierId}
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Acct ID: <span className="font-mono text-blue-600 dark:text-blue-400">{supplierId}</span></p>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Type: {supplierType}</p>
                  {tenderId && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <p className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Project: {tenderId}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="text-left md:text-right bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Statement Period</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
                  {fromDate ? fmtDate(fromDate) : "Opening"} <span className="text-slate-300 dark:text-slate-600 mx-1">—</span> {toDate ? fmtDate(toDate) : "Current"}
                </p>
              </div>
            </div>

            {/* ── Compact Summary Ribbon ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {[
                { label: "Opening Balance B/F", val: openingBalance, isBal: true, cls: "text-slate-700 dark:text-slate-300" },
                { label: "Total Debit (Dr)", val: totals.debit, isBal: false, cls: "text-emerald-600 dark:text-emerald-400" },
                { label: "Total Credit (Cr)", val: totals.credit, isBal: false, cls: "text-red-600 dark:text-red-400" },
                { label: "Closing Balance C/F", val: closingBalance, isBal: true, cls: "text-slate-900 dark:text-white" },
              ].map((m, i) => (
                <div key={i} className="p-4 md:p-5 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{m.label}</p>
                  {m.isBal ? (
                     <div className="text-lg"><BalanceDisplay balance={m.val} /></div>
                  ) : (
                    <p className={`text-lg font-black tabular-nums ${m.cls}`}>
                      ₹{fmt(m.val)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* ── Ledger Data Table ── */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-y border-slate-300 dark:border-slate-700">
                    <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-28">Date</th>
                    <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Particulars</th>
                    <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-32">Vch Type</th>
                    <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-32">Vch No.</th>
                    <th className="py-2.5 px-4 text-right text-[10px] font-black uppercase tracking-widest text-emerald-600 w-36">Debit (Dr)</th>
                    <th className="py-2.5 px-4 text-right text-[10px] font-black uppercase tracking-widest text-red-600 w-36">Credit (Cr)</th>
                    <th className="py-2.5 px-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 w-40">Running Bal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-800 dark:text-slate-200">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No transactions found for the selected period.
                      </td>
                    </tr>
                  ) : entries.map((entry, idx) => {
                    const isOB = entry.is_opening_balance;
                    const meta = VCH_META[entry.vch_type] || VCH_META.Journal;
                    
                    return (
                      <tr 
                        key={entry._id || idx} 
                        className={isOB ? "bg-amber-50/50 dark:bg-amber-900/10 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}
                      >
                        {/* Date */}
                        <td className={`py-3 px-4 font-semibold tabular-nums align-top ${isOB ? "text-amber-700 dark:text-amber-500" : "text-slate-600 dark:text-slate-400"}`}>
                          {fmtDate(entry.vch_date)}
                        </td>
                        
                        {/* Particulars */}
                        <td className="py-3 px-4 whitespace-normal min-w-[250px] leading-snug">
                          <p className={`${isOB ? "text-amber-700 dark:text-amber-500 italic" : ""}`}>
                            {entry.particulars}
                          </p>
                          {entry.tender_id && (
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                              PROJ: {entry.tender_id}
                            </p>
                          )}
                        </td>

                        {/* Vch Type */}
                        <td className="py-3 px-4 align-top">
                          {!isOB && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${meta.color}`}>
                              {meta.code || meta.label}
                            </span>
                          )}
                        </td>

                        {/* Vch No */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] align-top">
                          {entry.vch_no || (isOB ? "" : "—")}
                        </td>

                        {/* Debit */}
                        <td className="py-3 px-4 text-right tabular-nums align-top">
                          {entry.debit_amt > 0 ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(entry.debit_amt)}</span>
                          ) : ""}
                        </td>

                        {/* Credit */}
                        <td className="py-3 px-4 text-right tabular-nums align-top">
                          {entry.credit_amt > 0 ? (
                            <span className="font-bold text-red-600 dark:text-red-400">₹{fmt(entry.credit_amt)}</span>
                          ) : ""}
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-4 text-right align-top">
                          <BalanceDisplay balance={entry.balance} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* ── Table Footer Totals ── */}
                {entries.length > 0 && (
                  <tfoot className="border-t-2 border-slate-300 dark:border-slate-700 text-xs">
                    <tr className="bg-slate-50 dark:bg-slate-800/50 font-black">
                      <td colSpan={4} className="py-3 px-4 text-right text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        Period Totals
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ₹{fmt(totals.debit)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 tabular-nums">
                        ₹{fmt(totals.credit)}
                      </td>
                      <td className="py-3 px-4 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-right">
                         <BalanceDisplay balance={closingBalance} />
                      </td>
                    </tr>
                    <tr className="bg-slate-800 text-white">
                      <td className="py-2.5 px-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">{toDate ? fmtDate(toDate) : "Closing"}</td>
                      <td colSpan={5} className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-widest italic text-slate-300 text-right">
                        Closing Balance C/F
                      </td>
                      <td className="py-2.5 px-4 text-right text-sm">
                         <BalanceDisplay balance={closingBalance} />
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* ── Voucher Analysis (Compact View) ── */}
            {statement?.breakdown && statement.breakdown.length > 0 && (
              <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 print:break-inside-avoid print:p-4 print:mt-4 print:border print:bg-white">
                <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" />
                  Voucher Analysis Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statement.breakdown.map(b => {
                    const meta = VCH_META[b.vch_type] || VCH_META.Journal;
                    return (
                      <div key={b.vch_type} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{meta.label}</p>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{b.count}</span>
                        </div>
                        <BalanceDisplay balance={b.net} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="p-6 text-center border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 print:hidden">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 max-w-xl mx-auto leading-relaxed">
                 This is a system-generated financial ledger. All Cr entries denote liabilities owed by the company, and Dr entries denote payments made or receivable dues.
               </p>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewLedgerEntry;
