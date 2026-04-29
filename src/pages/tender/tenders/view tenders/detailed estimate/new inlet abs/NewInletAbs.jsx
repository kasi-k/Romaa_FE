import axios from "axios";
import Table from "../../../../../../components/Table";
import { API } from "../../../../../../constant";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UploadAbstract from "./UploadAbstract";
import { toast } from "react-toastify";

const NewInletAbsColumns = [
  { label: "Abstract ID", key: "abstract_id" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "Amount", key: "amount", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
];

const NewInletAbs = ({ name, isFrozen }) => {
  const { tender_id } = useParams();
  const [abstract, setAbstract] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAbstract = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getdatacustomhead?tender_id=${tender_id}&nametype=${name}`
      );
  
      setAbstract(res.data.data || []);
    } catch {
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAbstract();
  }, [tender_id, name]);
  return (
    <Table
      loading={loading}
      contentMarginTop="mt-0"
      pagination={false}
      UploadModal={isFrozen ? null : UploadAbstract}
      endpoint={abstract}
      columns={NewInletAbsColumns}
      onSuccess={fetchAbstract}
      exportModal={false}
      name={name}
      uploadModalProps={{ hasExistingData: abstract.length > 0, existingCount: abstract.length }}
    />
  );
};

export default NewInletAbs;
