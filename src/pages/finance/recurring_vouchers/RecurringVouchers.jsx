import { useState } from "react";
import { RotateCcw, Plus, RefreshCw, Pause, Play, Square, Zap, Trash2, XCircle } from "lucide-react";
import {
  useRVList, useCreateRV, usePauseRV, useResumeRV, useEndRV, useRunNowRV, useDeleteRV,
} from "./hooks/useRecurringVouchers";
import DeleteModal from "../../../components/DeleteModal";

const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const STATUS_CLS = {
  active:  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700",
  paused:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700",
  ended:   "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const FREQ_LABEL = {
  weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly",
  yearly: "Yearly", custom_days: "Custom Days",
};

/* ── Create Form ──────────────────────────────────────────────────── */
const CreateRVForm = ({ onClose }) => {
  const [form, setForm] = useState({
    template_name: "", voucher_type: "ExpenseVoucher",
    frequency: "monthly", interval: 1, custom_days: 0,
    start_date: "", end_date: "", day_of_month: 1,
    payee_type: "External", payee_name: "", gross_total: "",
    narration: "",
  });

  const { mutate: create, isPending } = useCreateRV({ onClose });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { payee_type, payee_name, gross_total, ...rest } = form;
    create({
      ...rest,
      interval: Number(rest.interval),
      custom_days: Number(rest.custom_days),
      day_of_month: Number(rest.day_of_month),
      end_date: rest.end_date || null,
      template_payload: {
        payee_type, payee_name,
        gross_total: parseFloat(gross_total) || 0,
      },
    });
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">New Recurring Voucher Template</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Template Name</label>
            <input className={inp} required value={form.template_name} onChange={(e) => setForm({ ...form, template_name: e.target.value })} placeholder="e.g. Office Rent — Madurai HO" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
              <select className={inp} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                {Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {form.frequency === "custom_days" ? "Every N Days" : "Day of Month"}
              </label>
              <input type="number" min="1" max="28" className={inp}
                value={form.frequency === "custom_days" ? form.custom_days : form.day_of_month}
                onChange={(e) => setForm({
                  ...form,
                  ...(form.frequency === "custom_days" ? { custom_days: e.target.value } : { day_of_month: e.target.value }),
                })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
              <input type="date" className={inp} required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">End Date (blank = open-ended)</label>
              <input type="date" className={inp} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">Voucher Payload</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Payee Type</label>
                <select className={inp} value={form.payee_type} onChange={(e) => setForm({ ...form, payee_type: e.target.value })}>
                  {["External","Vendor","Contractor","Employee"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Payee Name</label>
                <input className={inp} required value={form.payee_name} onChange={(e) => setForm({ ...form, payee_name: e.target.value })} placeholder="e.g. MGR Properties" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Gross Amount (₹)</label>
                <input type="number" step="0.01" className={inp} required value={form.gross_total} onChange={(e) => setForm({ ...form, gross_total: e.target.value })} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Narration</label>
            <input className={inp} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50">
            {isPending ? "Saving…" : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const RecurringVouchers = () => {
  const [params, setParams] = useState({ page: 1, limit: 20, status: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isError, refetch } = useRVList(params);
  const { mutate: pause } = usePauseRV();
  const { mutate: resume } = useResumeRV();
  const { mutate: end } = useEndRV();
  const { mutate: runNow, isPending: running } = useRunNowRV();
  const { mutate: del } = useDeleteRV();

  const list = data?.data || [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <RotateCcw size={18} className="text-violet-600 dark:text-violet-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Vouchers</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Recurring Vouchers</h1>
          </div>
        </div>
        {/* Status filter */}
        <select
          value={params.status}
          onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-400"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="ended">Ended</option>
        </select>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={15} />New Template
        </button>
      </div>

      <div className="px-6 py-5">
        {isLoading && <div className="flex items-center justify-center py-16 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-violet-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
        {isError && <div className="flex items-center justify-center py-16 text-sm text-red-500">Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

        {!isLoading && !isError && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {["Template", "Frequency", "Amount", "Next Run", "Runs", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {list.map((rv) => (
                  <tr key={rv._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-xs">{rv.template_name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{rv.template_no}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      {FREQ_LABEL[rv.frequency] || rv.frequency}
                      {rv.frequency === "custom_days" && ` (${rv.custom_days}d)`}
                      {rv.day_of_month > 0 && <span className="text-gray-400"> · day {rv.day_of_month}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums font-semibold text-violet-700 dark:text-violet-400">
                      ₹{fmt(rv.template_payload?.gross_total)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(rv.next_run_date)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{rv.run_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_CLS[rv.status] || STATUS_CLS.ended}`}>{rv.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {rv.status === "active" && (
                          <>
                            <button onClick={() => runNow(rv._id)} disabled={running} title="Run now" className="p-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-700 transition-colors disabled:opacity-50"><Zap size={13} /></button>
                            <button onClick={() => pause(rv._id)} title="Pause" className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700 transition-colors"><Pause size={13} /></button>
                            <button onClick={() => end(rv._id)} title="End permanently" className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors"><Square size={13} /></button>
                          </>
                        )}
                        {rv.status === "paused" && (
                          <button onClick={() => resume(rv._id)} title="Resume" className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700 transition-colors"><Play size={13} /></button>
                        )}
                        {rv.run_count === 0 && (
                          <button onClick={() => setDeleteId(rv._id)} title="Delete" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!list.length && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No templates yet. Create one to automate recurring expenses.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateRVForm onClose={() => setShowCreate(false)} />}
      {deleteId && (
        <DeleteModal
          deletetitle="Recurring Voucher Template"
          onclose={() => setDeleteId(null)}
          onDelete={() => { del(deleteId); setDeleteId(null); }}
        />
      )}
    </div>
  );
};

export default RecurringVouchers;
