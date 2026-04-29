import { useState, useMemo } from "react";
import {
  GitMerge, RefreshCw, Plus, CheckCircle2, XCircle,
  AlertTriangle, ChevronDown, ChevronRight, Lock, Zap, Minus
} from "lucide-react";
import { useBRList, useCreateBR, useAutoMatch, useIgnoreLine, useCloseBR, useDeleteBR, useNextBRNo } from "./hooks/useBankReconciliation";
import DeleteModal from "../../../components/DeleteModal";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_CLS = {
  draft:        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  in_progress:  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700",
  reconciled:   "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700",
  closed:       "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

/* ── Create Statement Form ────────────────────────────────────────── */
const CreateStatementForm = ({ nextNo, onClose }) => {
  const [form, setForm] = useState({
    bank_account_code: "", statement_date_from: "", statement_date_to: "",
    opening_balance: "", closing_balance: "", narration: "",
  });
  const [rawLines, setRawLines] = useState(
    "Date,Description,Ref No,Debit,Credit,Balance\n"
  );

  const { mutate: create, isPending } = useCreateBR({ onSuccess: onClose });

  const parseLines = () => {
    const lines = rawLines.split("\n").slice(1).filter((l) => l.trim());
    return lines.map((l) => {
      const [line_date, description, ref_no, debit_amt, credit_amt, balance] = l.split(",");
      return {
        line_date: line_date?.trim(),
        description: description?.trim(),
        ref_no: ref_no?.trim(),
        debit_amt: parseFloat(debit_amt) || 0,
        credit_amt: parseFloat(credit_amt) || 0,
        balance: parseFloat(balance) || 0,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    create({
      ...form,
      opening_balance: parseFloat(form.opening_balance) || 0,
      closing_balance: parseFloat(form.closing_balance) || 0,
      lines: parseLines(),
    });
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">New Bank Statement</h2>
            <p className="text-xs text-gray-400 mt-0.5">{nextNo}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XCircle size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Account Code</label>
              <input className={inp} required value={form.bank_account_code} onChange={(e) => setForm({ ...form, bank_account_code: e.target.value })} placeholder="e.g. 1070-HDFC" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Statement From</label>
              <input type="date" className={inp} required value={form.statement_date_from} onChange={(e) => setForm({ ...form, statement_date_from: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Statement To</label>
              <input type="date" className={inp} required value={form.statement_date_to} onChange={(e) => setForm({ ...form, statement_date_to: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Opening Balance (₹)</label>
              <input type="number" step="0.01" className={inp} value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Closing Balance (₹)</label>
              <input type="number" step="0.01" className={inp} value={form.closing_balance} onChange={(e) => setForm({ ...form, closing_balance: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Narration</label>
              <input className={inp} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} placeholder="e.g. HDFC April 2025" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Statement Lines (CSV: Date,Description,Ref No,Debit,Credit,Balance)
            </label>
            <textarea
              className={`${inp} font-mono text-xs h-36 resize-none`}
              value={rawLines}
              onChange={(e) => setRawLines(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-1">First row is the header — do not remove it. Leave the header row and add lines below.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
            {isPending ? "Creating…" : "Create Statement"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Statement Row (expandable) ───────────────────────────────────── */
const StatementRow = ({ stmt, onAutoMatch, onClose, onDelete, autoMatchPending }) => {
  const [open, setOpen] = useState(false);
  const { mutate: ignoreLineM } = useIgnoreLine();

  const matchedPct = stmt.matched_count + stmt.unmatched_count + stmt.ignored_count > 0
    ? Math.round((stmt.matched_count / (stmt.matched_count + stmt.unmatched_count)) * 100)
    : 0;

  return (
    <>
      <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
        <td className="px-4 py-3">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <code className="font-mono text-blue-600 dark:text-blue-400">{stmt.statement_no}</code>
          </button>
        </td>
        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 font-medium">{stmt.bank_account_name || stmt.bank_account_code}</td>
        <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(stmt.statement_date_from)} – {fmtDate(stmt.statement_date_to)}</td>
        <td className="px-4 py-3 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(stmt.closing_balance)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-16">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${matchedPct}%` }} />
            </div>
            <span className="text-[10px] text-gray-500 tabular-nums">{stmt.matched_count}/{stmt.matched_count + stmt.unmatched_count} matched</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_CLS[stmt.status] || STATUS_CLS.draft}`}>{stmt.status}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {stmt.status !== "closed" && (
              <>
                <button
                  onClick={() => onAutoMatch(stmt._id)}
                  disabled={autoMatchPending}
                  title="Auto-match"
                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700 transition-colors disabled:opacity-50"
                >
                  <Zap size={13} />
                </button>
                {stmt.status === "reconciled" && (
                  <button
                    onClick={() => onClose(stmt._id)}
                    title="Close & lock"
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700 transition-colors"
                  >
                    <Lock size={13} />
                  </button>
                )}
                {stmt.status === "draft" && (
                  <button
                    onClick={() => onDelete(stmt._id)}
                    title="Delete"
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                )}
              </>
            )}
            {stmt.status === "closed" && <Lock size={13} className="text-gray-400" />}
          </div>
        </td>
      </tr>
      {open && stmt.lines && (
        <tr>
          <td colSpan={7} className="px-4 py-0 bg-gray-50/60 dark:bg-gray-800/30">
            <div className="border-l-4 border-blue-200 dark:border-blue-700 pl-4 py-3">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-400 uppercase tracking-wider">
                  {["Date","Description","Ref","Debit","Credit","Matched","Actions"].map((h) => (
                    <th key={h} className="pb-1.5 font-semibold text-right first:text-left pr-3">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {stmt.lines.map((line) => (
                    <tr key={line._id} className={`border-t border-gray-100 dark:border-gray-700 ${line.recon_status === "ignored" ? "opacity-50" : ""}`}>
                      <td className="py-1.5 pr-3 text-gray-500">{fmtDate(line.line_date)}</td>
                      <td className="py-1.5 pr-3 text-gray-700 dark:text-gray-200 max-w-[200px] truncate">{line.description}</td>
                      <td className="py-1.5 pr-3 font-mono text-gray-400">{line.ref_no || "—"}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums text-red-600 dark:text-red-400">{line.debit_amt ? `₹${fmt(line.debit_amt)}` : "—"}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{line.credit_amt ? `₹${fmt(line.credit_amt)}` : "—"}</td>
                      <td className="py-1.5 pr-3 text-right">
                        {line.recon_status === "matched" && <CheckCircle2 size={13} className="text-emerald-500 inline" />}
                        {line.recon_status === "ignored" && <span className="text-gray-400">Ignored</span>}
                        {line.recon_status === "unmatched" && <span className="text-amber-500">Unmatched</span>}
                      </td>
                      <td className="py-1.5 text-right">
                        {line.recon_status === "unmatched" && stmt.status !== "closed" && (
                          <button
                            onClick={() => ignoreLineM({ id: stmt._id, lineId: line._id })}
                            className="text-[10px] text-gray-400 hover:text-red-500 underline"
                          >
                            Ignore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const BankReconciliation = () => {
  const [params] = useState({ page: 1, limit: 20 });
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isError, refetch } = useBRList(params);
  const { data: nextNo } = useNextBRNo();
  const { mutate: autoMatch, isPending: autoMatchPending } = useAutoMatch();
  const { mutate: closeStmt } = useCloseBR();
  const { mutate: deleteStmt } = useDeleteBR();

  const list = data?.data || [];

  const summary = useMemo(() => ({
    total: list.length,
    reconciled: list.filter((s) => s.status === "reconciled" || s.status === "closed").length,
    pending: list.filter((s) => s.status === "draft" || s.status === "in_progress").length,
  }), [list]);

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <GitMerge size={18} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Banking</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Bank Reconciliation</h1>
          </div>
        </div>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={15} />New Statement
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Statements", value: summary.total, color: "text-gray-800 dark:text-white" },
            { label: "Reconciled / Closed", value: summary.reconciled, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Pending", value: summary.pending, color: "text-amber-600 dark:text-amber-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-extrabold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Mental model note */}
        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
          <AlertTriangle size={13} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Mental model:</strong> Statement DEBIT (money OUT) ↔ JE Credit bank line · Statement CREDIT (money IN) ↔ JE Debit bank line.
            Use <strong>Auto-match</strong> (⚡) first — it matches exact-amount lines within ±5 days. Then manually handle ambiguous or missing entries.
          </p>
        </div>

        {/* Table */}
        {isLoading && <div className="flex items-center justify-center py-16 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
        {isError && <div className="flex items-center justify-center py-16 text-sm text-red-500">Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

        {!isLoading && !isError && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {["Statement No.", "Account", "Period", "Closing Bal.", "Match Progress", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((stmt) => (
                  <StatementRow
                    key={stmt._id}
                    stmt={stmt}
                    onAutoMatch={(id) => autoMatch({ id })}
                    onClose={(id) => closeStmt(id)}
                    onDelete={(id) => setDeleteId(id)}
                    autoMatchPending={autoMatchPending}
                  />
                ))}
                {!list.length && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No statements yet. Click "New Statement" to import a bank statement.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateStatementForm nextNo={nextNo} onClose={() => setShowCreate(false)} />}

      {deleteId && (
        <DeleteModal
          deletetitle="Bank Statement"
          onclose={() => setDeleteId(null)}
          onDelete={() => { deleteStmt(deleteId); setDeleteId(null); }}
        />
      )}
    </div>
  );
};

export default BankReconciliation;
