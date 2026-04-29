import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import SearchableSelect from "../../../components/SearchableSelect";
import { API } from "../../../constant";
import LeaveActionModal from "../../dashboard/profile/leave/LeaveActionModal";

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const user = JSON.parse(localStorage.getItem("crm_user")) || {};

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const endpoint =
        filterStatus === "All"
          ? `${API}/leave/all-pending`
          : `${API}/leave/all-pending?status=${filterStatus}`;
      const res = await axios.get(endpoint, { withCredentials: true });
      if (res.data.success || res.data.data) {
        setLeaves(res.data.data || []);
      }
    } catch (error) {
      toast.error("Unable to load leave records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [filterStatus]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (filterType !== "All" && leave.leaveType !== filterType) return false;
      if (dateRange.start && new Date(leave.toDate) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(leave.fromDate) > new Date(dateRange.end)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nm = leave.employeeId?.name?.toLowerCase().includes(q);
        const rs = leave.reason?.toLowerCase().includes(q);
        if (!nm && !rs) return false;
      }
      return true;
    });
  }, [leaves, filterType, dateRange, searchQuery]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
      ))}
    </tr>
  );

  return (
    <div className="flex flex-col h-full gap-3 font-layout-font">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg">
          {["All", "Pending", "Manager Approved", "HR Approved", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterStatus === s
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={fetchLeaves}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none w-48"
            />
          </div>
          <SearchableSelect
            value={filterType}
            onChange={(v) => setFilterType(v)}
            options={[
              { value: "All", label: "All Types" },
              { value: "CL", label: "CL" }, { value: "SL", label: "SL" },
              { value: "PL", label: "PL" }, { value: "LWP", label: "LWP" },
              { value: "CompOff", label: "Comp Off" }, { value: "Permission", label: "Permission" },
            ]}
            placeholder="All Types"
          />
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
            <FiCalendar className="text-gray-400 text-xs" />
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="bg-transparent text-xs outline-none text-gray-600 w-24" />
            <span className="text-gray-300">-</span>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="bg-transparent text-xs outline-none text-gray-600 w-24" />
          </div>
          {(filterType !== "All" || dateRange.start || searchQuery) && (
            <button onClick={() => { setFilterType("All"); setDateRange({ start: "", end: "" }); setSearchQuery(""); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Reset</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr>
              {["Employee", "Leave Type", "Duration", "Days", "Reason", "Status", "Action"].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider last:text-right">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FiFilter size={28} className="text-gray-300" />
                    <p className="text-gray-400 text-sm">No leave records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {leave.employeeId?.name?.[0] || "E"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{leave.employeeId?.name || "—"}</p>
                        <p className="text-[10px] text-gray-400">{leave.employeeId?.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TypeIcon type={leave.leaveType} />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{leave.leaveType}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{leave.requestType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{new Date(leave.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
                    {leave.fromDate !== leave.toDate && (
                      <p className="text-xs text-gray-400">
                        to {new Date(leave.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{leave.totalDays}</span>
                  </td>
                  <td className="px-6 py-4 max-w-[180px] text-sm text-gray-600 truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={leave.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(leave.status === "Pending" || leave.status === "Manager Approved") && (
                      <button
                        onClick={() => { setSelectedRequest(leave); setActionModalOpen(true); }}
                        className="opacity-0 group-hover:opacity-100 bg-darkest-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isActionModalOpen && selectedRequest && (
        <LeaveActionModal
          isOpen={isActionModalOpen}
          onClose={() => setActionModalOpen(false)}
          onSuccess={fetchLeaves}
          request={selectedRequest}
          user={user}
        />
      )}
    </div>
  );
};

const TypeIcon = ({ type }) => {
  const colors = {
    CL: "bg-blue-100 text-blue-600", SL: "bg-orange-100 text-orange-600",
    PL: "bg-purple-100 text-purple-600", LWP: "bg-red-100 text-red-600",
    CompOff: "bg-teal-100 text-teal-600", Permission: "bg-indigo-100 text-indigo-600",
  };
  const chars = { CL: "C", SL: "S", PL: "P", LWP: "L", CompOff: "CO", Permission: "P" };
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${colors[type] || "bg-gray-100"}`}>
      {chars[type] || type?.[0]}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <FiClock size={11} /> },
    "Manager Approved": { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: <FiCheckCircle size={11} /> },
    "HR Approved": { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FiCheckCircle size={11} /> },
    Rejected: { bg: "bg-red-50 text-red-700 border-red-200", icon: <FiXCircle size={11} /> },
    Cancelled: { bg: "bg-gray-50 text-gray-600 border-gray-200", icon: <FiAlertCircle size={11} /> },
  };
  const s = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg}`}>
      {s.icon} {status}
    </span>
  );
};

export default Leave;
