import { useState } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { useFundFlow } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const Section = ({ title, rows = [], total, colour }) => (
  <div className="flex-1 min-w-0">
    <div className={`px-4 py-2 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700 ${colour}`}>
      <p className="text-xs font-bold text-gray-700 dark:text-gray-100">{title}</p>
    </div>
    <div className="border border-gray-200 dark:border-gray-700 rounded-b-xl overflow-hidden">
      <table className="w-full text-xs">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
              <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{r.description || r.label}</td>
              <td className="px-4 py-2.5 tabular-nums text-right font-semibold text-gray-700 dark:text-gray-200">₹{fmt(r.amount)}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400">No data</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <td className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200">Total</td>
            <td className="px-4 py-2 tabular-nums text-right font-extrabold text-gray-900 dark:text-white">₹{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

const FundFlow = () => {
  const [params, setParams] = useState({ from_date: "", to_date: "" });
  const [applied, setApplied] = useState({});

  const { data, isLoading, refetch } = useFundFlow(applied);
  const sources = Array.isArray(data?.sources) ? data.sources : [];
  const applications = Array.isArray(data?.applications) ? data.applications : [];
  const summary = data?.summary || {};

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRightLeft size={18} className="text-violet-600 dark:text-violet-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Analytics</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Fund-Flow Statement</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={params.from_date} onChange={(e) => setParams({ ...params, from_date: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          <input type="date" value={params.to_date} onChange={(e) => setParams({ ...params, to_date: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          <button onClick={() => setApplied({ ...params })} className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg">Fetch</button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {isLoading && (
          <div className="py-12 flex items-center justify-center text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-violet-400 border-t-transparent rounded-full mr-2" />Loading…
          </div>
        )}

        {!isLoading && (sources.length > 0 || applications.length > 0) && (
          <>
            {summary.net_change != null && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Sources", value: fmtCompact(summary.total_sources), cls: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Total Applications", value: fmtCompact(summary.total_applications), cls: "text-red-500" },
                  { label: "Net Change in Funds", value: fmtCompact(summary.net_change), cls: summary.net_change >= 0 ? "text-violet-700 dark:text-violet-300" : "text-red-600" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className={`text-xl font-extrabold tabular-nums mt-1 ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 flex-col md:flex-row">
              <Section
                title="Sources of Funds"
                rows={sources}
                total={summary.total_sources}
                colour="bg-emerald-50 dark:bg-emerald-900/20"
              />
              <div className="flex items-center justify-center text-gray-300 dark:text-gray-600 text-2xl font-light md:mt-8">→</div>
              <Section
                title="Applications of Funds"
                rows={applications}
                total={summary.total_applications}
                colour="bg-red-50 dark:bg-red-900/20"
              />
            </div>
          </>
        )}

        {!isLoading && !sources.length && !applications.length && (
          <div className="text-center py-16 text-gray-400">
            <ArrowRightLeft size={44} className="mx-auto opacity-20 mb-3" />
            <p className="text-sm font-semibold">Select a date range and click Fetch to view fund-flow.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundFlow;
