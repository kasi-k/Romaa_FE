import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, RefreshCw, Search, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useDebounce } from "../../../hooks/useDebounce";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import {
  useIssuanceList,
  useSweepOverdue,
} from "./hooks/useIssuance";
import StatusChip from "../_shared/StatusChip";
import Loader from "../../../components/Loader";
import QuickReturnModal from "./QuickReturnModal";

const TABS = [
  { key: "all", label: "All", filter: {} },
  { key: "ISSUED", label: "Issued", filter: { status: "ISSUED" } },
  { key: "PARTIALLY_RETURNED", label: "Partially Returned", filter: { status: "PARTIALLY_RETURNED" } },
  { key: "RETURNED", label: "Returned", filter: { status: "RETURNED" } },
  { key: "OVERDUE", label: "Overdue", filter: { overdue: true } },
  { key: "LOST", label: "Lost", filter: { status: "LOST" } },
  { key: "DAMAGED", label: "Damaged", filter: { status: "DAMAGED" } },
];

const IssuanceList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAccess } = useAuth();
  const canCreate = canAccess(ASSET_MODULE, ASSET_SUB.ISSUANCE, ASSET_ACTION.CREATE);
  const canEdit = canAccess(ASSET_MODULE, ASSET_SUB.ISSUANCE, ASSET_ACTION.EDIT);

  const initialTab = searchParams.get("status") === "OVERDUE" ? "OVERDUE" : "all";
  const [tab, setTab] = useState(initialTab);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [filters, setFilters] = useState({ asset_kind: "", project_id: "" });
  const [returning, setReturning] = useState(null);

  const tabFilter = TABS.find((t) => t.key === tab)?.filter || {};
  const params = useMemo(() => ({
    page,
    limit: 20,
    search: debounced || undefined,
    asset_kind: filters.asset_kind || undefined,
    project_id: filters.project_id || undefined,
    ...tabFilter,
  }), [page, debounced, filters, tabFilter]);

  const { data, isLoading, isFetching, refetch } = useIssuanceList(params);
  const rows = data?.data?.rows || data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const { mutate: sweep, isPending: sweeping } = useSweepOverdue();

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Asset Issuance</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cross-cutting custody log</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className={btnSecondary}>
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
          {canEdit && (
            <button
              onClick={() => sweep()}
              disabled={sweeping}
              className={btnSecondary}
              title="Manually run the daily overdue sweep"
            >
              <AlertCircle size={14} /> {sweeping ? "Sweeping…" : "Sweep Overdue"}
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => navigate("/asset/issuance/new")}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Plus size={14} /> Issue Asset
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3 bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
              if (t.key === "OVERDUE") setSearchParams({ status: "OVERDUE" });
              else setSearchParams({});
            }}
            className={`cursor-pointer px-3 py-1.5 text-xs rounded ${
              tab === t.key
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Issue ID / asset / custodian…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
            />
          </div>
          <select value={filters.asset_kind} onChange={(e) => { setFilters((f) => ({ ...f, asset_kind: e.target.value })); setPage(1); }} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded">
            <option value="">Kind: All</option>
            <option>TAGGED</option>
            <option>BULK</option>
            <option>MACHINERY</option>
          </select>
          <input
            value={filters.project_id}
            onChange={(e) => setFilters((f) => ({ ...f, project_id: e.target.value }))}
            placeholder="Project ID"
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded w-32"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <Th>Issue ID</Th>
                <Th>Asset</Th>
                <Th>Custodian</Th>
                <Th>Site</Th>
                <Th>Issued</Th>
                <Th>Expected Return</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-12"><Loader /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">No issuances.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.issue_id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <Td className="font-mono">{r.issue_id}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <StatusChip value={r.asset_kind} />
                      <span className="font-mono text-xs">{r.asset_id_label}</span>
                    </div>
                    <div className="text-[10px] text-gray-500">{r.asset_name}</div>
                  </Td>
                  <Td>
                    <div className="text-xs">{r.assigned_to_name}</div>
                    <div className="text-[10px] text-gray-500">{r.assigned_to_kind}</div>
                  </Td>
                  <Td className="text-xs">{r.site_name || "—"}</Td>
                  <Td className="text-xs">{r.issue_date ? new Date(r.issue_date).toLocaleDateString() : "—"}</Td>
                  <Td className="text-xs">{r.expected_return_date ? new Date(r.expected_return_date).toLocaleDateString() : "—"}</Td>
                  <Td><StatusChip value={r.status} /></Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => navigate(`/asset/issuance/${r.issue_id}`)} className="cursor-pointer text-xs text-blue-600 hover:underline">
                        View
                      </button>
                      {canEdit && r.status !== "RETURNED" && r.status !== "LOST" && (
                        <button onClick={() => setReturning(r)} className="cursor-pointer text-xs text-emerald-600 hover:underline">
                          Return
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {returning && (
        <QuickReturnModal
          issuance={returning}
          onClose={() => setReturning(null)}
        />
      )}
    </div>
  );
};

const btnSecondary = "cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800";
const Th = ({ children }) => <th className="px-3 py-2 text-left font-semibold">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;

export default IssuanceList;
