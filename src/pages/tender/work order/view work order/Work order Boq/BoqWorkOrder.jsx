
import { useParams } from 'react-router-dom';
import { WorkOrderBOQData } from '../../../../../components/Data';
import DeleteModal from '../../../../../components/DeleteModal';
import Table from '../../../../../components/Table'
import ViewWorkOrderBoq from './ViewWorkOrderBoq';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../../../../../constant';
import { toast } from 'react-toastify';
import Filters from '../../../../../components/Filters';

const WorkOrderBOQColumns = [
  { label: "Specification", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Units", key: "unit" },
  { label: "Final Rate", key: "final_unit_rate" },
  { label: "Amount", key: "final_amount" },
];


const BoqWorkOrder = () => {
    const { tender_id } = useParams(); // 📌 Get tender_id from URL

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBoqItems = async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/boq/items/${tender_id}`, {
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      setItems(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch BOQ items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoqItems();
  }, [tender_id, currentPage]);

  const handleDeleteBoqItem = async (item_code) => {
    try {
      await axios.delete(`${API}/boq/removeitem/${tender_id}/${item_code}`);
      toast.success("Item deleted successfully");
      fetchBoqItems(); // refresh table
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete BOQ item");
    }
  };
  return (
    <>
    <Table
    contentMarginTop='mt-0'
      endpoint={items}
      columns={WorkOrderBOQColumns}
      //EditModal={true}
      ViewModal={ViewWorkOrderBoq}
      exportModal={false}
      DeleteModal={DeleteModal}
      deletetitle="BOQ"
      totalPages={totalPages}
      currentPage={currentPage}
      FilterModal={Filters}
      setCurrentPage={setCurrentPage}
      onUpdated={fetchBoqItems}
      onSuccess={fetchBoqItems}
      onDelete={handleDeleteBoqItem}
      idKey="item_code"
    />
    
    </>
  )
}

export default BoqWorkOrder