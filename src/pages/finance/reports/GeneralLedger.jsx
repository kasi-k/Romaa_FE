import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { useGeneralLedger } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const GeneralLedger = () => {
  const [accountCode, setAccountCode] = useState("");
  const [codeInput,   setCodeInput]   = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");
  const [page,     setPage]     = useState(1);
  const limit = 100;

  const params = accountCode ? { account_code: accountCode, from_date: fromDate || undefined, to_date: toDate || undefined, page, limit } : {};
  const { data, isLoading, isError, refetch } = useGeneralLedger(params);

  const search = () => { setAccountCode(codeInput.trim()); setPage(1); };

  const pg = data?.pagination || {};

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <BookOpen size={18} className="text-teal-600 dark:text-teal-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">General Ledger</h1>
          </div>
        </div>

        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <input
            placeholder="Account code e.g. 1010"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="px-3 py-1.5 text-sm bg-transparent dark:text-white focus:outline-none w-44"
          />
          <button onClick={search} className="px-2 py-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><Search size={15} /></button>
        </div>

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400" />
        <button onClick={() => { search(); }} className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {/* Account info */}
      {data?.account && (
        <div className="mx-6 mt-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-3 flex flex-wrap gap-6">
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Account</p><p className="text-xs font-bold text-gray-800 dark:text-white">{data.account.account_name}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Code</p><p className="text-xs font-mono text-gray-700 dark:text-gray-200">{data.account.account_code}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Type</p><p className="text-xs text-gray-700 dark:text-gray-200">{data.account.account_type} / {data.account.account_subtype}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Opening Balance</p><p className="text-xs font-bold text-gray-700 dark:text-gray-200">₹{fmt(data.opening?.balance)} {data.opening?.balance_type}</p></div>
        </div>
      )}

      {!accountCode && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Search size={32} className="text-gray-300" />
          <p className="text-sm">Enter an account code to view the ledger.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-teal-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="mx-6 my-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[90px_90px_130px_1fr_90px_90px_120px] gap-0 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            {["Date", "JE No", "Type", "Narration", "Debit", "Credit", "Balance"].map((h) => (
              <span key={h} className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {data.entries?.map((e) => (
            <div key={e.je_id} className="grid grid-cols-[90px_90px_130px_1fr_90px_90px_120px] gap-0 px-4 py-2 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
              <span className="text-xs text-gray-500">{fmtDate(e.je_date)}</span>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">{e.je_no}</span>
              <span className="text-xs text-gray-500 truncate pr-2">{e.je_type}</span>
              <span className="text-xs text-gray-700 dark:text-gray-200 truncate pr-2">{e.narration}</span>
              <span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400 text-right">{e.debit ? fmt(e.debit) : "—"}</span>
              <span className="text-xs tabular-nums text-rose-600 dark:text-rose-400 text-right">{e.credit ? fmt(e.credit) : "—"}</span>
              <span className={`text-xs tabular-nums font-semibold text-right ${e.balance_type === "Dr" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {fmt(e.balance)} {e.balance_type}
              </span>
            </div>
          ))}

          {data.entries && !data.entries.length && (
            <div className="text-center py-8 text-sm text-gray-400">No entries for this period.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pg.pages > 1 && (
        <div className="flex items-center justify-between px-6 pb-4">
          <span className="text-xs text-gray-400">{pg.total} entries · page {pg.page} of {pg.pages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button disabled={page >= pg.pages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralLedger;
