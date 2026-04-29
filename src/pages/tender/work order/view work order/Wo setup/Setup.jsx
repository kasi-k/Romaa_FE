import { useState } from "react";
import GeneralSetup from "./tabs/GeneralSetup";
import WBSRequired from "./tabs/WBSRequired";
import MaterialOptions from "./tabs/MaterialOptions";
import OthersSetup from "./tabs/OthersSetup";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../components/Button";
import { IoChevronBackSharp } from "react-icons/io5";



const tabs = [
  {
    id: "1",
    label: "General",
    component:<GeneralSetup/>,
  },
  // {
  //   id: "2",
  //   label: "WBS Required",
  //   component:<WBSRequired/>,


  // },
  // {
  //   id: "3",
  //   label: "Materail Options",
  //   component:<MaterialOptions/>,


  // },
  // {
  //   id: "4",
  //   label: "Others",
  //   component:<OthersSetup/>,

 
  // },

 
];

const Setup = () => {
      const navigate =  useNavigate();
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className=" font-roboto-flex  cursor-pointer flex justify-between items-center  ">
          <div className="flex flex-wrap gap-2 py-2.5 ">
            {tabs.map(({ id, label }) => (
              <p
                key={id}
                className={`flex gap-2 items-center px-4 py-2.5 font-medium rounded-lg text-sm whitespace-nowrap ${
                  activeTab === id
                    ? "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue"
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

export default Setup;
