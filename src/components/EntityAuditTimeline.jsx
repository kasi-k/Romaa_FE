import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import AuditDiff from "./AuditDiff";
import { useEntityAudit } from "../pages/settings/audit_trail/hooks/useAuditTrail";
import ActionChip from "../pages/settings/audit_trail/ActionChip";
import {
  displayActor,
  fmtAbsolute,
  fmtRelative,
} from "../pages/settings/audit_trail/auditShared";

/* Vertical timeline of audit events for one record. Embed on any entity detail
   page as an "Activity" tab. Takes entityType + entityId; loads /audit/:type/:id. */

const TimelineItem = ({ row, last }) => {
  const [open, setOpen] = useState(false);
  const hasChanges =
    !!row.changes && Object.keys(row.changes).length > 0;
  const hasSnapshot = !!row.meta?.snapshot;
  const canExpand = hasChanges || hasSnapshot || row.meta?.bulk === true;

  return (
    <li className="relative pl-7 pb-4">
      {/* rail */}
      {!last && (
        <span className="absolute left-[10px] top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-700" aria-hidden />
      )}
      {/* dot */}
      <span className="absolute left-1.5 top-1.5 w-[10px] h-[10px] rounded-full bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/40" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ActionChip action={row.action} />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
              {displayActor(row)}
            </span>
            <span
              className="text-[11px] text-gray-500"
              title={fmtAbsolute(row.createdAt)}
            >
              · {fmtRelative(row.createdAt)}
            </span>
          </div>
          {canExpand && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              {open ? "Hide changes" : "Show changes"}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-2">
          <AuditDiff row={row} />
        </div>
      )}
    </li>
  );
};

const EntityAuditTimeline = ({ entityType, entityId, title = "Activity" }) => {
  const { data, isLoading, isFetching, refetch } = useEntityAudit(entityType, entityId);
  const rows = Array.isArray(data) ? data : [];

  if (!entityType || !entityId) {
    return (
      <div className="py-8 text-center text-xs text-gray-400">
        Save this record first to see its activity log.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-gray-500" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          {rows.length > 0 && (
            <span className="text-[10px] font-semibold text-gray-400">
              · {rows.length} event{rows.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          title="Refresh"
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-gray-400">Loading activity…</div>
      ) : rows.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">
          No activity recorded for this record yet.
        </div>
      ) : (
        <ul className="relative">
          {rows.map((row, i) => (
            <TimelineItem
              key={row._id || i}
              row={row}
              last={i === rows.length - 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default EntityAuditTimeline;
