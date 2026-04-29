
import axios from "axios";
import Table from "../../../../../components/Table";
import { API } from "../../../../../constant";
import { useEffect, useState } from "react";
import { useProject } from "../../../../../context/ProjectContext";

const Columns = [
  { label: "Abstract ", key: "heading" },
  {
    label: "Abstract Amount ",
    key: "total_amount",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
];

const GeneralAbstract = () => {
  const { tenderId: tender_id } = useProject();
  const [generalAbstractdata, setGeneralAbstractdata] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getGeneralAbstractdata = async () => {
      try {
        const res = await axios.get(
          `${API}/drawingvboqde/getgeneralabstract?tender_id=${tender_id}`
        );
        setGeneralAbstractdata(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (tender_id) getGeneralAbstractdata();
  }, [tender_id]);
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={generalAbstractdata}
      columns={Columns}
      exportModal={false}
      pagination={false}
      loading={loading}
    />
  );
};

export default GeneralAbstract;
