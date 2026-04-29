import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LuLandPlot } from "react-icons/lu";
import Filters from "../../components/Filters";
import Table from "../../components/Table";
import AddSite from "./AddSite";
import { useProject } from "../../context/ProjectContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useProjects } from "../projects/hooks/useProjects";
import { useTableState } from "../../hooks/useTableState";
const Columns = [
  { label: "Project ID", key: "workOrder_id" },
  { label: "Site Name", key: "tender_project_name" },
  { label: "Category", key: "tender_type" },
  {
    label: "Date",
    key: "tender_start_date",
    render: (item) => item.tender_start_date ? new Date(item.tender_start_date).toLocaleDateString() : "-",
  },
  { label: "Assigned To", key: "tender_contact_person" },
  { label: "Status", key: "tender_status" },
];

const Site = () => {
  const { setTenderId } = useProject();
  const navigate = useNavigate();

  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("site");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useProjects({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  const handleRowClick = (site) => {
    setTenderId(site.tender_id);
    toast.success(`Selected Project: ${site.tender_project_name}`);
    navigate("boqsite");
  };

  return (
    <Table
      title="Site Management"
      subtitle="Site"
      pagetitle="Site Management"
      columns={Columns}
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
      AddModal={AddSite}
      onRowClick={handleRowClick}
      EditModal={true}
      routepoint={"boqsite"}
      FilterModal={Filters}
      addButtonLabel="New site Problem"
      addButtonIcon={<LuLandPlot size={24} />}
      onSuccess={refetch}
      onUpdated={refetch}
    />
  );
};

export default Site;
