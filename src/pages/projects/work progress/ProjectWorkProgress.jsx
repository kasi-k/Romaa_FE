import Table from "../../../components/Table";
import Filters from "../../../components/Filters";
import { useProject } from "../../../context/ProjectContext";
import { useWorkDoneList } from "../../site/WorkDone/hooks/useWorkDone";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

const columns = [
  { label: "Work ID", key: "workId" },
  {
    label: "Report Date",
    key: "report_date",
    formatter: (v) => (v ? new Date(v).toLocaleDateString("en-GB") : "—"),
  },
  { label: "Total Work Done", key: "totalWorkDone" },
  { label: "Created By", key: "created_by" },
  {
    label: "Status",
    key: "status",
    render: (row) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}>
        {row.status || "—"}
      </span>
    ),
  },
];

const ProjectWorkProgress = () => {
  const { tenderId } = useProject();
  const { data, isLoading, isFetching, refetch } = useWorkDoneList(tenderId);

  return (
    <Table
      title="Project Management"
      subtitle="Work Progress"
      pagetitle="Daily Progress Report"
      columns={columns}
      endpoint={data?.data || []}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={false}
      EditModal={false}
      routepoint="viewprojectworkprogress"
      FilterModal={Filters}
      onSuccess={refetch}
    />
  );
};

export default ProjectWorkProgress;
