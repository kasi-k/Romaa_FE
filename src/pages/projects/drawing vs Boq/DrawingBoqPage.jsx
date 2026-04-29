import React, { useState } from "react";
import Title from "../../../components/Title";
import DrawingBoq from "./DrawingBoq";
import ProjectDetailedEstimate from "./detailed estimate/ProjectDetailedEstimate";

const TABS = [
  { id: "drawingboq", label: "Drawing BOQ" },
  { id: "detailestimate", label: "Detailed Estimate" },
];

const DrawingBoqPage = () => {
  const [activeTab, setActiveTab] = useState("drawingboq");

  return (
    <div className="font-roboto-flex h-full flex flex-col">
      <Title page_title="Drawing vs BOQ" />

      {/* Tab Bar */}
      <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label }) => (
          <p
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === id
                ? "bg-darkest-blue text-white"
                : "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue"
            }`}
          >
            {label}
          </p>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "drawingboq" && <DrawingBoq />}
        {activeTab === "detailestimate" && <ProjectDetailedEstimate />}
      </div>
    </div>
  );
};

export default DrawingBoqPage;
