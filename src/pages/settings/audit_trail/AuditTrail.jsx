import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Link as LinkIcon,
  AlertTriangle,
  User as UserIcon,
} from "lucide-react";
import Title from "../../../components/Title";
import Loader from "../../../components/Loader";
import AuditDiff from "../../../components/AuditDiff";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAuth } from "../../../context/AuthContext";
import { useAuditTrail } from "./hooks/useAuditTrail";
import { useEmployeesForApproval } from "../approval_rules/hooks/useApprovalRules";
import { buildEntityLink, ENTITY_OPTIONS } from "./entityLinks";
import ActionChip from "./ActionChip";
import {
  ACTION_OPTIONS,
  displayActor,
  fmtAbsolute,
  fmtRelative,
} from "./auditShared";

/* --------------------------- Sub-components ---------------------------- */

const ActorPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const debounced = useDebounce(search, 300);
  const ref = useRef(null);

  const { data } = useEmployeesForApproval({ search: debounced, limit: 15 });
  const items = data?.data || [];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white hover:border-gray-300 min-w-[150px]"
      >
        <UserIcon size={12} className="text-gray-400" />
        <span className="truncate">
          {value ? selectedLabel || `Actor ${String(value).slice(-6)}` : "All actors"}
        </span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-72 bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {value && (
              <li>
                <button
                  onClick={() => { onChange(""); setSelectedLabel(""); setOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10"
                >
                  Clear actor filter
                </button>
              </li>
            )}
            {items.length === 0 && (
              <li className="px-3 py-3 text-[11px] text-gray-400 text-center">No employees</li>
            )}
            {items.map((emp) => (
              <li key={emp._id}>
                <button
                  onClick={() => {
                    onChange(emp._id);
                    setSelectedLabel(emp.name || emp.fullName || emp.email || emp._id);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
                >
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {emp.name || emp.fullName || "—"}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{emp.email || emp.empId || emp._id}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ params, setParams, onApply, onReset, fetching }) => (
  <div className="flex flex-wrap items-center gap-2">
    <select
      value={params.entity_type}
      onChange={(e) => setParams({ ...params, entity_type: e.target.value })}
      className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
    >
      <option value="">All modules</option>
      {ENTITY_OPTIONS.map((g) => (
        <optgroup key={g.group} label={g.group}>
          {g.items.map((e) => <option key={e} value={e}>{e}</option>)}
        </optgroup>
      ))}
    </select>
    <select
      value={params.action}
      onChange={(e) => setParams({ ...params, action: e.target.value })}
      className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
    >
      <option value="">All actions</option>
      {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
    </select>
    <ActorPicker
      value={params.actor_id}
      onChange={(id) => setParams({ ...params, actor_id: id })}
    />
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
    <div className="relative">
      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={params.q}
        placeholder="Entity no / actor name"
        onChange={(e) => setParams({ ...params, q: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onApply()}
        className="border border-gray-200 dark:border-gray-700 rounded-lg pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 w-52"
      />
    </div>
    <button
      onClick={onApply}
      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
    >
      Apply
    </button>
    <button
      onClick={onReset}
      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 text-xs font-semibold text-gray-600 dark:text-gray-300 rounded-lg"
    >
      Reset
    </button>
    <RefreshCw size={14} className={`text-gray-400 ${fetching ? "animate-spin" : ""}`} />
  </div>
);

const AuditDrawer = ({ row, onClose }) => {
  const closeBtnRef = useRef(null);

  // Esc to close + lock body scroll while open
  useEffect(() => {
    if (!row) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [row, onClose]);

  if (!row) return null;
  const link = buildEntityLink(row);
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Audit row details">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative w-full sm:max-w-xl h-full bg-white dark:bg-layout-dark shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ActionChip action={row.action} />
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {row.entity_type}
              </span>
              {row.entity_no && (
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  {row.entity_no}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{displayActor(row)}</span>
              {" · "}
              <span title={fmtAbsolute(row.createdAt)}>{fmtRelative(row.createdAt)}</span>
            </p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-4 sm:px-5 py-2.5 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <p className="text-gray-400 uppercase font-bold tracking-wider">Correlation ID</p>
            <p className="font-mono text-gray-700 dark:text-gray-300 truncate">{row.correlation_id || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase font-bold tracking-wider">IP Address</p>
            <p className="font-mono text-gray-700 dark:text-gray-300">{row.ip_address || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase font-bold tracking-wider">Entity ID</p>
            <p className="font-mono text-gray-700 dark:text-gray-300 truncate">{row.entity_id || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 uppercase font-bold tracking-wider">Timestamp</p>
            <p className="font-mono text-gray-700 dark:text-gray-300">{fmtAbsolute(row.createdAt)}</p>
          </div>
          {link && (
            <a
              href={link}
              className="col-span-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
            >
              <LinkIcon size={11} /> Open record in module
            </a>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Changes</p>
          <AuditDiff row={row} />
        </div>
      </aside>
    </div>
  );
};

/* ------------------------------- Main ---------------------------------- */

const DEFAULT_PARAMS = {
  entity_type: "",
  action: "",
  actor_id: "",
  from_date: "",
  to_date: "",
  q: "",
};

const AuditTrail = () => {
  const { canAccess } = useAuth();
  const hasRead = canAccess?.("audit", "trail", "read");

  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [applied, setApplied] = useState(DEFAULT_PARAMS);
  const [selected, setSelected] = useState(null);

  const debouncedQ = useDebounce(applied.q, 300);

  const query = useMemo(
    () => ({ ...applied, q: debouncedQ, page, limit }),
    [applied, debouncedQ, page, limit],
  );

  const { data, isLoading, isFetching } = useAuditTrail(query, {
    enabled: hasRead !== false,
  });

  const rows = data?.data || [];
  const totalPages = data?.pagination?.pages || 0;
  const total = data?.pagination?.total || 0;

  const onApply = () => {
    setApplied({ ...params });
    setPage(1);
  };
  const onReset = () => {
    setParams(DEFAULT_PARAMS);
    setApplied(DEFAULT_PARAMS);
    setPage(1);
  };

  if (hasRead === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <AlertTriangle size={36} className="text-amber-500 mb-3" />
        <p className="text-sm font-semibold">You don't have permission to view the audit trail.</p>
        <p className="text-xs mt-1">Requires <code className="font-mono">audit.trail.read</code>.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-slate-50 dark:bg-overall_bg-dark">
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
        <Title title="Settings" sub_title="Audit Trail" page_title="Audit Trail" />
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          Cross-module activity log. Every create, update, delete, approve and reject is recorded with actor, diff and correlation id.
        </p>
      </div>

      <div className="px-4 sm:px-6 pb-3">
        <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl px-3 sm:px-4 py-3">
          <FilterBar params={params} setParams={setParams} onApply={onApply} onReset={onReset} fetching={isFetching} />
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 sm:px-6 pb-6">
        <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto flex-1 min-h-0 flex flex-col">
            <div className="min-w-[760px] flex flex-col flex-1 min-h-0">
              <div className="grid grid-cols-[140px_minmax(120px,1fr)_minmax(120px,1fr)_minmax(110px,1fr)_110px_80px] gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Time</span>
                <span>Actor</span>
                <span>Module</span>
                <span>Entity #</span>
                <span>Action</span>
                <span className="text-right">View</span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader fullScreen={false} message="Loading audit trail…" />
                </div>
              ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                  <ClipboardList size={44} className="opacity-20" />
                  <p className="text-sm font-semibold">No audit rows match your filters.</p>
                  <p className="text-[11px]">Try widening the date range or clearing filters.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((row) => {
                    const link = buildEntityLink(row);
                    return (
                      <div
                        key={row._id}
                        onClick={() => setSelected(row)}
                        className="grid grid-cols-[140px_minmax(120px,1fr)_minmax(120px,1fr)_minmax(110px,1fr)_110px_80px] gap-3 px-4 py-2.5 items-center hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 cursor-pointer text-xs"
                      >
                        <span
                          className="text-gray-600 dark:text-gray-300 truncate"
                          title={fmtAbsolute(row.createdAt)}
                        >
                          {fmtRelative(row.createdAt)}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {displayActor(row)}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{row.entity_type}</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 truncate">
                          {link ? (
                            <a
                              href={link}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline"
                            >
                              {row.entity_no || "—"}
                            </a>
                          ) : (
                            row.entity_no || "—"
                          )}
                        </span>
                        <ActionChip action={row.action} />
                        <span className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelected(row); }}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            Open →
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {rows.length > 0 && totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {total.toLocaleString()} total · page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && <AuditDrawer row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AuditTrail;
