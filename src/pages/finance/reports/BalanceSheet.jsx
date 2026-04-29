import { useState } from "react";
import { Building2, CheckCircle2, AlertTriangle, RefreshCw, Info } from "lucide-react";
import { useBalanceSheet } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const LineItem = ({ code, name, amount }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
    <div>
      <span className="text-[10px] font-mono text-gray-400 mr-2">{code}</span>
      <span className="text-xs text-gray-700 dark:text-gray-200">{name}</span>
    </div>
    <span className="text-xs tabular-nums font-medium text-gray-700 dark:text-gray-200">₹{fmt(amount)}</span>
  </div>
);

const SectionCard = ({ title, subtotal, lines, color }) => {
  const colors = {
    blue:   "border-blue-200 dark:border-blue-800",
    red:    "border-red-200 dark:border-red-800",
    violet: "border-violet-200 dark:border-violet-800",
  };
  const headerColors = {
    blue:   "text-blue-700 dark:text-blue-400",
    red:    "text-red-700 dark:text-red-400",
    violet: "text-violet-700 dark:text-violet-400",
  };
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border ${colors[color]} shadow-sm p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${headerColors[color]}`}>{title}</span>
        <span className={`text-sm font-extrabold tabular-nums ${headerColors[color]}`}>₹{fmt(subtotal)}</span>
      </div>
      {lines?.map((l) => <LineItem key={l.account_code} code={l.account_code} name={l.account_name} amount={l.amount} />)}
      {!lines?.length && <p className="text-xs text-gray-400 text-center py-2">No entries.</p>}
    </div>
  );
};

const BalanceSheet = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [applied,  setApplied]  = useState({ as_of_date: new Date().toISOString().slice(0, 10) });
  const [tipOpen,  setTipOpen]  = useState(false);

  const { data, isLoading, isError, refetch } = useBalanceSheet(applied);

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Building2 size={18} className="text-violet-600 dark:text-violet-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Balance Sheet</h1>
          </div>
        </div>

        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">As of Date</label>
        <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-400" />
        <button onClick={() => setApplied({ as_of_date: asOfDate })} className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {/* Balance badge */}
      {data && (
        <div className={`mx-6 mt-4 rounded-xl px-4 py-3 flex items-center gap-3 ${data.is_balanced ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
          {data.is_balanced
            ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            : <AlertTriangle size={16} className="text-red-600 dark:text-red-400 shrink-0" />}
          <span className={`text-sm font-semibold ${data.is_balanced ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
            {data.is_balanced
              ? `Balanced — FY ${data.financial_year} as of ${fmtDate(data.as_of_date)}`
              : `Out of balance by ₹${fmt(data.difference)}`}
          </span>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-violet-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Assets */}
            <div className="space-y-4">
              <SectionCard title="Assets" subtotal={data.assets?.subtotal} lines={data.assets?.lines} color="blue" />
              <div className="bg-blue-600 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Total Assets</span>
                <span className="text-white font-extrabold tabular-nums">₹{fmt(data.total_assets)}</span>
              </div>
            </div>

            {/* Right: Liabilities + Equity */}
            <div className="space-y-4">
              <SectionCard title="Liabilities" subtotal={data.liabilities?.subtotal} lines={data.liabilities?.lines} color="red" />

              {/* Equity + Retained Earnings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-violet-200 dark:border-violet-800 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">Equity</span>
                  <span className="text-sm font-extrabold tabular-nums text-violet-700 dark:text-violet-300">₹{fmt(data.equity?.subtotal)}</span>
                </div>
                {data.equity?.lines?.map((l) => <LineItem key={l.account_code} code={l.account_code} name={l.account_name} amount={l.amount} />)}

                {/* Retained Earnings row */}
                <div className="flex items-center justify-between py-2 mt-1 border-t border-violet-100 dark:border-violet-900">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">Retained Earnings</span>
                    <div className="relative">
                      <button onMouseEnter={() => setTipOpen(true)} onMouseLeave={() => setTipOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <Info size={12} />
                      </button>
                      {tipOpen && (
                        <div className="absolute bottom-5 left-0 bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 w-48 z-10 shadow-lg">
                          Income − Expense from FY start to as_of_date
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs tabular-nums font-medium text-gray-700 dark:text-gray-200">₹{fmt(data.retained_earnings)}</span>
                </div>
              </div>

              <div className="bg-violet-600 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Total Liab + Equity</span>
                <span className="text-white font-extrabold tabular-nums">₹{fmt(data.total_liab_equity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheet;
