import { useState } from "react";
import GeneralFinancial from "./general/GeneralFinancial";
import PaymentTerms from "./payment terms/PaymentTerms";
import Deposit from "./deposit/Deposit";
import Button from "../../../../../components/Button";
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import PriceEscalation from "../terms & conditons/tabs/PriceEscalation";


const tabs = [
  {
    id: "1",
    label: "General",
    component:<GeneralFinancial/>,
  },
  {
    id: "2",
    label: "Payment Terms",
    component:<PaymentTerms/>,
  },
  {
    id: "3",
    label: "Price Escalation",
    component:<PriceEscalation/>,
  },
];

const FinancialWorkOrder = () => {
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

export default FinancialWorkOrder;
