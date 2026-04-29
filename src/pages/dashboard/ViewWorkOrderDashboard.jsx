import React from "react";
import { IoClose } from "react-icons/io5";
import { ViewOrderDashboarddata } from "../../components/Data";
import { IoEyeOutline } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { TbPencil } from "react-icons/tb";

const ViewWorkOrderDashboard = ({ onclose }) => {
  return (
    <div className=" font-layout-font fixed inset-0 flex justify-center items-center backdrop-blur-sm z-10">
      <div className="dark:bg-layout-dark bg-white rounded-lg drop-shadow-md w-fit h-fit">
        <p
          className=" cursor-pointer dark:bg-layout-dark bg-white grid place-self-end -mx-4 -my-4  shadow-sm  py-3 px-3 rounded-full"
          onClick={onclose}
        >
          <IoClose className="size-[20px]" />
        </p>
        <div className="grid justify-center px-8 py-2 gap-2">
          <p className="text-center font-bold text-lg ">Work Order</p>
          <div className="font-layout-font overflow-auto no-scrollbar">
            <table className=" w-[1000px] whitespace-nowrap">
              <thead className="dark:bg-overall_bg-dark bg-[#E3ECFF] dark:text-[#D6D6D6]">
                <tr className=" font-semibold text-sm  ">
                  <th className=" p-3.5 rounded-l-md">S.no</th>
                  {[
                    "Work order ID",
                    "Date",
                    "Client name",
                    "Project name",
                    "Location",
                    "Amount",
                  ].map((heading) => (
                    <th key={heading} className="p-2.5">
                      <h1 className="flex items-center justify-center gap-1">
                        {heading}
                      </h1>
                    </th>
                  ))}
                  <th className="pr-2 rounded-r-md">Actions</th>
                </tr>
              </thead>
              <tbody className=" rounded-2xl  dark:text-white text-gray-600   cursor-default">
                {ViewOrderDashboarddata.length > 0 ? (
                  ViewOrderDashboarddata.map((data, index) => (
                    <tr className="text-center  " key={index}>
                      <td className="rounded-l-lg ">{index + 1}</td>
                      <td>{data["Work order ID"]}</td>
                      <td>{data["Date"]}</td>
                      <td>{data["Client name"]}</td>
                      <td>{data["Project name"]}</td>
                      <td>{data["Location"]}</td>
                      <td>{data["Amount"]}</td>
                      <td className=" p-2.5  flex items-center justify-center gap-4">
                      
                        <p
                          className="dark:bg-icon-dark-blue bg-blue-100 dark:text-white text-blue-700 p-1.5 rounded-md"
                          title="Edit"
                        >
                          <TbPencil  size={16} />
                        </p>
                          <p
                          className=" dark:bg-icon-dark-green bg-green-100 dark:text-icontext-dark-green text-green-600 p-1.5 rounded "
                          title="View"
                        >
                          <IoEyeOutline size={16} />
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-10 text-gray-500"
                    >
                      No matching results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewWorkOrderDashboard;
