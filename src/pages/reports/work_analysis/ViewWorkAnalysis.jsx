import React from "react";
import { Pencil } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";

const fields = [
  { label: "Project", key: "project" },
  { label: "Location", key: "location" },
  { label: "Start Date", key: "startDate" },
  { label: "Status", key: "status" },
  { label: "Pending", key: "pending" },
  { label: "Project Manager", key: "projectManager" },

];

const ViewWorkAnalysis = () => {
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
          sub_title="Work Analysis"
          page_title="View Work Analysis"
        />
        <ButtonBg
          button_name="Back"
          onClick={() => navigate(-1)}
        />
      </div>

      <div className="dark:bg-layout-dark bg-white w-full  mx-auto rounded-md px-6 py-6">
        <p className="grid grid-cols-2 mb-2">
          <span></span>
          <span className="font-bold text-xl px-2">Work Analysis</span>
        </p>
        <div className="grid grid-cols-2 text-sm gap-y-2">
          {fields.map(({ label, key }) => (
            <React.Fragment key={key}>
              <p className="font-semibold dark:text-gray-200 text-gray-800">{label}</p>
              <p className="text-gray-600 dark:text-gray-500">{project[key] ?? "-"}</p>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default ViewWorkAnalysis;