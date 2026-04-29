import { useState } from "react";
import { Star, RefreshCw, ChevronRight } from "lucide-react";
import {
  useVendorScorecard, useContractorScorecard,
  useVendorScorecardDetail, useContractorScorecardDetail,
} from "./hooks/useSupplierScorecard";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const scoreColour = (s) => {
  if (s == null) return "text-gray-400";
  if (s >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (s >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-500";
};

const StarRating = ({ score }) => {
  const stars = Math.round((score || 0) / 20);
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={10} className={i <= stars ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
      ))}
    </span>
  );
};

/* ── Detail Drawer ──────────────────────────────────────────────── */
const DetailDrawer = ({ id, type, onClose }) => {
  const vendorQ = useVendorScorecardDetail(type === "vendor" ? id : null);
  const contractorQ = useContractorScorecardDetail(type === "contractor" ? id : null);
  const { data, isLoading } = type === "vendor" ? vendorQ : contractorQ;
  const d = data || {};
  const radarData = Array.isArray(d.kpi_breakdown)
    ? d.kpi_breakdown.map((k) => ({ subject: k.label, value: k.score || 0, fullMark: 100 }))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">{d.name || id}</p>
            <p className="text-[10px] text-gray-400 capitalize">{type}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {isLoading && <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Loading…</div>}
        {!isLoading && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center gap-4">
              <p className={`text-4xl font-extrabold tabular-nums ${scoreColour(d.overall_score)}`}>{d.overall_score != null ? Number(d.overall_score).toFixed(0) : "—"}</p>
              <div>
                <StarRating score={d.overall_score} />
                <p className="text-[10px] text-gray-400 mt-0.5">Overall Score</p>
              </div>
            </div>
            {radarData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" fill="#6366f1" fillOpacity={0.5} stroke="#6366f1" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
            {Array.isArray(d.kpi_breakdown) && (
              <div className="space-y-2">
                {d.kpi_breakdown.map((k) => (
                  <div key={k.key || k.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-36 shrink-0">{k.label}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(k.score || 0, 100)}%` }} />
                    </div>
                    <span className={`text-xs font-bold tabular-nums w-10 text-right ${scoreColour(k.score)}`}>{k.score != null ? Number(k.score).toFixed(0) : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const SupplierScorecard = () => {
  const [type, setType] = useState("vendor");
  const [sortKey, setSortKey] = useState("overall_score");
  const [selected, setSelected] = useState(null);

  const vendorQ = useVendorScorecard();
  const contractorQ = useContractorScorecard();
  const { data, isLoading, refetch } = type === "vendor" ? vendorQ : contractorQ;
  const rows = Array.isArray(data) ? data : [];
  const sorted = [...rows].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

  const idKey = type === "vendor" ? "vendor_id" : "contractor_id";
  const nameKey = type === "vendor" ? "vendor_name" : "contractor_name";

  const cols = type === "vendor"
    ? ["overall_score", "on_time_delivery", "quality_score", "price_score", "compliance_score"]
    : ["overall_score", "on_time_completion", "quality_score", "safety_score", "compliance_score"];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Star size={18} className="text-amber-500" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Supplier Scorecard</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1">
            {["vendor", "contractor"].map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${type === t ? "bg-amber-500 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"}`}>
                {t === "vendor" ? "Vendors" : "Contractors"}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading && (
          <div className="py-12 flex items-center justify-center text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full mr-2" />Loading…
          </div>
        )}

        {!isLoading && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  {cols.map((c) => (
                    <th key={c} onClick={() => setSortKey(c)}
                      className={`px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 ${sortKey === c ? "text-amber-600 dark:text-amber-400" : ""}`}>
                      {c.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r[idKey]} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-2">
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{r[nameKey] || r[idKey]}</p>
                      <StarRating score={r.overall_score} />
                    </td>
                    {cols.map((c) => (
                      <td key={c} className={`px-4 py-2 tabular-nums text-right font-bold ${scoreColour(r[c])}`}>
                        {r[c] != null ? Number(r[c]).toFixed(0) : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => setSelected(r[idKey])} className="p-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600">
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!sorted.length && (
                  <tr><td colSpan={cols.length + 2} className="text-center py-12 text-sm text-gray-400">No scorecard data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <DetailDrawer id={selected} type={type} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default SupplierScorecard;
