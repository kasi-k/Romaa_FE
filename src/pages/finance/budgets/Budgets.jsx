import { useState, useMemo } from "react";
import { Target, Plus, RefreshCw, CheckCircle2, Archive, Trash2, BarChart2, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import {
  useBudgetList, useCreateBudget, useApproveBudget, useArchiveBudget,
  useDeleteBudget, useBudgetVariance,
} from "./hooks/useBudgets";
import DeleteModal from "../../../components/DeleteModal";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const STATUS_CLS = {
  draft:    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700",
  archived: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const VARIANCE_CLS = {
  under:    "text-emerald-600 dark:text-emerald-400",
  over:     "text-red-600 dark:text-red-400",
  on_track: "text-blue-600 dark:text-blue-400",
};

/* ── Variance Panel ─────────────────���────────────────────────────── */
const VariancePanel = ({ budgetId, onClose }) => {
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const { data, isLoading } = useBudgetVariance(budgetId, asOf);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Budget vs Actual</h2>
            {data && <p className="text-xs text-gray-400 mt-0.5">{data.tender_name} · FY {data.financial_year}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading && <div className="flex items-center justify-center py-16 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
          {data && (
            <>
              {/* Totals strip */}
              <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                {[
                  { label: "Total Budget", value: fmtCompact(data.totals?.total_budget), cls: "text-gray-800 dark:text-white" },
                  { label: "Total Actual", value: fmtCompact(data.totals?.total_actual), cls: "text-violet-700 dark:text-violet-400" },
                  { label: "Total Variance", value: fmtCompact(data.totals?.total_variance), cls: data.totals?.total_variance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className={`text-lg font-extrabold mt-0.5 tabular-nums ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Lines */}
              <table className="w-full text-xs px-6">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  {["Account", "Period", "Budget", "Actual", "Variance", "Var %", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {data.lines?.map((line, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{line.account_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{line.account_code}</p>
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-right">{line.period_label || line.period}</td>
                      <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(line.budget)}</td>
                      <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(line.actual)}</td>
                      <td className={`px-4 py-2 tabular-nums text-right font-semibold ${VARIANCE_CLS[line.status] || ""}`}>
                        {line.is_favourable ? <TrendingUp size={11} className="inline mr-0.5" /> : <TrendingDown size={11} className="inline mr-0.5" />}
                        ₹{fmt(Math.abs(line.variance))}
                      </td>
                      <td className={`px-4 py-2 tabular-nums text-right ${VARIANCE_CLS[line.status] || ""}`}>{line.variance_pct?.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          line.status === "over" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                          line.status === "under" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                          "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}>{line.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Create Budget Form ────────────────────────────────────────────── */
const CreateBudgetForm = ({ onClose }) => {
  const [form, setForm] = useState({ tender_id: "", financial_year: "25-26", narration: "" });
  const [lines, setLines] = useState([{ account_code: "", period: "annual", period_label: "", budget_amount: "", notes: "" }]);
  const { mutate: create, isPending } = useCreateBudget({ onClose });

  const addLine = () => setLines((l) => [...l, { account_code: "", period: "annual", period_label: "", budget_amount: "", notes: "" }]);
  const removeLine = (i) => setLines((l) => l.filter((_, idx) => idx !== i));
  const updateLine = (i, field, value) => setLines((l) => l.map((ln, idx) => idx === i ? { ...ln, [field]: value } : ln));

  const handleSubmit = (e) => {
    e.preventDefault();
    create({
      ...form,
      lines: lines.map((l) => ({ ...l, budget_amount: parseFloat(l.budget_amount) || 0 })),
    });
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">New Budget</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tender ID</label>
              <input className={inp} required value={form.tender_id} onChange={(e) => setForm({ ...form, tender_id: e.target.value })} placeholder="e.g. TND-001" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Financial Year</label>
              <input className={inp} required value={form.financial_year} onChange={(e) => setForm({ ...form, financial_year: e.target.value })} placeholder="e.g. 25-26" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Narration</label>
              <input className={inp} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">Budget Lines</p>
              <button type="button" onClick={addLine} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"><Plus size={12} />Add Line</button>
            </div>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg">
                  <input className={`${inp} col-span-3`} placeholder="Account Code" value={line.account_code} onChange={(e) => updateLine(i, "account_code", e.target.value)} required />
                  <select className={`${inp} col-span-2`} value={line.period} onChange={(e) => updateLine(i, "period", e.target.value)}>
                    <option value="annual">Annual</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <input className={`${inp} col-span-2`} placeholder={line.period === "monthly" ? "2025-04" : line.period === "quarterly" ? "Q1" : ""} value={line.period_label} onChange={(e) => updateLine(i, "period_label", e.target.value)} />
                  <input type="number" step="0.01" className={`${inp} col-span-3`} placeholder="Amount" value={line.budget_amount} onChange={(e) => updateLine(i, "budget_amount", e.target.value)} required />
                  <button type="button" onClick={() => removeLine(i)} className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600 mt-2"><Trash2 size={13} /></button>
                  <input className={`${inp} col-span-11`} placeholder="Notes (optional)" value={line.notes} onChange={(e) => updateLine(i, "notes", e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">
            {isPending ? "Saving…" : "Create Budget"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const Budgets = () => {
  const [params, setParams] = useState({ page: 1, limit: 20, status: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [varianceId, setVarianceId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isError, refetch } = useBudgetList(params);
  const { mutate: approve } = useApproveBudget();
  const { mutate: archive } = useArchiveBudget();
  const { mutate: del } = useDeleteBudget();

  const list = data?.data || [];

  const totals = useMemo(() => ({
    draft: list.filter((b) => b.status === "draft").length,
    approved: list.filter((b) => b.status === "approved").length,
  }), [list]);

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Target size={18} className="text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Planning</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Budgets & Variance</h1>
          </div>
        </div>
        <select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={15} />New Budget
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Budgets", value: list.length, cls: "text-gray-800 dark:text-white" },
            { label: "Draft", value: totals.draft, cls: "text-amber-600 dark:text-amber-400" },
            { label: "Approved", value: totals.approved, cls: "text-emerald-600 dark:text-emerald-400" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-extrabold mt-0.5 ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        {isLoading && <div className="flex items-center justify-center py-16 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
        {isError && <div className="flex items-center justify-center py-16 text-sm text-red-500">Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

        {!isLoading && !isError && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {["Budget No.", "Tender", "FY", "Lines", "Status", "Created", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {list.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-emerald-700 dark:text-emerald-400">{b.budget_no}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {b.tender_name || b.tender_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">FY {b.financial_year}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{b.lines?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_CLS[b.status] || STATUS_CLS.draft}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setVarianceId(b._id)} title="View variance" className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700 transition-colors"><BarChart2 size={13} /></button>
                        {b.status === "draft" && (
                          <>
                            <button onClick={() => approve(b._id)} title="Approve" className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700 transition-colors"><CheckCircle2 size={13} /></button>
                            <button onClick={() => setDeleteId(b._id)} title="Delete" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors"><Trash2 size={13} /></button>
                          </>
                        )}
                        {b.status === "approved" && (
                          <button onClick={() => archive(b._id)} title="Archive" className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors"><Archive size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!list.length && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No budgets yet. Create one per tender per financial year.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateBudgetForm onClose={() => setShowCreate(false)} />}
      {varianceId && <VariancePanel budgetId={varianceId} onClose={() => setVarianceId(null)} />}
      {deleteId && (
        <DeleteModal
          deletetitle="Budget"
          onclose={() => setDeleteId(null)}
          onDelete={() => { del(deleteId); setDeleteId(null); }}
        />
      )}
    </div>
  );
};

export default Budgets;
