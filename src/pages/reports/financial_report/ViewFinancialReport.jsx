import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";

const fields = [
  { label: "Project", key: "project" },
  { label: "Work Type", key: "workType" },
  { label: "Project Value", key: "projectValue" },
  { label: "Completed Value", key: "completedValue" },
  { label: "Current Profit", key: "currentProfit" },
  { label: "Predicted Profit", key: "predictedProfit" },
];

const ViewFinancialReport = () => {
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
          sub_title="Financial Report"
          page_title="View Financial Report"
        />
        <ButtonBg button_name="Back" onClick={() => navigate(-1)} />
      </div>

      <div className="dark:bg-layout-dark bg-white w-full mx-auto rounded-md px-6 py-6">
        <p className="font-bold text-center text-xl px-2 mb-2">Financial Report</p>

        <div className="grid grid-cols-9 text-sm gap-y-2">
          {fields.map(({ label, key }) => (
            <React.Fragment key={key}>
              <p className="font-semibold dark:text-gray-200 text-gray-800 col-span-4">
                {label}
              </p>
              <p className="text-gray-600 dark:text-gray-500 col-span-3">
                {project[key] ?? "-"}
              </p>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default ViewFinancialReport;
