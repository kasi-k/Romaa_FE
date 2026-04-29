import React, { useState } from "react";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import { useNavigate, useSearchParams } from "react-router-dom";
import Title from "../../../components/Title";
import { TbPencil } from "react-icons/tb";
import { HiMiniPlusSmall } from "react-icons/hi2";
import Summary from "./summary/Summary";
import BOQSplit from "./boq split/BOQSplit";
import RateAnalysis from "./Rate analysis/RateAnalysis";
import SiteOverHead from "./Site overheads/SiteOverHead";
import Materials from "./materials/Materials";
import AddMaterial from "./materials/AddMaterial";
import EditMaterial from "./materials/EditMaterial";
import Machines from "./machines/Machines";
import ManPower from "./man power/ManPower";





const ZeroCost = () => {
  const navigate = useNavigate();
  const tabs = [
  {
    id: "1",
    label: " Summary",
    component:<Summary/>,
    buttons: [
      {
        label: "Edit",
        icon: <TbPencil size={23} />,
        className: "bg-darkest-blue text-white",
      },

    ],
  },
  {
    id: "2",
    label: "BOQ Split",
    component:<BOQSplit/>,
    buttons: [
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className: "dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
      },
      {
        label: "Filter",
        icon: <BiFilterAlt size={23} />,
        className: " dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
      },
    ],
  },
   {
    id: "3",
    label: " Rate Analysis",
    component:<RateAnalysis/>,
    buttons: [
      {
        label: "Edit",
        icon: <TbPencil size={23} />,
        className: "bg-darkest-blue text-white",
       navigateTo: "editrateanalysis",
      },

    ],
  },
   {
    id: "4",
    label: " Site Overheads",
    component:<SiteOverHead/>,
    buttons: [
      {
        label: "Edit",
        icon: <TbPencil size={23} />,
        className: "bg-darkest-blue text-white",
      },

    ],
  },
   {
    id: "5",
    label: " Materials",
    component:<Materials/>,
    buttons: [
          {
        label: "Add",
        icon: <HiMiniPlusSmall size={23} />,
        className: " dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
        modal: "add",
      },
      {
        label: "Edit",
        icon: <TbPencil size={23} />,
        className: "bg-darkest-blue text-white",
        modal: "edit",
      },

    ],
  },

     {
    id: "6",
    label: " Machine",
    component:<Machines/>,
    buttons: [
          {
        label: "Add",
        icon: <HiMiniPlusSmall size={23} />,
        className: " dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
      },
      {
        label: "Edit",
        icon: <TbPencil size={23} />,
        className: "bg-darkest-blue text-white",
      },

    ],
  },
     {
    id: "7",
    label: " Man Power",
    component:<ManPower/>,
    buttons: [
          {
        label: "Add",
        icon: <HiMiniPlusSmall size={23} />,
        className: " dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue",
      },
      {
        label: "Edit",
        icon: <TbPencil size={23} />,
        className: "bg-darkest-blue text-white",
      },

    ],
  },
];
const [openModal, setOpenModal] = useState({ action: null, tab: null });

const [searchParams, setSearchParams] = useSearchParams();
const defaultTab = tabs[0].id;
const activeTab = searchParams.get("tab") || defaultTab;

const handleTabChange = (id) => {
  setSearchParams({ tab: id });
};


  const activeTabData = tabs.find((tab) => tab.id === activeTab);
const buttonsWithHandlers = activeTabData.buttons.map((button) => {
  if (button.navigateTo) {
    return {
      ...button,
      onClick: () => navigate(button.navigateTo),
    };
  }

  if (button.modal) {
    return {
      ...button,
      onClick: () =>
        setOpenModal({ action: button.modal, tab: activeTab }),
    };
  }

  return button;
});



  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="font-roboto-flex flex justify-between items-center ">
          <Title
            title="Projects Management"
            sub_title="Zero Cost"
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
        <div className=" font-roboto-flex  cursor-pointer flex justify-between items-center ">
          <div className="flex flex-wrap gap-2 py-2.5 ">
            {tabs.map(({ id, label }) => (
              <p
                key={id}
                className={`flex gap-2 items-center px-4 py-2.5 font-medium rounded-lg text-sm whitespace-nowrap ${
                  activeTab === id
                    ? "bg-darkest-blue text-white"
                    : "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue "
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
      {openModal.action === "add" && openModal.tab === "5" && (
  <AddMaterial onclose={() => setOpenModal({ action: null, tab: null })} />
)}

{openModal.action === "edit" && openModal.tab === "5" && (
  <EditMaterial onclose={() => setOpenModal({ action: null, tab: null })} />
)}
    </>
  );
};

export default ZeroCost;
