import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  QrCode,
  Filter as FilterIcon,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useDebounce } from "../../../hooks/useDebounce";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import StatusChip from "../_shared/StatusChip";
import Loader from "../../../components/Loader";
import { useTaggedAssetList } from "./hooks/useTaggedAsset";

const ASSET_CLASSES = ["Tool", "IT", "Survey", "Furniture", "SiteInfra", "SafetyEquipment"];
const STATUSES = ["ACTIVE", "IN_STORE", "ISSUED", "UNDER_REPAIR", "LOST", "SCRAPPED"];
const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"];
const OWNERSHIPS = ["OWNED", "RENTED", "LEASED"];

const TaggedAssetList = () => {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canCreate = canAccess(ASSET_MODULE, ASSET_SUB.TAGGED_ASSET, ASSET_ACTION.CREATE);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [filters, setFilters] = useState({
    asset_class: "",
    status: "",
    condition: "",
    ownership: "",
    include_deleted: false,
  });

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: debounced || undefined,
      asset_class: filters.asset_class || undefined,
      status: filters.status || undefined,
      condition: filters.condition || undefined,
      ownership: filters.ownership || undefined,
      include_deleted: filters.include_deleted ? true : undefined,
    }),
    [page, debounced, filters],
  );

  const { data, isLoading, isFetching, refetch } = useTaggedAssetList(params);
  const rows = data?.data?.rows || data?.data || [];
  const totalPages = data?.meta?.totalPages || data?.totalPages || 1;

  const setFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tagged Assets</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Per-unit serial-tracked assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => alert("QR scan: requires camera permission. Add a barcode-scanner library to wire this up.")}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Scan QR / Barcode"
          >
            <QrCode size={14} />
          </button>
          {canCreate && (
            <button
              onClick={() => navigate("/asset/tagged/new")}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Plus size={14} /> Register Asset
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Asset ID / name / serial / QR…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
            />
          </div>
          <Select label="Class" value={filters.asset_class} onChange={(v) => setFilter("asset_class", v)} opts={ASSET_CLASSES} />
          <Select label="Status" value={filters.status} onChange={(v) => setFilter("status", v)} opts={STATUSES} />
          <Select label="Condition" value={filters.condition} onChange={(v) => setFilter("condition", v)} opts={CONDITIONS} />
          <Select label="Ownership" value={filters.ownership} onChange={(v) => setFilter("ownership", v)} opts={OWNERSHIPS} />
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.include_deleted}
              onChange={(e) => setFilter("include_deleted", e.target.checked)}
              className="cursor-pointer accent-blue-600"
            />
            Show retired
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <Th>Asset ID</Th>
                <Th>Name</Th>
                <Th>Class</Th>
                <Th>Status</Th>
                <Th>Condition</Th>
                <Th>Location / Custodian</Th>
                <Th>Calibration Due</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-12"><Loader /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500">No assets match your filters.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.asset_id}
                    onClick={() => navigate(`/asset/tagged/${r.asset_id}`)}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                  >
                    <Td className="font-mono">{r.asset_id}</Td>
                    <Td>
                      <div className="font-semibold text-gray-900 dark:text-white">{r.asset_name}</div>
                      {r.serial_number && <div className="text-[10px] text-gray-500">SN: {r.serial_number}</div>}
                    </Td>
                    <Td><StatusChip value={r.asset_class} /></Td>
                    <Td><StatusChip value={r.status} /></Td>
                    <Td><StatusChip value={r.condition} /></Td>
                    <Td>
                      <div className="text-xs">{r.assigned_to_employee_name || r.current_site_name || r.current_store_name || "—"}</div>
                      <div className="text-[10px] text-gray-500">{r.current_location_type}</div>
                    </Td>
                    <Td>
                      {r.compliance?.next_calibration_due ? (
                        <CalibrationDueChip date={r.compliance.next_calibration_due} />
                      ) : (
                        <span className="text-[10px] text-gray-400">—</span>
                      )}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Th = ({ children }) => (
  <th className="px-3 py-2 text-left font-semibold">{children}</th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-3 py-2 ${className}`}>{children}</td>
);

const Select = ({ label, value, onChange, opts }) => (
  <div className="flex items-center gap-1 text-xs">
    <FilterIcon size={12} className="text-gray-400" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded text-xs"
    >
      <option value="">{label}: All</option>
      {opts.map((o) => (
        <option key={o} value={o}>
          {o.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  </div>
);

const CalibrationDueChip = ({ date }) => {
  const dt = new Date(date);
  const days = Math.floor((dt - Date.now()) / (1000 * 60 * 60 * 24));
  let cls = "bg-gray-100 text-gray-600";
  if (days < 0) cls = "bg-red-100 text-red-700";
  else if (days <= 30) cls = "bg-amber-100 text-amber-700";
  else cls = "bg-emerald-100 text-emerald-700";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>
      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
    </span>
  );
};

export default TaggedAssetList;
