import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";

const fields = [
  { label: "Start Date", key: "startDate" },
  { label: "End Date", key: "endDate" },
  { label: "Project Value", key: "projectValue" },
  { label: "Payment Collected", key: "paymentCollected" },
  { label: "Billed", key: "billed" },
  { label: "To Be Billed", key: "toBeBilled" },
];

const ViewClientBilling = () => {
  const { state } = useLocation();
  const project = state?.item || {};
  const navigate = useNavigate();

  if (!project) {
    return <div className="p-4 text-red-600">No project data found.</div>;
  }

  return (
    <>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title
          title="Report"
          sub_title="Client Billing"
          page_title="View Client Billing"
        />
        <ButtonBg button_name="Back" onClick={() => navigate(-1)} />
      </div>

      <div className="dark:bg-layout-dark bg-white w-full  mx-auto rounded-md px-6 py-6">
        <p className="font-bold text-center text-xl px-2 mb-2">Client Billing</p>

        <div className="grid grid-cols-9 text-sm gap-y-2">
          {fields.map(({ label, key }) => (
            <React.Fragment key={key}>
              <p className=" dark:text-gray-200 text-gray-800 col-span-4">
                {label}
              </p>
              <p className=" col-span-3 text-gray-600 dark:text-gray-500">
                {project[key] ?? "-"}
              </p>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default ViewClientBilling;
