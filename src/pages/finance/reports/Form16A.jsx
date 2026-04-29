import { useState } from "react";
import { FileText, RefreshCw, Download, Printer } from "lucide-react";
import { useForm16A } from "./hooks/useFinanceReports";
import { API } from "../../../constant";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const QUARTER_LABELS = { Q1: "Q1 (Apr–Jun)", Q2: "Q2 (Jul–Sep)", Q3: "Q3 (Oct–Dec)", Q4: "Q4 (Jan–Mar)" };

const Form16A = () => {
  const currentFY = (() => {
    const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
  })();

  const [deductor, setDeductor] = useState({ tan: "", name: "", pan: "", address: "" });
  const [params, setParams] = useState({ financial_year: currentFY, quarter: "Q1", deductee_id: "", section: "" });
  const [applied, setApplied] = useState(null);

  const { data, isLoading, isError, refetch } = useForm16A(applied ? { ...applied, ...deductor } : {});
  const apply = () => setApplied({ ...params });

  const inp = "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Form 16A — Quarterly TDS Certificate (Non-Salary)</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {[{ key: "tan", placeholder: "Deductor TAN" }, { key: "name", placeholder: "Deductor Name" }, { key: "pan", placeholder: "Deductor PAN" }, { key: "address", placeholder: "Deductor Address" }].map(({ key, placeholder }) => (
            <input key={key} className={inp} placeholder={placeholder} value={deductor[key]} onChange={(e) => setDeductor({ ...deductor, [key]: e.target.value })} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input className={`${inp} w-24`} placeholder="FY (25-26)" value={params.financial_year} onChange={(e) => setParams({ ...params, financial_year: e.target.value })} />
          <select value={params.quarter} onChange={(e) => setParams({ ...params, quarter: e.target.value })} className={inp}>
            {QUARTERS.map((q) => <option key={q} value={q}>{QUARTER_LABELS[q]}</option>)}
          </select>
          <input className={`${inp} w-48`} placeholder="Deductee ID (optional)" value={params.deductee_id} onChange={(e) => setParams({ ...params, deductee_id: e.target.value })} />
          <input className={`${inp} w-24`} placeholder="Section (e.g. 194C)" value={params.section} onChange={(e) => setParams({ ...params, section: e.target.value })} />
          <button onClick={apply} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Fetch</button>
          {data && <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50"><Printer size={13} />Print</button>}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      {isLoading && <div className="flex-1 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {isError && <div className="flex-1 flex items-center justify-center text-sm text-red-500">Failed. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

      {data && (
        <div className="px-6 py-5 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                {["Deductee", "PAN", "Section", "Period", "Amount Paid", "TDS Rate", "TDS", "Challan No."].map((h) => (
                  <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(Array.isArray(data) ? data : data.certificates || []).map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.deductee_name}</td>
                    <td className="px-4 py-2 font-mono">{r.pan || <span className="text-red-500 font-bold">MISSING</span>}</td>
                    <td className="px-4 py-2 font-semibold text-indigo-700 dark:text-indigo-400">{r.section_code}</td>
                    <td className="px-4 py-2 text-right text-gray-500">{fmtDate(r.period_from)} – {fmtDate(r.period_to)}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.amount_paid)}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-gray-500">{r.tds_rate_pct}%</td>
                    <td className="px-4 py-2 tabular-nums text-right font-bold text-blue-700 dark:text-blue-400">₹{fmt(r.tds_amount)}</td>
                    <td className="px-4 py-2 font-mono text-gray-400 text-right">{r.challan_no || "—"}</td>
                  </tr>
                ))}
                {!(Array.isArray(data) ? data : data.certificates || []).length && (
                  <tr><td colSpan={8} className="text-center py-8 text-sm text-gray-400">No records for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!data && !isLoading && !isError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <FileText size={44} className="opacity-20" />
          <p className="text-sm font-semibold">Enter deductor details and click Fetch.</p>
        </div>
      )}
    </div>
  );
};

export default Form16A;
