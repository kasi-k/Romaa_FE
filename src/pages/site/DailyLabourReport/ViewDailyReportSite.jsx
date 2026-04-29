import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  IndianRupee,
  ClipboardList,
  HardHat,
  FileText,
  UserCheck,
} from "lucide-react";
import { useDLPByDate } from "./hooks/useDailyLabourReport";
import { useProject } from "../../../context/ProjectContext";
import Loader from "../../../components/Loader";

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  PENDING: {
    cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
    label: "Pending",
  },
  APPROVED: {
    cls: "bg-green-100 text-green-700 border-green-200",
    label: "Approved",
  },
  REJECTED: {
    cls: "bg-red-100 text-red-700 border-red-200",
    label: "Rejected",
  },
};

const ATT_STATUS = {
  PRESENT: { cls: "bg-green-500 text-white", label: "P" },
  HALF_DAY: { cls: "bg-yellow-400 text-white", label: "H" },
  QUARTER_DAY: { cls: "bg-yellow-400 text-white", label: "Q" },
  ABSENT: { cls: "bg-red-500 text-white", label: "A" },
};

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

// ── Root ───────────────────────────────────────────────────────────────────────

const ViewDailyReportSite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenderId } = useProject();

  const item = location.state?.item || {};
  const reportDate = item.report_date || "";

  const { data: records = [], isLoading } = useDLPByDate(tenderId, reportDate);

  const totals = useMemo(
    () => ({
      manDays: records.reduce((s, r) => s + (r.grand_total_man_days || 0), 0),
      amount: records.reduce((s, r) => s + (r.grand_total_amount || 0), 0),
      workers: records.reduce(
        (s, r) => s + (r.attendance_entries?.length || 0),
        0,
      ),
    }),
    [records],
  );

  if (isLoading)
    return <Loader />;

  if (!records.length)
    return (
      <div className="p-10 text-center text-sm text-red-500">
        No reports found for this date.
      </div>
    );

  return (
    <div className="font-roboto-flex dark:bg-[#0b0f19] h-full overflow-y-auto">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Daily Labour Report
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {formatDate(reportDate)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.project_name || tenderId} · {records.length} contractor
                {records.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              icon={<CalendarDays size={18} />}
              color="blue"
              label="Report Date"
              value={formatDate(reportDate)}
            />
            <SummaryCard
              icon={<ClipboardList size={18} />}
              color="indigo"
              label="Contractors"
              value={records.length}
            />
            <SummaryCard
              icon={<Users size={18} />}
              color="purple"
              label="Man Days"
              value={totals.manDays.toFixed(1)}
            />
            <SummaryCard
              icon={<IndianRupee size={18} />}
              color="green"
              label="Total Wages"
              value={`₹${fmt(totals.amount)}`}
            />
          </div>
        </div>
      </div>

      {/* ── Per-contractor Cards ── */}
      <div className="px-6 py-5">
        <div className="max-w-7xl mx-auto space-y-5">
          {records.map((record, i) => (
            <ContractorCard key={record._id || i} record={record} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Contractor Card ────────────────────────────────────────────────────────────

const ContractorCard = ({ record, index }) => {
  const status = STATUS_MAP[record.status] || STATUS_MAP.PENDING;
  const manDays = record.grand_total_man_days || 0;
  const amount = record.grand_total_amount || 0;
  const workQty = record.grand_total_qty || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold shrink-0">
            {index + 1}
          </span>
          <div>
            <p className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1.5">
              <HardHat size={14} className="text-orange-500" />
              {record.contractor_id}
            </p>
            {record.remark && record.remark !== "No Remark" && (
              <p className="text-xs text-gray-400 italic mt-0.5">
                {record.remark}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Chip label={`${manDays} man-days`} color="purple" />
          <Chip label={`₹${fmt(amount)}`} color="green" />
          <Chip label={`Qty: ${workQty}`} color="blue" />
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.cls}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {/* Work Entries */}
        {record.work_entries?.length > 0 && (
          <div className="p-4">
            <SectionTitle
              icon={<FileText size={13} />}
              title={`Work Entries (${record.work_entries.length})`}
            />
            <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 min-w-[160px]">Description</th>
                    <th className="px-3 py-2 min-w-[100px]">Category</th>
                    <th className="px-3 py-2 text-center w-14">L</th>
                    <th className="px-3 py-2 text-center w-14">B</th>
                    <th className="px-3 py-2 text-center w-14">H</th>
                    <th className="px-3 py-2 text-right w-20">Qty</th>
                    <th className="px-3 py-2 w-16">Unit</th>
                    <th className="px-3 py-2 min-w-[120px]">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                  {record.work_entries.map((e, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50/20 dark:hover:bg-gray-700/20"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                        {e.description}
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                          {e.category || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500">
                        {e.l || "—"}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500">
                        {e.b || "—"}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500">
                        {e.h || "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                        {e.quantity ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-500 uppercase">
                        {e.unit}
                      </td>
                      <td className="px-3 py-2 text-gray-400 italic">
                        {e.remark && e.remark !== "No Remark" ? e.remark : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <tr>
                    <td
                      colSpan="5"
                      className="px-3 py-2 text-right text-gray-500 font-semibold uppercase text-[10px] tracking-wider"
                    >
                      Total Qty
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">
                      {workQty}
                    </td>
                    <td colSpan="2" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Entries */}
        {record.attendance_entries?.length > 0 && (
          <div className="p-4">
            <SectionTitle
              icon={<UserCheck size={13} />}
              title={`Attendance (${record.attendance_entries.length} workers)`}
            />
            <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 min-w-[130px]">Worker</th>
                    <th className="px-3 py-2 w-24">Worker ID</th>
                    <th className="px-3 py-2 min-w-[100px]">Category</th>
                    <th className="px-3 py-2 text-right w-24">Daily Wage</th>
                    <th className="px-3 py-2 text-right w-24">In Time</th>
                    <th className="px-3 py-2 text-right w-24">Out Time</th>
                    <th className="px-3 py-2 text-center w-20">Status</th>
                    <th className="px-3 py-2 min-w-[120px]">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                  {record.attendance_entries.map((a, i) => {
                    const st = ATT_STATUS[a.status] || ATT_STATUS.ABSENT;
                    const absent = a.status === "ABSENT";
                    return (
                      <tr
                        key={i}
                        className={`transition-colors ${absent ? "opacity-50" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/20"}`}
                      >
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                          {a.worker_name}
                        </td>
                        <td className="px-3 py-2 text-gray-400 font-mono">
                          {a.worker_id}
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                            {a.category || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                          ₹{fmt(a.daily_wage)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                          {a.in_time || "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                          {a.out_time || "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-400 italic">
                          {a.remark || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-3 py-2 text-right text-gray-500 font-semibold uppercase text-[10px] tracking-wider"
                    >
                      Totals
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">
                      ₹{fmt(amount)}
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-gray-900 dark:text-white">
                      {manDays} days
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Small Reusables ────────────────────────────────────────────────────────────

const SectionTitle = ({ icon, title }) => (
  <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
    <span className="text-blue-500">{icon}</span>
    {title}
  </p>
);

const CHIP_COLORS = {
  purple:
    "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
};

const Chip = ({ label, color }) => (
  <span
    className={`px-2 py-0.5 rounded-md text-xs font-semibold ${CHIP_COLORS[color] || CHIP_COLORS.blue}`}
  >
    {label}
  </span>
);

const CARD_COLORS = {
  blue: { wrap: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-600" },
  indigo: {
    wrap: "bg-indigo-50 dark:bg-indigo-900/20",
    icon: "text-indigo-600",
  },
  purple: {
    wrap: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-600",
  },
  green: { wrap: "bg-green-50 dark:bg-green-900/20", icon: "text-green-600" },
};

const SummaryCard = ({ icon, color, label, value }) => {
  const c = CARD_COLORS[color] || CARD_COLORS.blue;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm">
      <div className={`p-2 rounded-lg shrink-0 ${c.wrap} ${c.icon}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
          {label}
        </p>
        <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
};

export default ViewDailyReportSite;
