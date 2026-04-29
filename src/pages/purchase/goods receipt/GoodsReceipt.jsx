import { useState } from "react";
import Table from "../../../components/Table";
import Filters from "../../../components/Filters";
import { useDebounce } from "../../../hooks/useDebounce";
import { useGRNProjects } from "./hooks/useGoodsReceipt";

const Columns = [
  { label: "Project ID", key: "tender_id" },
  { label: "Project Name", key: "project_name" },
  { label: "Tender Name", key: "tender_name" },
  { label: "Total GRN Entries", key: "total_grn_entries" },
  {
    label: "Last GRN Date",
    key: "last_grn_date",
    formatter: (v) => (v ? new Date(v).toLocaleDateString("en-GB") : "—"),
  },
];

const GoodsReceipt = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useGRNProjects({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  const rows = Array.isArray(data) ? data : (data?.data || []);

  return (
    <Table
      title="Purchase Management"
      subtitle="Goods Receipt"
      pagetitle="Goods Receipt Note (GRN)"
      endpoint={rows}
      totalPages={data?.totalPages || 0}
      columns={Columns}
      loading={isLoading}
      isRefreshing={isFetching}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      FilterModal={Filters}
      ViewModal={true}
      routepoint="viewgoodreceipt"
      onSuccess={refetch}
      onUpdated={refetch}
    />
  );
};

export default GoodsReceipt;
