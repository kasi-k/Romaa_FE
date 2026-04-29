import React from "react";
import Title from "../../../../components/Title";
import ButtonBg from "../../../../components/Button";
import { Pencil } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ViewTableReport = () => {
  const { state } = useLocation();
  const employee = state?.item || {};
  const navigate = useNavigate();

  console.log(employee);
  

  if (!employee) {
    return <div className="p-4 text-red-600">No employee data found.</div>;
  }

  return (
    <>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title
          title="Reports"
          sub_title="Planned vs Actual"
          page_title="View"
        />

        <ButtonBg
          button_name="Edit"
          button_icon={<Pencil size={16} />}
          onClick={() =>
            navigate("/reports/plannedvsactual", {
              state: { employee: employee },
            })
          }
        />
      </div>
     <div className="dark:bg-layout-dark bg-white w-full flex flex-col sm:grid grid-cols-2 gap-y-3 gap-x-6 rounded-md px-4 py-6">
  {/* Title */}
  <div className="col-span-2 flex justify-center items-center mb-4">
    <p className="text-xl font-semibold">Planned vs Actual</p>
  </div>

  <p className="text-xl font-bold text-gray-800">Description</p>
  <p className="text-sm text-gray-600">Earthwork</p>

  <p className="text-sm font-bold text-gray-800">Unit</p>
  <p className="text-sm text-gray-600">M3</p>

  <p className="text-sm font-bold text-gray-800">Quantity</p>
  <p className="text-sm text-gray-600">195.00</p>

  <p className="text-sm font-bold text-gray-800">Work Done Qty</p>
  <p className="text-sm text-gray-600">45</p>

  {/* Actual Labor Engaged Title */}
  <p className="text-xl font-bold text-gray-900 col-span-2 mt-3">Actual Labor Engaged</p>

  <p className="text-sm font-bold text-gray-800">Carpenter</p>
  <p className="text-sm text-gray-600">8.00</p>

  <p className="text-sm font-bold text-gray-800">Helper</p>
  <p className="text-sm text-gray-600">26</p>

  <p className="text-sm font-bold text-gray-800">Barbender</p>
  <p className="text-sm text-gray-600">8.00</p>

  <p className="text-sm font-bold text-gray-800">Helper</p>
  <p className="text-sm text-gray-600">6</p>

  <p className="text-sm font-bold text-gray-800">Amount Paid</p>
  <p className="text-sm text-gray-600">₹7658</p>

  {/* Actual Rate/Sqm */}
  <p className="text-xl font-bold text-gray-900 col-span-2 mt-3">Actual Rate/Sqm</p>

  <p className="text-sm font-bold text-gray-800">Rate/Sqm</p>
  <p className="text-sm text-gray-600">₹7658</p>

  {/* Actual Rate/MT */}
  <p className="text-xl font-bold text-gray-900 col-span-2 mt-3">Actual Rate/MT</p>

  <p className="text-sm font-bold text-gray-800">Rate/MT</p>
  <p className="text-sm text-gray-600">₹7658</p>

  {/* As per Standard Rate */}
  <p className="text-xl font-bold text-gray-900 col-span-2 mt-3">As per Standard Rate</p>

  <p className="text-sm font-bold text-gray-800">Rate/Sqm (200+50)</p>
  <p className="text-sm text-gray-600">₹7658</p>

  <p className="text-sm font-bold text-gray-800">Rate/MT (Rs 7000)</p>
  <p className="text-sm text-gray-600">₹7658</p>

  <p className="text-sm font-bold text-gray-800">Productive</p>
  <p className="text-sm text-green-600 font-semibold">₹5,508.10</p>

  <p className="text-sm font-bold text-gray-800">Unproductive</p>
  <p className="text-sm text-red-600 font-semibold">₹5,508.10</p>
</div>

    </>
  );
};

export default ViewTableReport;