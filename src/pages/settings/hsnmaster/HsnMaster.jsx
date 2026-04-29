import React, { useState } from 'react';
import Table from '../../../components/Table';
import Filters from '../../../components/Filters';
import UploadHSN from './UploadHSN';
import { useDebounce } from '../../../hooks/useDebounce';
import { useHsnList } from './hooks/useHsnMaster';

const HSNColumns = [
  { label: "HSN Code", key: "code" },
  { label: "Name", key: "shortDescription" },
  { label: "Type", key: "type" },
  { label: "Description", key: "description" },
  {
    label: "TaxStructure",
    key: "taxStructure",
    render: (item) =>
      item.taxStructure
        ? `${item.taxStructure.igst || ""} %, ${item.taxStructure.cgst || ""} %, ${item.taxStructure.sgst || ""} %`
        : "-",
  },
];

const HsnMaster = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isFetching, refetch } = useHsnList({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
  });

  const rows = Array.isArray(data) ? data : (data?.data || []);

  return (
    <Table
      title="Settings"
      subtitle="HSN "
      pagetitle="HSN"
      loading={isLoading}
      isRefreshing={isFetching}
      endpoint={rows}
      totalPages={data?.totalPages || 0}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={searchTerm}
      setSearch={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      columns={HSNColumns}
      EditModal={true}
      idKey="role_id"
      FilterModal={Filters}
      UploadModal={UploadHSN}
      onUpdated={refetch}
      onSuccess={refetch}
    />
  );
};

export default HsnMaster;
