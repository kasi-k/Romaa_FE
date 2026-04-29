import { useMemo, useState } from "react";
import { ClipboardList, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import Title from "../../components/Title";
import Loader from "../../components/Loader";
import AuditDiff from "../../components/AuditDiff";
import { useMyAudit } from "../settings/audit_trail/hooks/useAuditTrail";
import { buildEntityLink } from "../settings/audit_trail/entityLinks";
import ActionChip from "../settings/audit_trail/ActionChip";
import {
  ACTION_OPTIONS,
  fmtAbsolute,
  fmtRelative,
} from "../settings/audit_trail/auditShared";

const Row = ({ row }) => {
  const [open, setOpen] = useState(false);
  const link = buildEntityLink(row);
  const canExpand =
    !!row.changes && Object.keys(row.changes).length > 0 ||
    !!row.meta?.snapshot ||
    row.meta?.bulk === true;
  return (
    <li className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div
        onClick={() => canExpand && setOpen((o) => !o)}
        className={`px-4 py-3 flex items-center gap-3 text-xs ${canExpand ? "cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10" : ""}`}
      >
        <span className="shrink-0">
          {canExpand ? (open ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />) : <span className="w-3 inline-block" />}
        </span>
        <ActionChip action={row.action} />
        <span className="font-semibold text-gray-800 dark:text-gray-100 truncate min-w-[120px]">
          {row.entity_type}
        </span>
        <span className="font-mono text-indigo-600 dark:text-indigo-400 truncate">
          {link ? (
            <a href={link} onClick={(e) => e.stopPropagation()} className="hover:underline">
              {row.entity_no || "—"}
            </a>
          ) : (
            row.entity_no || "—"
          )}
        </span>
        <span
          className="ml-auto text-[11px] text-gray-500 shrink-0"
          title={fmtAbsolute(row.createdAt)}
        >
          {fmtRelative(row.createdAt)}
        </span>
      </div>
      {open && (
        <div className="px-8 pb-3">
          <AuditDiff row={row} />
        </div>
      )}
    </li>
  );
};

const DEFAULT = { from_date: "", to_date: "", action: "" };

const MyActivity = () => {
  const [params, setParams] = useState(DEFAULT);
  const [applied, setApplied] = useState(DEFAULT);

  const { data: rows = [], isLoading, isFetching, refetch } = useMyAudit(applied);

  const grouped = useMemo(() => {
    const g = {};
    for (const r of rows) {
      const date = r.createdAt ? new Date(r.createdAt).toDateString() : "—";
      (g[date] = g[date] || []).push(r);
    }
    return Object.entries(g);
  }, [rows]);

  const apply = () => setApplied({ ...params });
  const reset = () => { setParams(DEFAULT); setApplied(DEFAULT); };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-slate-50 dark:bg-overall_bg-dark">
      <div className="px-6 pt-5 pb-3">
        <Title title="Account" sub_title="My Activity" page_title="My Activity" />
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          Everything you've done on Romaa over the last 500 actions.
        </p>
      </div>

      <div className="px-6 pb-3">
        <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex flex-wrap items-center gap-2">
          <select
            value={params.action}
            onChange={(e) => setParams({ ...params, action: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="">All actions</option>
            {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            type="date"
            value={params.from_date}
            onChange={(e) => setParams({ ...params, from_date: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            title="From date"
          />
          <input
            type="date"
            value={params.to_date}
            onChange={(e) => setParams({ ...params, to_date: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            title="To date"
          />
          <button
            onClick={apply}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Apply
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 text-xs font-semibold text-gray-600 dark:text-gray-300 rounded-lg"
          >
            Reset
          </button>
          <button
            onClick={() => refetch()}
            title="Refresh"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-6">
        <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader fullScreen={false} message="Loading your activity…" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
              <ClipboardList size={44} className="opacity-20" />
              <p className="text-sm font-semibold">No activity in this range.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {grouped.map(([date, list]) => (
                <div key={date}>
                  <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                    {date}
                    <span className="ml-2 text-gray-400 font-semibold">· {list.length}</span>
                  </div>
                  <ul>
                    {list.map((row, i) => <Row key={row._id || i} row={row} />)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyActivity;
