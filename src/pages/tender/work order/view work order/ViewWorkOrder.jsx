import { useNavigate, useSearchParams } from "react-router-dom";
import Title from "../../../../components/Title";
import WorkOrderOverview from "./Work order Overview/WorkOrderOverview";
import BoqWorkOrder from "./Work order Boq/BoqWorkOrder";
import WorkOrderAssets from "./work order assets/WorkOrderAssets";
import { TbFileExport, TbFilter } from "react-icons/tb";
import FinancialWorkOrder from "./work order financial/FinancialWorkOrder";
import TermsConditionsWO from "./terms & conditons/TermsConditionsWO";
import Setup from "./Wo setup/Setup";

const tabs = [
  {
    id: "1",
    label: "Work Order Overview",
    component: <WorkOrderOverview />,
    buttons: [
      // {
      //   label: "Export",
      //   icon: <TbFileExport size={23} />,
      //   className: "dark:bg-layout-dark dark:text-white bg-white text-darkest-blue",
      // },
      // {
      //   label: "Filter",
      //   icon: <TbFilter size={23} />,
      //   className: " dark:bg-layout-dark dark:text-white  bg-white text-darkest-blue",
      // },
    ],
  },
  {
    id: "2",
    label: "Zero Cost BOQ",
    component: <BoqWorkOrder />,
    buttons: [
      // {
      //   label: "Export",
      //   icon: <TbFileExport size={23} />,
      //   className: "dark:bg-layout-dark dark:text-white  bg-white text-darkest-blue",
      // },
      // {
      //   label: "Filter",
      //   icon: <TbFilter size={23} />,
      //   className: " dark:bg-layout-dark dark:text-white bg-white text-darkest-blue",
      // },
    ],
  },
  {
    id: "3",
    label: "Assets",
    component: <WorkOrderAssets />,
    buttons: [
      // {
      //   label: "Upload Assets",
      //   className: "bg-darkest-blue text-white",
      // },

      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className: " dark:bg-layout-dark dark:text-white  bg-white text-darkest-blue",
      },
    ],
  },
  {
    id: "4",
    label: "Financial",
    component: <FinancialWorkOrder />,
    buttons: [
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className: " dark:bg-layout-dark dark:text-white  bg-white text-darkest-blue",
      },
    ],
  },
  {
    id: "5",
    label: "Terms & Conditions",
    component: <TermsConditionsWO />,
    buttons: [
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className: " dark:bg-layout-dark dark:text-white  bg-white text-darkest-blue",
      },
    ],
  },
  {
    id: "6",
    label: "Setup",
    component: <Setup />,
    buttons: [
      {
        label: "Export",
        icon: <TbFileExport size={23} />,
        className: " dark:bg-layout-dark dark:text-white  bg-white text-darkest-blue",
      },
    ],
  },
];

const ViewWorkOrder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = tabs[0].id;
  const activeTab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (id) => {
    setSearchParams({ tab: id });
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const buttonsWithHandlers = (activeTabData.buttons || []).map((button) => {
    if (button.navigateTo) {
      return {
        ...button,
        onClick: () => navigate(button.navigateTo),
      };
    }

    if (button.modal) {
      return {
        ...button,
        onClick: () => setOpenModal({ action: button.modal, tab: activeTab }),
      };
    }

    return button;
  });

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="font-roboto-flex flex justify-between items-center ">
          <Title
            title="Tender Management"
            sub_title="Work Order"
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
    </>
  );
};

export default ViewWorkOrder;
