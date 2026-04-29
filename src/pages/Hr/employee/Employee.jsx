import React, { useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import AddEmployee from "./AddEmployee";
import { AiOutlineFileAdd } from "react-icons/ai";
import { useDebounce } from "../../../hooks/useDebounce";
import { useEmployees } from "./hooks/useEmployees";
import { useTableState } from "../../../hooks/useTableState";


const EmployeeColumns = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Name", key: "name" },
  { label: "Designation", key: "designation" },
  { label: "Email", key: "email"  },
  { label: "Status", key: "status" },
];

const Employee = () => {
  // 1. Local State for Controls
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("employee");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Debounce Search (Prevents spamming the API on every keystroke)
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 3. Fetch Data via TanStack Query
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useEmployees({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  return (
    <Table
      title="HR Management"
      subtitle="Employee"
      pagetitle="Employee Management"
      
      // Data & Loading Props mapped from React Query
      endpoint={data?.data || []}
      totalPages={data?.totalPages || 0}
      loading={isLoading}
      isRefreshing={isFetching}
      
      // Controls State
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm} // If your Table supports internal search state binding
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      
      // Configuration
      columns={EmployeeColumns}
      AddModal={AddEmployee}
      editroutepoint={"editemployee"}
      routepoint="viewemployee"
      FilterModal={Filters}
      
      addButtonLabel="Add Employee"
      addButtonIcon={<AiOutlineFileAdd size={23} />}
      
      // Triggers for modals (Add/Edit) to refresh the table
      onUpdated={refetch}
      onSuccess={refetch}
    />
  );
};

export default Employee;