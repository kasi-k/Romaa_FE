import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import {
  RateAnalysisdata,
  siteoverheaddata,
} from "../../../../components/Data";

const SiteOverHead = () => {
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
                {[
                  "Item Description",
                  "Nos",
                  "Months",
                  "Value",
                  "factor",
                  "Amount",
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

            <tbody className="text-greyish  text-sm font-light">
              {siteoverheaddata.length > 0
                ? siteoverheaddata.map((data, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr className="border-b-[3px] dark:bg-layout-dark bg-white dark:border-border-dark-grey border-light-blue text-center">
                          <td className="rounded-l-lg py-3">{index + 1}</td>
                          <td>{data.description}</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
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
                            <td colSpan="8" className="px-10 py-1">
                              <div className="dark:bg-layout-dark bg-white p-4 text-center rounded-md shadow">
                                {data.details?.items &&
                                data.details.items.length > 0 ? (
                                  <table className="w-full text-sm">
                                    {/* Group title header */}
                                    <thead className="bg-indigo-100 text-left">
                                      <tr>
                                        <th
                                          colSpan="6"
                                          className="px-4 py-2 font-semibold"
                                        >
                                          {data.details?.headTitle ||
                                            "Resources"}
                                        </th>
                                      </tr>
                                    </thead>

                                    {/* Data rows */}
                                    <tbody className="dark:bg-overall_bg-dark bg-gray-100 ">
                                      {data.details.items.map((item, i) => (
                                        <tr
                                          key={i}
                                          className="border-t dark:border-border-dark-grey border-white"
                                        >
                                          <td className="px-4 py-2 font-medium">
                                            {item.desc}
                                          </td>
                                          <td className="px-4 py-2">
                                            {item.nos}
                                          </td>
                                          <td className="px-4 py-2">
                                            {item.months}
                                          </td>
                                          <td className="px-4 py-2">
                                            {item.value.toLocaleString()}
                                          </td>
                                          <td className="px-4 py-2">
                                            {item.factor}
                                          </td>
                                          <td className="px-4 py-2">
                                            ₹{item.amount.toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="py-6 text-gray-500 font-medium">
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

export default SiteOverHead;
