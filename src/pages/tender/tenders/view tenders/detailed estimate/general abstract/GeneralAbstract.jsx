import axios from "axios";
import Table from "../../../../../../components/Table";
import { API } from "../../../../../../constant";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  const { tender_id } = useParams();
  const [generalAbstractdata, setGeneralAbstractdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const getGeneralAbstractdata = async () => {
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getgeneralabstract?tender_id=${tender_id}`,
      );
      setGeneralAbstractdata(res.data.data);
    } catch (error) {
      console.log(error);
      toast.info("Failed to fetch General Abstract");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getGeneralAbstractdata();
  }, []);
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
