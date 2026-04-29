import React, { useState } from "react";
import { HiOutlineClipboardList } from "react-icons/hi";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddTender from "./AddTender";
import EditTender from "./EditTender";
import { useDebounce } from "../../../hooks/useDebounce";
import { useTenders } from "./hooks/useTenders";
import { useTableState } from "../../../hooks/useTableState";

// ✅ Columns Definition (Static)
const TenderColumns = [
  { label: "Tender ID", key: "tender_id" },
  { label: "Name", key: "tender_name", className: "text-left" },

  {
    label: "Location",
    key: "tender_location",
    className: "text-left",
    render: (item) =>
      item.tender_location
        ? `${item.tender_location.city || ""}, ${item.tender_location.state || ""}`
        : "-",
  },
  {
    label: "Submission Date",
    key: "tender_start_date",
    render: (item) =>
      item.tender_start_date
        ? new Date(item.tender_start_date)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-")
        : "-",
  },
  {
    label: "Budget",
    key: "tender_value",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value),
  },
  {
    label: "Status",
    key: "tender_status",
    // render: (item) => {
    //   let colorClass = "text-gray-700"; // default
    //   if (item.tender_status === "APPROVED") colorClass = "text-green-600";
    //   else if (item.tender_status === "REJECTED") colorClass = "text-red-600";
    //   else if (item.tender_status === "PENDING") colorClass = "text-blue-600 " ;

    //   return (
    //     <span className={colorClass}>
    //       {item.tender_status?.charAt(0).toUpperCase() + item.tender_status?.slice(1).toLowerCase() || "-"}
    //     </span>
    //   );
    // }
  }
];

const Tender = () => {
  // 1. UI State
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("tender");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Debounce Search (Wait 500ms after typing)
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Data Fetching Hook (Automatic Caching & Refetching)
  const { data, isLoading, isFetching, refetch } = useTenders({
    page: currentPage,
    limit: 10,
    search: debouncedSearch, // Pass the delayed search term
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="Tender Management"
      subtitle="Tender"
      pagetitle="Tenders Management"
      // State & Data
      loading={isLoading} // Initial load
      isRefreshing={isFetching} // Background update
      endpoint={data?.data || []} // The Array
      totalPages={data?.totalPages || 0}
      // Controls
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      // Search (Update local state instantly, hook handles debounce)
      search={searchTerm}
      setSearch={setSearchTerm}
      // Filters
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      FilterModal={Filters}
      // Actions
      columns={TenderColumns}
      AddModal={AddTender}
      EditModal={EditTender}
      routepoint={"viewtender"}
      addButtonLabel="Add Tender"
      addButtonIcon={<HiOutlineClipboardList size={24} />}
      idKey="tender_id"
      // Refetch on actions
      onUpdated={refetch}
      onSuccess={refetch}
    />
  );
};

export default Tender;
