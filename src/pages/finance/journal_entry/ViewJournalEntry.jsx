import { IoClose } from "react-icons/io5";
import {
  CheckCircle2, RotateCcw, Trash2, CalendarDays,
  BookOpen, ArrowRightLeft, Hash, AlertTriangle,
} from "lucide-react";
import { FiUser } from "react-icons/fi";
import AttachmentsPanel from "../shared/components/AttachmentsPanel";
import AuditHistoryPanel from "../shared/components/AuditHistoryPanel";
import ApprovalHistoryPanel from "../shared/components/ApprovalHistoryPanel";

const fmt     = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_STYLE = {
  draft:    "bg-gray-100 text-gray-600 border-gray-200",
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const TYPE_BADGE = {
  "Depreciation":           "bg-amber-50 text-amber-700",
  "Bank Reconciliation":    "bg-blue-50 text-blue-700",
  "Payroll":                "bg-teal-50 text-teal-700",
  "Accrual":                "bg-violet-50 text-violet-700",
  "Opening Balance":        "bg-slate-100 text-slate-700",
  "ITC Reversal":           "bg-red-50 text-red-700",
  "Inter-Account Transfer": "bg-emerald-50 text-emerald-700",
  "Reversal":               "bg-rose-50 text-rose-700",
  "Payment":                "bg-blue-50 text-blue-700",
  "Receipt":                "bg-green-50 text-green-700",
  "Purchase Invoice":       "bg-orange-50 text-orange-700",
  "Contractor Bill":        "bg-indigo-50 text-indigo-700",
};

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{label}</span>
    <span className={`text-xs text-right text-gray-700 dark:text-gray-200 ${mono ? "font-mono" : "font-medium"}`}>
      {value ?? "—"}
    </span>
  </div>
);

const ViewJournalEntry = ({ je, onClose, onApprove, onReverse, onDelete }) => {
  if (!je) return null;

  const canEdit   = je.status === "draft" || je.status === "pending";
  const canApprove = je.status === "pending";
  const canReverse = je.status === "approved" && !je.is_reversal;

  const totalDr = je.total_debit  || je.lines?.reduce((s, l) => s + (l.debit_amt  || 0), 0) || 0;
  const totalCr = je.total_credit || je.lines?.reduce((s, l) => s + (l.credit_amt || 0), 0) || 0;
  const balanced = Math.abs(totalDr - totalCr) < 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-roboto-flex p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <BookOpen size={16} className="text-indigo-700 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-400">{je.je_no}</code>
                <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${STATUS_STYLE[je.status] || STATUS_STYLE.pending}`}>
                  {je.status}
                </span>
                {je.is_posted && (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full px-2 py-0.5">
                    Posted ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {je.je_type} &nbsp;·&nbsp; {fmtDate(je.je_date)} &nbsp;·&nbsp; FY {je.financial_year}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Reversal / Auto-gen badges */}
          {(je.is_reversal || je.source_type || je.auto_reverse_date || je.auto_reversed) && (
            <div className="flex flex-wrap gap-2">
              {je.is_reversal && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-1.5">
                  <RotateCcw size={12} />
                  Reversal of {je.reversal_of_no}
                </div>
              )}
              {je.source_type && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5">
                  <ArrowRightLeft size={12} />
                  Auto-generated from {je.source_type}: {je.source_no}
                </div>
              )}
              {je.auto_reverse_date && !je.auto_reversed && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-1.5">
                  <CalendarDays size={12} />
                  Auto-reversal on {fmtDate(je.auto_reverse_date)}
                </div>
              )}
              {je.auto_reversed && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-1.5">
                  <CheckCircle2 size={12} />
                  Auto-reversed
                </div>
              )}
            </div>
          )}

          {/* Narration */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Narration</p>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{je.narration || "—"}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Entry Info</p>
              <InfoRow label="JE Type"   value={
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[je.je_type] || "bg-gray-100 text-gray-600"}`}>
                  {je.je_type}
                </span>
              } />
              <InfoRow label="Date"         value={fmtDate(je.je_date)} />
              <InfoRow label="Financial Yr" value={je.financial_year} />
              <InfoRow label="Created"      value={fmtDateTime(je.createdAt)} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Approval</p>
              <InfoRow label="Status"    value={je.status} />
              <InfoRow label="Posted"    value={je.is_posted ? "Yes" : "No"} />
              {je.approved_at && <InfoRow label="Approved At" value={fmtDateTime(je.approved_at)} />}
              {je.tender_id   && <InfoRow label="Tender"      value={<span className="flex items-center gap-1"><Hash size={10} />{je.tender_id}</span>} />}
              {je.tender_name && <InfoRow label="Tender Name" value={je.tender_name} />}
            </div>
          </div>

          {/* Lines table */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Journal Lines</p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    {["#", "Account Code", "Account Name", "Type", "Dr/Cr", "Debit (₹)", "Credit (₹)", "Narration"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap border-b border-gray-200 dark:border-gray-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {(je.lines || []).map((line, idx) => (
                    <tr key={idx} className={line.dr_cr === "Dr" ? "bg-red-50/30 dark:bg-red-900/5" : "bg-emerald-50/30 dark:bg-emerald-900/5"}>
                      <td className="px-3 py-2.5 text-xs text-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2.5">
                        <code className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{line.account_code}</code>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-gray-200">{line.account_name || "—"}</td>
                      <td className="px-3 py-2.5">
                        {line.account_type && (
                          <span className="text-[9px] font-bold uppercase bg-gray-100 dark:bg-gray-700 text-gray-500 rounded px-1.5 py-0.5">{line.account_type}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 ${
                          line.dr_cr === "Dr"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        }`}>
                          {line.dr_cr}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-right text-xs font-bold text-red-600 dark:text-red-400">
                        {line.debit_amt ? `₹${fmt(line.debit_amt)}` : "—"}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {line.credit_amt ? `₹${fmt(line.credit_amt)}` : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">{line.narration || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800/60 border-t-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <td colSpan={5} className="px-3 py-2.5 text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      TOTAL
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-right text-sm font-extrabold text-red-600 dark:text-red-400">
                      ₹{fmt(totalDr)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-right text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{fmt(totalCr)}
                    </td>
                    <td className="px-3 py-2.5">
                      {balanced ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 size={11} /> Balanced
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                          <AlertTriangle size={11} /> Unbalanced
                        </span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── Attachments · Audit · Approval side panels ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
            <AttachmentsPanel
              sourceType="JournalEntry"
              sourceRef={je._id}
              sourceNo={je.je_no}
              tenderId={je.tender_id}
              readOnly={je.status === "approved"}
            />
            <AuditHistoryPanel entityType="JournalEntry" entityId={je._id} />
          </div>
          {Array.isArray(je.approval_log) && je.approval_log.length > 0 && (
            <ApprovalHistoryPanel log={je.approval_log} />
          )}

        </div>

        {/* ── Actions Footer ── */}
        <div className="bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-700 px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => { if (window.confirm(`Delete ${je.je_no}?`)) { onDelete(je._id); } }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
            {canReverse && (
              <button
                type="button"
                onClick={() => onReverse(je)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sm font-semibold transition-colors"
              >
                <RotateCcw size={13} /> Reverse
              </button>
            )}
            {canApprove && (
              <button
                type="button"
                onClick={() => onApprove(je._id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                <CheckCircle2 size={13} /> Approve & Post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJournalEntry;
