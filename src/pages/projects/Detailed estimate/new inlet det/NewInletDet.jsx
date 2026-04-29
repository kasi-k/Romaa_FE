import React from "react";
import Loader from "../../../../components/Loader";
import { useProject } from "../../../../context/ProjectContext";
import { useNewInletDet } from "../../hooks/useProjects";


const BoqProjectsColumns = [
  { label: "Particulars", key: "particulars" },
  { label: "Number", key: "nos" },
  { label: "Length", key: "l" },
  { label: "Breadth", key: "b" },
  { label: "Density", key: "d_h" },
  { label: "Contents", key: "content" },
];

const NewInletDet = ({ name }) => {
  const { tenderId } = useProject();
  // const [showUpload, setShowUpload] = useState(false);

  // 1. Fetch data using TanStack Query
  const { 
    data: detailedEstimate = [], 
    isLoading 
  } = useNewInletDet(tenderId, name);

  // (Optional) Expand/Collapse logic if you decide to hide breakdowns by default
  // const [expandedAbstract, setExpandedAbstract] = useState(null);
  // const toggleExpand = (abstractId) => {
  //   setExpandedAbstract((prev) => (prev === abstractId ? null : abstractId));
  // };

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading ? (
        <Loader />
      ) : (
        <>

          {/* ✅ ONLY TABLE SCROLLS */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="rounded-lg bg-slate-50 dark:bg-layout-dark">
              {/* HEADER */}
              <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold border-b border-gray-200 dark:border-gray-700">
                <div className="col-span-1">S.no</div>
                <div className="col-span-2">Abstract ID</div>
                <div className="col-span-6">Item Description</div>
                <div className="col-span-3 text-right">Quantity</div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {detailedEstimate.map((item, index) => {
                  const abs = item.abstract_details || {};

                  return (
                    <div key={item.abstract_id || index} className="py-4">
                      {/* Abstract Row */}
                      <div className="grid grid-cols-12 px-8 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <div className="col-span-1">{index + 1}</div>
                        <div className="col-span-2">{item.abstract_id}</div>
                        <div className="col-span-6 pr-4">
                          {abs.description || "N/A"}
                        </div>
                        <div className="col-span-3 text-right">
                          {abs.quantity || "N/A"}
                        </div>
                      </div>

                      {/* Breakdown Table */}
                      <div className="px-6 pb-2 pt-2">
                        <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                          <table className="min-w-full text-xs">
                            <thead className="bg-darkest-blue text-white">
                              <tr>
                                {BoqProjectsColumns.map((col) => (
                                  <th
                                    key={col.key}
                                    className="px-4 py-2 text-left font-semibold uppercase tracking-wider"
                                  >
                                    {col.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {(item.breakdown || []).map((detail, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                  {BoqProjectsColumns.map((col) => (
                                    <td key={col.key} className="px-4 py-2">
                                      {detail[col.key] !== undefined && detail[col.key] !== null 
                                        ? detail[col.key] 
                                        : "N/A"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {(!item.breakdown || item.breakdown.length === 0) && (
                                <tr>
                                  <td colSpan={BoqProjectsColumns.length} className="px-4 py-3 text-center text-gray-500 italic">
                                    No breakdown details available.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {detailedEstimate.length === 0 && (
                  <div className="py-12 text-center text-gray-500 font-medium bg-white dark:bg-layout-dark">
                    No matching results found for {name}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewInletDet;