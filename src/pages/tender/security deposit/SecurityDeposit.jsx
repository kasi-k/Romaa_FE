import React, { useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import EditSecurityDeposit from "./EditSecurityDeposit";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSecurityDeposit } from "../tenders/hooks/useTenders";
import { useTableState } from "../../../hooks/useTableState";


// ✅ Static Columns Definition
const Columns = [
  { label: "Tender ID", key: "tender_id" },
  { label: "Project Name", key: "tender_name" },
  {
    label: "Security Deposit",
    key: "emd.approved_emd_details.security_deposit_amount",
    render: (item) =>
      item.emd?.approved_emd_details?.security_deposit_amount ?? "-",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "Expiry Date",
    key: "emd.approved_emd_details.security_deposit_validity",
    render: (item) =>
      item.emd?.approved_emd_details?.security_deposit_validity
        ? new Date(
            item.emd.approved_emd_details.security_deposit_validity
          ).toLocaleDateString("en-GB")
        : "-",
  },
  {
    label: "Amount Collected",
    key: "emd.approved_emd_details.security_deposit_amount_collected",
    render: (item) =>
      item.emd?.approved_emd_details?.security_deposit_amount_collected ?? "-",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
  // ✅ Dynamically computed balance (mirrors EMD pattern)
  {
    label: "Balance",
    key: "calculated_balance",
    render: (item) => {
      const total = Number(item.emd?.approved_emd_details?.security_deposit_amount) || 0;
      const collected = Number(item.emd?.approved_emd_details?.security_deposit_amount_collected) || 0;
      return total - collected;
    },
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value || 0),
  },
];

const SecurityDeposit = () => {
  // 1. Local State
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("securityDeposit");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Debounce Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Data Fetching Hook
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useSecurityDeposit({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="Tender Management"
      subtitle="Security Deposit"
      pagetitle="Security Deposit"
      
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
      EditModal={EditSecurityDeposit}
      
      // Events
      onUpdated={refetch}
      idKey="tender_id"
      routepoint={"viewsecuritydeposit"}
    />
  );
};

export default SecurityDeposit;