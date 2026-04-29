import React, { useState, useMemo } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { AiOutlineFileAdd } from "react-icons/ai";
import RequestRegister from "./RequestRegister";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePurchaseRequests } from "./hooks/usePurchaseRequest";

const getStatusBadge = (status) => {
  const styles = {
    "Request Raised": " px-3 bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    "Quotation Requested": " px-3 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    "Quotation Received": "px-3 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    "Vendor Approved": "px-3 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
    "Purchase Order Issued": "px-3 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    "Completed": "px-3 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  };
  const activeStyle = styles[status] || "bg-gray-50 text-gray-500 border-gray-200";
  return (
    <span className={` py-1 rounded-full text-xs font-semibold border ${activeStyle}`}>
      {status}
    </span>
  );
};

const Columns = [
  { label: "Request ID", key: "requestId" },
  { label: "Project", key: "projectId" },
  { label: "Project Name", key: "tender_project_name" },
  { label: "Request Date", key: "requestDate" },
  { label: "Date of Requirements", key: "requiredByDate" },
  { label: "Requested by", key: "siteIncharge" },
  {
    label: "Status",
    key: "status",
    render: (row) => getStatusBadge(row.status),
  },
];

const PurchaseRequest = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = usePurchaseRequests({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : (data?.data || []);
    return list.map((item) => ({
      requestId: item.requestId,
      requestDate: item.requestDate ? new Date(item.requestDate).toLocaleDateString("en-GB") : "-",
      projectId: item.projectId,
      tender_project_name: item.tender_project_name,
      tender_name: item.tender_name,
      requiredByDate: item.requiredByDate ? new Date(item.requiredByDate).toLocaleDateString("en-GB") : "-",
      siteIncharge: item.siteDetails?.siteIncharge || "N/A",
      status: item.status,
    }));
  }, [data]);

  return (
    <Table
      title="Purchase Management"
      subtitle="Purchase Request"
      pagetitle="Purchase Request"
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
      AddModal={RequestRegister}
      routepoint="viewpurchaserequest"
      FilterModal={Filters}
      addButtonLabel="Request Register"
      addButtonIcon={<AiOutlineFileAdd size={24} />}
      id2Key="requestId"
      onSuccess={refetch}
      onUpdated={refetch}
    />
  );
};

export default PurchaseRequest;
