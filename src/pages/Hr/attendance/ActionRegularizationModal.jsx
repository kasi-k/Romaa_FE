import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { CheckCircle, XCircle, ClipboardEdit } from "lucide-react";
import { FiUser } from "react-icons/fi";
import { useActionRegularization } from "./hooks/useAttendance";

const ActionRegularizationModal = ({ item, onclose, onSuccess }) => {
  const [remarks, setRemarks] = useState("");
  const mutation = useActionRegularization({ onSuccess, onclose });

  const handleAction = (action) => {
    if (!remarks.trim()) {
      import("react-toastify").then(({ toast }) =>
        toast.warning("Please enter remarks before taking action.")
      );
      return;
    }
    mutation.mutate({
      employeeId: item.employeeId?._id || item.employeeId,
      date: item.date?.split("T")[0],
      action,
      managerRemarks: remarks,
    });
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <ClipboardEdit size={18} className="text-gray-600 dark:text-gray-300" />
            <h3 className="font-bold text-gray-800 dark:text-white">Review Regularization</h3>
          </div>
          <button
            onClick={onclose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-all"
          >
            <IoClose size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Employee Summary */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
              {item.employeeId?.name?.[0] || <FiUser />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                {item.employeeId?.name || "Employee"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.employeeId?.employeeId} · {item.employeeId?.designation}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Date", value: item.date ? new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
              { label: "Category", value: item.category },
              { label: "In Time", value: item.correctedInTime || "—" },
              { label: "Out Time", value: item.correctedOutTime || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-gray-700 dark:text-gray-200 font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Reason */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Employee Reason</p>
            <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{item.reason}"</p>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">
              Manager Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Enter your remarks..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleAction("Rejected")}
              disabled={mutation.isPending}
              className="py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle size={16} /> Reject
            </button>
            <button
              onClick={() => handleAction("Approved")}
              disabled={mutation.isPending}
              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <CheckCircle size={16} />
              )}
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionRegularizationModal;
