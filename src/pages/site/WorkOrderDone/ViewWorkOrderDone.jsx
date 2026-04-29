import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  ClipboardList,
  Building2,
  User,
  Layers,
  TrendingUp,
  Package,
  MessageSquare,
  HardHat,
  Ruler,
} from "lucide-react";
import { useWorkDoneByDate } from "./hooks/useWorkOrderDone";
import { useProject } from "../../../context/ProjectContext";
import Loader from "../../../components/Loader";

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Page ───────────────────────────────────────────────────────────────────────

const ViewWorkOrderDone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenderId } = useProject();

  const reportDate = location.state?.item?.report_date || "";

  const { data: records = [], isLoading } = useWorkDoneByDate(tenderId, reportDate);

  const totalItems = useMemo(
    () => records.reduce((sum, r) => sum + (r.dailyWorkDone?.length || 0), 0),
    [records],
  );

  const totalQtyAll = useMemo(
    () =>
      records.reduce(
        (sum, r) =>
          sum + (r.dailyWorkDone || []).reduce((s, i) => s + (i.quantity || 0), 0),
        0,
      ),
    [records],
  );

  if (isLoading)
    return (
      <Loader/>
    );

  if (!records.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50 dark:bg-[#0b0f19]">
        <ClipboardList size={44} className="opacity-20" />
        <p className="text-sm font-semibold">No records found for this date.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-1 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 underline underline-offset-2"
        >
          <ArrowLeft size={12} /> Go back
        </button>
      </div>
    );

  return (
    <div className="font-roboto-flex dark:bg-[#0b0f19] h-full overflow-y-auto">

      {/* ── Sticky Page Header ── */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shrink-0"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <FileText size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                  Daily Progress Report
                </h1>
                <p className="text-xs text-gray-400 mt-1 leading-none">
                  <span className="font-mono font-semibold text-gray-600 dark:text-gray-300">{tenderId}</span>
                  <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
                  <CalendarDays size={11} className="inline mb-0.5 mr-0.5 text-gray-400" />
                  {formatDate(reportDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Header stat pills */}
          <div className="hidden sm:flex items-center gap-2">
            <StatPill icon={<ClipboardList size={12} />} value={records.length} label="Orders" color="blue" />
            <StatPill icon={<Layers size={12} />} value={totalItems} label="Items" color="violet" />
            <StatPill icon={<TrendingUp size={12} />} value={totalQtyAll.toLocaleString("en-IN")} label="Total Qty" color="emerald" />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div>
        <div className="max-w-7xl mx-auto px-6 pt-5 pb-8">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <SummaryCard
              icon={<ClipboardList size={22} />}
              color="blue"
              label="Work Orders"
              value={records.length}
              sub={`for ${formatDate(reportDate)}`}
            />
            <SummaryCard
              icon={<Package size={22} />}
              color="violet"
              label="Total Line Items"
              value={totalItems}
              sub="across all orders"
            />
            <SummaryCard
              icon={<TrendingUp size={22} />}
              color="emerald"
              label="Combined Qty"
              value={totalQtyAll.toLocaleString("en-IN")}
              sub="all work orders"
            />
          </div>

          {/* ── Work Order Cards ── */}
          <div className="space-y-5">
            {[...records].reverse().map((record, idx) => (
              <WorkOrderCard
                key={record.workDoneId || record.workOrder_id}
                record={record}
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Work Order Card ────────────────────────────────────────────────────────────

const WorkOrderCard = ({ record, index }) => {
  const totalQty = useMemo(
    () => (record.dailyWorkDone || []).reduce((sum, i) => sum + (i.quantity || 0), 0),
    [record],
  );

  const itemCount = record.dailyWorkDone?.length || 0;
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* ── Card Header ── */}
      <div className={`px-6 py-4 ${accent.headerBg} border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Left: icon + WO info */}
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent.iconWrap}`}>
              <FileText size={19} className={accent.iconColor} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  Work Order
                </span>
                <code className={`text-sm font-bold px-2.5 py-0.5 rounded-lg tracking-wide ${accent.idBadge}`}>
                  {record.workOrder_id}
                </code>
                <code className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded">
                  {record.workDoneId}
                </code>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {record.contractor_name && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                    <Building2 size={10} />
                    {record.contractor_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                  <User size={10} className="shrink-0" />
                  {record.created_by}
                </span>
              </div>
            </div>
          </div>

          {/* Right: stat chips */}
          <div className="flex items-center gap-2 flex-wrap">
        
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 px-3 py-1.5 rounded-full">
              <TrendingUp size={12} />
              Qty: {totalQty.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            {/* ── Group row ── */}
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <th rowSpan={2} className={TH_BASE + " w-10 text-center border-r border-gray-200 dark:border-gray-700"}>#</th>
              <th rowSpan={2} className={TH_BASE + " min-w-[220px] text-left border-r border-gray-200 dark:border-gray-700"}>Item Description</th>
              <th colSpan={5} className="px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border-r border-b border-gray-200 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10">
                <span className="flex items-center justify-center gap-1"><Ruler size={11} /> Dimensions</span>
              </th>
              <th rowSpan={2} className={TH_BASE + " w-24 text-right border-r border-gray-200 dark:border-gray-700"}>Qty</th>
              <th rowSpan={2} className={TH_BASE + " w-32 text-right border-r border-gray-200 dark:border-gray-700"}>Quoted Rate</th>
              <th rowSpan={2} className={TH_BASE + " w-16 text-center border-r border-gray-200 dark:border-gray-700"}>Unit</th>
              <th rowSpan={2} className={TH_BASE + " min-w-[150px] border-r border-gray-200 dark:border-gray-700"}>Contractor</th>
              <th rowSpan={2} className={TH_BASE + " min-w-[160px]"}>Remarks</th>
            </tr>
            <tr className=" whitespace-nowrap bg-indigo-50/40 dark:bg-indigo-900/10 border-b border-gray-200 dark:border-gray-700">
              {["No 1", "No 2", "L", "B", "H"].map((d, i) => (
                <th
                  key={d}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 text-center ${i < 4 ? "border-r border-indigo-100 dark:border-indigo-900/30" : "border-r border-gray-200 dark:border-gray-700"}`}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {itemCount === 0 ? (
              <tr>
                <td colSpan="12" className="py-12 text-center text-gray-400 text-sm">
                  No items recorded for this work order.
                </td>
              </tr>
            ) : (
              record.dailyWorkDone.map((item, i) => (
                <tr
                  key={i}
                  className={`group transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0 ${
                    i % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50/60 dark:bg-gray-800/40"
                  } hover:bg-blue-50/40 dark:hover:bg-blue-900/10`}
                >
                  {/* # */}
                  <td className="px-4 py-3 text-center border-r border-gray-100 dark:border-gray-700/40 w-10">
                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors w-6 h-6 inline-flex items-center justify-center rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                      {i + 1}
                    </span>
                  </td>

                  {/* Item */}
                  <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700/40">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight">
                      {item.item_description || "—"}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </td>

                  {/* Dimensions */}
                  {[
                    item.dimensions?.no1,
                    item.dimensions?.no2,
                    item.dimensions?.length,
                    item.dimensions?.breadth,
                    item.dimensions?.height,
                  ].map((v, di) => (
                    <td
                      key={di}
                      className={`px-3 py-3 text-center tabular-nums text-sm bg-indigo-50/20 dark:bg-indigo-900/5 ${
                        di < 4
                          ? "border-r border-indigo-100 dark:border-indigo-900/30"
                          : "border-r border-gray-100 dark:border-gray-700/40"
                      }`}
                    >
                      {v ? (
                        <span className="font-medium text-indigo-700 dark:text-indigo-300">{v}</span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  ))}

                  {/* Qty */}
                  <td className="px-4 py-3 text-right border-r border-gray-100 dark:border-gray-700/40">
                    <span className="inline-block font-bold text-blue-600 dark:text-blue-400 tabular-nums bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-lg text-sm">
                      {item.quantity ?? "—"}
                    </span>
                  </td>

                  {/* Rate */}
                  <td className="px-4 py-3 text-right border-r border-gray-100 dark:border-gray-700/40">
                    {item.quoted_rate > 0 ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                        ₹{Number(item.quoted_rate).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Unit */}
                  <td className="px-4 py-3 text-center border-r border-gray-100 dark:border-gray-700/40">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                      {item.unit || "—"}
                    </span>
                  </td>

                  {/* Contractor */}
                  <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700/40">
                    {item.contractor_details ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <HardHat size={11} className="text-amber-500 shrink-0" />
                        {item.contractor_details}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Remarks */}
                  <td className="px-4 py-3">
                    {item.remarks ? (
                      <span className="inline-flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
                        <MessageSquare size={10} className="mt-0.5 shrink-0 text-gray-400" />
                        {item.remarks}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* ── Footer total row ── */}
          {itemCount > 0 && (
            <tfoot>
              <tr className="border-t-2 border-blue-200 dark:border-blue-800/60">
                <td colSpan={2} className="px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 ">
                  
                </td>
                <td colSpan={5} />
                <td className="flex items-center whitespace-nowrap px-4 py-2.5 text-right border-r border-blue-200 dark:border-blue-800/40">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 dark:text-blue-400">Total Qty -</span>
                  <span className="ml-2 font-extrabold text-blue-700 dark:text-blue-300 tabular-nums text-sm">
                    {totalQty.toLocaleString("en-IN")}
                  </span>
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

// ── Reusable Components ────────────────────────────────────────────────────────

const TH_BASE = "px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400";

const SummaryCard = ({ icon, color, label, value, sub }) => {
  const styles = {
    blue:   { wrap: "bg-blue-50 dark:bg-blue-900/20",   icon: "text-blue-600 dark:text-blue-400",   val: "text-blue-700 dark:text-blue-300",   border: "border-blue-100 dark:border-blue-800/50" },
    violet: { wrap: "bg-violet-50 dark:bg-violet-900/20", icon: "text-violet-600 dark:text-violet-400", val: "text-violet-700 dark:text-violet-300", border: "border-violet-100 dark:border-violet-800/50" },
    emerald:{ wrap: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", val: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-100 dark:border-emerald-800/50" },
  };
  const s = styles[color];
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${s.border} p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${s.wrap} shrink-0`}>
        <span className={s.icon}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-extrabold mt-0.5 tabular-nums ${s.val}`}>{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

const StatPill = ({ icon, value, label, color }) => {
  const styles = {
    blue:    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    violet:  "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold border px-3 py-1.5 rounded-full ${styles[color]}`}>
      {icon}
      <span className="font-extrabold tabular-nums">{value}</span>
      <span className="font-medium opacity-70">{label}</span>
    </span>
  );
};

// ── Accent palette ─────────────────────────────────────────────────────────────
const ACCENTS = [
  {
    headerBg:  "bg-gradient-to-r from-blue-50/80 to-white dark:from-blue-900/10 dark:to-gray-800",
    iconWrap:  "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    idBadge:   "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    chip:      "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  {
    headerBg:  "bg-gradient-to-r from-violet-50/80 to-white dark:from-violet-900/10 dark:to-gray-800",
    iconWrap:  "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    idBadge:   "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    chip:      "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  },
  {
    headerBg:  "bg-gradient-to-r from-amber-50/80 to-white dark:from-amber-900/10 dark:to-gray-800",
    iconWrap:  "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    idBadge:   "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    chip:      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  {
    headerBg:  "bg-gradient-to-r from-teal-50/80 to-white dark:from-teal-900/10 dark:to-gray-800",
    iconWrap:  "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
    idBadge:   "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    chip:      "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  },
];

export default ViewWorkOrderDone;
