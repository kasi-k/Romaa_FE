import { LuUserRoundSearch } from "react-icons/lu";
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import axios from "axios";
import { API } from "../../../../../constant";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdArrowBackIosNew } from "react-icons/md";
import AddPenalty from "./AddPenalities";
import { useTableState } from "../../../../../hooks/useTableState";

const penaltyColumns = [
  { label: "Penalty_id", key: "penalty_id" },
  { label: "Penalty Type", key: "penalty_type" },
  { label: "Penalty Amount", key: "penalty_amount" , formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) } ,
  { label: "Penalty Date", key: "penalty_date" ,
    render: (item) => item.penalty_date ? new Date(item.penalty_date).toLocaleDateString() : "-"
  },
  { label: "Description", key: "description" },
  { label: "Status", key: "status" },
];

const Penalities = ({onBack}) => {
  const { tender_id } = useParams(); 
  const [penalty, setPenalty] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentPage, setCurrentPage, filterParams, setFilterParams } = useTableState("penalties");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  // Fetch penalty list
  const fetchPenalty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/penalty/penalties/${tender_id}`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          fromdate: filterParams.fromdate,
          todate: filterParams.todate,
        },
      });

      setPenalty(res.data.data);
      console.log(res.data.data);
      
      setTotalPages(res.data.totalPages);
    } catch  {
      toast.error("Failed to fetch penalty");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterParams, tender_id]);

  useEffect(() => {
    fetchPenalty();
  }, [fetchPenalty]);

  // Handle delete contract
  const handleDeletePenalty = async (penalty_id) => {
    try {
      await axios.delete(`${API}/penalty/remove/${tender_id}/${penalty_id}`);
      toast.success("Contract was successfully removed!");
      fetchPenalty();
    } catch  {
      toast.error("Failed to remove penalty.");
    }
  };

  return (
    <>
      <Table
        contentMarginTop="mt-0"
        endpoint={penalty}
        columns={penaltyColumns}
        loading={loading}
       // ViewModal={true}
        AddModal={AddPenalty}
        addButtonLabel="Add Penalty"
        addButtonIcon={<LuUserRoundSearch size={24} />}
        exportModal={false}
        DeleteModal={DeleteModal}
        deletetitle="Penalty"
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        onUpdated={fetchPenalty}
        onSuccess={fetchPenalty}
        onDelete={handleDeletePenalty}
        idKey="penalty_id" 
      />
      {/* Back Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-darkest-blue text-white px-8 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-all font-medium shadow-sm"
        >
          <MdArrowBackIosNew size={14} /> Back
        </button>
      </div>
    </>
  );
};

export default Penalities;
