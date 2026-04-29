import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, RefreshCw, AlertTriangle, Search } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useDebounce } from "../../../hooks/useDebounce";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import { useMachineryList, useUpdateMachineryStatus } from "../../settings/assets/machinery/hooks/useMachinery";
import { api } from "../../../services/api";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../../components/Loader";

const STATUSES = ["Active", "Idle", "Maintenance", "Breakdown", "Scrapped"];

const useExpiryAlerts = () =>
  useQuery({
    queryKey: ["machinery-expiry-alerts"],
    queryFn: async () => {
      const { data } = await api.get("/machineryasset/expiry-alerts");
      return data?.data || data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

const Maintenance = () => {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canEdit = canAccess(ASSET_MODULE, ASSET_SUB.MAINTENANCE, ASSET_ACTION.EDIT);

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState("Maintenance");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useMachineryList({
    page,
    limit: 20,
    search: debounced || undefined,
  });
  const all = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const filtered = useMemo(
    () => (statusFilter === "All" ? all : all.filter((r) => r.currentStatus === statusFilter)),
    [all, statusFilter],
  );

  const stats = useMemo(() => {
    const out = { total: all.length, Active: 0, Idle: 0, Maintenance: 0, Breakdown: 0, Scrapped: 0 };
    for (const r of all) {
      if (out[r.currentStatus] != null) out[r.currentStatus]++;
    }
    return out;
  }, [all]);

  const expiry = useExpiryAlerts();
  const expiryRows = expiry.data || [];

  const { mutate: updateStatus, isPending: updating } = useUpdateMachineryStatus();
  const [statusModal, setStatusModal] = useState(null);

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Service / breakdown status across the machinery fleet
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
        <Tile label="Total Fleet" value={stats.total} />
        <Tile label="Active" value={stats.Active} tone="emerald" />
        <Tile label="Idle" value={stats.Idle} />
        <Tile label="Maintenance" value={stats.Maintenance} tone="amber" />
        <Tile label="Breakdown" value={stats.Breakdown} tone="red" />
        <Tile label="Scrapped" value={stats.Scrapped} />
      </div>

      {expiryRows.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-1">
                Compliance Expiring Soon ({expiryRows.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {expiryRows.slice(0, 6).map((r, i) => (
                  <button
                    key={r.assetId || i}
                    onClick={() => navigate(`/asset/machinery/details/${r.assetId}`)}
                    className="cursor-pointer text-left text-xs px-2 py-1.5 bg-white dark:bg-layout-dark rounded border border-amber-200 dark:border-amber-800 hover:shadow"
                  >
                    <div className="font-mono">{r.assetId}</div>
                    <div className="text-amber-700 dark:text-amber-300 text-[11px]">{r.expiringDoc || r.docType || "compliance"}</div>
                    <div className="text-[10px] text-gray-500">
                      {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "—"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Asset ID / name…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
          />
        </div>
        <div className="flex gap-1">
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`cursor-pointer px-2.5 py-1 text-xs rounded ${
                statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <Th>Asset</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Site</Th>
                <Th>Last Reading</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-12"><Loader /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">No machinery in {statusFilter.toLowerCase()} state.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.assetId} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <Td>
                    <button onClick={() => navigate(`/asset/machinery/details/${r.assetId}`)} className="cursor-pointer text-left">
                      <div className="font-mono text-xs">{r.assetId}</div>
                      <div className="text-[11px] text-gray-500">{r.assetName}</div>
                    </button>
                  </Td>
                  <Td className="text-xs">{r.assetCategory || "—"}</Td>
                  <Td><StatusBadge value={r.currentStatus} /></Td>
                  <Td className="text-xs">{r.currentSite || "—"}</Td>
                  <Td className="text-xs">
                    {r.lastReading != null ? (
                      <>
                        {r.lastReading} {r.trackingMode === "HOURS" ? "hrs" : r.trackingMode === "KILOMETERS" ? "km" : ""}
                        {r.lastReadingDate && (
                          <div className="text-[10px] text-gray-500">
                            {new Date(r.lastReadingDate).toLocaleDateString()}
                          </div>
                        )}
                      </>
                    ) : "—"}
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/asset/machinery/details/${r.assetId}`)}
                        className="cursor-pointer text-xs text-blue-600 hover:underline"
                      >
                        View
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => setStatusModal(r)}
                          className="cursor-pointer text-xs text-amber-600 hover:underline"
                        >
                          <Wrench size={11} className="inline" /> Status
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

      {statusModal && (
        <StatusUpdateDialog
          asset={statusModal}
          submitting={updating}
          onClose={() => setStatusModal(null)}
          onSubmit={(payload) => updateStatus({ assetId: statusModal.assetId, payload })}
        />
      )}
    </div>
  );
};

const StatusBadge = ({ value }) => {
  const cls =
    value === "Active" ? "bg-emerald-100 text-emerald-700" :
    value === "Idle" ? "bg-gray-100 text-gray-600" :
    value === "Maintenance" ? "bg-amber-100 text-amber-700" :
    value === "Breakdown" ? "bg-red-100 text-red-700" :
    "bg-gray-200 text-gray-500";
  return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${cls}`}>{value}</span>;
};

const StatusUpdateDialog = ({ asset, submitting, onClose, onSubmit }) => {
  const [status, setStatus] = useState(asset.currentStatus);
  const [remarks, setRemarks] = useState("");
  return (
    <div className="fixed inset-0 z-30 grid place-items-center backdrop-blur-xs">
      <div className="bg-white dark:bg-layout-dark rounded-xl p-6 max-w-md mx-4 shadow-xl border border-gray-200 dark:border-gray-800 w-full">
        <h3 className="text-lg font-bold mb-1">Update Maintenance Status</h3>
        <p className="text-xs text-gray-500 mb-3 font-mono">{asset.assetId} — {asset.assetName}</p>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md mb-3">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Remarks" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md mb-3 resize-none" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={submitting} className="cursor-pointer px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50">Cancel</button>
          <button
            onClick={() => { onSubmit({ status, remarks }); onClose(); }}
            disabled={submitting}
            className="cursor-pointer px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TONE = {
  default: "bg-gray-50 dark:bg-gray-900",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20",
  amber: "bg-amber-50 dark:bg-amber-900/20",
  red: "bg-red-50 dark:bg-red-900/20",
};
const Tile = ({ label, value, tone = "default" }) => (
  <div className={`rounded-xl border border-gray-200 dark:border-gray-800 p-3 ${TONE[tone] || TONE.default}`}>
    <div className="text-[10px] uppercase font-bold text-gray-500">{label}</div>
    <div className="text-xl font-bold mt-1">{value}</div>
  </div>
);
const Th = ({ children, className = "" }) => <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;

export default Maintenance;
