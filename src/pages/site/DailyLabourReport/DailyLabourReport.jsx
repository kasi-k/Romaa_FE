import { useState } from "react";
import { TbPlus } from "react-icons/tb";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddDailyLabourSite from "./AddDailyLabourSite";
import { useDebounce } from "../../../hooks/useDebounce";
import { useDLPSummary } from "./hooks/useDailyLabourReport";
import { useProject } from "../../../context/ProjectContext";

const columns = [
  {
    label: "Report Date",
    key: "report_date",
    formatter: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—",
  },
  { label: "Project Name",   key: "project_name" },
  { label: "Total Reports",  key: "total_reports" },
  {
    label: "Man Days",
    key: "total_man_days",
    formatter: (v) => v != null ? Number(v).toFixed(1) : "—",
  },
  {
    label: "Total Amount",
    key: "total_amount",
    formatter: (v) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—",
  },
];

const DailyLabourReport = () => {
  const { tenderId } = useProject();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useDLPSummary(tenderId, {
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  const rows = Array.isArray(data) ? data : (data?.data || []);

  return (
    <Table
      title="Site Management"
      subtitle="Daily Labour Report"
      pagetitle="Daily Labour Report"
      columns={columns}
      endpoint={rows}
      totalPages={data?.totalPages || 0}
      loading={isLoading}
      isRefreshing={isFetching}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      AddModal={AddDailyLabourSite}
      EditModal={false}
      routepoint="viewdailylabourReport"
      FilterModal={Filters}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Daily Labour"
      onSuccess={refetch}
    />
  );
};

export default DailyLabourReport;
