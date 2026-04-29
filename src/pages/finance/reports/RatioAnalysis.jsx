import { useState } from "react";
import { BarChart2, RefreshCw } from "lucide-react";
import { useRatioAnalysis } from "./hooks/useFinanceReports";

const fmtRatio = (v) => (v == null ? "—" : Number(v).toFixed(2));

const trafficLight = (value, benchmark, higherIsBetter = true) => {
  if (value == null || benchmark == null) return { dot: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800" };
  const good = higherIsBetter ? value >= benchmark : value <= benchmark;
  const warn = higherIsBetter ? value >= benchmark * 0.7 : value <= benchmark * 1.3;
  if (good) return { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  if (warn) return { dot: "bg-amber-400", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" };
  return { dot: "bg-red-500", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" };
};

const RatioCard = ({ ratio }) => {
  const tl = trafficLight(ratio.value, ratio.benchmark, ratio.higher_is_better !== false);
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 ${tl.bg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{ratio.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{ratio.description}</p>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${tl.dot}`} />
      </div>
      <p className={`text-2xl font-extrabold tabular-nums ${tl.text}`}>{fmtRatio(ratio.value)}</p>
      {ratio.benchmark != null && (
        <p className="text-[10px] text-gray-400 mt-1">Benchmark: {fmtRatio(ratio.benchmark)}</p>
      )}
      {ratio.formula && (
        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1 font-mono">{ratio.formula}</p>
      )}
    </div>
  );
};

const RatioGroup = ({ group }) => (
  <div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{group.group}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {(group.ratios || []).map((r) => <RatioCard key={r.key || r.name} ratio={r} />)}
    </div>
  </div>
);

const RatioAnalysis = () => {
  const [params, setParams] = useState({ as_of_date: new Date().toISOString().slice(0, 10), financial_year: "" });
  const [applied, setApplied] = useState({ as_of_date: new Date().toISOString().slice(0, 10) });

  const { data, isLoading, refetch } = useRatioAnalysis(applied);
  const groups = Array.isArray(data) ? data : Array.isArray(data?.groups) ? data.groups : [];

  const currentFY = (() => {
    const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
  })();

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={18} className="text-orange-600 dark:text-orange-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Analytics</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Ratio Analysis</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">As of</span>
            <input type="date" value={params.as_of_date} onChange={(e) => setParams({ ...params, as_of_date: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">FY</span>
            <input value={params.financial_year} onChange={(e) => setParams({ ...params, financial_year: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-24" placeholder={currentFY} />
          </div>
          <button onClick={() => setApplied({ ...params })} className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg">Compute</button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-400">
            {[["bg-emerald-500", "Good"], ["bg-amber-400", "Near"], ["bg-red-500", "Below"]].map(([dot, lbl]) => (
              <span key={lbl} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${dot}`} />{lbl}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {isLoading && (
          <div className="py-12 flex items-center justify-center text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-orange-400 border-t-transparent rounded-full mr-2" />Computing ratios…
          </div>
        )}

        {!isLoading && groups.length > 0 && groups.map((g, i) => <RatioGroup key={i} group={g} />)}

        {!isLoading && !groups.length && (
          <div className="text-center py-16 text-gray-400">
            <BarChart2 size={44} className="mx-auto opacity-20 mb-3" />
            <p className="text-sm font-semibold">Set date / FY and click Compute to view financial ratios.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatioAnalysis;
