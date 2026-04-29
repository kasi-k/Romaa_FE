import { CheckCircle2, XCircle, MessageSquare, Clock } from "lucide-react";

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const ICON = {
  approved: <CheckCircle2 size={14} className="text-emerald-500" />,
  rejected: <XCircle size={14} className="text-red-500" />,
  pending: <Clock size={14} className="text-amber-500" />,
  withdrawn: <XCircle size={14} className="text-gray-400" />,
  comment: <MessageSquare size={14} className="text-blue-500" />,
};

/**
 * Renders approval_log[] entries inline from a document or approval request.
 * Pass either `log` directly or `approvalRequest` with an `approval_log` array.
 */
const ApprovalHistoryPanel = ({ log, approvalRequest }) => {
  const entries = log || approvalRequest?.approval_log || [];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <CheckCircle2 size={14} className="text-gray-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Approval History
        </span>
        <span className="text-xs text-gray-400">({entries.length})</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {entries.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">
            No approval activity yet
          </div>
        ) : (
          entries.map((e, i) => (
            <div key={e._id || i} className="px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                {ICON[e.action] || ICON.comment}
                <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">
                  {e.action}
                </span>
                <span className="text-gray-400">by</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {e.actor_name || e.by_name || e.actor_id || e.by || "—"}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 tabular-nums">
                  {fmtDateTime(e.at || e.createdAt)}
                </span>
              </div>
              {e.comment && (
                <p className="mt-1 pl-5 text-gray-500 italic">&ldquo;{e.comment}&rdquo;</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalHistoryPanel;
