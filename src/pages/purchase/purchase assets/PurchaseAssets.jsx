import Table from "../../../components/Table";
import { ProjectAssetData } from "../../../components/Data";
import Filters from "../../../components/Filters";
import { useEffect, useState } from "react";
import { API } from "../../../constant";
import axios from "axios";


const PurchaseAssets = () => {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([])

  const Columns = [
    {label:"AssetId",key:"assetId"},
    { label: "Asset Name", key: "assetName" },
    { label: "Asset Type", key: "assetType" },
    { label: "CurrentSite", key: "currentSite" },
    { label: "Status", key: "currentStatus" },
  ];

  useEffect(() => {
    const fetchAssetsByTender = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API}/machineryasset/getall/assets`,
        );
        setAssets(res.data.data);
      } catch (err) {
        console.error("Error fetching assets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssetsByTender();
  }, []);
  return (
    <Table
      title={"Purchase Management"}
      subtitle={"Assets"}
      pagetitle={" Assets"}
      endpoint={assets}
      columns={Columns}
       EditModal={false}
      FilterModal={Filters}
      ViewModal={true}
      loading={loading}
      idKey="assetId"
      routepoint="details"
    />
  );
};

export default PurchaseAssets;
