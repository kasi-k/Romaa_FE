import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import ScheduleMetaCard from "../tabs/daily/Table"; // your meta card

const ScheduleTable = ({ scheduleData }) => {
  const [expandedMajorIdx, setExpandedMajorIdx] = useState(null);
  const [expandedSubIdx, setExpandedSubIdx] = useState(null);
  const [expandedSubworkIdx, setExpandedSubworkIdx] = useState(null);

  if (!scheduleData || scheduleData.length === 0) {
    return (
      <div className="py-8 text-center text-red-500 dark:text-red-300 bg-white dark:bg-layout-dark">
        No schedule data available
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Loop through each schedule */}
      {scheduleData.map((schedule, sidx) => (
        <div key={sidx} className="mb-8">
          {/* Show Schedule Meta */}
          {schedule && <ScheduleMetaCard meta={schedule} />}

          {/* Expandable Table for Major Headings */}
          {schedule.majorHeadings?.map((major, midx) => (
            <div key={midx} className="mb-6">
              {/* Major Heading */}
              <div
                className="dark:bg-layout-dark bg-slate-700 text-white font-semibold px-2 py-2 cursor-pointer flex justify-between"
                onClick={() =>
                  setExpandedMajorIdx(expandedMajorIdx === `${sidx}-${midx}` ? null : `${sidx}-${midx}`)
                }
              >
                <span>{major.majorHeadingName || "-"}</span>
                {expandedMajorIdx === `${sidx}-${midx}` ? <ChevronUp /> : <ChevronDown />}
              </div>

              {/* Subheadings */}
              {expandedMajorIdx === `${sidx}-${midx}` &&
                major.subheadings?.map((sub, subidx) => (
                  <div key={subidx} className="mb-2 ml-2">
                    <div
                      className="bg-blue-300 text-black px-2 py-1 my-1 font-semibold flex justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedSubIdx(
                          expandedSubIdx === `${sidx}-${midx}-${subidx}` ? null : `${sidx}-${midx}-${subidx}`
                        )
                      }
                    >
                      <span>{sub.customworks || "-"}</span>
                      {expandedSubIdx === `${sidx}-${midx}-${subidx}` ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {/* Subworks */}
                    {expandedSubIdx === `${sidx}-${midx}-${subidx}` &&
                      sub.subworks?.map((subwork, swidx) => (
                        <div key={swidx} className="ml-4 mb-2">
                          <div
                            className="bg-indigo-500 px-2 py-1 font-medium flex justify-between cursor-pointer dark:text-black"
                            onClick={() =>
                              setExpandedSubworkIdx(
                                expandedSubworkIdx === `${sidx}-${midx}-${subidx}-${swidx}` ? null : `${sidx}-${midx}-${subidx}-${swidx}`
                              )
                            }
                          >
                            <span>
                              {subwork.subworkName || "-"} | Unit: {subwork.Unit} | Qty: {subwork.total_Qty}
                            </span>
                            {expandedSubworkIdx === `${sidx}-${midx}-${subidx}-${swidx}` ? <ChevronUp /> : <ChevronDown />}
                          </div>

                          {expandedSubworkIdx === `${sidx}-${midx}-${subidx}-${swidx}` && (
                            <table className="w-full text-sm mt-1 mb-4 rounded shadow dark:text-black">
                              <thead>
                                <tr className="bg-indigo-200">
                                  <th className="px-2 py-1">Description</th>
                                  <th className="px-2 py-1">Unit</th>
                                  <th className="px-2 py-1">Qty</th>
                                  <th className="px-2 py-1">Executed Qty</th>
                                  <th className="px-2 py-1">Balance Qty</th>
                                  <th className="px-2 py-1">Start Date</th>
                                  <th className="px-2 py-1">End Date</th>
                                  <th className="px-2 py-1">Duration</th>
                                  <th className="px-2 py-1">Status</th>
                                  <th className="px-2 py-1">Days Remaining</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subwork.workDetails?.length > 0 ? (
                                  subwork.workDetails.map((wd, widx) => (
                                    <tr key={widx} className="bg-white border-b text-center">
                                      <td className="px-2 py-1">{wd.description || "-"}</td>
                                      <td className="px-2 py-1">{wd.unit || "-"}</td>
                                      <td className="px-2 py-1">{wd.qty ?? "-"}</td>
                                      <td className="px-2 py-1">{wd.executedQty ?? "-"}</td>
                                      <td className="px-2 py-1">{wd.balanceQty ?? "-"}</td>
                                      <td className="px-2 py-1">
                                        {wd.startDate ? format(new Date(wd.startDate), "yyyy-MM-dd") : "-"}
                                      </td>
                                      <td className="px-2 py-1">
                                        {wd.endDate ? format(new Date(wd.endDate), "yyyy-MM-dd") : "-"}
                                      </td>
                                      <td className="px-2 py-1">{wd.duration ?? "-"}</td>
                                      <td className="px-2 py-1">{wd.status ?? "-"}</td>
                                      <td className="px-2 py-1">{wd.daysRemaining ?? "-"}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={10} className="text-red-500 py-3">
                                      No work details available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ScheduleTable;
