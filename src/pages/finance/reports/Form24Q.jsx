import { useState } from "react";
import { FileText, RefreshCw, Download, AlertTriangle } from "lucide-react";
import { useForm24Q } from "./hooks/useFinanceReports";
import { API } from "../../../constant";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const QUARTER_LABELS = { Q1: "Q1 (Apr–Jun)", Q2: "Q2 (Jul–Sep)", Q3: "Q3 (Oct–Dec)", Q4: "Q4 (Jan–Mar)" };

const TABS = ["Summary", "By Employee", "Records"];

const Form24Q = () => {
  const currentFY = (() => {
    const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
  })();

  const [deductor, setDeductor] = useState({ tan: "", name: "", pan: "", address: "" });
  const [params, setParams] = useState({ financial_year: currentFY, quarter: "Q1" });
  const [applied, setApplied] = useState(null);
  const [tab, setTab] = useState("Summary");

  const { data, isLoading, isError, refetch } = useForm24Q(applied ? { ...applied, ...deductor } : {});
  const apply = () => setApplied({ ...params });

  const downloadCSV = () => {
    if (!applied) return;
    const q = new URLSearchParams({ ...applied, ...deductor }).toString();
    window.open(`${API}/reports/form-24q/csv?${q}`, "_blank");
  };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto mb-3">
          <FileText size={18} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Form 24Q — Quarterly TDS Return (Salary)</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {[{ key: "tan", placeholder: "Deductor TAN" }, { key: "name", placeholder: "Deductor Name" }, { key: "pan", placeholder: "Deductor PAN" }, { key: "address", placeholder: "Deductor Address" }].map(({ key, placeholder }) => (
            <input key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder={placeholder} value={deductor[key]} onChange={(e) => setDeductor({ ...deductor, [key]: e.target.value })} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-24"
            placeholder="FY (25-26)" value={params.financial_year} onChange={(e) => setParams({ ...params, financial_year: e.target.value })} />
          <select value={params.quarter} onChange={(e) => setParams({ ...params, quarter: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400">
            {QUARTERS.map((q) => <option key={q} value={q}>{QUARTER_LABELS[q]}</option>)}
          </select>
          <button onClick={apply} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Fetch</button>
          {data && <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50"><Download size={13} />CSV (RPU)</button>}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      {isLoading && <div className="flex-1 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {isError && <div className="flex-1 flex items-center justify-center text-sm text-red-500">Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

      {data && (
        <div className="px-6 py-5 space-y-4">
          {data.summary?.pan_missing > 0 && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium"><strong>{data.summary.pan_missing}</strong> employee(s) missing PAN — 20% TDS applies (Sec 206AA).</p>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Employees", value: data.summary?.total_entries ?? 0 },
              { label: "Total Salary Paid", value: `₹${fmt(data.summary?.total_paid)}` },
              { label: "TDS Deducted", value: `₹${fmt(data.summary?.total_tds)}`, cls: "text-blue-700 dark:text-blue-400" },
              { label: "PAN Missing", value: data.summary?.pan_missing ?? 0, cls: data.summary?.pan_missing > 0 ? "text-red-600" : "text-emerald-600" },
            ].map(({ label, value, cls = "text-gray-800 dark:text-white" }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-base font-extrabold tabular-nums mt-0.5 ${cls}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 w-fit">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{t}</button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {tab === "Summary" && (
              <div className="p-5">
                <p className="text-xs text-gray-600 dark:text-gray-300">Period: {fmtDate(data.period?.from)} – {fmtDate(data.period?.to)} &nbsp;·&nbsp; FY {data.financial_year} &nbsp;·&nbsp; {QUARTER_LABELS[data.quarter]}</p>
                {data.notes?.map((n, i) => <p key={i} className="text-xs text-gray-500 mt-1">• {n}</p>)}
              </div>
            )}
            {tab === "By Employee" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Employee", "PAN", "Salary Paid", "Exemptions", "Taxable", "TDS"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.by_employee?.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">{r.employee_name}</td>
                      <td className="px-4 py-2 text-xs font-mono">{r.pan || <span className="text-red-500 font-bold">MISSING</span>}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right">₹{fmt(r.total_salary)}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right text-gray-500">₹{fmt(r.exemptions)}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.taxable_income)}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-right font-bold text-blue-700 dark:text-blue-400">₹{fmt(r.tds_amount)}</td>
                    </tr>
                  ))}
                  {!data.by_employee?.length && <tr><td colSpan={6} className="text-center py-8 text-sm text-gray-400">No records.</td></tr>}
                </tbody>
              </table>
            )}
            {tab === "Records" && (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Sl.", "Employee", "PAN", "Month", "Salary", "TDS", "Voucher"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.deductee_records?.map((r) => (
                    <tr key={r.sl_no} className={`border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 ${!r.pan ? "bg-red-50/30" : ""}`}>
                      <td className="px-3 py-2 text-xs text-gray-400">{r.sl_no}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200">{r.deductee_name}</td>
                      <td className="px-3 py-2 text-xs font-mono">{r.pan || <span className="text-red-500 font-bold">MISSING</span>}</td>
                      <td className="px-3 py-2 text-xs text-right text-gray-500">{fmtDate(r.payment_date)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right">₹{fmt(r.amount_paid)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums text-right font-semibold text-blue-700 dark:text-blue-400">₹{fmt(r.tds_amount)}</td>
                      <td className="px-3 py-2 text-xs font-mono text-gray-400">{r.voucher_no}</td>
                    </tr>
                  ))}
                  {!data.deductee_records?.length && <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No records.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {!data && !isLoading && !isError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <FileText size={44} className="opacity-20" />
          <p className="text-sm font-semibold">Enter deductor details above and click Fetch.</p>
        </div>
      )}
    </div>
  );
};

export default Form24Q;
