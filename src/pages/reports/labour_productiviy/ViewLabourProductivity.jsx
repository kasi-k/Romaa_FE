import React from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { ArrowBigLeft, Pencil } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "recharts";
import { BsBack } from "react-icons/bs";

const ViewLabourProductivity = () => {
  const { state } = useLocation();
  const employee = state?.item || {};
  const navigate = useNavigate();

  if (!employee) {
    return <div className="p-4 text-red-600">No employee data found.</div>;
  }

  return (
    <>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title
          title="Reports"
          sub_title="
          Labour Productivity"
          page_title="Labour Productivity"
        />

        <ButtonBg
          button_name="Back"
          button_icon={<ArrowBigLeft size={16} />}
          onClick={() =>
            navigate("/reports/labourproductivity", {
              state: { employee: employee },
            })
          }
        />
      </div>
      <div className="bg-white w-full flex flex-col sm:grid grid-cols-2 gap-y-2 rounded-md px-4 py-6">
        <div className="col-span-2 flex justify-center items-center mb-4 ">
          <p className="text-xl font-semibold"> Labour Productivity</p>
        </div>
        {[
          { label: "Description", value: "Manual Excavation" },
          { label: "Output", value: "100 cft" },
          { label: "No. of Tradesmen", value: "2 Labour" },
          { label: "Description", value: "Excavation" },
          { label: "Output", value: "100 cft" },
          { label: "No. of Tradesmen", value: "2 Labour" },
          { label: "Remarks", value: "-" },
        ].map((item, index) => (
          <div
            className="flex flex-col col-span-2 sm:grid grid-cols-2 w-full space-y-2"
            key={index}
          >
            <p className="text-sm col-span-1 font-bold text-gray-800">
              {item.label}
            </p>
            <p className="text-sm col-span-1 text-gray-600">{item.value}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ViewLabourProductivity;
