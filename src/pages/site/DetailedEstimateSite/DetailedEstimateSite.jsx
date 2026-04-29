import React, { useEffect, useState } from "react";
import Title from "../.././../components/Title";
import axios from "axios";
import { API } from "../../../constant";
import GeneralAbstract from "../../projects/Detailed estimate/general abstract/GeneralAbstract";
import BOQProject from "../../projects/Detailed estimate/BOQProjects/BOQProject";
import NewInletDet from "../../projects/Detailed estimate/new inlet det/NewInletDet";
import NewInletAbs from "../../projects/Detailed estimate/new inlet abs/NewInletAbs";
import { useProject } from "../../../context/ProjectContext";


const DetailedEstimateSite = () => {
  const { tenderId } = useProject();

  const [tabs, setTabs] = useState([
    { id: "1", label: "GS(General Abstract)", component: <GeneralAbstract /> },
    { id: "2", label: "Bill of Qty", component: <BOQProject /> },
  ]);
  const [activeTab, setActiveTab] = useState("1");


  // ✅ Fetch headings from backend
  const fetchHeadings = async () => {
    try {
      const res = await axios.get(`${API}/detailedestimate/extractheadings`, {
        params: { tender_id: tenderId },
      });

      console.log(res);

      if (res.data.status && res.data.data.length > 0) {
        const dynamicTabs = res.data.data.flatMap((item, index) => [
          {
            id: `${item.heading}-det-${index}`,
            label: `${item.heading} Detailed`,
            component: <NewInletDet name={item.detailedKey} />,
          },
          {
            id: `${item.heading}-abs-${index}`,
            label: `${item.heading} Abstract`,
            component: <NewInletAbs name={item.abstractKey} />,
          },
        ]);

        setTabs((prev) => [
          prev[0], // keep GS(General Abstract)
          prev[1], // keep BOQ
          ...dynamicTabs,
        ]);
      }
    } catch (error) {
      console.error("Error fetching headings:", error);
    }
  };

  useEffect(() => {
    if (tenderId) fetchHeadings();
  }, [tenderId]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="font-roboto-flex flex flex-col h-full p-4">
      <Title title={`Detailed Estimate Site`} sub_title={`Tender : ${tenderId}`} />

      {/* Tabs */}
      <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label }) => (
          <p
            key={id}
            className={`first-letter:uppercase px-4 py-2.5 rounded-lg text-sm cursor-pointer whitespace-nowrap shrink-0 ${activeTab === id
                ? "bg-darkest-blue text-white"
                : "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue"
              }`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </p>
        ))}
      </div>

      {/* Active Component */}
      <div className="h-full overflow-y-auto no-scrollbar mt-2">
        {activeTabData?.component || (
          <div className="text-center text-gray-500 mt-4">
            Select a tab to view content
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedEstimateSite;
