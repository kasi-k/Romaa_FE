import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fuel, RefreshCw, Search, MapPin, Activity } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useDebounce } from "../../../hooks/useDebounce";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import { useMachineryList } from "../../settings/assets/machinery/hooks/useMachinery";
import { useSyncAllFuel } from "../../settings/assets/machinery/hooks/useFuelTelemetry";
import Loader from "../../../components/Loader";

const STALE_MS = 12 * 60 * 60 * 1000;

const fmtAge = (iso) => {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
};

const FuelTelemetry = () => {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canSync = canAccess(ASSET_MODULE, ASSET_SUB.FUEL_TELEMETRY, ASSET_ACTION.EDIT);

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useMachineryList({
    page,
    limit: 20,
    search: debounced || undefined,
  });
  const rows = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const fleet = useMemo(() => rows.filter((r) => r.gps?.isInstalled), [rows]);

  const stats = useMemo(() => {
    let synced = 0, stale = 0, errored = 0;
    for (const r of fleet) {
      const t = r.fuelTelemetry || {};
      if (t.lastError) errored++;
      else if (t.lastSyncAt && Date.now() - new Date(t.lastSyncAt).getTime() > STALE_MS) stale++;
      else if (t.lastSyncAt) synced++;
    }
    return { total: fleet.length, synced, stale, errored };
  }, [fleet]);

  const { mutate: syncAll, isPending: syncing } = useSyncAllFuel();

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fuel Telemetry</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Live GPS / fuel sync from third-party trackers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
          {canSync && (
            <button
              onClick={() => {
                if (window.confirm("Trigger a fuel sync for every active GPS-enabled asset? This may take 30s+.")) syncAll();
              }}
              disabled={syncing}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              <Fuel size={14} /> {syncing ? "Syncing…" : "Sync All"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <Tile label="GPS Enabled" value={stats.total} />
        <Tile label="Recently Synced" value={stats.synced} tone="emerald" />
        <Tile label="Stale (12h+)" value={stats.stale} tone="amber" />
        <Tile label="Errored" value={stats.errored} tone="red" />
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Asset ID / name…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <Th>Asset</Th>
                <Th>Provider</Th>
                <Th>Last Sync</Th>
                <Th className="text-right">Fuel %</Th>
                <Th className="text-right">Reading (L)</Th>
                <Th>Status</Th>
                <Th>Location</Th>
                <Th>Health</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-12"><Loader /></td></tr>
              ) : fleet.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">No GPS-enabled assets found.</td></tr>
              ) : fleet.map((r) => {
                const t = r.fuelTelemetry || {};
                const stale = t.lastSyncAt && Date.now() - new Date(t.lastSyncAt).getTime() > STALE_MS;
                const pct = Number(t.lastFuelPercent || 0);
                return (
                  <tr
                    key={r.assetId}
                    onClick={() => navigate(`/asset/machinery/details/${r.assetId}`)}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                  >
                    <Td>
                      <div className="font-mono text-xs">{r.assetId}</div>
                      <div className="text-[11px] text-gray-500">{r.assetName}</div>
                    </Td>
                    <Td className="text-xs">{r.gps?.provider || "—"}</Td>
                    <Td className="text-xs">{fmtAge(t.lastSyncAt)}</Td>
                    <Td className="text-right">
                      {t.lastFuelPercent != null ? (
                        <span className="inline-flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                            <div className={`h-full ${pct < 20 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                          </div>
                          <span className="text-xs font-mono">{pct.toFixed(0)}%</span>
                        </span>
                      ) : "—"}
                    </Td>
                    <Td className="text-right font-mono text-xs">{t.lastFuelReading != null ? Number(t.lastFuelReading).toFixed(1) : "—"}</Td>
                    <Td>
                      <span className={`text-[10px] uppercase font-bold ${t.lastIgnition === "ON" ? "text-emerald-600" : "text-gray-500"}`}>
                        {t.lastStatus || (t.lastIgnition ? `IGN ${t.lastIgnition}` : "—")}
                      </span>
                    </Td>
                    <Td>
                      {t.lastLocation?.address ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                          <MapPin size={11} className="text-gray-400" />
                          <span className="truncate max-w-[180px]" title={t.lastLocation.address}>{t.lastLocation.address}</span>
                        </span>
                      ) : "—"}
                    </Td>
                    <Td>
                      {t.lastError ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">ERROR</span>
                      ) : stale ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">STALE</span>
                      ) : t.lastSyncAt ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          <Activity size={10} /> LIVE
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">never synced</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <span className="text-gray-500">
            Page {page} of {totalPages} · Showing GPS-enabled machinery only
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Next</button>
          </div>
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

export default FuelTelemetry;
