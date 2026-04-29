import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  IoCalendarClearOutline,
  IoWarning,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoChevronBack,
  IoChevronForward,
  IoInformationCircle,
  IoHourglassOutline,
  IoBriefcaseOutline,
} from "react-icons/io5";
import { API } from "../../../../constant";
import DetailModal from "./DetailModal";

const THEME = {
  Present: {
    primary: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <IoCheckmarkCircle className="w-3.5 h-3.5" />,
    gradient: "from-emerald-500 to-teal-500",
  },
  Absent: {
    primary: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: <IoCloseCircle className="w-3.5 h-3.5" />,
    gradient: "from-rose-500 to-red-500",
  },
  "Half-Day": {
    primary: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <IoHourglassOutline className="w-3.5 h-3.5" />,
    gradient: "from-amber-400 to-orange-500",
  },
  "On Leave": {
    primary: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <IoInformationCircle className="w-3.5 h-3.5" />,
    gradient: "from-blue-400 to-indigo-500",
  },
  Holiday: {
    primary: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: <IoCalendarClearOutline className="w-3.5 h-3.5" />,
    gradient: "from-purple-400 to-fuchsia-500",
  },
  Default: {
    primary: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: null,
    gradient: "from-slate-400 to-slate-500",
  },
};

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  const [attendanceMap, setAttendanceMap] = useState({});
  const [summary, setSummary] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const response = await axios.get(
          `${API}/attendance/get-my-attendance-stats`,
          {
            params: { month, year },
            withCredentials: true,
          },
        );

        const { calendarData, summary } = response.data;
        const dataMap = {};
        if (calendarData) {
          calendarData.forEach((record) => (dataMap[record.date] = record));
        }
        setAttendanceMap(dataMap);
        setSummary(summary);
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    fetchAttendance();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const totalDaysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  }).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 px-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Attendance
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Overview & Regularization
          </p>
        </div>

        <div className="flex items-center bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 ring-1 ring-slate-100">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            <IoChevronBack />
          </button>
          <span className="w-40 text-center font-semibold text-slate-700 text-md tabular-nums">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            <IoChevronForward />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatWidget
          title="Present Days"
          value={summary?.present}
          total={totalDaysInMonth}
          color="teal"
          icon={<IoCheckmarkCircle size={20} />}
          labelOverride="Days"
        />
        <StatWidget
          title="Absent Days"
          value={summary?.absent}
          total="-" // No progress bar needed implies straight count
          color="rose"
          icon={<IoCloseCircle size={20} />}
        />
        <StatWidget
          title="Late Marks"
          value={summary?.late}
          total="-"
          color="orange"
          icon={<IoWarning size={20} />}
        />
        <StatWidget
          title="Permission "
          value={summary?.permissions || 0}
          total="-"
          color="blue"
          icon={<IoBriefcaseOutline size={20} />}
        />
      </div>
      <div className="bg-white rounded-lg shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(120px,_1fr)] divide-x divide-y divide-slate-100">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const data = attendanceMap[dateKey];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const style = THEME[data?.status] || THEME.Default;

            return (
              <div
                key={day.toString()}
                onClick={() =>
                  isCurrentMonth && setSelectedDay({ date: day, ...data })
                }
                className={`
                  relative p-3 transition-all duration-200 group flex flex-col justify-between
                  ${!isCurrentMonth ? "bg-slate-50/30 cursor-default" : "bg-white hover:bg-slate-50 cursor-pointer"}
                  ${isTodayDate ? "bg-blue-50/30" : ""}
                `}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`
                    text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-all
                    ${isTodayDate ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-600 group-hover:bg-slate-200/50"}
                    ${!isCurrentMonth ? "text-slate-300" : ""}
                  `}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="flex flex-col gap-1 items-end">
                    {data?.isLate && (
                      <span
                        className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white"
                        title="Late Entry"
                      />
                    )}
                    {data?.isRegularized && (
                      <span
                        className="w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white"
                        title="Regularized"
                      />
                    )}
                    {data?.permissionUsed && (
                      <span
                        className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"
                        title="Permission"
                      />
                    )}
                  </div>
                </div>

                {data && isCurrentMonth ? (
                  <div className="flex flex-col justify-between h-full mt-1 min-h-[40px]">
                    <div className="flex items-center gap-1.5">
                      <div className={`text-sm ${style.primary} opacity-80`}>
                        {style.icon}
                      </div>

                      <span
                        className={`text-[11px] font-bold uppercase tracking-tight ${style.primary}`}
                      >
                        {data.status}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-0.5 mt-0.5">
                      {data.hours > 0 ? (
                        <>
                          <span className="text-xs font-extrabold text-slate-700 tabular-nums tracking-tight">
                            {data.hours}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            h
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-200">
                          --
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  isCurrentMonth &&
                  day < new Date() && (
                    <div className="h-full flex items-center justify-center mt-2">
                      <div className="w-4 h-0.5 bg-slate-100 rounded-full"></div>
                    </div>
                  )
                )}

                {isCurrentMonth && (
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 pointer-events-none rounded-none transition-colors" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <DetailModal
          data={selectedDay}
          onClose={() => setSelectedDay(null)}
          theme={THEME[selectedDay.status] || THEME.Default}
        />
      )}
    </div>
  );
};

const StatWidget = ({ title, value, total, color, icon, labelOverride }) => {
  const styles = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      light: "bg-blue-50",
      text: "text-blue-600",
      shadow: "shadow-blue-200",
    },
    orange: {
      gradient: "from-orange-400 to-orange-500",
      light: "bg-orange-50",
      text: "text-orange-600",
      shadow: "shadow-orange-200",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      light: "bg-purple-50",
      text: "text-purple-600",
      shadow: "shadow-purple-200",
    },
    teal: {
      gradient: "from-teal-400 to-teal-500",
      light: "bg-teal-50",
      text: "text-teal-600",
      shadow: "shadow-teal-200",
    },
    rose: {
      gradient: "from-rose-500 to-rose-600",
      light: "bg-rose-50",
      text: "text-rose-600",
      shadow: "shadow-rose-200",
    },
  };

  const theme = styles[color] || styles.blue;

  const percentage = total && total !== "-" ? (value / total) * 100 : 0;
  const displayLabel = labelOverride || (total ? "Count" : "Total");

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${theme.gradient}`}
      ></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-2xl font-bold text-slate-800 tabular-nums tracking-tight">
              {value || 0}
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              {displayLabel}
            </span>
          </div>
        </div>

        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-lg ${theme.shadow} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>

      {total && total !== "-" && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}

      {(!total || total === "-") && (
        <div className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-1">
          <div
            className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${theme.gradient}`}
          ></div>
          Recorded this month
        </div>
      )}
    </div>
  );
};

export default Attendance;
