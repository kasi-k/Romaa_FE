import { useState } from "react";
import { FileInput, RefreshCw, Download } from "lucide-react";
import { useGSTR2B } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fyStart = () => {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-04-01`;
};

const SourceTile = ({ label, count, color }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-4 ${color}`}>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-extrabold tabular-nums text-gray-800 dark:text-white mt-1">{count ?? 0}</p>
    <p className="text-[10px] text-gray-400 mt-0.5">documents</p>
  </div>
);

const GSTR2B = () => {
  const [fromDate, setFromDate] = useState(fyStart());
  const [toDate,   setToDate]   = useState(new Date().toISOString().slice(0, 10));
  const [applied,  setApplied]  = useState({ from_date: fyStart(), to_date: new Date().toISOString().slice(0, 10) });

  const { data, isLoading, isError, refetch } = useGSTR2B(applied);
  const summary = data?.summary || {};
  const sources = data?.sources || {};

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gstr2b_${applied.from_date}_${applied.to_date}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <FileInput size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · GST</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">GSTR-2B — Inward ITC</h1>
          </div>
        </div>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400" />
        <button onClick={() => setApplied({ from_date: fromDate, to_date: toDate })} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        {data && <button onClick={downloadJSON} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Download size={13} />JSON</button>}
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="px-6 py-4 space-y-4">
          {/* Source tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SourceTile label="Purchase Bills" count={sources.purchase_bills} color="border-indigo-200 dark:border-indigo-800" />
            <SourceTile label="Debit Notes" count={sources.debit_notes} color="border-amber-200 dark:border-amber-800" />
            <SourceTile label="Expense Vouchers w/ GST" count={sources.expense_vouchers_with_gst} color="border-teal-200 dark:border-teal-800" />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Taxable", value: summary.total_taxable },
              { label: "CGST ITC", value: summary.total_cgst },
              { label: "SGST ITC", value: summary.total_sgst },
              { label: "IGST ITC", value: summary.total_igst },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-base font-extrabold tabular-nums text-gray-800 dark:text-white mt-0.5">₹{fmt(value)}</p>
              </div>
            ))}
          </div>

          {/* Vendor table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Vendor-wise ITC</span>
            </div>
            <table className="w-full">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                {["Vendor", "GSTIN", "# Invoices", "Taxable", "CGST", "SGST", "IGST", "Total Value"].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {data.vendors?.rows?.map((v, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 font-medium">{v.vendor_name}</td>
                    <td className="px-3 py-2 text-xs font-mono text-gray-500">{v.vendor_gstin || "—"}</td>
                    <td className="px-3 py-2 text-xs text-right text-gray-500">{v.invoice_count}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(v.taxable)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(v.cgst)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(v.sgst)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(v.igst)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-right font-semibold text-gray-800 dark:text-white">₹{fmt(v.total_value)}</td>
                  </tr>
                ))}
                {!data.vendors?.rows?.length && (
                  <tr><td colSpan={8} className="text-center py-6 text-sm text-gray-400">No vendor data.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Rate slab table */}
          {data.rate_slabs?.rows?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Rate-wise ITC</span>
              </div>
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Rate %", "Taxable", "CGST", "SGST", "IGST"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.rate_slabs.rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">{r.rate_pct}%</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.taxable)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(r.cgst)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(r.sgst)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(r.igst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GSTR2B;
