import { useState } from "react";
import { Clock, RefreshCw, Download } from "lucide-react";
import { useARAgingReport, useAPAgingReport } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const BUCKETS = [
  { key: "not_due",   label: "Not Due",    cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" },
  { key: "d_0_30",    label: "0–30 Days",  cls: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700" },
  { key: "d_31_60",   label: "31–60 Days", cls: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700" },
  { key: "d_61_90",   label: "61–90 Days", cls: "text-red-500 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700" },
  { key: "d_90_plus", label: "90+ Days",   cls: "text-red-700 dark:text-red-300 font-extrabold", bg: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700" },
];

const downloadJSON = (data, prefix) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${prefix}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
};

const useAgingData = (mode, applied) => {
  const arResult = useARAgingReport(mode === "AR" ? applied : {});
  const apResult = useAPAgingReport(mode === "AP" ? applied : {});
  return mode === "AR" ? arResult : apResult;
};

/* ── Aging Panel ──────────────────────────────────────────────────── */
const AgingPanel = ({ mode }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [asOf, setAsOf] = useState(today);
  const [applied, setApplied] = useState({ as_of: today });

  const { data, isLoading, isError, refetch } = useAgingData(mode, applied);

  const buckets = data?.buckets || {};
  const grand_total = data?.grand_total || 0;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-semibold">As of</label>
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" />
          <button onClick={() => setApplied({ as_of: asOf })} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg">Apply</button>
        </div>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={14} /></button>
        {data && <button onClick={() => downloadJSON(data, mode === "AR" ? "ar_aging" : "ap_aging")} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"><Download size={13} />JSON</button>}
      </div>

      {isLoading && <div className="flex items-center justify-center py-16 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-orange-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {isError && <div className="flex items-center justify-center py-16 text-sm text-red-500">Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

      {data && (
        <>
          {/* Bucket tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {BUCKETS.map(({ key, label, cls, bg }) => (
              <div key={key} className={`rounded-xl border shadow-sm p-3 ${bg}`}>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-base font-extrabold tabular-nums mt-0.5 ${cls}`}>{fmtCompact(buckets[key])}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-500">Grand Total Outstanding</span>
            <span className="text-sm font-extrabold text-red-600 dark:text-red-400 tabular-nums">₹{fmt(grand_total)}</span>
          </div>

          {/* By-party summary */}
          {data.by_party?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
              <p className="px-4 pt-3 pb-2 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">By Party</p>
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Party", "Total", "Not Due", "0–30d", "31–60d", "61–90d", "90+d"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.by_party.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">{p.party_name}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-gray-800 dark:text-white">₹{fmt(p.total)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">₹{fmt(p.not_due)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-amber-600 dark:text-amber-400">₹{fmt(p.d_0_30)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-orange-600 dark:text-orange-400">₹{fmt(p.d_31_60)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-red-500 dark:text-red-400">₹{fmt(p.d_61_90)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-red-700 dark:text-red-300 font-bold">₹{fmt(p.d_90_plus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail rows */}
          {data.rows?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
              <p className="px-4 pt-3 pb-2 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">Invoice Detail</p>
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Bill ID", "Party", "Tender", "Bill Date", "Due Date", "Net", "Received", "Balance", "Days", "Bucket"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.rows.map((r, i) => {
                    const bucket = BUCKETS.find((b) => b.key === r.bucket);
                    return (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-3 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.bill_id}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{r.party_name}</td>
                        <td className="px-3 py-2 text-gray-500">{r.tender_id || "—"}</td>
                        <td className="px-3 py-2 text-gray-500 text-right">{fmtDate(r.bill_date)}</td>
                        <td className="px-3 py-2 text-gray-500 text-right">{fmtDate(r.due_date)}</td>
                        <td className="px-3 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.net_amount)}</td>
                        <td className="px-3 py-2 tabular-nums text-right text-emerald-600 dark:text-emerald-400">₹{fmt(r.amount_received)}</td>
                        <td className="px-3 py-2 tabular-nums text-right font-semibold text-red-600 dark:text-red-400">₹{fmt(r.balance_due)}</td>
                        <td className="px-3 py-2 tabular-nums text-right text-gray-600 dark:text-gray-300">{r.days_overdue ?? 0}d</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bucket?.bg || ""} ${bucket?.cls || ""}`}>{bucket?.label || r.bucket}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const AgingReports = () => {
  const [tab, setTab] = useState("AR");

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-orange-600 dark:text-orange-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Reports</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Aging Reports</h1>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
          {[
            { key: "AR", label: "AR — Receivables" },
            { key: "AP", label: "AP — Payables" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === key ? "bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        <AgingPanel key={tab} mode={tab} />
      </div>
    </div>
  );
};

export default AgingReports;
