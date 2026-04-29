import React, { useState } from "react";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import Filters from "../../../components/Filters";
import { MdOutlineCalendarMonth } from "react-icons/md";
import InFlow from "./in_flow/InFlow";
import OutFlow from "./out_flow/OutFlow";

const CashFlow = () => {
  const [activeTab, setActiveTab] = useState("inflow");
  const [filter, setFilter] = useState(false);

  const tabs = [
    { id: "inflow", label: "In Flow" },
    { id: "outflow", label: "Out Flow" },
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
    <>
      <div className="flex justify-between py-2 pb-3">
        <Title
          title="Reports"
          sub_title="Cash Flow"
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
            bgColor=" dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            onClick={() => setFilter(true)}
          />
        </div>
      </div>
      <div className="">
        <div className="flex justify-between mt-2 ">
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
         
            <div className="w-52 flex rounded-md justify-between items-center">
              <input
                type="text"
                className="bg-white dark:bg-layout-dark outline-none w-full rounded-l-md placeholder:text-sm px-3 py-2 pl-6"
                placeholder="Search month"
              />
              <p className="bg-select-subbar text-darkest-blue rounded-r-md py-3 px-3">
                <MdOutlineCalendarMonth />
              </p>
            </div>
        </div>
        <div className="">
          {activeTab === "inflow" && <><InFlow /></>}
          {activeTab === "outflow" && <><OutFlow  /></>}
        </div>
      </div>
      {filter && (
        <Filters onclose={() => setFilter(false)} onFilter={handleFilter} />
      )}
    </>
  );
};

export default CashFlow;
