import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Minus } from "lucide-react";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const pretty = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

const ScalarCell = ({ value, tone }) => {
  const cls =
    tone === "from"
      ? "text-rose-700 dark:text-rose-300 line-through decoration-rose-400/60"
      : "text-emerald-700 dark:text-emerald-300";
  return (
    <span className={`font-mono text-[11px] break-words ${cls}`}>
      {value === "" ? '""' : pretty(value)}
    </span>
  );
};

const JsonBlock = ({ value, tone }) => {
  const cls =
    tone === "from"
      ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200"
      : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-200";
  return (
    <pre
      className={`font-mono text-[10px] whitespace-pre-wrap break-words rounded-md border px-2 py-1.5 max-h-64 overflow-auto ${cls}`}
    >
      {pretty(value)}
    </pre>
  );
};

const FieldRow = ({ field, from, to }) => {
  const nested = isObj(from) || isObj(to) || Array.isArray(from) || Array.isArray(to);
  const fromIsNull = from === null || from === undefined;
  return (
    <div
      className="grid grid-cols-[minmax(120px,160px)_1fr_auto_1fr] items-start gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
      aria-label={`Changed ${field} from ${pretty(from)} to ${pretty(to)}`}
    >
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate pt-0.5">
        {field}
      </span>
      {nested ? (
        <JsonBlock value={from} tone="from" />
      ) : fromIsNull ? (
        <span className="text-[11px] italic text-gray-400">(not tracked)</span>
      ) : (
        <ScalarCell value={from} tone="from" />
      )}
      <span className="text-gray-400 text-[11px] pt-0.5">→</span>
      {nested ? (
        <JsonBlock value={to} tone="to" />
      ) : (
        <ScalarCell value={to} tone="to" />
      )}
    </div>
  );
};

const CollapsibleSnapshot = ({ label, data, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {label}
      </button>
      {open && <JsonBlock value={data} tone="to" />}
    </div>
  );
};

const EmptyState = ({ icon, text }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800/60 text-[12px] text-gray-600 dark:text-gray-300">
    {icon}
    <span>{text}</span>
  </div>
);

/**
 * Diff renderer — §5.4 of the app audit guide.
 * Props:
 *   row: AuditRow
 */
const AuditDiff = ({ row }) => {
  if (!row) return null;
  const { action, changes, meta } = row;

  // Bulk op — show filter + counts, no per-row diff.
  if (meta?.bulk === true) {
    const affected =
      meta.modified ?? meta.deleted ?? meta.upserted ?? meta.matched ?? null;
    return (
      <div className="space-y-2">
        <EmptyState
          icon={<Plus size={12} />}
          text={`Bulk ${action} — ${affected != null ? `${affected} affected` : "N rows affected"}`}
        />
        {meta.query && <CollapsibleSnapshot label="Filter (meta.query)" data={meta.query} defaultOpen />}
        {meta.update && <CollapsibleSnapshot label="Update (meta.update)" data={meta.update} />}
      </div>
    );
  }

  // Create with no diff → initial creation
  if (!changes && action === "create") {
    return (
      <div className="space-y-2">
        <EmptyState icon={<Plus size={12} />} text="(initial creation)" />
        {meta?.snapshot && <CollapsibleSnapshot label="Initial values" data={meta.snapshot} />}
      </div>
    );
  }

  // Delete with no diff → record removed + snapshot
  if (!changes && action === "delete") {
    return (
      <div className="space-y-2">
        <EmptyState icon={<Minus size={12} />} text="(record removed)" />
        {meta?.snapshot && (
          <CollapsibleSnapshot label="Final state" data={meta.snapshot} defaultOpen />
        )}
      </div>
    );
  }

  // Approve / reject with no diff → action only
  if (!changes) {
    return (
      <EmptyState
        icon={<Plus size={12} />}
        text={`(no field changes — ${action} action)`}
      />
    );
  }

  const entries = Object.entries(changes);
  if (!entries.length) {
    return <EmptyState icon={<Plus size={12} />} text="(no tracked field changes)" />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2">
      {entries.map(([field, pair]) => (
        <FieldRow key={field} field={field} from={pair?.from} to={pair?.to} />
      ))}
    </div>
  );
};

export default AuditDiff;
