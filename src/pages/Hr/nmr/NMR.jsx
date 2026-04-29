import { useState } from "react";
import { LuNotebookText } from "react-icons/lu";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddNMR from "./AddNMR";
import { useDebounce } from "../../../hooks/useDebounce";
import { useContractWorkers } from "./hooks/useContractWorkers";
import { useTableState } from "../../../hooks/useTableState";

const columns = [
  { label: "NMR ID", key: "worker_id" },
  { label: "Name", key: "employee_name" },
  { label: "Role", key: "role" },
  { label: "Daily Wage", key: "daily_wage" },
  { label: "Contractor", key: "contractor_id" },
  { label: "Status", key: "status" },
];

const NMR = () => {
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("nMR");
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useContractWorkers({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="HR Management"
      subtitle="NMR"
      pagetitle="NMR"
      columns={columns}
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 0}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={AddNMR}
      editroutepoint={"editnmr"}
      routepoint={"viewnmr"}
      FilterModal={Filters}
      addButtonLabel="Add NMR"
      addButtonIcon={<LuNotebookText size={23} />}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onUpdated={refetch}
      onSuccess={refetch}
    />
  );
};

export default NMR;
