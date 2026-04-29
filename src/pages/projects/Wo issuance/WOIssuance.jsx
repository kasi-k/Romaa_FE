import Title from "../../../components/Title";
import { useSearchParams } from "react-router-dom";
import WORequest from "./work order request/WORequest";
import WorkOrderIssuance from "./Work order issuance/WorkOrderIssuance";

const tabs = [
  {
    id: "1",
    label: "Work Order Enquiry",
    component: (reloadTrigger) => <WORequest reloadTrigger={reloadTrigger} />,
    buttons: [],
  },
  {
    id: "2",
    label: "Work Order Issuance",
    component: () => <WorkOrderIssuance />,
    buttons: [],
  },
];

const WoIssuance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = tabs[0].id;
  const activeTab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (id) => {
    setSearchParams({ tab: id });
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const buttonsWithHandlers = activeTabData.buttons.map((button) => {
    return button;
  });

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="font-roboto-flex flex justify-between items-center ">
          <Title
            title="Projects Management"
            sub_title="WOR"
            active_title={activeTabData?.label}
          />
          <div className="flex gap-2">
            {buttonsWithHandlers.map((button, index) => (
              <button
                key={index}
                className={`cursor-pointer w-fit text-sm flex items-center gap-2 px-4 py-2 rounded-md ${button.className}`}
                onClick={button.  onClick}
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
                className={`flex gap-2 items-center px-4 py-2 font-medium rounded-lg text-sm  whitespace-nowrap ${
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
        <div className=" h-full overflow-y-auto  no-scrollbar ">
          {activeTabData?.component()}
        </div>

      </div>
    </>
  );
};

export default WoIssuance;
