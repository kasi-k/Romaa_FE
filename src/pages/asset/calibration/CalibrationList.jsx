import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import {
  useCalibrationList,
  useCalibrationDueReport,
  useDeleteCalibration,
} from "./hooks/useCalibration";
import StatusChip from "../_shared/StatusChip";
import Loader from "../../../components/Loader";

const RESULTS = ["", "PASS", "FAIL", "ADJUSTED", "OUT_OF_TOLERANCE"];

const CalibrationList = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { canAccess } = useAuth();
  const canCreate = canAccess(ASSET_MODULE, ASSET_SUB.CALIBRATION, ASSET_ACTION.CREATE);
  const canDelete = canAccess(ASSET_MODULE, ASSET_SUB.CALIBRATION, ASSET_ACTION.DELETE);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    asset_id_label: "",
    result: "",
    from: "",
    to: "",
  });

  const dueDays = params.get("due") ? Number(params.get("due")) : null;
  const dueReport = useCalibrationDueReport(dueDays || 30);

  const queryParams = useMemo(() => ({
    page,
    limit: 20,
    asset_id_label: filters.asset_id_label || undefined,
    result: filters.result || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  }), [page, filters]);

  const { data, isLoading, isFetching, refetch } = useCalibrationList(queryParams);
  const rows = data?.data?.rows || data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const { mutate: del } = useDeleteCalibration();

  // Compute KPI tiles from current rows for a quick at-a-glance view.
  const stats = useMemo(() => {
    const all = rows;
    const total = all.length;
    const pass = all.filter((r) => r.result === "PASS").length;
    const failOrAdj = all.filter((r) => ["FAIL", "ADJUSTED", "OUT_OF_TOLERANCE"].includes(r.result)).length;
    const due30 = (dueReport.data || []).filter((r) => {
      const d = new Date(r.next_due_date);
      const days = Math.floor((d - Date.now()) / 86400000);
      return days >= 0 && days <= 30;
    }).length;
    const overdue = (dueReport.data || []).filter((r) => new Date(r.next_due_date) < new Date()).length;
    return { total, pass, failOrAdj, due30, overdue };
  }, [rows, dueReport.data]);

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">Asset Calibration</h1>
          <p className="text-xs text-gray-500">Survey / Lab certificates</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className={btnSecondary}>
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
          {canCreate && (
            <button
              onClick={() => navigate("/asset/calibration/new")}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Plus size={14} /> Record Calibration
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <Tile label="Total" value={stats.total} />
        <Tile label="Pass" value={stats.pass} tone="emerald" />
        <Tile label="Fail / Adjusted" value={stats.failOrAdj} tone="amber" />
        <Tile label="Overdue" value={stats.overdue} tone="red" />
        <Tile label="Due in 30d" value={stats.due30} tone="blue" />
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3 flex items-center gap-2 flex-wrap">
        <input value={filters.asset_id_label} onChange={(e) => { setFilters((f) => ({ ...f, asset_id_label: e.target.value })); setPage(1); }} placeholder="Asset ID" className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded w-32" />
        <select value={filters.result} onChange={(e) => { setFilters((f) => ({ ...f, result: e.target.value })); setPage(1); }} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded">
          {RESULTS.map((r) => <option key={r} value={r}>{r || "Result: All"}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded" />
        <span className="text-xs text-gray-400">to</span>
        <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded" />
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-500">
              <tr>
                <Th>Cert #</Th>
                <Th>Asset</Th>
                <Th>Date</Th>
                <Th>Next Due</Th>
                <Th>Result</Th>
                <Th>Agency</Th>
                <Th>Cost</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-12"><Loader /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-gray-500">No calibrations.</td></tr>
              ) : rows.map((r) => (
                <tr key={r._id || r.calibration_id} className="border-t border-gray-100 dark:border-gray-800">
                  <Td className="font-mono">{r.certificate_number}</Td>
                  <Td>
                    <div className="font-mono text-xs">{r.asset_id_label}</div>
                    <div className="text-[10px] text-gray-500">{r.asset_name}</div>
                  </Td>
                  <Td>{r.calibration_date ? new Date(r.calibration_date).toLocaleDateString() : "—"}</Td>
                  <Td>{r.next_due_date ? new Date(r.next_due_date).toLocaleDateString() : "—"}</Td>
                  <Td><StatusChip value={r.result} /></Td>
                  <Td className="text-xs">{r.agency_name}</Td>
                  <Td className="text-xs">{r.cost ? `₹ ${Number(r.cost).toLocaleString()}` : "—"}</Td>
                  <Td>
                    {r.certificate_url && (
                      <a href={r.certificate_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mr-2">
                        Cert
                      </a>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this calibration record?")) del(r._id);
                        }}
                        className="cursor-pointer text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
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
    </div>
  );
};

const TONE = {
  default: "bg-gray-50 dark:bg-gray-900",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20",
  amber: "bg-amber-50 dark:bg-amber-900/20",
  red: "bg-red-50 dark:bg-red-900/20",
  blue: "bg-blue-50 dark:bg-blue-900/20",
};
const Tile = ({ label, value, tone = "default" }) => (
  <div className={`rounded-xl border border-gray-200 dark:border-gray-800 p-3 ${TONE[tone] || TONE.default}`}>
    <div className="text-[10px] uppercase font-bold text-gray-500">{label}</div>
    <div className="text-xl font-bold mt-1">{value}</div>
  </div>
);
const btnSecondary = "cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800";
const Th = ({ children }) => <th className="px-3 py-2 text-left font-semibold">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;

export default CalibrationList;
