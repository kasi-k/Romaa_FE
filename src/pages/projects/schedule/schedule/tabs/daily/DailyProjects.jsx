import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  addMonths,
  isWithinInterval,
  startOfDay,
  parseISO,
  isSameDay,
  differenceInCalendarDays,
  getDate,
  max,
  min
} from "date-fns";
import { ChevronLeft, ChevronRight, Save, Calendar as CalendarIcon, Loader2, Edit2, Lock } from "lucide-react";
import { API } from "../../../../../../constant";
import axios from "axios";
import { useProject } from "../../../../../../context/ProjectContext";
import { toast } from "react-toastify";

// --- HELPERS ---

const flattenStructure = (nodes) => {
  let flatList = [];
  const traverse = (node, level) => {
    if (node.row_index !== undefined) flatList.push({ ...node, level });
    if (node.items) node.items.forEach(child => traverse(child, level + 1));
    if (node.tasks) node.tasks.forEach(child => traverse(child, level + 1));
    if (node.task_wbs_ids) node.task_wbs_ids.forEach(child => traverse(child, level + 1));
  };
  if (Array.isArray(nodes)) nodes.forEach(node => traverse(node, 0));
  return flatList.sort((a, b) => a.row_index - b.row_index);
};

const getLevelStyle = (level) => {
  switch (level) {
    case 0: return "font-extrabold text-blue-900 dark:text-white uppercase tracking-wide";
    case 1: return "font-bold text-red-700 dark:text-blue-400";
    case 2: return "font-medium text-slate-900 dark:text-gray-300 text-sm";
    case 3: return "font-normal text-blue-400 dark:text-gray-400 italic text-xs text-semibold";
    default: return "text-gray-800";
  }
};

const getUTCDateStr = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput === 'string') return dateInput.substring(0, 10);
  return format(dateInput, "yyyy-MM-dd");
};

const getWeeklyPlanForLabel = (item, dayObj, activeStartStr, activeEndStr) => {
  if (!activeStartStr || !activeEndStr) return null;
  const startDate = parseISO(activeStartStr);
  const endDate = parseISO(activeEndStr);
  const totalDuration = differenceInCalendarDays(endDate, startDate) + 1;
  if (totalDuration <= 0) return null;

  const dailyRate = (item.quantity || 0) / totalDuration;
  const dayNum = getDate(dayObj);
  let weekIndex = dayNum <= 7 ? 1 : dayNum <= 14 ? 2 : dayNum <= 21 ? 3 : 4;

  const logicalWeekStartDay = (weekIndex - 1) * 7 + 1;
  if (getDate(dayObj) !== logicalWeekStartDay) return null;

  const currentMonthYear = startOfMonth(dayObj);
  const logicalWeekStartDate = new Date(Date.UTC(currentMonthYear.getFullYear(), currentMonthYear.getMonth(), logicalWeekStartDay));
  const weekEndDay = weekIndex === 4 ? endOfMonth(dayObj).getDate() : weekIndex * 7;
  const logicalWeekEndDate = new Date(Date.UTC(currentMonthYear.getFullYear(), currentMonthYear.getMonth(), weekEndDay));

  const overlapStart = max([startOfDay(logicalWeekStartDate), startOfDay(startDate)]);
  const overlapEnd = min([startOfDay(logicalWeekEndDate), startOfDay(endDate)]);

  if (overlapStart > overlapEnd) return null;

  const overlapDays = differenceInCalendarDays(overlapEnd, overlapStart) + 1;
  const plannedQty = (overlapDays * dailyRate).toFixed(1);

  if (parseFloat(plannedQty) <= 0) return null;
  return { label: `W${weekIndex}: ${plannedQty}`, weekIndex };
};


