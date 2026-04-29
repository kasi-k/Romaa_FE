import { History, UserCircle2 } from "lucide-react";
import { useFinanceAuditForEntity } from "../hooks/useFinanceAudit";

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

const ACTION_CLS = {
  create: "bg-emerald-50 text-emerald-700 border-emerald-200",
  update: "bg-blue-50 text-blue-700 border-blue-200",
  approve: "bg-green-50 text-green-700 border-green-200",
  reject: "bg-red-50 text-red-700 border-red-200",
  delete: "bg-red-50 text-red-700 border-red-200",
  cancel: "bg-amber-50 text-amber-700 border-amber-200",
  reverse: "bg-purple-50 text-purple-700 border-purple-200",
  import: "bg-indigo-50 text-indigo-700 border-indigo-200",
  export: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const renderDiff = (changes) => {
  if (!changes) return null;
  const before = changes.before || {};
  const after = changes.after || {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  if (!keys.length) return null;
  return (
    <ul className="mt-1 text-[11px] text-gray-500 space-y-0.5">
      {keys.slice(0, 6).map((k) => (
        <li key={k} className="flex flex-wrap gap-1">
          <code className="font-mono text-gray-400">{k}</code>:
          <span className="line-through text-red-400">{JSON.stringify(before[k])}</span>
          <span className="text-gray-400">→</span>
          <span className="text-emerald-600">{JSON.stringify(after[k])}</span>
        </li>
      ))}
    </ul>
  );
};

const AuditHistoryPanel = ({ entityType, entityId }) => {
  const { data: entries = [], isLoading } = useFinanceAuditForEntity(entityType, entityId);

  if (!entityType || !entityId) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <History size={14} className="text-gray-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Change History
        </span>
        <span className="text-xs text-gray-400">({entries.length})</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700/60 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">Loading history…</div>
        ) : entries.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">
            No recorded changes yet
          </div>
        ) : (
          entries.map((e) => (
            <div key={e._id || `${e.action}-${e.createdAt}`} className="px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                    ACTION_CLS[e.action] || "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {e.action}
                </span>
                <UserCircle2 size={12} className="text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {e.actor_name || e.actor_id || "system"}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 tabular-nums">
                  {fmtDateTime(e.createdAt)}
                </span>
              </div>
              {renderDiff(e.changes)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditHistoryPanel;
