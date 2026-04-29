import axios from "axios";
import Table from "../../../../../components/Table";
import { API } from "../../../../../constant";
import { useCallback, useEffect, useState } from "react";
import UploadAbstract from "./UploadAbstract";
import { toast } from "react-toastify";
import { useProject } from "../../../../../context/ProjectContext";

const NewInletAbsColumns = [
  { label: "Abstract ID", key: "abstract_id" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "Amount", key: "amount", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
];

const NewInletAbs = ({ name }) => {
  const { tenderId: tender_id } = useProject();
  const [abstract, setAbstract] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAbstract = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/drawingvboqde/getdatacustomhead?tender_id=${tender_id}&nametype=${name}`
      );
  
      setAbstract(res.data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  }, [tender_id, name]);

  useEffect(() => {
    fetchAbstract();
  }, [fetchAbstract]);
  return (
    <Table
      loading={loading}
      contentMarginTop="mt-0"
      pagination={false}
      UploadModal={abstract.length > 0 ? null : UploadAbstract}
      endpoint={abstract}
      columns={NewInletAbsColumns}
      // routepoint={"viewnewinletabs"}
      onSuccess={fetchAbstract}
      exportModal={false}
      name={name}
    />
  );
};

export default NewInletAbs;
