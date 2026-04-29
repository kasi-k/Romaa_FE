import React, { useState } from "react";
import { HiArrowsUpDown } from "react-icons/hi2";

const materialRequestData = [
  {
    name: "Cement",
    quantity: 50,
    unit: "Bags",
    status: "Approved",
  },
  {
    name: "Sand",
    quantity: 10,
    unit: "Tons",
    status: "Approved",
  },
  {
    name: "Bricks",
    quantity: 1000,
    unit: "Nos",
    status: "Approved",
  },
  {
    name: "Steel Rods",
    quantity: 200,
    unit: "Kg",
    status: "Approved",
  },
  {
    name: "Concrete Mix",
    quantity: 5,
    unit: "Cubic Meters",
    status: "Approved",
  },
];
const MaterialRequest = () => {


  return (
    <div className="dark:bg-layout-dark bg-white p-2 rounded-md shadow  h-full overflow-x-auto no-scrollbar">
      <h3 className="font-semibold mb-4 text-lg border-b border-input-bordergrey dark:border-border-dark-grey p-4">Materail Request</h3>
      <table className="w-full text-sm ">
        <thead >
          <tr className=" border-b dark:border-border-dark-grey border-input-bordergrey  dark:bg-layout-dark bg-white" >
            <th className="px-2  ">
             <p className=" flex items-center gap-2"> Name <HiArrowsUpDown /></p>
            </th>
            <th className="">
              <p className=" flex items-center gap-2"> Quantity
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="">
              <p className=" flex items-center gap-2"> Unit
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="">
              <p className=" flex items-center gap-2"> Status
              <HiArrowsUpDown />
              </p>
            </th>
            
          </tr>
        </thead>
        <tbody>
          {materialRequestData.map((row, index) => (
            <React.Fragment key={index}>
              <tr className=" border-b dark:border-border-dark-grey border-input-bordergrey">
                <td className="text-start px-2 py-1.5">{row.name}</td>
                <td className="px-4 text-start">{row.quantity}</td>
                <td>{row.unit}</td>
                <td className="text-green-800">{row.status}</td>
          
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialRequest;
