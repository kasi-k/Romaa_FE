import { useState } from "react";
import { FileText, RefreshCw, Download, AlertTriangle } from "lucide-react";
import { useForm26Q } from "./hooks/useFinanceReports";
import { API } from "../../../constant";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const QUARTER_LABELS = { Q1: "Q1 (Apr–Jun)", Q2: "Q2 (Jul–Sep)", Q3: "Q3 (Oct–Dec)", Q4: "Q4 (Jan–Mar)" };
const DUE_DATES = { Q1: "31 Jul", Q2: "31 Oct", Q3: "31 Jan", Q4: "31 May" };

const TABS = ["Summary", "By Section", "By Deductee", "Records"];

const Form26Q = () => {
  const currentFY = (() => {
    const d = new Date();
    const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
  })();

  const [deductor, setDeductor] = useState({ tan: "", name: "", pan: "", address: "" });
  const [params, setParams] = useState({ financial_year: currentFY, quarter: "Q1" });
  const [applied, setApplied] = useState(null);
  const [tab, setTab] = useState("Summary");

  const { data, isLoading, isError, refetch } = useForm26Q(
    applied ? { ...applied, ...deductor } : {}
  );

  const apply = () => setApplied({ ...params });

  const downloadCSV = () => {
    if (!applied) return;
    const q = new URLSearchParams({ ...applied, ...deductor }).toString();
    window.open(`${API}/reports/form-26q/csv?${q}`, "_blank");
  };

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `form26q_${applied?.financial_year}_${applied?.quarter}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto mb-3">
          <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Form 26Q — Quarterly TDS Return (Non-Salary)</h1>
          </div>
        </div>

        {/* Deductor details */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {[
            { key: "tan", placeholder: "Deductor TAN (XXX12345A)" },
            { key: "name", placeholder: "Deductor Name" },
            { key: "pan", placeholder: "Deductor PAN" },
            { key: "address", placeholder: "Deductor Address" },
          ].map(({ key, placeholder }) => (
            <input key={key}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder={placeholder} value={deductor[key]} onChange={(e) => setDeductor({ ...deductor, [key]: e.target.value })}
            />
          ))}
        </div>

        {/* FY + Quarter + Apply */}
        <div className="flex flex-wrap items-center gap-2">
          <input className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 w-24"
            placeholder="FY (25-26)" value={params.financial_year} onChange={(e) => setParams({ ...params, financial_year: e.target.value })} />
          <select value={params.quarter} onChange={(e) => setParams({ ...params, quarter: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
            {QUARTERS.map((q) => <option key={q} value={q}>{QUARTER_LABELS[q]}</option>)}
          </select>
          <button onClick={apply} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">Fetch</button>
          {data && (
            <>
              <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"><Download size={13} />CSV (RPU)</button>
              <button onClick={downloadJSON} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"><Download size={13} />JSON</button>
            </>
          )}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          {data?.due_date && (
            <span className="text-xs text-gray-400">Due: <strong className="text-gray-600 dark:text-gray-300">{data.due_date ? fmtDate(data.due_date) : DUE_DATES[applied?.quarter]}</strong></span>
          )}
        </div>
      </div>

      {isLoading && <div className="flex-1 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {isError && <div className="flex-1 flex items-center justify-center text-sm text-red-500">Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

      {data && (
        <div className="px-6 py-5 space-y-4">
          {/* PAN missing alert */}
          {data.summary?.pan_missing > 0 && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertTriangle size={14} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                <strong>{data.summary.pan_missing}</strong> deductee(s) have no PAN — they attract 20% TDS u/s 206AA and <strong>must be fixed before filing</strong>.
                Check the "Records" tab for details.
              </p>
            </div>
          )}

          {/* Challan note */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Challan fields (BSR code, date, serial number) are blank in this export — fill them at the TDS portal (TRACES / Saral TDS / RPU) before uploading the return file.
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Entries", value: data.summary?.total_entries ?? 0, cls: "text-gray-800 dark:text-white", isNum: true },
              { label: "Total Paid", value: `₹${fmt(data.summary?.total_paid)}`, cls: "text-gray-700 dark:text-gray-200" },
              { label: "TDS Deducted", value: `₹${fmt(data.summary?.total_tds)}`, cls: "text-indigo-700 dark:text-indigo-400" },
              { label: "PAN Missing", value: data.summary?.pan_missing ?? 0, cls: data.summary?.pan_missing > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400", isNum: true },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-base font-extrabold tabular-nums mt-0.5 ${cls}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 w-fit">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {tab === "Summary" && (
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Period</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {fmtDate(data.period?.from)} – {fmtDate(data.period?.to)} &nbsp;·&nbsp; FY {data.financial_year} &nbsp;·&nbsp; {QUARTER_LABELS[data.quarter]}
                  </p>
                </div>
                {data.notes?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                    <ul className="space-y-1">
                      {data.notes.map((n, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"><span className="text-indigo-400 mt-0.5">•</span>{n}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {tab === "By Section" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Section", "# Entries", "Total Paid", "TDS"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.by_section?.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400">{r.section_code}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">{r.entry_count}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.total_paid)}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right font-bold text-indigo-700 dark:text-indigo-400">₹{fmt(r.total_tds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "By Deductee" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Deductee", "PAN", "Section", "# Entries", "Total Paid", "TDS"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.by_deductee?.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">{r.deductee_name}</td>
                      <td className="px-4 py-2 text-xs font-mono">{r.pan || <span className="text-red-500 font-bold">MISSING</span>}</td>
                      <td className="px-4 py-2 text-xs text-indigo-700 dark:text-indigo-400 font-semibold">{r.section_code}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">{r.entry_count}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.total_paid)}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right font-bold text-indigo-700 dark:text-indigo-400">₹{fmt(r.total_tds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "Records" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Sl.", "PAN", "Deductee", "Section", "Payment Date", "Amount Paid", "TDS Rate", "TDS", "Voucher"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.deductee_records?.map((r) => (
                    <tr key={r.sl_no} className={`border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 ${!r.pan ? "bg-red-50/30 dark:bg-red-900/10" : ""}`}>
                      <td className="px-3 py-2 text-xs text-gray-400">{r.sl_no}</td>
                      <td className="px-3 py-2 text-xs font-mono">
                        {r.pan ? <span className="text-gray-700 dark:text-gray-200">{r.pan}</span> : <span className="text-red-500 font-bold">MISSING</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200">{r.deductee_name}</td>
                      <td className="px-3 py-2 text-xs text-indigo-700 dark:text-indigo-400 font-semibold">{r.section_code}</td>
                      <td className="px-3 py-2 text-xs text-gray-500 text-right">{fmtDate(r.payment_date)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.amount_paid)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">{r.tds_rate_pct}%</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right font-semibold text-indigo-700 dark:text-indigo-400">₹{fmt(r.tds_amount)}</td>
                      <td className="px-3 py-2 text-xs font-mono text-gray-400">{r.voucher_no}</td>
                    </tr>
                  ))}
                  {!data.deductee_records?.length && <tr><td colSpan={9} className="text-center py-8 text-sm text-gray-400">No records for this period.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {!data && !isLoading && !isError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <FileText size={44} className="opacity-20" />
          <p className="text-sm font-semibold">Enter deductor details above and click Fetch to generate the 26Q report.</p>
        </div>
      )}
    </div>
  );
};

export default Form26Q;
