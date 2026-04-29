import React from "react";
const wbsRequireddata = [
  { label: "Material Consumption Based on", value: "Yes" },
  { label: "Work Progress", value: "Yes" },
  { label: "Client Bill", value: "No " },
  { label: "Labor Bill", value: "No"},
  { label: "Material Consumption", value: "No"},
  { label: "Plant and Machinery", value: "No"},
];

const WBSRequired = () => {
  return (
    <div className="h-full">
      <div className="dark:bg-layout-dark bg-white w-full rounded-md p-6">
        <div className="flex flex-col col-span-2 sm:grid grid-cols-3 w-full gap-3">
          {wbsRequireddata.map((field, idx) => (
            <React.Fragment key={idx}>
              <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
                {field.label}
              </p>
              <p className="text-sm col-span-2 dark:text-gray-400 text-gray-600">
                {field.value}
              </p>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WBSRequired;