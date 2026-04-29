import React from "react";
const MaterialOptiondata = [
  { label: "Material Consumption Based on", value: "Site Requirement" },
  { label: "Item wise issue required", value: "Yes" },
  { label: "Issue Rate Based on", value: "Last Purchase Rate" },
  { label: "Issue Based on", value: "Indent Approval" },
  { label: "Transfer Based on", value: "Stock Transfer Note" },
];

const MaterialOptions = () => {
  return (
    <div className="h-full">
      <div className="dark:bg-layout-dark bg-white w-full rounded-md p-6">
        <div className="flex flex-col col-span-2 sm:grid grid-cols-3 w-full gap-3">
          {MaterialOptiondata.map((field, idx) => (
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

export default MaterialOptions;