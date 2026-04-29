import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { RateAnalysisdata } from "../../../../components/Data";

const RateAnalysis = () => {
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
              <tr className="font-semibold text-sm dark:bg-layout-dark bg-white border-b-4 dark:border-border-dark-grey border-light-blue">
                <th className="p-3.5 rounded-l-lg">S.no</th>
                {["Description", "Unit", "Quantity", "Rate", "Amount"].map(
                  (heading) => (
                    <th key={heading} className="p-3">
                      <h1 className="flex items-center justify-center gap-2">
                        {heading} <HiArrowsUpDown size={18} />
                      </h1>
                    </th>
                  )
                )}
                <th className="pr-2 rounded-r-lg"></th>
              </tr>
            </thead>

            <tbody className="text-greyish  text-sm font-light">
              {RateAnalysisdata.length > 0
                ? RateAnalysisdata.map((data, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr className="border-b-[3px] dark:bg-layout-dark bg-white dark:border-border-dark-grey border-light-blue text-center">
                          <td className="rounded-l-lg py-3">{index + 1}</td>
                          <td>{data.Description}</td>
                          <td>{data.Unit}</td>
                          <td>{data.Quantity}</td>
                          <td>{data.Rate}</td>
                          <td>{data.Amount}</td>
                          <td className="rounded-r-lg">
                            <button
                              onClick={() => toggleRow(index)}
                              className="cursor-pointer bg-blue-200  text-lg mr-2 rounded-sm p-0.5 text-blue-600"
                            >
                              {expandedRow === index ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRow === index && (
                          <tr>
                            <td colSpan="7" className="px-10 py-1">
                              <div className="dark:bg-layout-dark bg-white p-4 text-center rounded-md">
                                {data.details && data.details.length > 0 ? (
                                  data.details.map((detail, i) => (
                                    <table
                                      className="w-full text-sm bg-indigo-200 "
                                      key={i}
                                    >
                                      <thead className="border-b-2 dark:border-border-dark-grey border-white">
                                        <tr>
                                          <th className="py-2 px-2 font-semibold">
                                            {detail.head}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="dark:bg-overall_bg-dark bg-gray-200  ">
                                        <tr className="border-b dark:border-border-dark-grey border-white">
                                          <td className="py-1.5 px-2 font-medium">
                                            {detail.desc}
                                          </td>
                                          <td className="py-1.5 px-2">
                                            {detail.day}
                                          </td>
                                          <td className="py-1.5 px-2">
                                            {detail.value}
                                          </td>
                                          <td className="py-1.5 px-2">
                                            {detail.rate}
                                          </td>
                                          <td className="py-1.5 px-2">
                                            {detail.amount}
                                          </td>
                                        </tr>
                                        <tr className="text-end border-b dark:border-border-dark-grey border-white">
                                          <td
                                            colSpan={5}
                                            className="py-1.5 px-22"
                                          >
                                            {detail.amount}
                                          </td>
                                        </tr>
                                        <tr className=" dark:bg-layout-dark bg-white text-end border-b dark:border-border-dark-grey border-white">
                                          <td className="font-semibold">
                                            Dismantling PCC Total =
                                          </td>
                                          <td
                                            colSpan={5}
                                            className="py-1.5 px-22"
                                          >
                                            {detail.amount}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  ))
                                ) : (
                                  <div className="text-red-500 py-4">
                                    No data available
                                  </div>
                                )}
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

export default RateAnalysis;
