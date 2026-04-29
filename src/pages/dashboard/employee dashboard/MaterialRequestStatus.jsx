import React, { useState } from "react";
import { HiArrowsUpDown } from "react-icons/hi2";

const materialRequestData = [
  {
    requestId: "REQ-001",
    machineName: "Excavator",
    siteLocation: "Site A",
    date: "2025-07-01",
    status: "Approved",
    remarks: "Urgent",
  },
  {
    requestId: "REQ-002",
    machineName: "Concrete Mixer",
    siteLocation: "Site B",
    date: "2025-07-02",
    status: "Pending",
    remarks: "Awaiting approval",
  },
  {
    requestId: "REQ-003",
    machineName: "Crane",
    siteLocation: "Site C",
    date: "2025-07-03",
    status: "Rejected",
    remarks: "Insufficient stock",
  },
  {
    requestId: "REQ-004",
    machineName: "Loader",
    siteLocation: "Site D",
    date: "2025-07-04",
    status: "Approved",
    remarks: "Deliver by Friday",
  },
  {
    requestId: "REQ-005",
    machineName: "Bulldozer",
    siteLocation: "Site E",
    date: "2025-07-05",
    status: "Approved",
    remarks: "Waiting",
  },
];
const MaterialRequestStatus = () => {


  return (
    <div className="h-full overflow-x-auto no-scrollbar">
      <h3 className="font-semibold mb-4 text-lg border-b dark:border-border-dark-grey border-input-bordergrey p-4">Materail Request</h3>
      <table className="w-full text-sm ">
        <thead >
          <tr className=" border-b dark:border-border-dark-grey border-input-bordergrey  dark:bg-layout-dark bg-white" >
            <th className="px-2 py-2  ">
            S.no 
            </th>
            <th className="px-2">
              <p className=" flex items-center gap-2"> Request ID
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="px-2">
              <p className=" flex items-center gap-2"> Machine Name
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="">
              <p className=" flex items-center gap-2"> Site Location
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="">
              <p className=" flex items-center gap-2"> Date
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="">
              <p className=" flex items-center gap-2"> Status
              <HiArrowsUpDown />
              </p>
            </th>
            <th className="">
            Remarks
            </th>
            
            
          </tr>
        </thead>
        <tbody>
          {materialRequestData.map((row, index) => (
            <React.Fragment key={index}>
              <tr className="text-center border-b dark:border-border-dark-grey border-input-bordergrey">
                <td className=" px-2 py-2">{index+1}</td>
                <td className="">{row.requestId}</td>
                <td>{row.machineName}</td>
                <td >{row.siteLocation}</td>
                <td >{row.date}</td>
                <td >{row.status}</td>
                <td >{row.remarks}</td>
          
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialRequestStatus;
