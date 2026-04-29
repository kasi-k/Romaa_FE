import Table from "../../../../../components/Table";
import axios from "axios";
import { API } from "../../../../../constant";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdArrowBackIosNew } from "react-icons/md";
import { useTableState } from "../../../../../hooks/useTableState";

const customerColumns = [
  { label: "Contractor_id", key: "contractor_id" },
  { label: "Company Name", key: "contractor_name" },
  { label: "Phone", key: "contact_phone" },
  { label: "Email", key: "contact_email" },
  { label: "Business Type", key: "business_type" },
  { label: "Status", key: "status" },
];

const Contract = () => {
  const { tender_id } = useParams(); 
  const [contracts, setContracts] = useState([]);
  const [_Loading, setLoading] = useState(false);
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("contract");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  // Fetch contracts list
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/contractor/getbytender/${tender_id}`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });
console.log(res.data.data);
      setContracts(res.data.data);
      console.log(res.data.data);
      
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  }, [tender_id, currentPage, searchTerm, filterParams]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);



  return (
    <>
      <Table
        contentMarginTop="mt-0"
        endpoint={contracts}
        columns={customerColumns}
        ViewModal={true}
        exportModal={false}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onUpdated={fetchContracts}
        onSuccess={fetchContracts}
        idKey="contractWorker_id" 
      />
    </>
  );
};

export default Contract;
