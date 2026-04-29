import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { BookUser } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { API } from "../../../constant";
import { toast } from "react-toastify";
import axios from "axios";
import CreateVendorSupplier from "./CreateVendorSupplier";
import EditVendorSupplier from "./EditVendorSupplier";
import { useTableState } from "../../../hooks/useTableState";

const VendorColumns = [
  { label: "Vendor ID", key: "vendor_id" },
  { label: "Company Name", key: "company_name" },
  { label: "Vendor Type", key: "type" },
  {
    label: "Address",
    key: "address",
    render: (item) =>
      `${item.address?.city || ""}, ${item.address?.state || ""}, ${
        item.address?.country || ""
      } - ${item.address?.pincode || ""}`,
  },
  { label: "GSTIN", key: "gstin" },
  { label: "Phone", key: "contact_phone" },
  { label: "Email", key: "contact_email" },
  { label: "Status", key: "status" },
];

const VendorSupplier = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("vendorSupplier");
  const [totalPages, setTotalPages] = useState(0);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/vendor/getvendors`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });

      setVendors(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterParams]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <Table
      title="Purchase Management"
      subtitle="Vendor & Supplier"
      pagetitle="Vendor & Supplier Management"
      loading={loading}
      endpoint={vendors}
      columns={VendorColumns}
      AddModal={CreateVendorSupplier}
      EditModal={EditVendorSupplier}
      routepoint={"viewvendorsupplier"}
      FilterModal={Filters}
      addButtonLabel="Create Vendor"
      addButtonIcon={<BookUser size={24} />}
      totalPages={totalPages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterParams={filterParams}
      setFilterParams={setFilterParams}
      onUpdated={fetchVendors}
      onSuccess={fetchVendors}
      idKey="vendor_id"
    />
  );
};

export default VendorSupplier;
