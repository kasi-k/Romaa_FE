import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Title from "../../../../components/Title";
import { FiFilePlus } from "react-icons/fi";
import VendorFullDetails from "./tabs/VendorFullDetails";
import KYCDocuments from "./tabs/KYCDocuments";
import BillsPurchase from "./tabs/BillsPurchase";
import CreditDebit from "./tabs/CreditDebit";
import { API } from "../../../../constant";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "../../../../components/Loader";



const ViewVendorSupplier = () => {
  const location = useLocation();
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [_openModal, setOpenModal] = useState(null);

  useEffect(() => {
    if (!vendor) {
      const storedVendor = localStorage.getItem("selectedVendor");
      if (storedVendor) {
        setVendor(JSON.parse(storedVendor));
        setLoading(false);
      } else {
        axios.get(`${API}/vendor/getvendor/${vendorId}`).then((res) => {
          setVendor(res.data.data);
        }).finally(() => setLoading(false));
      }
    }
  }, [vendor, vendorId]);

  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = [
  {
    id: "1",
    label: "Vendor Full Details",
    outstandingAmount: "2121212",
    component:<VendorFullDetails vendor={vendor}/>,
  },
  {
    id: "2",
    label: "KYC Documents",
    outstandingAmount: "2121212",
    component:<KYCDocuments vendor={vendor}/>,
    buttons: [
      {
        label: "Upload Documents",
        icon: <FiFilePlus size={23} />,
        className: "bg-darkest-blue text-white",
      },
    ],
  },
  {
    id: "3",
    label: "Bills",
    outstandingAmount: "2121212",
    component:<BillsPurchase vendor={vendor}/>,
    buttons: [
      {
        label: "Upload Bills",
        icon: <FiFilePlus size={23} />,
        className: "bg-darkest-blue text-white",
      },
    ],
  },
  {
    id: "4",
    label: "Credit/Debit",
    outstandingAmount: "2121212",
    component:<CreditDebit vendor={vendor}/>,
  },
];
  const defaultTab = tabs[0].id;
  const activeTab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (id) => {
    setSearchParams({ tab: id });
  };

  

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const outstandingAmount = activeTabData?.outstandingAmount || 0;
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


  if (loading) return <Loader />;

  return (
    <>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="font-roboto-flex flex justify-between items-center ">
          <Title
            title="Purchase Management"
            sub_title="Vendor & supplier"
            active_title={activeTabData?.label}
          />
          <div className="flex gap-6 items-center">
            <div className="flex gap-2 ">
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
            <p className="grid text-sm font-light">
              Outstanding Amount
              <span className="font-bold text-2xl">
                ₹ {Number(outstandingAmount || 0).toLocaleString("en-IN")}
              </span>
            </p>
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

export default ViewVendorSupplier;
