import React, { useState } from "react";
import Title from "../../../components/Title";
import Filters from "../../../components/Filters";
import Table from "./table/TableReport";
import TableReport from "./table/TableReport";
import Chart from "./chart/Chart";

const PlannedvsAcutal = () => {
  const [activeTab, setActiveTab] = useState("chart");
  const [filter, setFilter] = useState(false);

  const tabs = [
    { id: "chart", label: "Chart" },
    { id: "table", label: "Table" },
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
    <div className="flex flex-col ">
     <div className="sticky top-0 z-20 w-full  pb-3">
       <div className="flex justify-between py-2 pb-3">
        <Title
          title="Reports"
          sub_title="Planned vs Actual"
          page_title={currentTabLabel}
          page_title_2={currentTabLabel}
        />
      </div>
      <div className="">
        <div className="flex justify-between mt-2  ">
          <div className="flex gap-2  ">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-3 rounded-md text-sm font-medium ${
                  activeTab === tab.id
                    ? " text-white bg-darkest-blue font-light   font-roboto-flex"
                    : "dark:text-white dark:bg-layout-dark text-black bg-white font-light font-roboto-flex"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
     </div>
      <div className="overflow-y-auto my-3 no-scrollbar">
        {activeTab === "chart" && (
          <>
            <Chart />
          </>
        )}
        {activeTab === "table" && (
          <>
            <TableReport />
          </>
        )}
      </div>
      {filter && (
        <Filters onclose={() => setFilter(false)} onFilter={handleFilter} />
      )}
    </div>
  );
};

export default PlannedvsAcutal;
