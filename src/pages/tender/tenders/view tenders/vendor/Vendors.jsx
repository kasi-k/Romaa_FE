import { LuUserRoundSearch } from "react-icons/lu";
import { VendorData } from "../../../../../components/Data";
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import AddPermittedVendor from "./vendorPermitted";
import axios from "axios";
import { API } from "../../../../../constant";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdArrowBackIosNew } from "react-icons/md";
import { useTableState } from "../../../../../hooks/useTableState";

const customerColumns = [
  { label: "Vendor ID", key: "vendor_id" },
  { label: "Vendor Name", key: "vendor_name" },
  { label: "Vendor Type", key: "type" },
  //{ label: "Address", key: "address" },
  { label: "Status", key: "permitted_status" },
];

const Vendor = () => {
  const { tender_id } = useParams();

  const [permittedVendor, setPermittedVendor] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("vendor");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const fetchVendorPermitted = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/permittedvendor/permitted-vendors/${tender_id}`,
        {
          params: {
            page: currentPage,
            limit: 10,
            search: searchTerm,
            fromdate: filterParams.fromdate,
            todate: filterParams.todate,
          },
        }
      );

      setPermittedVendor(res.data.data);
      setTotalPages(res.data.totalPages);
      console.log(res.data);
    } catch {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterParams, tender_id]);

  useEffect(() => {
    fetchVendorPermitted();
  }, [fetchVendorPermitted]);

  const handleDeletePermittedVendor = async (vendor_id) => {
    try {
      const res = await axios.delete(
        `${API}/permittedvendor/remove/${tender_id}/${vendor_id}`
      );
      console.log(res);

      toast.success("Vendor was successfully removed!");
      // Refresh the vendor list after deletion
      fetchVendorPermitted();
    } catch  {
      toast.error("Failed to remove vendor.");
    }
  };

  return (
    <>
      <Table
        contentMarginTop="mt-0"
        endpoint={permittedVendor}
        columns={customerColumns}
        loading={loading}
        ViewModal={true}
        AddModal={AddPermittedVendor}
        addButtonLabel="Add Vendor"
        addButtonIcon={<LuUserRoundSearch size={24} />}
        exportModal={false}
        DeleteModal={DeleteModal}
        deletetitle="vendor"
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        onUpdated={fetchVendorPermitted}
        onSuccess={fetchVendorPermitted}
        onDelete={handleDeletePermittedVendor}
        idKey="vendor_id"
      />
    </>
  );
};

export default Vendor;
