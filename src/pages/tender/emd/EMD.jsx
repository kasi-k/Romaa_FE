import React, { useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import EditEMDModal from "./EditEMDModal";
import { useDebounce } from "../../../hooks/useDebounce";
import { useEMD } from "../tenders/hooks/useTenders";
import { useTableState } from "../../../hooks/useTableState";


// ✅ Static Columns Definition
const Columns = [
  { label: "Tender ID", key: "tender_id" },
  { label: "Project Name", key: "tender_name", className: "text-left" },
  {
    label: "Company",
    key: "emd.approved_emd_details.emd_proposed_company",
    render: (item) => item.emd?.approved_emd_details?.emd_proposed_company ?? "-",
  },
  {
    label: "EMD Amount",
    key: "emd.approved_emd_details.emd_approved_amount",
    render: (item) => item.emd?.approved_emd_details?.emd_approved_amount ?? "-",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value || 0),
  },
  {
    label: "Expiry Date",
    key: "emd.emd_validity",
    render: (item) =>
      item.emd?.emd_validity
        ? new Date(item.emd.emd_validity).toLocaleDateString("en-GB")
        : "-",
  },
  {
    label: "Amount Collected",
    key: "emd.approved_emd_details.emd_deposit_amount_collected",
    render: (item) => item.emd?.approved_emd_details?.emd_deposit_amount_collected ?? "-",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value || 0),
  },
  // 🔄 UPDATED: Calculate Balance Dynamically
  {
    label: "Balance",
    key: "calculated_balance", 
    render: (item) => {
      // 1. Extract both values, defaulting to 0 if missing
      const totalAmount = Number(item.emd?.approved_emd_details?.emd_approved_amount) || 0;
      const collectedAmount = Number(item.emd?.approved_emd_details?.emd_deposit_amount_collected) || 0;
      
      // 2. Return the real-time math
      return totalAmount - collectedAmount;
    },
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value || 0),
  },
];

const EMD = () => {
  // 1. Local State
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("eMD");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Debounce Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Data Fetching Hook
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useEMD({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="Tender Management"
      subtitle="EMD"
      pagetitle="EMD (Earnest Money Deposit)"
      
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
      columns={Columns}
      FilterModal={Filters}
      EditModal={EditEMDModal}
      
      // Events
      onUpdated={refetch}
      idKey="tender_id"
      routepoint={"viewemd"}
    />
  );
};

export default EMD;