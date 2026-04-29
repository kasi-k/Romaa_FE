import { useState } from "react";
import { ClipboardList, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useAuditTrail } from "./hooks/useAuditTrail";

const fmt = (v) => v ? new Date(v).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const ACTION_CLS = {
  create:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  update:  "bg-blue-50 text-blue-700 border-blue-200",
  approve: "bg-indigo-50 text-indigo-700 border-indigo-200",
  reverse: "bg-amber-50 text-amber-700 border-amber-200",
  cancel:  "bg-red-50 text-red-600 border-red-200",
  delete:  "bg-red-100 text-red-700 border-red-200",
};

const FieldChanges = ({ changes }) => {
  if (!changes?.length) return null;
  return (
    <div className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1 text-[10px] font-mono bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
      {changes.map((c, i) => (
        <div key={i} className="contents">
          <span className="text-gray-500 font-semibold truncate">{c.field}</span>
          <span className="text-red-500 line-through truncate">{String(c.before ?? "—")}</span>
          <span className="text-emerald-600 truncate">{String(c.after ?? "—")}</span>
        </div>
      ))}
    </div>
  );
};

const AuditRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  const hasChanges = row.field_changes?.length > 0;

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div
        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 ${hasChanges ? "cursor-pointer" : ""}`}
        onClick={() => hasChanges && setOpen(!open)}
      >
        <div className="shrink-0 mt-0.5">
          {hasChanges ? (open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />) : <span className="w-3 inline-block" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ACTION_CLS[row.action] || "bg-gray-100 text-gray-500 border-gray-200"}`}>{row.action}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{row.doc_type}</span>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{row.source_no || row.je_no}</span>
            {row.je_no && row.source_no && <span className="text-xs font-mono text-gray-400">{row.je_no}</span>}
          </div>
          {open && <FieldChanges changes={row.field_changes} />}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{row.user_name}</p>
          <p className="text-[10px] text-gray-400">{fmt(row.timestamp)}</p>
        </div>
      </div>
    </div>
  );
};

const AuditTrail = () => {
  const [params, setParams] = useState({
    page: 1, limit: 50,
    from_date: "", to_date: "",
    doc_type: "", user_id: "", source_no: "", tender_id: "",
  });
  const [applied, setApplied] = useState({});

  const { data, isLoading, refetch } = useAuditTrail(applied);
  const rows = data?.data || [];

  const apply = () => { setApplied({ ...params }); };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList size={18} className="text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Audit Trail (Companies Act Rule 11(g))</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "from_date", type: "date", placeholder: "From date" },
            { key: "to_date", type: "date", placeholder: "To date" },
          ].map(({ key, type, placeholder }) => (
            <input key={key} type={type} placeholder={placeholder} value={params[key]}
              onChange={(e) => setParams({ ...params, [key]: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400" />
          ))}
          <input placeholder="Doc type" value={params.doc_type} onChange={(e) => setParams({ ...params, doc_type: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-32" />
          <input placeholder="Doc / JE no." value={params.source_no} onChange={(e) => setParams({ ...params, source_no: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-36" />
          <input placeholder="Tender ID" value={params.tender_id} onChange={(e) => setParams({ ...params, tender_id: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-28" />
          <button onClick={apply} className="px-4 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors">Fetch</button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          {data?.totalCount > 0 && <span className="text-xs text-gray-400">{data.totalCount.toLocaleString()} records</span>}
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2" />Loading…
          </div>
        )}

        {!isLoading && rows.length > 0 && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 rounded-t-xl text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Action · Document</span>
                <span className="col-span-1 pl-1">Changes</span>
                <span className="text-right">User · Time</span>
              </div>
              {rows.map((r, i) => <AuditRow key={i} row={r} />)}
            </div>

            {(data?.totalPages || 0) > 1 && (
              <div className="flex items-center justify-end gap-2 mt-3">
                <button disabled={params.page <= 1} onClick={() => setParams({ ...params, page: params.page - 1 })}
                  className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Prev</button>
                <span className="text-xs text-gray-500">Page {params.page} / {data?.totalPages}</span>
                <button disabled={params.page >= (data?.totalPages || 1)} onClick={() => setParams({ ...params, page: params.page + 1 })}
                  className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Next</button>
              </div>
            )}
          </>
        )}

        {!isLoading && !rows.length && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
            <ClipboardList size={44} className="opacity-20" />
            <p className="text-sm font-semibold">Select a date range and click Fetch to view the audit trail.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
