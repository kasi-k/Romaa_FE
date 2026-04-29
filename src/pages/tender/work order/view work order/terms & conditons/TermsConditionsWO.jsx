import { useState } from "react";
import PriceEscalation from "./tabs/PriceEscalation";
import ClientsupplyMaterials from "./tabs/ClientsupplyMaterials";
import MaterialAdvance from "./tabs/MaterialAdvance";
import TechnicalSpecifications from "./tabs/TechnicalSpecifications";
import OtherTerms from "./tabs/OtherTerms";
import Notes from "./tabs/Notes";
import Button from "../../../../../components/Button";
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";



const tabs = [
  // {
  //   id: "1",
  //   label: "Price Escalation",
  //   component:<PriceEscalation/>,
  // },
  // {
  //   id: "2",
  //   label: "Client Supply Materails",
  //   component:<ClientsupplyMaterials/>,

  // },
  // {
  //   id: "3",
  //   label: "Materail Advance",
  //   component:<MaterialAdvance/>,

  // },
  // {
  //   id: "4",
  //   label: "Technical Specifications",
  //   component:<TechnicalSpecifications/>,
 
  // },
  {
    id: "5",
    label: "Other Terms",
    component:<OtherTerms/>,
   
  },
  {
    id: "6",
    label: "Notes",
    component:<Notes/>,

  },
];

const TermsConditionsWO = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className=" font-roboto-flex  cursor-pointer flex justify-between items-center  ">
          <div className="flex flex-wrap gap-2 pt-2.5 ">
            {tabs.map(({ id, label }) => (
              <p
                key={id}
                className={`flex gap-2 items-center px-4 py-2.5 font-medium rounded-lg text-sm whitespace-nowrap ${
                  activeTab === id
                    ? "dark:bg-layout-dark  dark:text-white bg-white text-darkest-blue"
                    : "dark:text-white text-darkest-blue"
                }`}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </p>
            ))}
          </div>
        </div>
        <div className=" h-full overflow-y-auto  no-scrollbar">
          {activeTabData?.component}
        </div>
                     <div className="flex justify-end py-2 ">
          <Button
            onClick={() => navigate("..")}
            button_name="Back"
            button_icon={<IoChevronBackSharp/>}
          />
        </div>
      </div>
    </>
  );
};

export default TermsConditionsWO;
