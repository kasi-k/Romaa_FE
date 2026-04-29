import { useState } from "react";
import { Banknote, ChevronDown, ChevronRight, RefreshCw, Info, AlertTriangle } from "lucide-react";
import { useCashFlow } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fyStart = () => {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-04-01`;
};

const KIND_COLOR = {
  Income:          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Expense:         "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  Capex:           "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Asset Sale":    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Equity Infusion":"bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  Borrowing:       "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  Drawings:        "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  Repayment:       "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
};

const StatTile = ({ label, value, positive }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-4 ${positive ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800"}`}>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-lg font-extrabold tabular-nums mt-1 ${positive ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>₹{fmt(Math.abs(value))}</p>
    <p className="text-[10px] text-gray-400 mt-0.5">{positive ? "Net inflow" : "Net outflow"}</p>
  </div>
);

const FlowSection = ({ title, section, color }) => {
  const [open, setOpen] = useState(true);
  if (!section) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</span>
        </div>
        <div className="flex items-center gap-4 text-xs tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-400">In: ₹{fmt(section.inflow)}</span>
          <span className="text-red-600 dark:text-red-400">Out: ₹{fmt(section.outflow)}</span>
          <span className={`font-bold ${section.net >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
            Net: ₹{fmt(Math.abs(section.net))} {section.net >= 0 ? "↑" : "↓"}
          </span>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {section.lines?.map((line, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${KIND_COLOR[line.kind] || "bg-gray-100 text-gray-600"}`}>{line.kind}</span>
                <span className="text-xs text-gray-700 dark:text-gray-200">{line.account_name}</span>
              </div>
              <span className="text-xs tabular-nums font-medium text-gray-700 dark:text-gray-200">₹{fmt(line.amount)}</span>
            </div>
          ))}
          {!section.lines?.length && <p className="text-xs text-gray-400 text-center py-3">No entries.</p>}
        </div>
      )}
    </div>
  );
};

const CashFlow = () => {
  const [fromDate, setFromDate] = useState(fyStart());
  const [toDate,   setToDate]   = useState(new Date().toISOString().slice(0, 10));
  const [applied,  setApplied]  = useState({ from_date: fyStart(), to_date: new Date().toISOString().slice(0, 10) });

  const { data, isLoading, isError, refetch } = useCashFlow(applied);
  const summary = data?.cash_flow_summary || {};
  const rec = data?.reconciliation || {};

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Banknote size={18} className="text-cyan-600 dark:text-cyan-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Cash Flow Statement</h1>
          </div>
        </div>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400" />
        <button onClick={() => setApplied({ from_date: fromDate, to_date: toDate })} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="px-6 py-4 space-y-4">
          {/* 4 stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label="Operating" value={summary.operating_net} positive={summary.operating_net >= 0} />
            <StatTile label="Investing" value={summary.investing_net} positive={summary.investing_net >= 0} />
            <StatTile label="Financing" value={summary.financing_net} positive={summary.financing_net >= 0} />
            <StatTile label="Net Change in Cash" value={summary.net_change_in_cash} positive={summary.net_change_in_cash >= 0} />
          </div>

          {/* Working capital note */}
          {data.working_capital_change !== 0 && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              <Info size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Working capital change: ₹{fmt(Math.abs(data.working_capital_change))} — Reflects AR / AP / inventory shifts that don't flow through cash yet.
              </p>
            </div>
          )}

          {/* Three expandable sections */}
          <FlowSection title="Operating Activities" section={data.operating} color="text-emerald-700 dark:text-emerald-400" />
          <FlowSection title="Investing Activities" section={data.investing} color="text-blue-700 dark:text-blue-400" />
          <FlowSection title="Financing Activities" section={data.financing} color="text-violet-700 dark:text-violet-400" />

          {/* Footer reconciliation */}
          <div className={`rounded-xl px-5 py-4 border ${rec.is_balanced ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
            <div className="flex flex-wrap gap-6 text-xs">
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-[10px]">Opening Cash</p>
                <p className="font-bold text-gray-800 dark:text-white tabular-nums">₹{fmt(data.opening_cash?.total)}</p>
              </div>
              <div className="flex items-center text-gray-400">+</div>
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-[10px]">Net Change</p>
                <p className={`font-bold tabular-nums ${summary.net_change_in_cash >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>₹{fmt(summary.net_change_in_cash)}</p>
              </div>
              <div className="flex items-center text-gray-400">=</div>
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-[10px]">Closing Cash</p>
                <p className="font-bold text-gray-800 dark:text-white tabular-nums">₹{fmt(data.closing_cash?.total)}</p>
              </div>
              {!rec.is_balanced && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 ml-auto">
                  <AlertTriangle size={13} />
                  <span className="font-semibold">Difference: ₹{fmt(rec.difference)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlow;
