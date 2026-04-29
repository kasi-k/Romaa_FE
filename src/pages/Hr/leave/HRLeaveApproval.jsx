import React, { useState } from "react";
import { FiSearch, FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiFilter } from "react-icons/fi";
import SearchableSelect from "../../../components/SearchableSelect";
import { useAllPendingLeaves, useLeaveAction } from "./hooks/useLeave";
import { IoClose } from "react-icons/io5";
import Pagination from "../../../components/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <FiClock size={11} /> },
    "Manager Approved": { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: <FiCheckCircle size={11} /> },
    "HR Approved": { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FiCheckCircle size={11} /> },
    Rejected: { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: <FiXCircle size={11} /> },
    Cancelled: { bg: "bg-gray-50 text-gray-600 border-gray-200", icon: <FiAlertCircle size={11} /> },
  };
  const s = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg}`}>
      {s.icon} {status}
    </span>
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
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${colors[type] || "bg-gray-100 text-gray-600"}`}>
      {chars[type] || type?.[0]}
    </div>
  );
};

const ActionModal = ({ request, onClose, onSuccess }) => {
  const [remarks, setRemarks] = useState("");
  const user = JSON.parse(localStorage.getItem("crm_user")) || {};
  const mutation = useLeaveAction({ onSuccess, onclose: onClose });

  const handleAction = (action) => {
    if (!remarks.trim()) {
      import("react-toastify").then(({ toast }) => toast.warning("Please enter remarks first."));
      return;
    }
    mutation.mutate({
      leaveRequestId: request._id,
      action,
      role: "HR",
      remarks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-800 dark:text-white">HR Review — Leave Request</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
            <IoClose size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Employee Summary */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
              {request.employeeId?.name?.[0] || "E"}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{request.employeeId?.name || "Unknown"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {request.leaveType} · {request.totalDays} Day(s) · {request.requestType}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "From", value: request.fromDate ? new Date(request.fromDate).toLocaleDateString("en-GB") : "—" },
              { label: "To", value: request.toDate ? new Date(request.toDate).toLocaleDateString("en-GB") : "—" },
              { label: "Manager Status", value: request.status },
              { label: "Applied On", value: request.createdAt ? new Date(request.createdAt).toLocaleDateString("en-GB") : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
                <p className="text-gray-700 dark:text-gray-200 font-medium text-xs">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reason</p>
            <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{request.reason}"</p>
          </div>

          {/* HR Remarks */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">
              HR Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Enter HR remarks..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction("Reject")}
              disabled={mutation.isPending}
              className="py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction("Approve")}
              disabled={mutation.isPending}
              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              HR Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HRLeaveApproval = () => {
  const [statusFilter, setStatusFilter] = useState("Manager Approved");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const [actionItem, setActionItem] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching, refetch } = useAllPendingLeaves({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
    status: statusFilter === "All" ? undefined : statusFilter,
  });

  const allLeaves = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const filtered = typeFilter === "All"
    ? allLeaves
    : allLeaves.filter((l) => l.leaveType === typeFilter);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          {["All", "Pending", "Manager Approved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s
                  ? "bg-darkest-blue text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
          <button onClick={refetch} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh">
            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
          <input
            type="date"
            value={filterParams.fromdate}
            onChange={(e) => { setFilterParams((p) => ({ ...p, fromdate: e.target.value })); setCurrentPage(1); }}
            className="py-2 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={filterParams.todate}
            onChange={(e) => { setFilterParams((p) => ({ ...p, todate: e.target.value })); setCurrentPage(1); }}
            className="py-2 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <SearchableSelect
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            options={[
              { value: "All", label: "All Types" },
              { value: "CL", label: "CL" }, { value: "SL", label: "SL" },
              { value: "PL", label: "PL" }, { value: "LWP", label: "LWP" },
              { value: "CompOff", label: "CompOff" }, { value: "Permission", label: "Permission" },
            ]}
            placeholder="All Types"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-layout-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-darkest-blue text-white text-[11px] font-bold uppercase tracking-widest">
              <th className="px-5 py-3 rounded-tl-xl">Employee</th>
              <th className="px-5 py-3">Leave Type</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Days</th>
              <th className="px-5 py-3">Reason</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <FiFilter size={32} className="text-gray-200" />
                    <p>No leave requests found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {leave.employeeId?.name?.[0] || "E"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{leave.employeeId?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{leave.employeeId?.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <TypeIcon type={leave.leaveType} />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{leave.leaveType}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{leave.requestType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                    <p>{new Date(leave.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
                    {leave.fromDate !== leave.toDate && (
                      <p className="text-xs text-gray-400">to {new Date(leave.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">{leave.totalDays}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 max-w-[180px] truncate" title={leave.reason}>{leave.reason}</td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge status={leave.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {(leave.status === "Pending" || leave.status === "Manager Approved") && (
                      <button
                        onClick={() => setActionItem(leave)}
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}

      {actionItem && (
        <ActionModal
          request={actionItem}
          onClose={() => setActionItem(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default HRLeaveApproval;
