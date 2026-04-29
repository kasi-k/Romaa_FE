import React, { useState } from "react";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import Filters from "../../../components/Filters";
import BulkMaterial from "./bulk_material/BulkMaterial"
import Steel from "./steel/Steel"


const Reconciliation = () => {
  const [activeTab, setActiveTab] = useState("bulkmaterial");
  const [filter, setFilter] = useState(false);

  const tabs = [
    { id: "bulkmaterial", label: "Bulk Material" },
    { id: "steel", label: "Steel" },
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
          sub_title="Reconciliation"
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
            bgColor=" dark:bg-layout-dark  bg-white"
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
         
           
        </div>
        <div className="">
          {activeTab === "bulkmaterial" && <BulkMaterial />}
          {activeTab === "steel" && <Steel />}
        </div>
      </div>
      {filter && (
        <Filters onclose={() => setFilter(false)} onFilter={handleFilter} />
      )}
    </>
  );
};

export default Reconciliation;
