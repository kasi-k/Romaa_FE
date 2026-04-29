import { useState } from "react";
import { RotateCcw, RefreshCw, Plus } from "lucide-react";
import { useITCReversal } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fyStart = () => {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-04-01`;
};

const ITCReversal = () => {
  const [fromDate, setFromDate] = useState(fyStart());
  const [toDate,   setToDate]   = useState(new Date().toISOString().slice(0, 10));
  const [applied,  setApplied]  = useState({ from_date: fyStart(), to_date: new Date().toISOString().slice(0, 10) });

  const { data, isLoading, isError, refetch } = useITCReversal(applied);
  const totals = data?.totals || {};

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <RotateCcw size={18} className="text-rose-600 dark:text-rose-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · GST</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">ITC Reversal Register</h1>
          </div>
        </div>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400" />
        <button onClick={() => setApplied({ from_date: fromDate, to_date: toDate })} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-rose-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="mx-6 my-4 space-y-4">
          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{data.count ?? 0} reversals</span>
            </div>

            <table className="w-full">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                {["Date", "JE No", "Narration", "Tender", "CGST", "SGST", "IGST", "Total"].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {data.rows?.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-3 py-2 text-xs text-gray-500">{fmtDate(row.je_date)}</td>
                    <td className="px-3 py-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">{row.je_no}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 max-w-xs truncate">{row.narration}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{row.tender_id || "—"}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.cgst)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.sgst)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.igst)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right font-semibold text-rose-700 dark:text-rose-400">₹{fmt(row.total)}</td>
                  </tr>
                ))}
                {!data.rows?.length && (
                  <tr><td colSpan={8} className="text-center py-8 text-sm text-gray-400">No ITC reversals for this period.</td></tr>
                )}
              </tbody>

              {/* Totals footer */}
              {data.rows?.length > 0 && (
                <tfoot><tr className="bg-gray-50 dark:bg-gray-800/50 border-t-2 border-gray-200 dark:border-gray-700">
                  <td colSpan={4} className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300">Total</td>
                  <td className="px-3 py-2 text-xs tabular-nums text-right font-bold text-gray-700 dark:text-gray-200">₹{fmt(totals.cgst)}</td>
                  <td className="px-3 py-2 text-xs tabular-nums text-right font-bold text-gray-700 dark:text-gray-200">₹{fmt(totals.sgst)}</td>
                  <td className="px-3 py-2 text-xs tabular-nums text-right font-bold text-gray-700 dark:text-gray-200">₹{fmt(totals.igst)}</td>
                  <td className="px-3 py-2 text-xs tabular-nums text-right font-bold text-rose-700 dark:text-rose-400">₹{fmt(totals.total)}</td>
                </tr></tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITCReversal;
