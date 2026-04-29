import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { RetainingWallReportData } from "../../../components/Data";
import Title from "../../../components/Title";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import Button from "../../../components/Button";

const LabourProductivity = () => {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <Title
          title="Reports"
          sub_title="Labour Productivity"
          page_title="Labour Productivity"
        />

        <div className="flex items-center gap-3">
          <Button
            button_icon={<TbFileExport size={22} />}
            button_name="Export"
            bgColor="bg-white"
            textColor="text-darkest-blue"
          />

          <Button
            button_icon={<BiFilterAlt size={22} />}
            button_name="Filter"
            bgColor="bg-white"
            textColor="text-darkest-blue"
          />
        </div>
      </div>
      <div className="font-roboto-flex flex flex-col h-full">
        <div className="mt-4 overflow-y-auto no-scrollbar">
          <div className="overflow-auto no-scrollbar">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="font-semibold text-sm dark:bg-layout-dark dark:border-border-dark-grey bg-white border-b-4 border-light-blue">
                  <th className="p-3.5 rounded-l-lg">S.no</th>
                  {[
                    "Description",
                    "Nos",
                    "Length",
                    "Breadth",
                    "Depth",
                    "Contents",
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

              <tbody className="text-greyish dark:text-gray-200 text-sm font-light">
                {RetainingWallReportData.length > 0 &&
                  RetainingWallReportData.map((data, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b-[3px] dark:bg-layout-dark bg-white dark:border-border-dark-grey border-light-blue text-center">
                        <td className="rounded-l-lg py-3">{index + 1}</td>
                        <td>{data.description}</td>
                        <td>{data.nos}</td>
                        <td>{data.length}</td>
                        <td>{data.breadth}</td>
                        <td>{data.depth}</td>
                        <td>{data.contents}</td>
                        <td className="rounded-r-lg flex items-center justify-center gap-2 mt-2">
                          <p
                            onClick={() => navigate("viewlabourproductivity")}
                            className="cursor-pointer bg-green-200 rounded-sm p-2 text-green-600"
                          >
                            <FiEye />
                          </p>
                          <p
                            onClick={() => toggleRow(index)}
                            className="cursor-pointer bg-blue-200 rounded-sm p-0.5 text-blue-600"
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
                          <td colSpan="8" className="px-10 py-1">
                            <div className="dark:bg-layout-dark bg-white px-4 py-4 rounded-md">
                              <table className="w-full text-center text-sm table-fixed">
                                <tbody className="dark:bg-overall_bg-dark bg-gray-200">
                                  {data.details && data.details.length > 0 ? (
                                    data.details.map((detail, i) => (
                                      <tr
                                        key={i}
                                        className="border-b-2 border-white dark:border-border-dark-grey"
                                      >
                                        <td className="py-1.5">
                                          {detail.item}
                                        </td>
                                        <td>{detail.output}</td>
                                        <td>{detail.tradmen}</td>
                                        <td>{detail.remarks}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="4"
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
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabourProductivity;
