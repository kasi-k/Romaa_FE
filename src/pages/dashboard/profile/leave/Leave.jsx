import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiCalendar,
  FiDownload,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import SearchableSelect from "../../../../components/SearchableSelect";
import { API } from "../../../../constant";
import ApplyLeaveModal from "./ApplyLeaveModal";
import LeaveActionModal from "./LeaveActionModal"; // Assuming you have this

const Leave = () => {
  const [activeTab, setActiveTab] = useState("my-leaves"); // "my-leaves" | "team-requests"
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // --- Modals ---
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // --- User Context ---
  const user = JSON.parse(localStorage.getItem("crm_user")) || {};
  // Mock Balances (Replace with API fetch if needed)
  const balances = user.leaveBalance || {
    CL: 12,
    SL: 10,
    PL: 15,
    compOffCount: 2,
  };

  // --- 1. Fetch Data ---
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      // Determine endpoint based on tab
      let endpoint =
        activeTab === "my-leaves"
          ? `${API}/leave/my-history?employeeId=${user._id}`
          : `${API}/leave/team-pending?managerId=${user._id}`;

      const res = await axios.get(endpoint, { withCredentials: true });
      if (res.data.success || res.data.data) {
        setLeaves(res.data.data || []);
      }
    } catch (error) {
      console.error("Fetch Error", error);
      toast.error("Unable to load leave records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // Reset filters when tab changes
    setFilterStatus("All");
    setFilterType("All");
    setDateRange({ start: "", end: "" });
    setSearchQuery("");
  }, [activeTab]);

  // --- 2. Filter Logic (Client-Side) ---
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // A. Status Filter
      if (filterStatus !== "All" && leave.status !== filterStatus) return false;

      // B. Type Filter
      if (filterType !== "All" && leave.leaveType !== filterType) return false;

      // C. Date Range Filter (Checks if leave overlaps with range)
      if (dateRange.start && new Date(leave.toDate) < new Date(dateRange.start))
        return false;
      if (dateRange.end && new Date(leave.fromDate) > new Date(dateRange.end))
        return false;

      // D. Search (Reason or Name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const reasonMatch = leave.reason?.toLowerCase().includes(query);
        const nameMatch = leave.employeeId?.name?.toLowerCase().includes(query); // For team view
        if (!reasonMatch && !nameMatch) return false;
      }

      return true;
    });
  }, [leaves, filterStatus, filterType, dateRange, searchQuery]);

  // --- Handlers ---
  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?"))
      return;
    try {
      await axios.post(
        `${API}/leave/cancel`,
        {
          leaveRequestId: leaveId,
          cancelledBy: user._id,
        },
        { withCredentials: true },
      );
      toast.success("Leave cancelled successfully");
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div className="flex flex-col h-full gap-3 font-layout-font p-2 md:p-0">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Leave Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your leaves, check balances, and review team requests.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Only show Apply button on My Leaves */}
          {activeTab === "my-leaves" && (
            <button
              onClick={() => setApplyModalOpen(true)}
              className="flex items-center gap-2 bg-darkest-blue hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
            >
              <FiPlus size={18} /> Apply Leave
            </button>
          )}
        </div>
      </div>

      {/* --- Stats Overview (Only My Leaves) --- */}
      {activeTab === "my-leaves" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatWidget
            title="Casual Leave"
            used={12 - balances.CL}
            total={12}
            color="blue"
            icon={<FiBriefcase />}
          />
          <StatWidget
            title="Sick Leave"
            used={10 - balances.SL}
            total={10}
            color="orange"
            icon={<FiAlertCircle />}
          />
          <StatWidget
            title="Privilege Leave"
            used={15 - balances.PL}
            total={15}
            color="purple"
            icon={<FiUser />}
          />
          <StatWidget
            title="Comp Offs"
            used={balances.compOffCount || 0}
            total="-"
            color="teal"
            icon={<FiClock />}
          />
        </div>
      )}

      {/* --- Main Content Card --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar: Tabs & Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col xl:flex-row gap-4 justify-between bg-white">
          {/* Tabs */}
          <div className="bg-gray-100/80 p-1 rounded-lg inline-flex w-fit self-start">
            <TabButton
              active={activeTab === "my-leaves"}
              onClick={() => setActiveTab("my-leaves")}
            >
              My History
            </TabButton>
            <TabButton
              active={activeTab === "team-requests"}
              onClick={() => setActiveTab("team-requests")}
            >
              Team Requests
            </TabButton>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative group">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none w-40 focus:w-60 transition-all"
              />
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            {/* Status Filter */}
            <SearchableSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              options={["All", "Pending", "Approved", "Rejected", "Cancelled"].map((s) => ({ value: s, label: s === "All" ? "All Status" : s }))}
              placeholder="All Status"
            />

            {/* Type Filter */}
            <SearchableSelect
              value={filterType}
              onChange={(val) => setFilterType(val)}
              options={[
                { value: "All", label: "All Types" },
                { value: "CL", label: "Casual (CL)" },
                { value: "SL", label: "Sick (SL)" },
                { value: "PL", label: "Privilege (PL)" },
                { value: "LWP", label: "LWP" },
                { value: "CompOff", label: "Comp Off" },
                { value: "Permission", label: "Permission" },
              ]}
              placeholder="All Types"
            />

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
              <span className="text-gray-400 text-xs">
                <FiCalendar />
              </span>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="bg-transparent text-xs outline-none text-gray-600 w-24"
              />
              <span className="text-gray-300">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="bg-transparent text-xs outline-none text-gray-600 w-24"
              />
            </div>

            {/* Reset Button */}
            {(filterStatus !== "All" ||
              filterType !== "All" ||
              dateRange.start ||
              searchQuery) && (
              <button
                onClick={() => {
                  setFilterStatus("All");
                  setFilterType("All");
                  setDateRange({ start: "", end: "" });
                  setSearchQuery("");
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-white relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                {activeTab === "team-requests" && (
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <SkeletonRow
                    key={i}
                    cols={activeTab === "team-requests" ? 7 : 6}
                  />
                ))
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <FiFilter size={30} />
                      </div>
                      <h3 className="text-gray-800 font-medium">
                        No leaves found
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Try adjusting your filters or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Type */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <TypeIcon type={leave.leaveType} />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {leave.leaveType === "LWP"
                              ? "LWP"
                              : leave.leaveType}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            {leave.requestType}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-gray-600">
                        <span className="font-medium">
                          {new Date(leave.fromDate).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short" },
                          )}
                        </span>
                        {leave.fromDate !== leave.toDate && (
                          <span className="text-xs text-gray-400">
                            to{" "}
                            {new Date(leave.toDate).toLocaleDateString(
                              "en-GB",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Days Count */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${leave.totalDays > 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {leave.requestType === "Short Leave"
                          ? "0"
                          : leave.totalDays}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4 max-w-[200px]">
                      <p
                        className="text-sm text-gray-600 truncate"
                        title={leave.reason}
                      >
                        {leave.reason}
                      </p>
                    </td>

                    {/* Employee (Team View Only) */}
                    {activeTab === "team-requests" && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-200">
                            {leave.employeeId?.name?.[0] || "U"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">
                              {leave.employeeId?.name || "Unknown"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {leave.employeeId?.department || "Dept"}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <StatusBadge status={leave.status} />

                        {leave.status === "Rejected" &&
                          leave.rejectionReason && (
                            <div
                              className="text-[10px] text-red-600  max-w-[160px] break-words leading-tight italic"
                              title={leave.rejectionReason}
                            >
                              {leave.rejectionReason}
                            </div>
                          )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                        {activeTab === "my-leaves" &&
                          leave.status === "Pending" && (
                            <button
                              onClick={() => handleCancelLeave(leave._id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-md text-xs font-medium transition-colors"
                              title="Cancel Request"
                            >
                              <FiXCircle size={16} />
                            </button>
                          )}
                        {/* For Approved items, maybe showing a download/view details icon later */}
                        {leave.status === "Approved" && (
                          <button
                            className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md"
                            title="Download details"
                          >
                            <FiDownload size={16} />
                          </button>
                        )}

                        {/* Manager Actions */}
                        {activeTab === "team-requests" &&
                          leave.status === "Pending" && (
                            <button
                              onClick={() => {
                                setSelectedRequest(leave);
                                setActionModalOpen(true);
                              }}
                              className="bg-darkest-blue text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm hover:shadow-md transition-all"
                            >
                              Review
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modals --- */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={fetchLeaves}
        user={user}
      />
      {isActionModalOpen && (
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

// --- Sub-Components ---

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
      active
        ? "bg-white text-blue-700 shadow-sm"
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
    }`}
  >
    {children}
  </button>
);

const StatWidget = ({ title, used, total, color, icon }) => {
  // Determine gradient based on color prop
  const colors = {
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-400 to-orange-500",
    purple: "from-purple-500 to-purple-600",
    teal: "from-teal-400 to-teal-500",
  };

  const remaining = total !== "-" ? total - used : used; // Logic varies for numeric vs tracking
  const percentage = total !== "-" ? (remaining / total) * 100 : 100;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
      {/* Background Decoration */}
      <div
        className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-5 rounded-bl-full group-hover:scale-110 transition-transform duration-500`}
      ></div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h2 className="text-2xl font-bold text-gray-800">{remaining}</h2>
          <span className="text-xs text-gray-400 font-medium">
            {total !== "-" ? "Left" : "Taken"}
          </span>
        </div>
        {total !== "-" && (
          <div className="w-full h-1 bg-gray-100 rounded-full mt-3 w-20">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}
      </div>

      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg shadow-${color}-200`}
      >
        {icon}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    Pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: <FiClock size={12} />,
    },
    Approved: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: <FiCheckCircle size={12} />,
    },
    "Manager Approved": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <FiCheckCircle size={12} />,
    },
    Rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <FiXCircle size={12} />,
    },
    Cancelled: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
      icon: <FiAlertCircle size={12} />,
    },
  };

  const style = config[status] || config.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
    >
      {style.icon} {status}
    </span>
  );
};

const TypeIcon = ({ type }) => {
  const chars = {
    CL: "C",
    SL: "S",
    PL: "P",
    LWP: "L",
    CompOff: "CO",
    Permission: "P",
  };
  const colors = {
    CL: "bg-blue-100 text-blue-600",
    SL: "bg-orange-100 text-orange-600",
    PL: "bg-purple-100 text-purple-600",
    LWP: "bg-red-100 text-red-600",
    CompOff: "bg-teal-100 text-teal-600",
    Permission: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${colors[type] || "bg-gray-100"}`}
    >
      {chars[type] || type?.[0]}
    </div>
  );
};

const SkeletonRow = ({ cols }) => (
  <tr className="animate-pulse">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-100 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

export default Leave;
