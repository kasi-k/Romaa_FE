import { useState } from "react";
import { Shield, RefreshCw, XCircle, CheckCircle, Ban } from "lucide-react";
import AttachmentsBadge from "../shared/components/AttachmentsBadge";
import {
  useRetentionPayableOutstanding, useRetentionReceivableOutstanding,
  useRetentionSummary, useRetentionReleaseList,
  useCreateRetentionRelease, useApproveRetentionRelease, useCancelRetentionRelease,
} from "./hooks/useRetention";

const fmt = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtN = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const STATUS_CLS = {
  draft: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700",
  cancelled: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700",
};

const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400";

/* ── Create Release Modal ─────────────────────────────────────────── */
const CreateReleaseModal = ({ onClose }) => {
  const [form, setForm] = useState({
    side: "Payable", party_type: "Contractor", party_id: "", party_name: "", tender_id: "",
    source_type: "WeeklyBilling", source_ref: "", source_no: "",
    amount: "", release_date: new Date().toISOString().slice(0, 10), narration: "",
  });
  const { mutate: create, isPending } = useCreateRetentionRelease({ onSuccess: onClose });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); create({ ...form, amount: parseFloat(form.amount) || 0 }); }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">New Retention Release</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Side</label>
              <select className={inp} value={form.side} onChange={(e) => set("side", e.target.value)}>
                <option>Payable</option>
                <option>Receivable</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Party Type</label>
              <select className={inp} value={form.party_type} onChange={(e) => set("party_type", e.target.value)}>
                <option>Contractor</option>
                <option>Client</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Party ID</label>
              <input className={inp} required value={form.party_id} onChange={(e) => set("party_id", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Party Name</label>
              <input className={inp} required value={form.party_name} onChange={(e) => set("party_name", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tender ID</label>
              <input className={inp} value={form.tender_id} onChange={(e) => set("tender_id", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Source Type</label>
              <select className={inp} value={form.source_type} onChange={(e) => set("source_type", e.target.value)}>
                <option>WeeklyBilling</option>
                <option>ClientBilling</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Source Ref (ID)</label>
              <input className={inp} required value={form.source_ref} onChange={(e) => set("source_ref", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Source No.</label>
              <input className={inp} required value={form.source_no} onChange={(e) => set("source_no", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (₹)</label>
              <input type="number" step="0.01" className={inp} required value={form.amount} onChange={(e) => set("amount", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Release Date</label>
              <input type="date" className={inp} required value={form.release_date} onChange={(e) => set("release_date", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Narration</label>
              <input className={inp} value={form.narration} onChange={(e) => set("narration", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50">
            {isPending ? "Creating…" : "Create Release"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const Retention = () => {
  const [tab, setTab] = useState("releases");
  const [releaseParams, setReleaseParams] = useState({ page: 1, limit: 20, side: "", status: "" });
  const [outstandingFilter, setOutstandingFilter] = useState({ tender_id: "" });
  const [showCreate, setShowCreate] = useState(false);

  const { data: releaseData, isLoading: relLoading, refetch: refetchRel } = useRetentionReleaseList(releaseParams);
  const { data: payable, isLoading: payLoading, refetch: refetchPay } = useRetentionPayableOutstanding(outstandingFilter);
  const { data: receivable, isLoading: recLoading, refetch: refetchRec } = useRetentionReceivableOutstanding(outstandingFilter);
  const { data: summary } = useRetentionSummary(outstandingFilter);
  const { mutate: approve } = useApproveRetentionRelease();
  const { mutate: cancel } = useCancelRetentionRelease();

  const releases = releaseData?.data || [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Shield size={18} className="text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Retention</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Retention Ledger</h1>
          </div>
        </div>
        <button onClick={() => { refetchRel(); refetchPay(); refetchRec(); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + New Release
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Retention Payable O/S", value: fmtN(summary.payable_outstanding), cls: "text-amber-600 dark:text-amber-400" },
              { label: "Retention Receivable O/S", value: fmtN(summary.receivable_outstanding), cls: "text-blue-600 dark:text-blue-400" },
              { label: "Total Released (Payable)", value: fmtN(summary.payable_released), cls: "text-emerald-600 dark:text-emerald-400" },
              { label: "Total Released (Receivable)", value: fmtN(summary.receivable_released), cls: "text-emerald-600 dark:text-emerald-400" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-extrabold mt-0.5 tabular-nums ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 w-fit">
          {[["releases", "Releases"], ["payable", "Payable Outstanding"], ["receivable", "Receivable Outstanding"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === k ? "bg-purple-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "releases" && (
          <>
            <div className="flex gap-2">
              <select value={releaseParams.side} onChange={(e) => setReleaseParams({ ...releaseParams, side: e.target.value, page: 1 })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
                <option value="">All Sides</option>
                <option>Payable</option>
                <option>Receivable</option>
              </select>
              <select value={releaseParams.status} onChange={(e) => setReleaseParams({ ...releaseParams, status: e.target.value, page: 1 })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
                <option value="">All Status</option>
                <option>draft</option>
                <option>approved</option>
                <option>cancelled</option>
              </select>
            </div>
            {relLoading ? <div className="py-10 text-center text-sm text-gray-400">Loading…</div> : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      {["RR No.", "Side", "Party", "Source", "Amount", "Release Date", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {releases.map((r) => (
                      <tr key={r._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.rr_no}</td>
                        <td className="px-4 py-2 text-gray-500">{r.side}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.party_name}</td>
                        <td className="px-4 py-2 text-gray-500">{r.source_no}</td>
                        <td className="px-4 py-2 tabular-nums text-right font-semibold text-purple-600 dark:text-purple-400">{fmtN(r.amount)}</td>
                        <td className="px-4 py-2 text-gray-500">{fmt(r.release_date)}</td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_CLS[r.status] || ""}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5 justify-end">
                            <AttachmentsBadge
                              sourceType="RetentionRelease"
                              sourceRef={r._id}
                              sourceNo={r.rr_no}
                              readOnly={r.status === "approved" || r.status === "cancelled"}
                            />
                            {r.status === "draft" && (
                              <>
                                <button onClick={() => approve(r._id)} title="Approve" className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700">
                                  <CheckCircle size={13} />
                                </button>
                                <button onClick={() => cancel({ id: r._id, reason: "Cancelled by user" })} title="Cancel" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">
                                  <Ban size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!releases.length && <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">No releases found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {(tab === "payable" || tab === "receivable") && (
          <>
            <input value={outstandingFilter.tender_id} onChange={(e) => setOutstandingFilter({ tender_id: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-36" placeholder="Tender ID" />

            {(tab === "payable" ? payLoading : recLoading) ? <div className="py-10 text-center text-sm text-gray-400">Loading…</div> : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      {["Party", "Tender", "Bill No.", "Retention Amount", "Released", "Balance"].map((h) => (
                        <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(tab === "payable" ? payable : receivable)?.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.party_name || r.contractor_name || r.client_name}</td>
                        <td className="px-4 py-2 text-gray-500">{r.tender_id || "—"}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.source_no || "—"}</td>
                        <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">{fmtN(r.retention_amount)}</td>
                        <td className="px-4 py-2 tabular-nums text-right text-emerald-600">{fmtN(r.released_amount)}</td>
                        <td className="px-4 py-2 tabular-nums text-right font-semibold text-purple-600 dark:text-purple-400">{fmtN(r.balance_amount)}</td>
                      </tr>
                    ))}
                    {!(tab === "payable" ? payable : receivable)?.length && <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No outstanding retention.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && <CreateReleaseModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default Retention;
