import React from "react";
import Table from "../../../../components/Table";
import { useProject } from "../../../../context/ProjectContext";
import { useNewInletAbs } from "../../hooks/useProjects";

const NewInletAbsColumns = [
  { label: "Abstract ID", key: "abstract_id" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { 
    label: "Rate", 
    key: "rate", 
    formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value || 0) 
  },
  { 
    label: "Amount", 
    key: "amount", 
    formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value || 0) 
  },
];

const NewInletAbs = ({ name }) => {
  const { tenderId } = useProject();

  // Fetch data using TanStack Query
  const { 
    data: abstractData, 
    isLoading, 
    isFetching, 
    refetch 
  } = useNewInletAbs(tenderId, name);

  return (
    <Table
      contentMarginTop="mt-0"
      pagination={false}
      
      // Data Props from React Query
      loading={isLoading}
      isRefreshing={isFetching}
      endpoint={abstractData || []}
      
      // Config
      columns={NewInletAbsColumns}
      exportModal={false}
      name={name}
      
      // Actions
      onSuccess={refetch}
      onUpdated={refetch}
    />
  );
};

export default NewInletAbs;