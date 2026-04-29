import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { RetainingAbstractdata } from "../../../../components/Data";
import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const RetainingAbstractSite = () => {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(false);
  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="font-roboto-flex flex flex-col h-full">
      <div className="mt-4 overflow-y-auto no-scrollbar ">
        <div className="overflow-auto no-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="font-semibold text-sm dark:bg-layout-dark dark:border-border-dark-grey bg-white border-b-4 border-light-blue">
                <th className="p-3.5 rounded-l-lg">S.no</th>
                {[
                  "Description",
                  "Unit",
                  "Planned Qty",
                  "Executed Qty",
                  "Rate",
                  "Costs",
                ].map((heading) => (
                  <th key={heading} className="p-3">
                    <h1 className="flex items-center justify-center gap-2">
                      {heading} <HiArrowsUpDown size={18} />
                    </h1>
                  </th>
                ))}
                <th className="pr-2 rounded-r-lg"></th>
              </tr>
            </thead>

            <tbody className="text-greyish dark:text-gray-200  text-sm font-light">
              {RetainingAbstractdata.length > 0
                ? RetainingAbstractdata.map((data, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr className="border-b-[3px] dark:bg-layout-dark dark:border-border-dark-grey bg-white border-light-blue text-center">
                          <td className="rounded-l-lg py-3">{index + 1}</td>
                          <td>{data.description}</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td className="rounded-r-lg flex items-center justify-center gap-2 mt-2">
                            <p
                              onClick={() => navigate("viewretainingabstractsite",{ state: { item: data } })}
                              className="cursor-pointer bg-green-200  rounded-sm  p-2  text-green-600"
                            >
                              <FiEye />
                            </p>
                            <p
                              onClick={() => toggleRow(index)}
                              className="cursor-pointer bg-blue-200  rounded-sm p-0.5 text-blue-600"
                            >
                              {expandedRow === index ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </p>
                          </td>
                        </tr>

                        {expandedRow === index && (
                          <tr>
                            <td colSpan="8" className="px-10 py-1  ">
                              <div className="dark:bg-layout-dark bg-white px-4 py-4 rounded-md ">
                                <table className="w-full text-center  text-sm table-fixed ">
                                  <tbody className="dark:bg-overall_bg-dark bg-gray-200">
                                    {data.details && data.details.length > 0 ? (
                                      <>
                                        {data.details.map((detail, i) => (
                                          <tr
                                            key={i}
                                            className="border-b-2 dark:border-border-dark-grey border-white "
                                          >
                                            <td className="py-1.5 text-start px-8">
                                              {String.fromCharCode(97 + i)}){" "}
                                              {detail.item}
                                            </td>
                                            <td>{detail.nos}</td>
                                            <td>{detail.plannedQty}</td>
                                            <td>{detail.executedQty}</td>
                                            <td>{detail.rate}</td>
                                            <td>{`₹ ${detail.costs}`}</td>
                                          </tr>
                                        ))}
                                        <tr className="dark:bg-indigo-400 dark:text-black bg-input-bordergrey">
                                          <td
                                            className="py-1.5 text-right px-4 font-semibold"
                                            colSpan={5}
                                          >
                                            Total
                                          </td>
                                          <td className="py-2">
                                               {`₹ ${data.total || data.details.reduce((acc, curr) => acc + (curr.costs || 0), 0)}`}
                                          </td>
                                        </tr>
                                      </>
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan="6"
                                          className="text-center py-4 text-red-500"
                                        >
                                          No data available
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                : ""}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RetainingAbstractSite;
