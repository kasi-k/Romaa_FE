import { useState, useMemo } from "react";
import { BookOpen, Search, ChevronRight, TrendingUp } from "lucide-react";
import { useAccountByCode } from "../banks/hooks/useAccountTree";
import { useAccountLedger } from "../ledger_entry/hooks/useLedger";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const todayStr = () => new Date().toISOString().split("T")[0];

/* ── Account Summary Card ───────────────────────────────────────────── */
const AccountSummary = ({ code }) => {
  const { data: account, isLoading } = useAccountByCode(code);
  if (!code) return null;
  if (isLoading) return <div className="py-6 text-center text-xs text-gray-400">Loading account…</div>;
  if (!account) return (
    <div className="rounded-xl border border-red-100 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4">
      <p className="text-xs font-semibold text-red-700 dark:text-red-400">No account found with code &ldquo;{code}&rdquo;.</p>
    </div>
  );
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
          <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-bold text-gray-800 dark:text-white">{account.name}</p>
            <code className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">{account.code}</code>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
            <span className="capitalize">{account.account_type}</span>
            {account.account_subtype && <><span>·</span><span>{account.account_subtype}</span></>}
            {account.tax_type && <><span>·</span><span>{account.tax_type}</span></>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {account.is_group && <Badge cls="bg-blue-50 text-blue-700">Group</Badge>}
            {account.is_posting_account && <Badge cls="bg-emerald-50 text-emerald-700">Posting</Badge>}
            {account.is_bank_cash && <Badge cls="bg-amber-50 text-amber-700">Bank / Cash</Badge>}
            {account.is_personal && <Badge cls="bg-purple-50 text-purple-700">Personal</Badge>}
            {account.is_active === false && <Badge cls="bg-red-50 text-red-600">Inactive</Badge>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Available</p>
          <p className="text-lg font-extrabold text-gray-800 dark:text-white tabular-nums">₹{fmt(account.available_balance)}</p>
          {account.opening_balance != null && (
            <p className="text-[10px] text-gray-400 tabular-nums">Opening ₹{fmt(account.opening_balance)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, cls }) => (
  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{children}</span>
);

/* ── Ledger Table ───────────────────────────────────────────────────── */
const LedgerTable = ({ code, fromDate, toDate }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAccountLedger(code, {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    page,
    limit: 50,
  });
  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const pagination = data?.pagination || { current_page: 1, total_pages: 1, total_items: rows.length };

  if (!code) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <TrendingUp size={14} className="text-gray-400" />
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Transactions</p>
        <span className="ml-auto text-xs text-gray-400">{pagination.total_items ?? rows.length} entries</span>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-gray-400">Loading transactions…</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No transactions in the selected range.</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/30">
              <tr>
                {["Date", "Voucher", "Narration", "Dr", "Cr", "Balance"].map((h, i) => (
                  <th key={h} className={`px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id || i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-2 text-gray-500">{fmtDate(r.date)}</td>
                  <td className="px-4 py-2">
                    <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{r.voucher_no || "—"}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{(r.voucher_type || "").replace(/_/g, " ")}</p>
                  </td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300 truncate max-w-xs" title={r.narration}>{r.narration || "—"}</td>
                  <td className="px-4 py-2 tabular-nums text-right font-semibold text-red-600 dark:text-red-400">{r.debit_amt ? `₹${fmt(r.debit_amt)}` : "—"}</td>
                  <td className="px-4 py-2 tabular-nums text-right font-semibold text-emerald-600 dark:text-emerald-400">{r.credit_amt ? `₹${fmt(r.credit_amt)}` : "—"}</td>
                  <td className="px-4 py-2 tabular-nums text-right font-bold text-gray-700 dark:text-gray-200">₹{fmt(r.running_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {(pagination.total_pages ?? 1) > 1 && (
        <div className="px-5 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-gray-500">{page} / {pagination.total_pages}</span>
          <button
            disabled={page >= (pagination.total_pages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────────────── */
const LedgerAccountBrowser = () => {
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(todayStr());

  const submit = (e) => {
    e.preventDefault();
    setApplied(codeInput.trim());
  };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Admin</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Ledger Account Browser</h1>
          </div>
        </div>
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Account code (e.g. 1200)"
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
            <label className="text-[10px] font-semibold text-gray-500 uppercase">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          </div>
          <button type="submit" className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
            <ChevronRight size={12} />View ledger
          </button>
        </form>
      </div>

      <div className="px-6 py-5 space-y-4">
        {!applied ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Enter an account code to browse its ledger</p>
            <p className="text-[11px] text-gray-400 mt-1">e.g. 1200 (HDFC Main Bank), 4001 (Sales Revenue), 2001 (Accounts Payable)</p>
          </div>
        ) : (
          <>
            <AccountSummary code={applied} />
            <LedgerTable code={applied} fromDate={fromDate} toDate={toDate} />
          </>
        )}
      </div>
    </div>
  );
};

export default LedgerAccountBrowser;
