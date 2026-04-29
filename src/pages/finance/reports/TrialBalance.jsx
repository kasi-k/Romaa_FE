import { useState, useMemo } from "react";
import { Scale, ChevronDown, ChevronRight, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTrialBalance } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const ACCOUNT_TYPE_ORDER = ["Asset", "Liability", "Equity", "Income", "Expense"];
const TYPE_COLOR = {
  Asset:     "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  Liability: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
  Equity:    "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20",
  Income:    "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  Expense:   "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
};

const AmtCell = ({ amount, type }) => (
  <span className={`tabular-nums font-medium text-xs ${type === "Dr" ? "text-emerald-600 dark:text-emerald-400" : type === "Cr" ? "text-rose-600 dark:text-rose-400" : "text-gray-400"}`}>
    {amount ? `${fmt(amount)} ${type}` : "—"}
  </span>
);

const TrialBalance = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [includeZero, setIncludeZero] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [applied, setApplied] = useState({ as_of_date: new Date().toISOString().slice(0, 10), include_zero: false });

  const { data, isLoading, isError, refetch } = useTrialBalance(applied);

  const grouped = useMemo(() => {
    if (!data?.rows) return {};
    return data.rows.reduce((acc, row) => {
      (acc[row.account_type] = acc[row.account_type] || []).push(row);
      return acc;
    }, {});
  }, [data]);

  const toggle = (type) => setCollapsed((p) => ({ ...p, [type]: !p[type] }));

  const apply = () => setApplied({ as_of_date: asOfDate, include_zero: includeZero });

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Scale size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Trial Balance</h1>
          </div>
        </div>

        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">As of Date</label>
        <input
          type="date"
          value={asOfDate}
          onChange={(e) => setAsOfDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />

        <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={includeZero}
            onChange={(e) => setIncludeZero(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Include zero-balance
        </label>

        <button
          onClick={apply}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Apply
        </button>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Balance status */}
      {data && (
        <div className={`mx-6 mt-4 rounded-xl px-4 py-3 flex items-center gap-3 ${data.is_balanced ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
          {data.is_balanced
            ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            : <AlertTriangle size={16} className="text-red-600 dark:text-red-400 shrink-0" />}
          <span className={`text-sm font-semibold ${data.is_balanced ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
            {data.is_balanced ? `Balanced — as of ${fmtDate(data.as_of_date)}` : `Out of balance by ₹${fmt(data.difference)} — ${fmtDate(data.as_of_date)}`}
          </span>
        </div>
      )}

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-2" />
          Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Table */}
      {data && (
        <div className="mx-6 my-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[180px_1fr_120px_120px_120px_130px] gap-0 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            {["Code", "Account Name", "Opening", "Period Dr", "Period Cr", "Closing"].map((h) => (
              <span key={h} className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {ACCOUNT_TYPE_ORDER.filter((t) => grouped[t]).map((type) => (
            <div key={type}>
              {/* Group header */}
              <button
                onClick={() => toggle(type)}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
              >
                {collapsed[type] ? <ChevronRight size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[type]}`}>{type}</span>
                <span className="text-[11px] text-gray-400 ml-1">{grouped[type].length} accounts</span>
              </button>

              {!collapsed[type] && grouped[type].map((row) => (
                <div
                  key={row.account_code}
                  className="grid grid-cols-[180px_1fr_120px_120px_120px_130px] gap-0 px-4 py-2 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <span className="text-xs font-mono text-gray-500">{row.account_code}</span>
                  <span className="text-xs text-gray-700 dark:text-gray-200 font-medium truncate pr-2">{row.account_name}</span>
                  <AmtCell amount={row.opening_balance} type={row.opening_balance_type} />
                  <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">{row.period_debit ? fmt(row.period_debit) : "—"}</span>
                  <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">{row.period_credit ? fmt(row.period_credit) : "—"}</span>
                  <AmtCell amount={row.closing_balance} type={row.closing_balance_type} />
                </div>
              ))}
            </div>
          ))}

          {/* Grand total footer */}
          <div className="grid grid-cols-[180px_1fr_120px_120px_120px_130px] gap-0 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t-2 border-gray-200 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 col-span-2">Grand Total</span>
            <span />
            <span className="text-xs font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{fmt(data.total_debit)}</span>
            <span className="text-xs font-bold tabular-nums text-rose-700 dark:text-rose-400">{fmt(data.total_credit)}</span>
            <span />
          </div>
        </div>
      )}

      {data && !data.rows?.length && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No data for this period.</div>
      )}
    </div>
  );
};

export default TrialBalance;
