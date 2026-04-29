import { useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { useDebounce } from "../../../hooks/useDebounce";
import { useProjects } from "../../projects/hooks/useProjects";
import { useTableState } from "../../../hooks/useTableState";

const Columns = [
  { label: "Work order ID", key: "workOrder_id" },
  {
    label: "Date",
    key: "workOrder_issued_date",
    render: (item) => item.workOrder_issued_date ? new Date(item.workOrder_issued_date).toLocaleDateString() : "-",
  },
  { label: "Client Name", key: "client_name" },
  { label: "Project Name", key: "tender_name" },
  {
    label: "Location",
    key: "tender_location",
    render: (item) =>
      `${item.tender_location?.city || ""}, ${item.tender_location?.state || ""}, ${
        item.tender_location?.country || ""
      } - ${item.tender_location?.pincode || ""}`,
  },
  { label: "Amount", key: "tender_value" },
];

const WorkOrder = () => {
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("workOrder");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useProjects({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="Tender Management"
      subtitle="Work Order"
      pagetitle="Work Order"
      loading={isLoading}
      isRefreshing={isFetching}
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 0}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      columns={Columns}
      routepoint={"viewworkorder"}
      FilterModal={Filters}
      idKey="tender_id"
      id2Key="workOrder_id"
      onUpdated={refetch}
      onSuccess={refetch}
    />
  );
};

export default WorkOrder;
