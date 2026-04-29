import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, RefreshCw, Calendar } from "lucide-react";
import { api } from "../../../services/api";
import { useDebounce } from "../../../hooks/useDebounce";
import Loader from "../../../components/Loader";

const useAllMachineryLogs = (params = {}) =>
  useQuery({
    queryKey: ["machinery-logs-all", params],
    queryFn: async () => {
      const { data } = await api.get("/machinerylogs/getall-logs", { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

const MachineryLogs = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    projectId: "",
    assetName: "",
    startDate: "",
    endDate: "",
  });
  const debouncedAsset = useDebounce(filters.assetName, 400);

  const params = useMemo(() => {
    const p = {};
    if (filters.projectId) p.projectId = filters.projectId;
    if (debouncedAsset) p.assetName = debouncedAsset;
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate) p.endDate = filters.endDate;
    return p;
  }, [filters, debouncedAsset]);

  const { data, isLoading, isFetching, refetch } = useAllMachineryLogs(params);
  const rows = data?.data || [];

  const stats = useMemo(() => {
    let totalHours = 0;
    let totalKms = 0;
    let totalFuel = 0;
    let totalTrips = 0;
    for (const r of rows) {
      totalHours += Number(r.hoursWorked || r.hmrEnd - r.hmrStart || 0);
      totalKms += Number(r.kmsRun || 0);
      totalFuel += Number(r.fuelConsumed || 0);
      totalTrips += Number(r.trips || 0);
    }
    return { totalLogs: rows.length, totalHours, totalKms, totalFuel, totalTrips };
  }, [rows]);

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Machinery Daily Logs</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daily HMR / KM / fuel / trips entries across the fleet
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <Tile label="Logs" value={stats.totalLogs} />
        <Tile label="Total Hours" value={stats.totalHours.toFixed(1)} tone="blue" />
        <Tile label="Total Kms" value={stats.totalKms.toFixed(1)} tone="blue" />
        <Tile label="Fuel (L)" value={stats.totalFuel.toFixed(1)} tone="amber" />
        <Tile label="Trips" value={stats.totalTrips} />
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.assetName}
              onChange={(e) => setFilters((f) => ({ ...f, assetName: e.target.value }))}
              placeholder="Asset name…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
            />
          </div>
          <input
            value={filters.projectId}
            onChange={(e) => setFilters((f) => ({ ...f, projectId: e.target.value }))}
            placeholder="Project ID"
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded w-32"
          />
          <Calendar size={14} className="text-gray-400 ml-1" />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <Th>Date</Th>
                <Th>Asset</Th>
                <Th>Operator</Th>
                <Th>Shift</Th>
                <Th className="text-right">HMR Start</Th>
                <Th className="text-right">HMR End</Th>
                <Th className="text-right">Hrs / Kms</Th>
                <Th className="text-right">Fuel (L)</Th>
                <Th className="text-right">Trips</Th>
                <Th>Site</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="p-12"><Loader /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="p-12 text-center text-gray-500">No logs match your filters.</td></tr>
              ) : rows.map((r, i) => {
                const usage =
                  r.hoursWorked != null ? `${r.hoursWorked} h` :
                  r.kmsRun != null ? `${r.kmsRun} km` :
                  (r.hmrEnd != null && r.hmrStart != null) ? `${(r.hmrEnd - r.hmrStart).toFixed(1)} h` : "—";
                return (
                  <tr
                    key={r._id || `${r.assetId}-${r.logDate}-${i}`}
                    onClick={() => r.assetId && navigate(`/asset/machinery/details/${r.assetId}`)}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                  >
                    <Td className="text-xs">{r.logDate ? new Date(r.logDate).toLocaleDateString() : "—"}</Td>
                    <Td>
                      <div className="font-mono text-xs">{r.assetId || "—"}</div>
                      <div className="text-[11px] text-gray-500">{r.assetName}</div>
                    </Td>
                    <Td className="text-xs">{r.operatorName || r.operator || "—"}</Td>
                    <Td className="text-xs">{r.shift || "—"}</Td>
                    <Td className="text-right font-mono text-xs">{r.hmrStart != null ? r.hmrStart : "—"}</Td>
                    <Td className="text-right font-mono text-xs">{r.hmrEnd != null ? r.hmrEnd : "—"}</Td>
                    <Td className="text-right font-mono text-xs">{usage}</Td>
                    <Td className="text-right font-mono text-xs">{r.fuelConsumed != null ? Number(r.fuelConsumed).toFixed(1) : "—"}</Td>
                    <Td className="text-right font-mono text-xs">{r.trips != null ? r.trips : "—"}</Td>
                    <Td className="text-xs">{r.siteName || r.currentSite || "—"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TONE = {
  default: "bg-gray-50 dark:bg-gray-900",
  blue: "bg-blue-50 dark:bg-blue-900/20",
  amber: "bg-amber-50 dark:bg-amber-900/20",
};
const Tile = ({ label, value, tone = "default" }) => (
  <div className={`rounded-xl border border-gray-200 dark:border-gray-800 p-3 ${TONE[tone] || TONE.default}`}>
    <div className="text-[10px] uppercase font-bold text-gray-500">{label}</div>
    <div className="text-xl font-bold mt-1">{value}</div>
  </div>
);
const Th = ({ children, className = "" }) => <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;

export default MachineryLogs;
