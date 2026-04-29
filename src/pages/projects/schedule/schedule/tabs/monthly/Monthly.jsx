import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  BarChart2,
  Loader2,
  AlertCircle,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { API } from "../../../../../../constant";
import { useProject } from "../../../../../../context/ProjectContext";
import SearchableSelect from "../../../../../../components/SearchableSelect";

// --- HELPERS ---

// 1. Flattening (Preserves hierarchy levels for UI)
// No Aggregation here, just flattening the tree to a list
const flattenStructure = (nodes) => {
  let flatList = [];

  const traverse = (node, level) => {
    // If it has a row_index, it's a renderable row.
    if (node.row_index !== undefined) {
      flatList.push({ ...node, level });
    }
    if (node.items && Array.isArray(node.items)) node.items.forEach(child => traverse(child, level + 1));
    if (node.tasks && Array.isArray(node.tasks)) node.tasks.forEach(child => traverse(child, level + 1));
    if (node.task_wbs_ids && Array.isArray(node.task_wbs_ids)) node.task_wbs_ids.forEach(child => traverse(child, level + 1));
  };

  if (Array.isArray(nodes)) {
    nodes.forEach(node => traverse(node, 0));
  }

  return flatList.sort((a, b) => a.row_index - b.row_index);
};

// 2. Styling Helper
const getLevelStyle = (level) => {
  switch (level) {
    case 0: // L1 (Group)
      return "font-extrabold text-blue-900 dark:text-white uppercase tracking-wide";
    case 1: // L2 (Item)
      return "font-bold text-red-700 dark:text-blue-400";
    case 2: // L3 (Task)
      return "font-medium text-slate-900 dark:text-gray-300 text-sm";
    case 3: // L4 (Sub-task/WBS)
      return "font-normal text-blue-500 dark:text-gray-400 italic text-xs font-semibold";
    default:
      return "text-gray-800";
  }
};

