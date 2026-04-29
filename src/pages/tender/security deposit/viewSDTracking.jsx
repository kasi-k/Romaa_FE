import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../../../components/Table";
import { useSecurityDepositTracking } from "../tenders/hooks/useTenders";

// --- 1. ERP Standard Table Skeleton ---
const TableSkeleton = () => (
  <div className="w-full mt-8 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="bg-gray-50 border-b border-gray-100 p-4 flex gap-6">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
    </div>
    {[1, 2, 3, 4, 5].map((row) => (
      <div key={row} className="p-4 border-b border-gray-50 flex gap-6 items-center">
        <div className="h-3 bg-gray-100 rounded w-1/4"></div>
        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
      </div>
    ))}
  </div>
);

// --- 2. Interactive Animated Empty State ---
const EmptyState = ({ title, message, onAction }) => (
  <div className="flex flex-col items-center justify-center p-16 mt-8 bg-white border border-gray-100 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
    <div className="relative flex items-center justify-center w-28 h-28 mb-6 rounded-full bg-blue-50">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
      <div className="relative text-blue-500 animate-[bounce_3s_infinite]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="max-w-md mt-2 mb-8 text-center text-gray-500 leading-relaxed">{message}</p>
    <button
      onClick={onAction}
      className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg overflow-hidden transition-all hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300"
    >
      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
      <span className="relative flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Security Deposit
      </span>
    </button>
  </div>
);

// --- 3. Error State UI ---
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-16 mt-8 bg-red-50 border border-red-100 rounded-xl">
    <div className="w-16 h-16 mb-4 text-red-500 transition-transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-800">Connection Interrupted</h3>
    <p className="mt-2 text-center text-red-600">{message}</p>
    <button
      onClick={onRetry}
      className="mt-6 px-5 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg transition-colors hover:bg-red-50"
    >
      Try Again
    </button>
  </div>
);

// --- 4. Columns ---
const trackingColumns = [
  { label: "Note", key: "security_deposit_note" },
  {
    label: "Amount Collected",
    key: "amount_collected",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value || 0),
  },
  {
    label: "Pending Amount",
    key: "amount_pending",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value || 0),
  },
  {
    label: "Collected Date",
    key: "amount_collected_date",
    render: (item) =>
      item.amount_collected_date
        ? new Date(item.amount_collected_date).toLocaleDateString("en-GB")
        : "-",
  },
  { label: "Collected Time", key: "amount_collected_time" },
];

// --- 5. Main View Component ---
const SecurityDepositTrackingTable = () => {
  const { tender_id } = useParams();
  const navigate = useNavigate();

  const { data: tracking = [], isLoading, isError, refetch } = useSecurityDepositTracking(tender_id);

  // Layout: Loading (Skeleton)
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Layout: Error
  if (isError) {
    return (
      <ErrorState
        message="We couldn't retrieve the history for this tender. Please check your connection."
        onRetry={refetch}
      />
    );
  }

  // Layout: Empty State
  if (tracking.length === 0) {
    return (
      <EmptyState
        title="No Tracking History"
        message={`We couldn't find any Security Deposit collection records for Tender ID: ${tender_id}.`}
        onAction={() => navigate(-1)}
      />
    );
  }

  // Layout: Data Table
  return (
    <Table
      title="Security Deposit Tracking"
      subtitle={`Tender: ${tender_id}`}
      pagetitle="Security Deposit Collection History"
      endpoint={tracking}
      columns={trackingColumns}
      addButtonLabel={null}
      search={""}
    />
  );
};

export default SecurityDepositTrackingTable;
