import React, { useState } from "react";
import { FiCalendar, FiList, FiCheckSquare } from "react-icons/fi";
import Leave from "./Leave";
import Calendar from "./Calendar";
import HRLeaveApproval from "./HRLeaveApproval";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("leave");

  return (
    <div className="w-full h-full flex flex-col font-layout-font">

      {/* Page Header */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Leave Management</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage employee leave requests, HR approvals, and holiday schedules.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mt-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <TabButton
            isActive={activeTab === "leave"}
            onClick={() => setActiveTab("leave")}
            icon={<FiList />}
            label="All Leave Requests"
          />
          <TabButton
            isActive={activeTab === "hr-approval"}
            onClick={() => setActiveTab("hr-approval")}
            icon={<FiCheckSquare />}
            label="HR Approvals"
          />
          <TabButton
            isActive={activeTab === "calendar"}
            onClick={() => setActiveTab("calendar")}
            icon={<FiCalendar />}
            label="Holiday Calendar"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="h-full animate-fade-in-up">
          {activeTab === "leave" && <Leave />}
          {activeTab === "hr-approval" && <HRLeaveApproval />}
          {activeTab === "calendar" && <Calendar />}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, icon, label, disabled = false }) => (
  <button
    onClick={disabled ? null : onClick}
    disabled={disabled}
    className={`
      group flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-all duration-200 ease-in-out
      ${disabled ? "opacity-50 cursor-not-allowed text-gray-400 border-transparent" : "cursor-pointer"}
      ${isActive
        ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300"
      }
    `}
  >
    <span className={`text-lg ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600"}`}>
      {icon}
    </span>
    {label}
  </button>
);

export default LeaveManagement;
