import React, { useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { useDebounce } from "../../../hooks/useDebounce";
import { useProjectPenalty } from "../tenders/hooks/useTenders";
import { useTableState } from "../../../hooks/useTableState";

// ✅ Static Columns Definition
const ProjectPenaltyColumns = [
  { label: "Tender ID", key: "tender_id" },
  { label: "Project Name", key: "tender_name" },
  // { label: "Deposit", key: "deposit", render: (row) => `₹${row.deposit.toLocaleString("en-IN")}` },
 
  // { label: "Expiry Date", key: "teb" },
  // { label: "Amount Collected", key: "amntcollected", render: (row) => `₹${row.amntcollected.toLocaleString("en-IN")}` },
  // { label: "Balance", key: "balance", render: (row) => `₹${row.balance.toLocaleString("en-IN")}` },
  // { label: "Note", key: "Note" },
  { label: "Work order ID", key: "workOrder_id" },
  {
    label: "Tender Start Date",
    key: "tender_start_date",
    render: (item) =>
      item.tender_start_date
        ? new Date(item.tender_start_date).toLocaleDateString()
        : "-",
  },
  {
    label: "Tender End Date",
    key: "tender_end_date",
    render: (item) =>
      item.tender_end_date
        ? new Date(item.tender_end_date).toLocaleDateString()
        : "-",
  },
  {
    label: "Amount",
    key: "tender_value",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "Project Penalty",
    key: "penalty_final_value",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
];

const ProjectPenalty = () => {
  // 1. Local State
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("projectPenalty");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Debounce Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Data Fetching Hook
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useProjectPenalty({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="Tender Management"
      subtitle="Project Penalty"
      pagetitle="Project Penalty"
      
      // Data
      loading={isLoading}
      isRefreshing={isFetching}
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 0}
      
      // Controls
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      
      // Actions
      columns={ProjectPenaltyColumns}
      FilterModal={Filters}
      
      // Events
      onUpdated={refetch}
      idKey="tender_id"
      routepoint={"viewpenalty"}
    />
  );
};

export default ProjectPenalty;