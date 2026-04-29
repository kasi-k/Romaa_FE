import React, { useState } from "react";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import Filters from "../../../components/Filters";
import { FaAngleDown } from "react-icons/fa6";
import WorkProgressIndicator from "./work_progress_indicator/WorkProgressIndicator";
import Overview from "./overview/Overview";

const ProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [filter, setFilter] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "WPI", label: "Work Progress Indicators" },
  ];
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setFilter(false);
    setCurrentPage(1);
  };
  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
   <div className="flex flex-col h-full">
  <div className="sticky top-0 z-20 w-full">
    <div className="flex md:justify-between justify-start md:flex-row flex-col md:items-center items-start py-2 pb-3 px-4">
      <Title
        title="Reports"
        sub_title="Project Dashboard"
        page_title={currentTabLabel}
        page_title_2={currentTabLabel}
      />
      <div className="flex items-center gap-2">
        <Button
          button_icon={<TbFileExport size={22} />}
          button_name="Export"
          bgColor="dark:bg-layout-dark bg-white"
          textColor="dark:text-white text-darkest-blue"
        />
        <Button
          button_icon={<BiFilterAlt size={22} />}
          button_name="Filter"
          bgColor="dark:bg-layout-dark bg-white"
          textColor="dark:text-white text-darkest-blue"
          onClick={() => setFilter(true)}
        />
      </div>
    </div>

    <div className="flex md:justify-between gap-4 justify-normal md:flex-row  flex-col items-start  md:items-center px-4 pb-2">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              activeTab === tab.id
                ? "text-white bg-darkest-blue font-light font-roboto-flex"
                : "dark:text-white dark:bg-layout-dark text-black bg-white font-light font-roboto-flex"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== "WPI" && (
        <div className="w-72 flex rounded-md justify-between items-center">
          <input
            type="text"
            className=" dark:bg-layout-dark bg-white w-full rounded-l-md placeholder:text-sm px-3 py-2 pl-6 outline-none"
            placeholder="Project Name"
          />
          <p className="bg-select-subbar text-darkest-blue rounded-r-md py-3 px-3">
            <FaAngleDown />
          </p>
        </div>
      )}
    </div>
  </div>

  <div className=" overflow-y-auto px-2 no-scrollbar">
    {activeTab === "overview" && <Overview />}
    {activeTab === "WPI" && <WorkProgressIndicator />}
  </div>
  {filter && (
    <Filters onclose={() => setFilter(false)} onFilter={handleFilter} />
  )}
</div>

  );
};

export default ProjectDashboard;
