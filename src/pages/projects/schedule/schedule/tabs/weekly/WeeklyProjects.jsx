import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, getDaysInMonth } from "date-fns";
import {
  BarChart3,
  Loader2,
  AlertCircle,
  Calendar
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
    case 0: // L1
      return "font-extrabold text-blue-900 dark:text-white uppercase tracking-wide";
    case 1: // L2
      return "font-bold text-red-700 dark:text-blue-400";
    case 2: // L3
      return "font-medium text-slate-900 dark:text-gray-300 text-sm";
    case 3: // L4
      return "font-normal text-blue-400 dark:text-gray-400 italic text-xs text-semibold";
    default:
      return "text-gray-800";
  }
};

const WeeklyProjects = () => {
  const { tenderId } = useProject();
  const today = new Date();

  // --- State ---
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Constants ---
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  const weeks = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    return [
      { label: "Week 1", range: "01 - 07", number: 1 },
      { label: "Week 2", range: "08 - 14", number: 2 },
      { label: "Week 3", range: "15 - 21", number: 3 },
      { label: "Week 4", range: `22 - ${daysInMonth}`, number: 4 },
    ];
  }, [selectedYear, selectedMonth]);

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
      console.error("Error fetching weekly data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tenderId]);

  // --- Map Display Data (Direct Read from API) ---
  const mappedData = useMemo(() => {
    if (!rows.length) return [];

    const targetMonthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM");
    const targetWeekNum = weeks[selectedWeekIndex].number;

    return rows.map((item) => {
      let planned = 0;
      let achieved = 0;
      let lag = 0;

      // 1. Find the Month Object
      const monthData = item.schedule_data?.find(m =>
        m.month_name === targetMonthName && m.year === selectedYear
      );

      if (monthData && monthData.weeks) {
        // 2. Find the Week Object
        const weekData = monthData.weeks.find(w => w.week_number === targetWeekNum);

        if (weekData && weekData.metrics) {
          planned = weekData.metrics.planned_quantity || 0;
          achieved = weekData.metrics.achieved_quantity || 0;
          lag = weekData.metrics.lag_quantity || 0;
        }
      }

      return {
        ...item,
        display_planned: planned,
        display_achieved: achieved,
        display_lag: lag,
      };
    });
  }, [rows, selectedYear, selectedMonth, selectedWeekIndex, weeks]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-layout-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden font-roboto-flex text-sm">

      {/* --- Header --- */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Performance</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track planned vs achieved progress per week</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <SearchableSelect
                value={String(selectedMonth)}
                onChange={(val) => { setSelectedMonth(parseInt(val)); setSelectedWeekIndex(0); }}
                options={Array.from({ length: 12 }, (_, i) => ({ value: String(i), label: format(new Date(2000, i, 1), "MMMM") }))}
                placeholder="Select month"
              />
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <SearchableSelect
                value={String(selectedYear)}
                onChange={(val) => { setSelectedYear(parseInt(val)); setSelectedWeekIndex(0); }}
                options={years.map((year) => ({ value: String(year), label: String(year) }))}
                placeholder="Select year"
              />
            </div>

            <div className="flex items-center bg-white dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-x-auto max-w-full">
              {weeks.map((week, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedWeekIndex(idx)}
                  className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium transition-all min-w-[80px]
                    ${selectedWeekIndex === idx
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"}
                  `}
                >
                  <span>{week.label}</span>
                  <span className="text-[10px] opacity-70 mt-0.5 font-normal">{week.range}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-layout-dark">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-layout-dark/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">Calculating schedule data...</p>
          </div>
        ) : (
          <div className="h-full overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-40 shadow-sm">
                <tr>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 text-center w-[50px] bg-gray-50 dark:bg-gray-800 sticky left-0 z-50">#</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[300px] bg-gray-50 dark:bg-gray-800 sticky left-[50px] z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Description</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 text-center w-[60px]">Unit</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 text-right w-[80px]">Total Qty</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-right bg-indigo-50/50 dark:bg-indigo-900/20 w-[90px] border-l border-gray-200 dark:border-gray-700">Executed</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-right bg-rose-50/50 dark:bg-rose-900/20 w-[90px] border-r border-gray-200 dark:border-gray-700">Balance</th>

                  {/* Dynamic Week Header */}
                  <th className="py-3 px-4 text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider text-right w-[110px] bg-blue-50/30 dark:bg-blue-900/10">
                    {weeks[selectedWeekIndex].label} Plan
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-right w-[110px] bg-emerald-50/30 dark:bg-emerald-900/10">
                    Achieved
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider text-right w-[90px] bg-orange-50/30 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-700">
                    Lag
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-layout-dark">
                {mappedData.map((row) => {
                  const name = row.description || row.task_name || row.item_name || row.group_name || "Unknown";
                  const indentPx = 10 + (row.level || 0) * 20;
                  const textStyle = getLevelStyle(row.level || 0);
                  const rowBgClass = row.level === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

                  const isLagging = row.display_lag > 0.01;
                  const lagColor = isLagging ? "text-red-600 dark:text-red-400 font-bold" : "text-gray-400 dark:text-gray-500";

                  return (
                    <tr key={row._id || row.row_index} className={`group ${rowBgClass} transition-colors`}>

                      {/* Sticky Index */}
                      <td className="sticky left-0 z-30 bg-white dark:bg-layout-dark border-r border-gray-200 dark:border-gray-700 py-3 px-4 text-center text-xs text-slate-400 group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                        {row.row_index}
                      </td>

                      {/* Sticky Description with Indentation */}
                      <td className="sticky left-[50px] z-30 bg-white dark:bg-layout-dark border-r border-gray-200 dark:border-gray-700 py-3 px-4 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col" style={{ paddingLeft: `${indentPx}px` }}>
                          <span className={`${textStyle} truncate max-w-[350px] text-xs`} title={name}>{name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-center border-r border-gray-100 dark:border-gray-800">
                        {row.unit && (
                          <span className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                            {row.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 text-right border-r border-gray-100 dark:border-gray-800">
                        {row.quantity?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/10 dark:bg-indigo-900/5">
                        {row.executed_quantity > 0 ? row.executed_quantity.toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-rose-700 dark:text-rose-400 bg-rose-50/10 dark:bg-rose-900/5 border-r border-gray-200 dark:border-gray-700">
                        {row.balance_quantity?.toLocaleString()}
                      </td>

                      {/* Weekly Data Columns */}
                      <td className="py-3 px-4 text-right bg-blue-50/30 dark:bg-blue-900/5 border-r border-gray-100 dark:border-gray-800">
                        <span className={`text-sm font-bold ${row.display_planned > 0 ? "text-blue-700 dark:text-blue-400" : "text-gray-300 dark:text-gray-600"}`}>
                          {row.display_planned > 0 ? row.display_planned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right bg-green-50/30 dark:bg-green-900/5 border-r border-gray-100 dark:border-gray-800">
                        <span className={`text-sm font-bold ${row.display_achieved > 0 ? "text-green-700 dark:text-green-400" : "text-gray-300 dark:text-gray-600"}`}>
                          {row.display_achieved > 0 ? row.display_achieved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "-"}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right bg-orange-50/30 dark:bg-orange-900/5 border-r border-gray-200 dark:border-gray-700 ${lagColor}`}>
                        <span className="text-sm font-mono">
                          {row.display_lag === 0 ? "-" : row.display_lag.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyProjects;