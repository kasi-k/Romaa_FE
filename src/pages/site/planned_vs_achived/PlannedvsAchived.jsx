import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Title from "../../../components/Title";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import TableReportSite from "./table site/TableReportSite";
import ChartSite from "./chart site/ChartSite";

const tabs = [
  {
    id: "1",
    label: "Table",
    component: <TableReportSite />,
    buttons: [
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className:
          "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue",
      },
      {
        label: "Filter",
        icon: <BiFilterAlt size={23} />,
        className:
          " dark:bg-layout-dark dark:text-white bg-white text-darkest-blue",
      },
    ],
  },
  {
    id: "2",
    label: "Chart",
    component: <ChartSite />,
    buttons: [
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className:
          "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue",
      },
      {
        label: "Filter",
        icon: <BiFilterAlt size={23} />,
        className:
          " dark:bg-layout-dark dark:text-white bg-white text-darkest-blue",
      },
    ],
  },
];

const PlannedVsAchived = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = tabs[0].id;
  const activeTab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (id) => {
    setSearchParams({ tab: id });
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const buttonsWithHandlers = (activeTabData.buttons || []).map((button) => {
    const modalMap = {};
    if (modalMap[button.label]) {
      return {
        ...button,
        onClick: () => setOpenModal(modalMap[button.label]),
      };
    }
    return button;
  });

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="font-roboto-flex flex justify-between items-center ">
          <Title
            title="Site Management"
            sub_title="Reconciliation"
            active_title={activeTabData?.label}
          />
          <div className="flex gap-2">
            {buttonsWithHandlers.map((button, index) => (
              <button
                key={index}
                className={`cursor-pointer w-fit text-sm flex items-center gap-2 px-4 py-2 rounded-md ${button.className}`}
                onClick={button.onClick}
              >
                {button.icon} {button.label}
              </button>
            ))}
          </div>
        </div>
        <div className=" font-roboto-flex  cursor-pointer flex justify-between items-center  ">
          <div className="flex flex-wrap gap-2 py-2.5 ">
            {tabs.map(({ id, label }) => (
              <p
                key={id}
                className={`flex gap-2 items-center px-4 py-2.5 font-medium rounded-lg text-sm whitespace-nowrap ${
                  activeTab === id
                    ? "bg-darkest-blue text-white"
                    : "dark:text-white dark:bg-layout-dark bg-white text-darkest-blue "
                }`}
                onClick={() => handleTabChange(id)}
              >
                {label}
              </p>
            ))}
          </div>
        </div>
        <div className=" h-full overflow-y-auto  no-scrollbar">
          {activeTabData?.component}
        </div>
      </div>
    </>
  );
};

export default PlannedVsAchived;
