import React, { useState } from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import { Check, X, ClipboardEdit } from "lucide-react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { HiArrowsUpDown } from "react-icons/hi2";
import Pagination from "../../../components/Pagination";
import Filters from "../../../components/Filters";
import { useSearch } from "../../../context/SearchBar";
import { useDebounce } from "../../../hooks/useDebounce";
import { useMonthlyAttendanceReport, useRegularizationRequests } from "./hooks/useAttendance";
import ApplyRegularizationModal from "./ApplyRegularizationModal";
import ActionRegularizationModal from "./ActionRegularizationModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getDaysInMonth = (month, year) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push({
      date: date.getDate().toString(),
      day: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0).toUpperCase(),
      full: `${year}-${String(month + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const STATUS_COLOR = {
  Present: "text-emerald-600",
  Absent: "text-rose-500",
  "Half-Day": "text-amber-500",
  "On Leave": "text-blue-500",
  Holiday: "text-purple-500",
  "Missed Punch": "text-orange-500",
};

const Attendance = () => {
  const { searchTerm } = useSearch();
  const [activeTab, setActiveTab] = useState("monthly");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModal, setFilterModal] = useState(false);
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const [applyRegModal, setApplyRegModal] = useState(false);
  const [actionRegItem, setActionRegItem] = useState(null);
  const [regStatusFilter, setRegStatusFilter] = useState("Pending");

  const itemsPerPage = 10;
  const days = getDaysInMonth(month, year);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: monthlyData, isLoading: loadingMonthly, refetch: refetchMonthly } =
    useMonthlyAttendanceReport({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      fromdate: filterParams.fromdate,
      todate: filterParams.todate,
    });

  const { data: regData, isLoading: loadingReg, refetch: refetchReg } =
    useRegularizationRequests({
      page: 1,
      limit: 50,
      search: debouncedSearch,
      fromdate: filterParams.fromdate,
      todate: filterParams.todate,
      status: regStatusFilter,
    });

  const allRows      = monthlyData?.data || [];
  const paginatedRows = allRows;
  const totalMonthlyPages = monthlyData?.totalPages || 1;

  const regRequests = regData?.data || [];

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setFilterModal(false);
    setCurrentPage(1);
  };

  const TabBtn = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-all duration-200 ${
        activeTab === id
          ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col font-layout-font">
      {/* Header */}
      <div className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <Title title="HR Management" sub_title="Attendance" page_title="Attendance" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Date:</span>{" "}
            {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
          <ButtonBg
            button_icon={<TbFileExport size={20} />}
            button_name="Export"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
          />
          <ButtonBg
            button_icon={<BiFilterAlt size={20} />}
            button_name="Filter"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            onClick={() => setFilterModal(true)}
          />
          {activeTab === "regularization" && (
            <ButtonBg
              button_icon={<ClipboardEdit size={18} />}
              button_name="Apply"
              onClick={() => setApplyRegModal(true)}
            />
          )}
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={month}
          onChange={(e) => { setMonth(+e.target.value); setCurrentPage(1); }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
        >
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => { setYear(+e.target.value); setCurrentPage(1); }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
        >
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button
          onClick={activeTab === "regularization" ? refetchReg : refetchMonthly}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw className={loadingMonthly || loadingReg ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4 flex gap-8">
        <TabBtn id="monthly" label="Monthly View" icon={<FiCheckCircle size={14} />} />
        <TabBtn id="regularization" label="Regularizations" icon={<ClipboardEdit size={14} />} />
      </div>

      {/* MONTHLY VIEW */}
      {activeTab === "monthly" && (
        <>
          <div className="overflow-auto flex-1 no-scrollbar rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <table className="w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="bg-darkest-blue text-white text-[11px] font-bold uppercase tracking-widest">
                  <th className="px-3 pl-5 py-3 rounded-tl-xl">S.No</th>
                  <th className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      Name <HiArrowsUpDown size={14} />
                    </div>
                  </th>
                  {days.map((d, i) => (
                    <th key={i} className="px-2 py-3 text-center">
                      {d.date}
                      <br />
                      <span className="font-normal opacity-70">{d.day}</span>
                    </th>
                  ))}
                  <th className="px-3 py-3 pr-5 text-center rounded-tr-xl">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 dark:bg-layout-dark bg-white">
                {loadingMonthly ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-3 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-6" /></td>
                      <td className="px-3 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-28" /></td>
                      {days.map((_, j) => (
                        <td key={j} className="px-2 py-3">
                          <div className="h-4 w-4 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto" />
                        </td>
                      ))}
                      <td className="px-3 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-12 mx-auto" /></td>
                    </tr>
                  ))
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={days.length + 3} className="py-16 text-center text-gray-400">
                      No attendance data found for {MONTHS[month]} {year}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => {
                    const presentCount = days.filter((d) => {
                      const s = row.attendance?.[d.full]?.status;
                      return s === "Present";
                    }).length;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-3 pl-5 py-3 text-center text-gray-500 text-xs">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{row.name}</p>
                            <p className="text-xs text-gray-400">{row.employeeId}</p>
                          </div>
                        </td>
                        {days.map((day, i) => {
                          const rec = row.attendance?.[day.full];
                          const status = rec?.status;
                          return (
                            <td key={i} className="px-2 py-3 text-center">
                              {status === "Present" ? (
                                <Check className="text-emerald-500 mx-auto" size={14} strokeWidth={3} />
                              ) : status === "Absent" ? (
                                <X className="text-rose-500 mx-auto" size={14} strokeWidth={3} />
                              ) : status === "Half-Day" ? (
                                <span className="text-[9px] font-bold text-amber-500">HD</span>
                              ) : status === "On Leave" ? (
                                <span className="text-[9px] font-bold text-blue-500">L</span>
                              ) : status === "Holiday" ? (
                                <span className="text-[9px] font-bold text-purple-500">H</span>
                              ) : (
                                <span className="text-gray-200 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 pr-5 text-center font-semibold text-gray-700 dark:text-gray-200">
                          {presentCount}/{days.length}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loadingMonthly && totalMonthlyPages > 1 && (
            <div className="mt-3">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalMonthlyPages}
              />
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            {[
              { label: "Present", icon: <Check size={10} strokeWidth={3} className="text-emerald-500" /> },
              { label: "Absent", icon: <X size={10} strokeWidth={3} className="text-rose-500" /> },
              { label: "Half-Day", icon: <span className="text-[9px] font-bold text-amber-500">HD</span> },
              { label: "On Leave", icon: <span className="text-[9px] font-bold text-blue-500">L</span> },
              { label: "Holiday", icon: <span className="text-[9px] font-bold text-purple-500">H</span> },
            ].map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-1.5">
                {icon} {label}
              </div>
            ))}
          </div>
        </>
      )}

      {/* REGULARIZATION VIEW */}
      {activeTab === "regularization" && (
        <div className="flex flex-col flex-1 gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            {["Pending", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setRegStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  regStatusFilter === s
                    ? "bg-darkest-blue text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-layout-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-darkest-blue text-white text-[11px] font-bold uppercase tracking-widest">
                  <th className="px-5 py-3 rounded-tl-xl">Employee</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">In / Out</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loadingReg ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : regRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardEdit size={32} className="text-gray-200" />
                        <p>No {regStatusFilter.toLowerCase()} regularization requests</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  regRequests.map((req) => (
                    <tr
                      key={req._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {req.employeeId?.name?.[0] || "E"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {req.employeeId?.name || "—"}
                            </p>
                            <p className="text-xs text-gray-400">{req.employeeId?.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                        {req.date
                          ? new Date(req.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                          {req.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {req.correctedInTime || "—"} / {req.correctedOutTime || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 max-w-[180px] truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <RegStatusBadge status={req.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status === "Pending" && (
                          <button
                            onClick={() => setActionRegItem(req)}
                            className="opacity-0 group-hover:opacity-100 bg-darkest-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                          >
                            Review
                          </button>
                        )}
                        {req.managerRemarks && req.status !== "Pending" && (
                          <span className="text-xs text-gray-400 italic truncate max-w-[120px] block text-right" title={req.managerRemarks}>
                            {req.managerRemarks}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {filterModal && (
        <Filters onclose={() => setFilterModal(false)} onFilter={handleFilter} />
      )}
      {applyRegModal && (
        <ApplyRegularizationModal
          onclose={() => setApplyRegModal(false)}
          onSuccess={refetchReg}
        />
      )}
      {actionRegItem && (
        <ActionRegularizationModal
          item={actionRegItem}
          onclose={() => setActionRegItem(null)}
          onSuccess={refetchReg}
        />
      )}
    </div>
  );
};

const RegStatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <FiClock size={11} /> },
    Approved: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FiCheckCircle size={11} /> },
    Rejected: { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: <FiXCircle size={11} /> },
  };
  const s = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg}`}>
      {s.icon} {status}
    </span>
  );
};

export default Attendance;