const MonthlyProjects = () => {
  const { tenderId } = useProject();
  const today = new Date();

  // --- State ---
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Constants ---
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schedulelite/get-daily-schedule/${tenderId}`);
      if (res.data && res.data.data && res.data.data.structure) {
        // Just flatten. No aggregation logic applied.
        const flatData = flattenStructure(res.data.data.structure);
        setRows(flatData);
      }
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenderId]);

  // --- Data Mapping Logic (Direct Read) ---
  const mappedData = useMemo(() => {
    if (!rows.length) return [];

    const targetMonthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM");

    return rows.map((item) => {
      // 1. Find the specific Month Object in the 'schedule_data' array
      const monthData = item.schedule_data?.find(m =>
        m.month_name === targetMonthName && m.year === selectedYear
      );

      // 2. Extract Metrics directly
      const metrics = monthData?.metrics || {
        achieved_quantity: 0,
        planned_quantity: 0,
        lag_quantity: 0
      };

      const planned = metrics.planned_quantity || 0;
      const achieved = metrics.achieved_quantity || 0;
      // Note: Use lag from DB or calculate simply. Here we use DB if available, else simple diff.
      const lag = metrics.lag_quantity !== undefined ? metrics.lag_quantity : (planned - achieved);

      // Active if there is any plan or achievement for this specific month
      const isActive = (planned > 0 || achieved > 0);

      return {
        ...item,
        display_planned: planned,
        display_achieved: achieved,
        display_lag: lag,
        is_active_month: isActive
      };
    });
  }, [rows, selectedYear, selectedMonth]);

  const selectedMonthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-layout-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden font-roboto-flex text-sm">

      {/* --- Header Control Bar --- */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <BarChart2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Overview</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Project progress for {selectedMonthName} {selectedYear}</p>
            </div>
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <SearchableSelect
              value={String(selectedMonth)}
              onChange={(val) => setSelectedMonth(parseInt(val))}
              options={Array.from({ length: 12 }, (_, i) => ({ value: String(i), label: format(new Date(2000, i, 1), "MMMM") }))}
              placeholder="Select month"
            />

            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

            <SearchableSelect
              value={String(selectedYear)}
              onChange={(val) => setSelectedYear(parseInt(val))}
              options={years.map((year) => ({ value: String(year), label: String(year) }))}
              placeholder="Select year"
            />
          </div>

        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-layout-dark">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-layout-dark/80 z-20 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
            <span className="text-xs text-gray-500 font-medium">Loading monthly data...</span>
          </div>
        ) : (
          <MonthlyTable data={mappedData} monthName={selectedMonthName} />
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Table ---
const MonthlyTable = ({ data, monthName }) => {

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
        <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
        <p className="text-xs font-medium">No schedule data found.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-40 shadow-sm">
          <tr>
            {/* Sticky Index */}
            <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-[50px] bg-gray-50 dark:bg-gray-800 sticky left-0 z-50">#</th>

            {/* Sticky Description */}
            <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[300px] bg-gray-50 dark:bg-gray-800 sticky left-[50px] z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Description</th>

            <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-[60px]">Unit</th>
            <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-[80px]">Total Qty</th>
            <th className="py-2.5 px-3 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-right bg-indigo-50/50 dark:bg-indigo-900/20 w-[90px] border-l border-gray-200 dark:border-gray-700">Executed</th>
            <th className="py-2.5 px-3 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-right bg-rose-50/50 dark:bg-rose-900/20 w-[90px] border-r border-gray-200 dark:border-gray-700">Balance</th>

            {/* Monthly Metrics Section (Purple Theme) */}
            <th className="py-2.5 px-3 text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider text-right w-[110px] bg-purple-50/30 dark:bg-purple-900/10">
              {monthName} Plan
            </th>
            <th className="py-2.5 px-3 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-right w-[110px] bg-emerald-50/30 dark:bg-emerald-900/10">
              Achieved
            </th>
            <th className="py-2.5 px-3 text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider text-right w-[90px] bg-orange-50/30 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-700">
              Lag
            </th>
            <th className="py-2.5 px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-[100px]">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-layout-dark text-sm">
          {data.map((row) => {
            // Indentation & Styling
            const name = row.description || row.task_name || row.item_name || row.group_name || "Unknown";
            const indentPx = 10 + (row.level || 0) * 20;
            const textStyle = getLevelStyle(row.level || 0);

            // Row Visibility
            const rowClass = row.level === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

            // Lag Color
            const isLagging = row.display_lag > 0.01;
            const lagColor = isLagging ? "text-red-600 dark:text-red-400 font-bold" : "text-gray-400 dark:text-gray-500";

            // Dates
            const startDate = row.start_date ? format(new Date(row.start_date), "dd MMM") : "-";
            const endDate = (row.revised_end_date || row.end_date) ? format(new Date(row.revised_end_date || row.end_date), "dd MMM") : "-";

            return (
              <tr key={row._id || row.row_index} className={`group ${rowClass} transition-colors`}>

                {/* Sticky Index */}
                <td className="sticky left-0 z-30 bg-white dark:bg-layout-dark border-r border-gray-200 dark:border-gray-700 py-3 px-4 text-center text-xs text-slate-400 group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                  {row.row_index}
                </td>

                {/* Sticky Description with Indentation */}
                <td className="sticky left-[50px] z-30 bg-white dark:bg-layout-dark border-r border-gray-200 dark:border-gray-700 py-3 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="flex flex-col" style={{ paddingLeft: `${indentPx}px` }}>
                    <span className={`${textStyle} truncate max-w-[350px] text-xs`} title={name}>{name}</span>

                    {/* Dates inside Description for context */}
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5 ml-0.5 font-normal">
                      <CalendarDays size={9} />
                      <span>{startDate}</span>
                      <ArrowRight size={8} />
                      <span>{endDate}</span>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3 text-center"><span className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-medium">{row.unit}</span></td>

                <td className="py-2.5 px-3 text-right font-medium text-gray-700 dark:text-gray-300">{row.quantity?.toLocaleString()}</td>

                <td className="py-2.5 px-3 text-right font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/10 dark:bg-indigo-900/5">
                  {row.executed_quantity > 0 ? row.executed_quantity.toLocaleString() : "-"}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-rose-700 dark:text-rose-400 bg-rose-50/10 dark:bg-rose-900/5 border-r border-gray-100 dark:border-gray-800">
                  {row.balance_quantity?.toLocaleString()}
                </td>

                {/* Monthly Metrics */}
                <td className="py-2.5 px-3 text-right font-medium text-purple-700 dark:text-purple-300 border-l border-gray-100 dark:border-gray-800 bg-purple-50/10">
                  {row.display_planned > 0 ? row.display_planned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "-"}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/10">
                  {row.display_achieved > 0 ? row.display_achieved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "-"}
                </td>
                <td className={`py-2.5 px-3 text-right border-r border-gray-200 dark:border-gray-700 ${lagColor} bg-orange-50/10`}>
                  {row.display_lag === 0 || Math.abs(row.display_lag) < 0.01 ? "-" : row.display_lag.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </td>

                {/* Status */}
                <td className="py-2.5 px-3 text-center">
                  <StatusBadge status={row.status} />
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Helper: Status Badge ---
const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || "pending";
  const styles = {
    completed: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
    inprogress: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    pending: "text-gray-500 bg-gray-100 dark:bg-gray-800",
  };
  const labels = { completed: "Done", inprogress: "Active", pending: "Pending" };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${styles[normalizedStatus] || styles.pending}`}>
      {labels[normalizedStatus] || "Pending"}
    </span>
  );
};

export default MonthlyProjects;