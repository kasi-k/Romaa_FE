import React, { useState } from 'react';
import Table from '../../../components/Table';
import { useProject } from '../../../context/ProjectContext';
import { useZeroCostItems } from '../hooks/useProjects';


const customerColumns = [
  { label: "Item Code", key: "item_name" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
  { 
    label: "Final Rate", 
    key: "n_rate", 
    formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) 
  },
  { 
    label: "Amount", 
    key: "n_amount", 
    formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) 
  },
];

const ZeroCost = () => {
  const { tenderId } = useProject();

  // 1. Local State for Pagination Controls
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Fetch Data via TanStack Query
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useZeroCostItems(tenderId, {
    page: currentPage,
    limit: 10,
  });

  // If no tenderId is selected, you might want to show a message or just an empty table
  if (!tenderId) {
    return <div className="p-4 text-center text-gray-500 font-medium mt-10">Please select a project to view BOQ costs.</div>;
  }

  return (
    <>
      <Table
        title="BOQ Cost"
        subtitle={`Tender: ${tenderId}`}
        
        // Data Props mapped from React Query
        loading={isLoading}
        isRefreshing={isFetching}
        endpoint={data?.data || []}
        totalPages={data?.totalPages || 1}
        
        // Pagination Controls
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        
        // Config
        columns={customerColumns}      
        exportModal={false}
        idKey="item_code"
        
        // Actions
        onUpdated={refetch}
        onSuccess={refetch}
      />
    </>
  );
};

export default ZeroCost;