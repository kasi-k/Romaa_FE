import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Summary from "./summary/Summary";
import BOQSplit from "./boq split/BOQSplit";
import RateAnalysis from "./Rate analysis/RateAnalysis";
import SiteOverHead from "./Site overheads/SiteOverHead";
import Materials from "./materials/Materials";
import AddMaterial from "./materials/AddMaterial";
import EditMaterial from "./materials/EditMaterial";
import Machines from "./machines/Machines";
import ManPower from "./man power/ManPower";
import { IoChevronBackSharp } from "react-icons/io5";
import Button from "../../../../../components/Button";
import Title from "../../../../../components/Title";
import { MdArrowBackIosNew } from "react-icons/md";


  const tabs = [
  {
    id: "1",
    label: " Summary",
    component:<Summary/>,

  },
  {
    id: "2",
    label: "BOQ Split",
    component:<BOQSplit/>,

  },
   {
    id: "3",
    label: " Rate Analysis",
    component:<RateAnalysis/>,

  },
   {
    id: "4",
    label: " Site Overheads",
    component:<SiteOverHead/>,
   

  
  },
   {
    id: "5",
    label: " Materials",
    component:<Materials/>,
  
  },

     {
    id: "6",
    label: " Machine",
    component:<Machines/>,

  },
     {
    id: "7",
    label: " Man Power",
    component:<ManPower/>,
  
  },
];


const TenderZeroCost = () => {
  const { tender_id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/tender/tenders/viewtender/${tender_id}?tab=5`);
  };
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header Balance with Top Back Arrow */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-darkest-blue dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm"
            title="Go Back"
          >
            <MdArrowBackIosNew size={18} className="translate-x-0.5" />
          </button>
          <Title page_title=" Tender Zero Cost" />
        </div>
        
        <div className="font-roboto-flex cursor-pointer flex justify-between items-center py-2">
          <div className="flex flex-wrap gap-2 ">
            {tabs.map(({ id, label }) => (
              <p
                key={id}
                className={`flex gap-2 items-center px-4 py-2.5 font-medium rounded-lg text-sm whitespace-nowrap transition-opacity ${
                  activeTab === id
                    ? "bg-darkest-blue text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-darkest-blue dark:text-slate-300 hover:opacity-80"
                }`}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Independent Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
        <div className="mt-4">
          {activeTabData?.component}
        </div>
      </div>
    </div>
  );
};

export default TenderZeroCost;
