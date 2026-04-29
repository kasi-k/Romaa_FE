import React, { useState } from "react";
import Filters from "../../components/Filters";
import ProgressBar from "../../components/ProgressBar";
import Table from "../../components/Table";
import { toast } from "react-toastify";
import { useProject } from "../../context/ProjectContext";
import { useProjects } from "./hooks/useProjects";
import { useDebounce } from "../../hooks/useDebounce";
import { useTableState } from "../../hooks/useTableState";

const Columns = [
  { label: "Project ID", key: "workOrder_id" },
  { label: "Name", key: "tender_project_name" },
  {
    label: "Location",
    key: "tender_location",
    render: (item) => `${item.tender_location?.city || ""}`,
  },
  {
    label: "Status",
    key: "status",
    render: (item) => <ProgressBar percentage={item.status} />,
  },
  { label: "Budget", key: "tender_value" },
];

const Project = () => {
  const { setTenderId } = useProject();
 

  // 1. Local State for Controls
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("project");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Debounce Search (Prevents spamming the API on every keystroke)
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Fetch Data (Cached & Optimized via TanStack Query)
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useProjects({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  // Row Click Handler
  const handleRowClick = (project) => {
    setTenderId(project.tender_id);
    toast.success(`Selected Project: ${project.tender_project_name}`);
  };

  return (
    <Table
      title="Projects Management"
      subtitle="Project"
      pagetitle="Project Table"

      // Data Props mapping from React Query
      loading={isLoading}
      isRefreshing={isFetching}
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 0}

      // State Controls
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}

      // Modals, Columns & Actions
      columns={Columns}
      FilterModal={Filters}
      onRowClick={handleRowClick}
      routepoint={"zerocost"}
      
      // Refresh Triggers (if you add mutations later)
      onUpdated={refetch}
      onSuccess={refetch}
    />
  );
};

export default Project;