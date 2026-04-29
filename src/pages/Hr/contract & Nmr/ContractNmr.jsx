import { useState } from "react";
import { AiOutlineFileAdd } from "react-icons/ai";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddContractor from "./AddContractor";
import { useDebounce } from "../../../hooks/useDebounce";
import { useContractors } from "./hooks/useContractors";
import { useTableState } from "../../../hooks/useTableState";

const ContractColumns = [
  { label: "Contractor ID", key: "contractor_id" },
  { label: "Contractor Name", key: "contractor_name" },
  {
    label: "Contract Start",
    key: "contract_start_date",
    render: (item) =>
      item.contract_start_date
        ? new Date(item.contract_start_date).toLocaleDateString("en-GB")
        : "-",
  },
  {
    label: "End Date",
    key: "contract_end_date",
    render: (item) =>
      item.contract_end_date
        ? new Date(item.contract_end_date).toLocaleDateString("en-GB")
        : "-",
  },
  { label: "Business Type", key: "business_type" },
  {
    label: "Address",
    key: "address",
    render: (item) =>
      `${item.address?.city || ""}, ${item.address?.state || ""}, ${
        item.address?.country || ""
      } - ${item.address?.pincode || ""}`,
  },
  { label: "Status", key: "status" },
];

const ContractNmr = () => {
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("contractNmr");
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useContractors({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="HR Management"
      subtitle="Contract & NMR"
      pagetitle="Contract & NMR"
      columns={ContractColumns}
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 0}
      loading={isLoading}
      isRefreshing={isFetching}
      AddModal={AddContractor}
      editroutepoint={"editcontractor"}
      routepoint="viewcontractor"
      FilterModal={Filters}
      addButtonLabel="Add Contractor"
      addButtonIcon={<AiOutlineFileAdd size={23} />}
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

export default ContractNmr;
