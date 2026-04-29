import { useState } from "react";
import { FileText, RefreshCw, Download, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { useGSTR9 } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

/* ── Section Block ────────────────────────────────────────────────── */
const SectionBlock = ({ title, rows }) => {
  const [open, setOpen] = useState(true);
  if (!rows?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-left">
        {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{title}</span>
      </button>
      {open && (
        <table className="w-full text-xs">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                <td className="px-5 py-2 text-gray-600 dark:text-gray-300">{r.label || r.description || r.nature}</td>
                <td className="px-5 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">{r.taxable_value !== undefined ? `₹${fmt(r.taxable_value)}` : ""}</td>
                <td className="px-5 py-2 tabular-nums text-right text-gray-500">{r.cgst !== undefined ? `₹${fmt(r.cgst)}` : ""}</td>
                <td className="px-5 py-2 tabular-nums text-right text-gray-500">{r.sgst !== undefined ? `₹${fmt(r.sgst)}` : ""}</td>
                <td className="px-5 py-2 tabular-nums text-right font-semibold text-indigo-600 dark:text-indigo-400">{r.igst !== undefined ? `₹${fmt(r.igst)}` : ""}</td>
                <td className="px-5 py-2 tabular-nums text-right font-semibold text-gray-700 dark:text-gray-200">{r.total !== undefined ? `₹${fmt(r.total)}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/* ── Reconciliation Warnings ──────────────────────────────────────── */
const ReconciliationWarnings = ({ items }) => {
  if (!items?.length) return null;
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
      <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-3">Reconciliation Warnings</p>
      <div className="space-y-2">
        {items.map((w, i) => (
          <div key={i} className="flex flex-wrap gap-4 text-xs">
            <span className="font-semibold text-amber-800 dark:text-amber-200">{w.field}</span>
            <span className="text-gray-500">Expected: <strong className="text-gray-700 dark:text-gray-200">₹{fmt(w.expected)}</strong></span>
            <span className="text-gray-500">Actual: <strong className="text-amber-700 dark:text-amber-300">₹{fmt(w.actual)}</strong></span>
            <span className="text-red-600 dark:text-red-400">Δ ₹{fmt(Math.abs((w.expected || 0) - (w.actual || 0)))}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const GSTR9 = () => {
  const currentFY = (() => {
    const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
  })();

  const [params, setParams] = useState({ financial_year: currentFY });
  const [applied, setApplied] = useState(null);

  const { data, isLoading, isError, refetch } = useGSTR9(applied || {});
  const apply = () => setApplied({ ...params });

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `GSTR-9_${applied?.financial_year}.json`; a.click();
  };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <FileText size={18} className="text-teal-600 dark:text-teal-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · GST</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">GSTR-9 — Annual GST Return</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400 w-24"
            placeholder="FY (25-26)" value={params.financial_year} onChange={(e) => setParams({ financial_year: e.target.value })} />
          <button onClick={apply} className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg">Fetch</button>
          {data && <button onClick={downloadJSON} className="flex items-center gap-1.5 px-3 py-1.5 border border-teal-200 dark:border-teal-700 rounded-lg text-sm text-teal-600 hover:bg-teal-50"><Download size={13} />Export JSON (CA)</button>}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      {isLoading && <div className="flex-1 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-teal-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {isError && <div className="flex-1 flex items-center justify-center text-sm text-red-500">Failed. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

      {data && (
        <div className="px-6 py-5 space-y-4">
          <ReconciliationWarnings items={data.reconciliation?.filter((r) => Math.abs((r.expected || 0) - (r.actual || 0)) > 1)} />

          <SectionBlock title="Pt. II — Table 4: Outward Supplies" rows={data.pt2_outward} />
          <SectionBlock title="Pt. III — Table 6: ITC Availed" rows={data.pt3_itc} />
          <SectionBlock title="Pt. IV — Table 9: Tax Paid vs. Payable" rows={data.pt4_tax_paid} />
          {data.pt5_prev_fy?.length > 0 && <SectionBlock title="Pt. V — Prior FY Amendments" rows={data.pt5_prev_fy} />}
          {data.pt6_other?.length > 0 && <SectionBlock title="Pt. VI — Refunds, Demands, Fees" rows={data.pt6_other} />}

          {/* Reconciliation summary table */}
          {data.reconciliation?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Full Reconciliation</p>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Field", "Expected", "Actual", "Difference", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.reconciliation.map((r, i) => {
                    const diff = (r.actual || 0) - (r.expected || 0);
                    return (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.field}</td>
                        <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.expected)}</td>
                        <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.actual)}</td>
                        <td className={`px-4 py-2 tabular-nums text-right font-semibold ${Math.abs(diff) > 1 ? "text-red-600" : "text-emerald-600"}`}>{diff >= 0 ? "+" : ""}₹{fmt(diff)}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${Math.abs(diff) <= 1 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                            {Math.abs(diff) <= 1 ? "OK" : "MISMATCH"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!data && !isLoading && !isError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <FileText size={44} className="opacity-20" />
          <p className="text-sm font-semibold">Enter the financial year and click Fetch to load GSTR-9.</p>
        </div>
      )}
    </div>
  );
};

export default GSTR9;
