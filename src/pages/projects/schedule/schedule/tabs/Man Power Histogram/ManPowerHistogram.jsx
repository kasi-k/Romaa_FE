import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FiEye } from "react-icons/fi";
import {manpowerhistogramData} from "../../../../../../components/Data"
import { useNavigate } from "react-router-dom";

const ManPowerHistogram = () => {
  const [expandedRow, setExpandedRow] = useState(null);
const navigate = useNavigate();
  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <div className="mt-4 overflow-y-auto no-scrollbar">
        <div className="overflow-auto no-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="font-semibold text-sm bg-white border-b-4 border-light-blue">
                <th className="p-3.5 rounded-l-lg">S.no</th>
                {["Description", "Quantity", "Units", "Start Date", "Days Remaining","No of man power"].map((heading) => (
                  <th key={heading} className="p-3">
                    <h1 className="flex items-center justify-center gap-2">
                      {heading} <HiArrowsUpDown size={18} />
                    </h1>
                  </th>
                ))}
                <th className="pr-2 rounded-r-lg">Action</th>
              </tr>
            </thead>

            <tbody className="text-greyish text-sm font-light">
              {manpowerhistogramData?.length > 0 &&
                manpowerhistogramData.map((data, index) => (
                  <React.Fragment key={index}>
                    <tr className="border-b-[3px] bg-white border-light-blue text-center">
                      <td className="rounded-l-lg py-3">{index + 1}</td>
                      <td>{data.description}</td>
                      <td>{data.quantity}</td>
                      <td>{data.unit}</td>
                      <td>{data.startDate}</td>
                      <td>{data.daysRemaining}</td>
                      <td>{data.manPower}</td>

                      <td className="rounded-r-lg flex items-center justify-center gap-2 mt-2 px-4">
                        <p className="cursor-pointer bg-green-200 rounded-sm p-1.5 text-green-600"
                        onClick={() =>
                              navigate(
                                "/projects/projectschedule/viewmanpowerhistogram",
                                { state: { item: data } }
                              )
                            }>
                          <FiEye />
                        </p>
                        <p
                          onClick={() => toggleRow(index)}
                          className="cursor-pointer bg-blue-200 rounded p-0.5 text-blue-600"
                        >
                          {expandedRow === index ? <ChevronUp /> : <ChevronDown />}
                        </p>
                      </td>
                    </tr>

                    {expandedRow === index && (
                      <tr>
                        <td colSpan="7" className="px-6 py-1">
                          <div className="bg-blue-50 px-4 py-2 rounded-md">
                            <table className="w-full text-sm table-fixed">
                              <tbody>
                                {data.details?.map((detail, i) => (
                                  <tr
                                    key={i}
                                    className="bg-gray-200 border-b border-white text-center"
                                  >
                                    <td className="text-start pl-4 py-1 font-medium whitespace-nowrap">
                                      {String.fromCharCode(97 + i)}) {detail.contractor}
                                    </td>
                                    <td></td>
                                    <td className="py-1 text-center">{detail.quantity}</td>
                                    <td className="py-1">{detail.unit}</td>
                                    <td className="py-1">{detail.startDate}</td>
                                    <td className="py-1">{detail.daysRemaining}</td>
                                    <td className="py-1">{detail.manPower}</td>
                                    
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManPowerHistogram;
