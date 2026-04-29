import React, { useState } from "react";
import { LuUserRoundSearch } from "react-icons/lu";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddClients from "./AddClients";
import EditClients from "./EditClients";
import ViewClients from "./ViewClients";
import { useClients } from "./hooks/useClients";
import { useDebounce } from "../../../hooks/useDebounce";
import { useTableState } from "../../../hooks/useTableState";

const ClientColumns = [
  { label: "Client ID", key: "client_id" },
  { label: "Name", key: "client_name" },
  {
    label: "Address",
    key: "address",
    render: (item) =>
      item.address
        ? `${item.address.city || ""}, ${item.address.state || ""}`
        : "-",
  },
  { label: "Phone", key: "contact_phone" },
  { label: "Email", key: "contact_email" },
];

const Clients = () => {
  // 1. UI State
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("clients");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Debounce Search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Fetch Data (Cached & Optimized)
  const { data, isLoading, isFetching, refetch } = useClients({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="Tender Management"
      subtitle="Client"
      pagetitle="Clients Management"
      // Data Props
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
      // Modals & Actions
      columns={ClientColumns}
      AddModal={AddClients}
      EditModal={EditClients}
      routepoint={`/tender/customers/viewcustomer`}
      FilterModal={Filters}
      addButtonLabel="Add Client"
      addButtonIcon={<LuUserRoundSearch size={24} />}
      // Refresh Trigger
      onUpdated={refetch}
      onSuccess={refetch}
      idKey="client_id"
    />
  );
};

export default Clients;
