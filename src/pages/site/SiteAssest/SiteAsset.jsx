import React, { useEffect, useState } from 'react'
import Table from '../../../components/Table'
import Filters from '../../../components/Filters'
import axios from 'axios'
import { API } from '../../../constant'

const SiteAsset = () => {
    const [siteAssets, setSiteAssets] = useState([])
    const [loading, setLoading] = useState(false)

   const tenderId = localStorage.getItem("tenderId");

  const siteAssestColumns = [
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
        setSiteAssets(res.data.data);
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
                subtitle={"Site Asset"}
                pagetitle={"Site Asset"}
                endpoint={siteAssets}   // pass filtered data
                columns={siteAssestColumns}
                EditModal={false}
                routepoint={"details"}
                FilterModal={Filters}
                ViewModal={true}
                loading={loading}
                idKey="assetId"
            />
        </div>
    )
}

export default SiteAsset
