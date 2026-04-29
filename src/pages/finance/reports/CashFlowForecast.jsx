import { useState } from "react";
import { TrendingDown, RefreshCw, AlertTriangle } from "lucide-react";
import { useCashFlowForecast } from "./hooks/useFinanceReports";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {fmtCompact(p.value)}
        </p>
      ))}
    </div>
  );
};

const CashFlowForecast = () => {
  const [params, setParams] = useState({ horizon_days: 90, credit_days: 30 });
  const [applied, setApplied] = useState({ horizon_days: 90, credit_days: 30 });

  const { data, isLoading, refetch } = useCashFlowForecast(applied);
  const buckets = Array.isArray(data?.buckets) ? data.buckets : [];
  const summary = data?.summary || {};
  const warnings = Array.isArray(data?.low_balance_warnings) ? data.low_balance_warnings : [];

  const chartData = buckets.map((b) => ({
    label: b.bucket_label || b.bucket,
    inflow: b.inflow || 0,
    outflow: b.outflow || 0,
    net: b.net_flow || 0,
    balance: b.running_balance || 0,
  }));

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={18} className="text-sky-600 dark:text-sky-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Analytics</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Cash-Flow Forecast</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Horizon (days)</span>
            <input type="number" value={params.horizon_days} onChange={(e) => setParams({ ...params, horizon_days: +e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-20" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Credit Days</span>
            <input type="number" value={params.credit_days} onChange={(e) => setParams({ ...params, credit_days: +e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-20" />
          </div>
          <button onClick={() => setApplied({ ...params })} className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg">Generate</button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {isLoading && (
          <div className="py-12 flex items-center justify-center text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-sky-400 border-t-transparent rounded-full mr-2" />Loading…
          </div>
        )}

        {!isLoading && summary.opening_balance != null && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Opening Balance", value: fmtCompact(summary.opening_balance), cls: "text-gray-700 dark:text-gray-200" },
              { label: "Total Inflows", value: fmtCompact(summary.total_inflow), cls: "text-emerald-600 dark:text-emerald-400" },
              { label: "Total Outflows", value: fmtCompact(summary.total_outflow), cls: "text-red-500" },
              { label: "Closing Balance", value: fmtCompact(summary.closing_balance), cls: summary.closing_balance >= 0 ? "text-sky-700 dark:text-sky-300" : "text-red-600" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-lg font-extrabold tabular-nums mt-1 ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-3 space-y-1">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle size={13} /> {warnings.length} Low-Balance Warning{warnings.length > 1 ? "s" : ""}
            </p>
            {warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
                {w.bucket_label || w.bucket}: balance {fmtCompact(w.balance)} — below threshold {fmtCompact(w.threshold)}
              </p>
            ))}
          </div>
        )}

        {!isLoading && chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-4">Cash-Flow by Period</p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmtCompact(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
                <Bar dataKey="inflow" name="Inflow" fill="#10b981" opacity={0.8} radius={[3, 3, 0, 0]} />
                <Bar dataKey="outflow" name="Outflow" fill="#ef4444" opacity={0.8} radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="balance" name="Running Balance" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {!isLoading && buckets.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Period", "Inflow", "Outflow", "Net Flow", "Running Balance"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buckets.map((b, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{b.bucket_label || b.bucket}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-emerald-600">₹{fmt(b.inflow)}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-red-500">₹{fmt(b.outflow)}</td>
                    <td className={`px-4 py-2 tabular-nums text-right font-semibold ${(b.net_flow || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>₹{fmt(b.net_flow)}</td>
                    <td className={`px-4 py-2 tabular-nums text-right font-bold ${(b.running_balance || 0) >= 0 ? "text-sky-600 dark:text-sky-400" : "text-red-600"}`}>₹{fmt(b.running_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !buckets.length && (
          <div className="text-center py-16 text-gray-400">
            <TrendingDown size={44} className="mx-auto opacity-20 mb-3" />
            <p className="text-sm font-semibold">Set horizon & credit days, then click Generate.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowForecast;