const DailyProjects = () => {
  const { tenderId } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date("2026-01-01"));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const scrollContainerRef = useRef(null);

  const fetchSchedule = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schedulelite/get-daily-schedule/${tenderId}`);
      if (res.data?.data?.structure) {
        setRows(flattenStructure(res.data.data.structure));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedule(); }, [tenderId]);
  useEffect(() => { if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0; }, [currentDate]);

  const daysInMonth = useMemo(() => eachDayOfInterval({
    start: startOfMonth(currentDate), end: endOfMonth(currentDate)
  }), [currentDate]);

  const handlePrevMonth = () => setCurrentDate(prev => startOfMonth(subMonths(prev, 1)));
  const handleNextMonth = () => setCurrentDate(prev => startOfMonth(addMonths(prev, 1)));

  const handleInputChange = (rowIndex, dateStr, value) => {
    const key = `${rowIndex}_${dateStr}`;
    setUpdates(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const payloadArray = Object.entries(updates).map(([key, value]) => {
      const [rowIndexStr, dateStr] = key.split('_');
      return { row_index: Number(rowIndexStr), date: `${dateStr}T00:00:00.000Z`, quantity: Number(value) };
    });
    const validUpdates = payloadArray.filter(u => !isNaN(u.quantity) && u.quantity !== "");

    if (validUpdates.length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/schedulelite/update-daily-quantity-bulk/${tenderId}`, { updates: validUpdates });
      console.log(res.data);

      // Check res.data.status OR res.data.data.success based on your structure
      if (res.data.status === true || (res.data.data && res.data.data.success === true)) {
        toast.success(`Updated ${validUpdates.length} entries`);
        setUpdates({});
        setIsEditing(false);
        fetchSchedule();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save updates");
    } finally {
      setLoading(false);
    }
  };

  // --- FIXED VALUE RESOLVER ---
  const getCellValue = (row, dayStr) => {
    const key = `${row.row_index}_${dayStr}`;
    if (updates.hasOwnProperty(key)) return updates[key];

    if (row.daily && Array.isArray(row.daily)) {
      // Robust string comparison
      const found = row.daily.find(d => d.date && d.date.substring(0, 10) === dayStr);
      return found ? found.quantity : "";
    }
    return "";
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-layout-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden font-roboto-flex text-sm">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><CalendarIcon size={20} /></div>
          <div><h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">Daily Progress {!isEditing && <Lock size={14} className="text-gray-400" />}</h2></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600"><ChevronLeft size={18} /></button>
            <span className="px-4 font-semibold text-sm w-32 text-center min-w-[140px]">{format(currentDate, "MMMM yyyy")}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600"><ChevronRight size={18} /></button>
          </div>
          {isEditing ? (
            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Updates
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              <Edit2 size={16} /> Edit Quantities
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-layout-dark overflow-x-auto">
        <div className="flex items-center gap-2"><span className="w-4 h-3 rounded-full bg-cyan-500 text-[8px] text-white flex items-center justify-center font-bold">OS</span> Orig. Start</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 text-[8px] text-white flex items-center justify-center font-bold">S</span> Rev. Start</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center font-bold">E</span> Orig. End</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 text-[8px] text-white flex items-center justify-center font-bold">R</span> Rev. End</div>
        <div className="flex items-center gap-2"><span className="bg-blue-100 border border-blue-200 text-blue-700 px-1 rounded text-[9px] font-bold">W1: 15.2</span> Weekly Plan</div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-auto relative custom-scrollbar">
        <table className="border-collapse w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 z-40 sticky top-0">
            <tr>
              <th className="sticky left-0 z-50 bg-gray-50 dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 p-3 text-left min-w-[10px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">#</th>
              <th className="sticky left-0 z-50 bg-gray-50 dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 p-3 text-left min-w-[320px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Item Details</th>
              {daysInMonth.map((day) => (
                <th key={day.toString()} className="border-b border-r border-gray-200 dark:border-gray-700 min-w-[60px] p-2 text-center bg-gray-50 dark:bg-gray-800">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-gray-400 font-medium">{format(day, "EEE")}</span>
                    <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}>{format(day, "d")}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => {
              const safeRevStart = row.revised_start_date || row.start_date;
              const safeRevEnd = row.revised_end_date || row.end_date;
              const revStartStr = getUTCDateStr(safeRevStart);
              const revEndStr = getUTCDateStr(safeRevEnd);
              const origStartStr = getUTCDateStr(row.start_date);
              const origEndStr = getUTCDateStr(row.end_date);
              const validRange = revStartStr && revEndStr;
              const rangeStart = validRange ? parseISO(revStartStr) : null;
              const rangeEnd = validRange ? parseISO(revEndStr) : null;
              const canEditRow = validRange;
              const name = row.description || row.task_name || row.item_name || row.group_name || "Unknown";
              const indentPx = 10 + (row.level || 0) * 20;
              const textStyle = getLevelStyle(row.level || 0);
              const rowBgClass = row.level === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

              return (
                <tr key={row._id || `${row.row_index}`} className={`group ${rowBgClass}`}>
                  <td className="sticky text-center text-xs text-slate-400 left-0 z-30 bg-white dark:bg-layout-dark border-r border-gray-200 dark:border-gray-700 p-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{row.row_index}</td>
                  <td className="sticky left-0 z-20 bg-white dark:bg-layout-dark border-r border-gray-200 dark:border-gray-700 p-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex flex-col" style={{ paddingLeft: `${indentPx}px` }}>
                      <span className={`${textStyle} truncate max-w-[280px] text-xs`} title={name}>{name}</span>
                      {row.unit && <span className="text-[10px] text-gray-400 mt-1">Qty: {row.quantity} {row.unit} | Dur: {row.revised_duration || row.duration}d</span>}
                    </div>
                  </td>
                  {daysInMonth.map((day) => {
                    const dayStr = format(day, "yyyy-MM-dd");
                    const dayObj = startOfDay(day);
                    let isActiveDay = false;
                    if (canEditRow && rangeStart && rangeEnd) isActiveDay = isWithinInterval(dayObj, { start: rangeStart, end: rangeEnd });

                    const isOrigStart = dayStr === origStartStr;
                    const isOrigEnd = dayStr === origEndStr;
                    const isRevStart = dayStr === revStartStr;
                    const isRevEnd = dayStr === revEndStr;
                    const isCombinedStart = isOrigStart && isRevStart;
                    const isCombinedEnd = isOrigEnd && isRevEnd;
                    const weeklyPlanData = getWeeklyPlanForLabel(row, day, revStartStr, revEndStr);

                    let inputClass = "w-full h-7 text-center text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all ";
                    if (isActiveDay) {
                      inputClass += "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200";
                      if (isRevStart) inputClass += " border-green-500 ring-1 ring-green-100";
                      if (isRevEnd) inputClass += " border-purple-500 ring-1 ring-purple-100";
                    } else {
                      inputClass += "bg-transparent border-none text-transparent pointer-events-none";
                    }

                    return (
                      <td key={dayStr} className={`border-r border-gray-100 dark:border-gray-800 p-1 relative min-h-[40px] align-middle ${isActiveDay ? "bg-blue-50/10" : ""}`}>
                        {weeklyPlanData && (
                          <div className="absolute -top-2 left-0 right-0 z-10 flex justify-center pointer-events-none">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700 text-[8px] font-bold px-1 rounded-sm shadow-sm whitespace-nowrap">{weeklyPlanData.label}</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 pointer-events-none z-10 flex gap-0.5">
                          {isOrigStart && !isCombinedStart && <span className="text-[7px] w-4 h-3 flex items-center justify-center rounded-full font-bold text-white bg-cyan-500 shadow-sm" title="Original Start">OS</span>}
                          {isRevStart && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-green-500 shadow-sm" title="Revised Start">S</span>}
                          {isCombinedEnd ? <span className="text-[7px] w-auto px-1 h-3 flex items-center justify-center rounded-full font-bold text-white bg-purple-500 shadow-sm" title="Original & Revised End">End</span> : (
                            <>
                              {isOrigEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-red-500 shadow-sm" title="Original End Date">E</span>}
                              {isRevEnd && <span className="text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-bold text-white bg-purple-500 shadow-sm" title="Revised End Date">R</span>}
                            </>
                          )}
                        </div>
                        <input type="number" disabled={!isEditing || !isActiveDay} className={inputClass} value={getCellValue(row, dayStr)} onChange={(e) => handleInputChange(row.row_index, dayStr, e.target.value)} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyProjects;