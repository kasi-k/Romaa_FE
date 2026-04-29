import React, { useState } from "react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { RiUserAddLine } from "react-icons/ri";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import { useDebounce } from "../../../hooks/useDebounce";
import { useUsers } from "./hooks/useUsers";


const UserColumns = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Name", key: "name" },
  { label: "Designation", key: "designation" },
  {
    label: "Role Id",
    key: "role_id",
    render: (item) => `${item.role?.role_id || ""}`,
  },
  {
    label: "Role Name",
    key: "roleName",
    render: (item) => `${item.role?.roleName || ""}`,
  },
  {
    label: "Access Mode",
    key: "accessMode",
    render: (item) => `${item.accessMode || ""}`,
  },
  { label: "Email", key: "email" },
  { label: "Status", key: "status" },
];

const User = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useUsers({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  const users = Array.isArray(data) ? data : (data?.data || []);

  return (
    <div>
      <Table
        title="Settings"
        subtitle="User "
        pagetitle="User"
        endpoint={users}
        totalPages={data?.totalPages || 0}
        loading={isLoading}
        isRefreshing={isFetching}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        search={searchTerm}
        setSearch={setSearchTerm}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        columns={UserColumns}
        ViewModal={true}
        routepoint={"viewuser"}
        FilterModal={Filters}
        AddModal={AddUser}
        EditModal={EditUser}
        DeleteModal={DeleteUser}
        addButtonLabel="Add User"
        addButtonIcon={<RiUserAddLine size={23} />}
        onUpdated={refetch}
        onSuccess={refetch}
        onDelete={refetch}
      />
    </div>
  );
};

export default User;
