import React, { useState } from "react";
import Title from "../../../components/Title";

const ViewPurchaseRequestSite = () => {
  const [mainFields] = useState([
    {
      label: "Request ID",
      value: "PR-002",
      tooltip: "Unique identifier for the purchase request",
    },
    {
      label: "Material",
      value: "Steel Rods",
      tooltip: "Material requested for purchase",
    },
    {
      label: "Unit",
      value: "Ton",
      tooltip: "Measurement unit for the material",
    },
    {
      label: "Quantity",
      value: 5,
      tooltip: "Requested quantity",
    },
    {
      label: "Site Location",
      value: "Site B",
      tooltip: "Location where material is required",
    },
    {
      label: "Required On",
      value: "2024-06-12",
      tooltip: "Date by which material is required",
    },
    {
      label: "Status",
      value: "Approved",
      tooltip: "Current status of the request",
    },
  ]);

  // Tooltip wrapper
  const TooltipWrapper = ({ tooltip, children }) => {
    if (!tooltip) return children;
    return (
      <div className="relative group inline-block cursor-help">
        {children}
        <div className="absolute z-10 hidden group-hover:block bg-indigo-100 text-black text-xs font-semibold px-3 py-1 rounded shadow-md -top-6 left-36 -translate-x-1/2 w-52 whitespace-normal">
          {tooltip}
          <div className="absolute -bottom-1 left-1 w-3.5 h-3 bg-indigo-100 transform rotate-45"></div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Title title="Site Management" active_title="Purchase Request Details" />
      <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-3">
        <p className="font-semibold text-center text-lg">
          Purchase Request Details
        </p>
        <div className="grid grid-cols-12 gap-2 items-start mt-3">
          {mainFields.map((field, idx) => (
            <React.Fragment key={idx}>
              <p className="col-span-6 font-medium">{field.label}</p>
              <div className="col-span-6">
                <TooltipWrapper tooltip={field.tooltip}>
                  <span className="text-xs opacity-70">{field.value}</span>
                </TooltipWrapper>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseRequestSite;
