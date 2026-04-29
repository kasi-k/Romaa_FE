import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useProfitLoss } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fyStart = () => {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-04-01`;
};

const GroupSection = ({ group }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{group.subtype}</span>
        </div>
        <span className="text-xs font-bold tabular-nums text-gray-700 dark:text-gray-200">₹{fmt(group.subtotal)}</span>
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {group.lines?.map((line) => (
            <div key={line.account_code} className="flex items-center justify-between px-3 py-1.5 border-b border-gray-50 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">{line.account_name}</span>
              <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">₹{fmt(line.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfitLoss = () => {
  const [fromDate, setFromDate] = useState(fyStart());
  const [toDate,   setToDate]   = useState(new Date().toISOString().slice(0, 10));
  const [tenderId, setTenderId] = useState("");
  const [applied,  setApplied]  = useState({ from_date: fyStart(), to_date: new Date().toISOString().slice(0, 10) });

  const { data, isLoading, isError, refetch } = useProfitLoss(applied);

  const apply = () => {
    const p = { from_date: fromDate, to_date: toDate };
    if (tenderId) p.tender_id = tenderId;
    setApplied(p);
  };

  const isProfit = data?.net_profit_type === "Profit";

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Profit & Loss</h1>
          </div>
        </div>

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
        <input placeholder="Tender ID (optional)" value={tenderId} onChange={(e) => setTenderId(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-44" />
        <button onClick={apply} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="px-6 py-4 space-y-4">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Income</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">₹{fmt(data.income?.total)}</span>
              </div>
              {data.income?.groups?.map((g) => <GroupSection key={g.subtype} group={g} />)}
              {!data.income?.groups?.length && <p className="text-xs text-gray-400 text-center py-4">No income entries.</p>}
            </div>

            {/* Expense */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Expense</span>
                <span className="text-sm font-extrabold text-red-700 dark:text-red-300">₹{fmt(data.expense?.total)}</span>
              </div>
              {data.expense?.groups?.map((g) => <GroupSection key={g.subtype} group={g} />)}
              {!data.expense?.groups?.length && <p className="text-xs text-gray-400 text-center py-4">No expense entries.</p>}
            </div>
          </div>

          {/* Net Profit/Loss tile */}
          <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${isProfit ? "bg-emerald-600" : "bg-red-600"}`}>
            <div className="flex items-center gap-3">
              {isProfit ? <TrendingUp size={20} className="text-white" /> : <TrendingDown size={20} className="text-white" />}
              <span className="text-white font-bold text-base">Net {data.net_profit_type}</span>
            </div>
            <span className="text-white font-extrabold text-xl tabular-nums">₹{fmt(data.net_profit)}</span>
          </div>
        </div>
      )}

      {data && !data.income?.groups?.length && !data.expense?.groups?.length && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No data for this period.</div>
      )}
    </div>
  );
};

export default ProfitLoss;
