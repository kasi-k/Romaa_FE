import React, { useEffect, useState } from "react";
import Table from "../../../components/Table";
import Filters from "../../../components/Filters";
import axios from "axios";
import { API } from "../../../constant";

const ProjectAsset = () => {
  const [projectAssets, setProjectAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Retrieve tenderId from localStorage
  const tenderId = localStorage.getItem("tenderId");

  const ProjectAssestColumns = [
    {label:"AssetId",key:"assetId"},
    { label: "Asset Name", key: "assetName" },
    { label: "Asset Type", key: "assetType" },
    { label: "CurrentSite", key: "currentSite" },
    { label: "Status", key: "currentStatus" },
  ];

  useEffect(() => {
    const fetchAssetsByTender = async () => {
      if (!tenderId) return;
      try {
        setLoading(true);
        const res = await axios.get(
          `${API}/machineryasset/getbyproject/${tenderId}`,
        );
        setProjectAssets(res.data.data);
      } catch (err) {
        console.error("Error fetching assets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssetsByTender();
  }, [tenderId]);

  return (
    <div>
      <Table
        title={"Site Management"}
        subtitle={"Project Asset"}
        pagetitle={"Project Asset"}
        endpoint={projectAssets} // pass filtered data
        columns={ProjectAssestColumns}
        EditModal={false}
        routepoint={"details"}
        FilterModal={Filters}
        ViewModal={true}
        loading={loading}
        idKey="assetId"
      />
    </div>
  );
};

export default ProjectAsset;
