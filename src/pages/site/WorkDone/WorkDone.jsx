import { useState } from "react";
import { TbPlus } from "react-icons/tb";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddWorkDone from "./AddWorkDone";
import { useProject } from "../../../context/ProjectContext";
import { useWorkDoneList } from "./hooks/useWorkDone";
import { useDebounce } from "../../../hooks/useDebounce";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

const columns = [
  { label: "Report ID", key: "workId" },
  {
    label: "Report Date",
    key: "report_date",
    formatter: (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "—"),
  },
  { label: "Total Qty", key: "totalWorkDone" },
  { label: "Created By", key: "created_by" },
  {
    label: "Status",
    key: "status",
    render: (row) => (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}
      >
        {row.status || "—"}
      </span>
    ),
  },
];

const WorkDone = () => {
  const { tenderId } = useProject();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterParams, setFilterParams] = useState({ search: "", fromdate: "", todate: "" });
  const debouncedSearch = useDebounce(filterParams.search, 500);

  const queryParams = {
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  };

  const { data: rawData, isLoading, isFetching, refetch } = useWorkDoneList(tenderId, queryParams);
  const records = rawData?.data || [];
  const totalPages = rawData?.totalPages || 1;

  return (
    <Table
      title="Site Management"
      subtitle="Work Done"
      pagetitle="Daily Progress Report"
      columns={columns}
      endpoint={records}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={AddWorkDone}
      EditModal={false}
      routepoint="viewworkdone"
      FilterModal={Filters}
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel="Add Work Done"
      onSuccess={refetch}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
    />
  );
};

export default WorkDone;
