import { useState } from "react";
import { Receipt, RefreshCw, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTDSRegister } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fyStart = () => {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-04-01`;
};

const SECTIONS = ["194C", "194J", "194I", "194Q"];
const TABS = ["Entries", "By Section", "By Deductee", "By Month"];

const TDSRegister = () => {
  const [fromDate, setFromDate] = useState(fyStart());
  const [toDate,   setToDate]   = useState(new Date().toISOString().slice(0, 10));
  const [section,  setSection]  = useState("");
  const [applied,  setApplied]  = useState({ from_date: fyStart(), to_date: new Date().toISOString().slice(0, 10) });
  const [tab,      setTab]      = useState("Entries");

  const { data, isLoading, isError, refetch } = useTDSRegister(applied);
  const summary = data?.summary || {};

  const apply = () => {
    const p = { from_date: fromDate, to_date: toDate };
    if (section) p.section = section;
    setApplied(p);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tds_register_${applied.from_date}_${applied.to_date}.json`;
    a.click();
  };

  const TRACKABLE_TYPES = ["Vendor", "Contractor", "Client", "Employee"];
  const missingPAN = data?.rows?.filter(
    (r) => !r.deductee_pan && TRACKABLE_TYPES.includes(r.deductee_type)
  );

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Receipt size={18} className="text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">TDS Register / 26Q</h1>
          </div>
        </div>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-400" />
        <select value={section} onChange={(e) => setSection(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-400">
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={apply} className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        {data && <button onClick={downloadJSON} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Download size={13} />JSON</button>}
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {/* Missing PAN warning */}
      {missingPAN?.length > 0 && (
        <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">
            {missingPAN.length} deductee(s) have no PAN — PAN is mandatory for 26Q filing. Update Vendor / Contractor masters.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="px-6 py-4 space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Entries</p>
              <p className="text-xl font-extrabold text-gray-800 dark:text-white mt-0.5">{summary.total_entries ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Gross Amount</p>
              <p className="text-base font-extrabold tabular-nums text-gray-800 dark:text-white mt-0.5">₹{fmt(summary.total_gross)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">TDS Deducted</p>
              <p className="text-base font-extrabold tabular-nums text-amber-700 dark:text-amber-400 mt-0.5">₹{fmt(summary.total_tds)}</p>
            </div>
            <div className={`rounded-xl border shadow-sm p-3 ${summary.is_reconciled ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"}`}>
              <div className="flex items-center gap-1.5">
                {summary.is_reconciled
                  ? <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                  : <AlertTriangle size={12} className="text-amber-600 dark:text-amber-400" />}
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ledger Credit</p>
              </div>
              <p className="text-base font-extrabold tabular-nums text-gray-800 dark:text-white mt-0.5">₹{fmt(summary.ledger_credit)}</p>
              {!summary.is_reconciled && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">Diff: ₹{fmt(summary.ledger_diff)}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 w-fit">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-amber-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {tab === "Entries" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Date", "Voucher", "Deductee", "PAN", "GSTIN", "Section", "TDS %", "Gross", "TDS", "Net Paid"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.rows?.map((r, i) => {
                    const panRequired = TRACKABLE_TYPES.includes(r.deductee_type);
                    const panMissing  = panRequired && !r.deductee_pan;
                    return (
                    <tr key={i} className={`border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors ${panMissing ? "bg-red-50/30 dark:bg-red-900/10" : ""}`}>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          {panMissing && (
                            <span title="PAN missing on master — required for TDS return" className="w-2 h-2 rounded-full bg-red-500 shrink-0 cursor-help" />
                          )}
                          {fmtDate(r.payment_date)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">{r.voucher_no}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200">{r.deductee_name}</td>
                      <td className="px-3 py-2 text-xs font-mono">{r.deductee_pan ? <span className="text-gray-700 dark:text-gray-200">{r.deductee_pan}</span> : <span className="text-red-500 font-semibold" title={panRequired ? "PAN missing on master — required for TDS return" : undefined}>MISSING</span>}</td>
                      <td className="px-3 py-2 text-xs font-mono text-gray-500">{r.deductee_gstin || "—"}</td>
                      <td className="px-3 py-2 text-xs"><span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-[10px] font-semibold">{r.tds_section}</span></td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">{r.tds_pct}%</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.gross_amount)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-amber-700 dark:text-amber-400 font-semibold">₹{fmt(r.tds_amount)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.net_paid)}</td>
                    </tr>
                    );
                  })}
                  {!data.rows?.length && <tr><td colSpan={10} className="text-center py-8 text-sm text-gray-400">No TDS entries.</td></tr>}
                </tbody>
              </table>
            )}

            {tab === "By Section" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Section", "# Entries", "Gross", "TDS"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.by_section?.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">{r.section}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">{r.count}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.gross)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right font-bold text-amber-700 dark:text-amber-400">₹{fmt(r.tds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "By Deductee" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Deductee", "PAN", "Section", "# Entries", "Gross", "TDS"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.by_deductee?.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 font-medium">{r.deductee_name}</td>
                      <td className="px-3 py-2 text-xs font-mono">{r.deductee_pan || <span className="text-red-500 font-semibold">MISSING</span>}</td>
                      <td className="px-3 py-2 text-xs text-amber-700 dark:text-amber-400 font-semibold">{r.section}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">{r.count}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.gross)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right font-bold text-amber-700 dark:text-amber-400">₹{fmt(r.tds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "By Month" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Month", "# Entries", "Gross", "TDS"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.by_month?.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">{r.month}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">{r.count}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.gross)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right font-bold text-amber-700 dark:text-amber-400">₹{fmt(r.tds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TDSRegister;
