import React from "react";
import Table from "../../../../components/Table";
import { useProject } from "../../../../context/ProjectContext";
import { useGeneralAbstract } from "../../hooks/useProjects";


const Columns = [
  { label: "Abstract", key: "heading" },
  {
    label: "Abstract Amount",
    key: "total_amount",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value || 0),
  },
];

const GeneralAbstract = () => {
  const { tenderId } = useProject();

  // Fetch data using TanStack Query
  const { data: generalAbstractData, isLoading, isFetching } = useGeneralAbstract(tenderId);

  // Fallback if no project is selected
  if (!tenderId) {
    return (
      <div className="p-4 text-center text-gray-500 font-medium">
        Please select a project to view the General Abstract.
      </div>
    );
  }

  return (
    <Table
      contentMarginTop="mt-0"
      
      // Data Props from React Query
      loading={isLoading}
      isRefreshing={isFetching}
      endpoint={generalAbstractData || []}
      
      // Config
      columns={Columns}
      exportModal={false}
      pagination={false}
    />
  );
};

export default GeneralAbstract;