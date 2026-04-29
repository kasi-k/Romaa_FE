import React, { useState, useMemo, useEffect } from "react";
import Title from "../../../components/Title"; // Adjust path if needed
import GeneralAbstract from "./general abstract/GeneralAbstract";
import BOQProject from "./BOQProjects/BOQProject";
import NewInletDet from "./new inlet det/NewInletDet";
import NewInletAbs from "./new inlet abs/NewInletAbs";
import { useProject } from "../../../context/ProjectContext";
import { useDetailedEstimateHeadings } from "../hooks/useProjects";


const DetailedEstimate = () => {
  const { tenderId } = useProject();
  const [activeTab, setActiveTab] = useState("1");

  // 1. Fetch Dynamic Headings via TanStack Query
  const { data: headings, isLoading } = useDetailedEstimateHeadings(tenderId);

  // 2. Compute Tabs Dynamically (Best Practice: No need to store components in state)
  const tabs = useMemo(() => {
    // Base static tabs
    const baseTabs = [
      { id: "1", label: "GS(General Abstract)", component: <GeneralAbstract /> },
      { id: "2", label: "Bill of Qty", component: <BOQProject /> },
    ];

    // If no headings or still loading, just return base tabs
    if (!headings || headings.length === 0) return baseTabs;

    // Generate dynamic tabs from API data
    const dynamicTabs = headings.flatMap((item, index) => [
      {
        id: `${item.heading}-abs-${index}`,
        label: `${item.heading} Abstract`,
        component: <NewInletAbs name={item.abstractKey} />,
      },
      {
        id: `${item.heading}-det-${index}`,
        label: `${item.heading} Detailed`,
        component: <NewInletDet name={item.detailedKey} />,
      },
    ]);

    return [...baseTabs, ...dynamicTabs];
  }, [headings]); // Recalculate only when headings change

  // 3. Reset to first tab automatically when a new project is selected
  useEffect(() => {
    setActiveTab("1");
  }, [tenderId]);

  // Find the currently active component to render
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  if (!tenderId) {
    return (
      <div className="p-4 text-center text-gray-500 font-medium mt-10">
        Please select a project to view the detailed estimate.
      </div>
    );
  }

  return (
    <div className="font-roboto-flex flex flex-col h-full p-4">
      <Title title="Detailed Estimate" sub_title={`Tender : ${tenderId}`} />

      {/* Tabs Row */}
      <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
        {isLoading ? (
          <span className="text-sm text-gray-400 animate-pulse">Loading tabs...</span>
        ) : (
          tabs.map(({ id, label }) => (
            <p
              key={id}
              onClick={() => setActiveTab(id)}
              className={`first-letter:uppercase px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                activeTab === id
                  ? "bg-darkest-blue text-white shadow-md"
                  : "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {label}
            </p>
          ))
        )}
      </div>

      {/* Active Component Wrapper */}
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

export default DetailedEstimate;