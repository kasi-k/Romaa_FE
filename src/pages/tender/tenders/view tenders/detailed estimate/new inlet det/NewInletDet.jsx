import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../../constant";
import Loader from "../../../../../../components/Loader";
import { TbChevronRight, TbChevronDown } from "react-icons/tb";

const NewInletDet = ({ name }) => {
  const { tender_id } = useParams();
  const [detailedEstimate, setDetailedEstimate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [delayedLoading, setDelayedLoading] = useState(false);

  const fetchDetailedEstimate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getdatacustomhead?tender_id=${tender_id}&nametype=${name}`,
      );
      setDetailedEstimate(res.data.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch detailed estimate");
    } finally {
      setLoading(false);
    }
  }, [tender_id, name]);

  useEffect(() => {
    fetchDetailedEstimate();
  }, [fetchDetailedEstimate]);

  const toggleExpand = (abstractId) => {
    setExpandedAbstract((prev) => (prev === abstractId ? null : abstractId));
  };

  useEffect(() => {
    let timer;
    if (loading) {
      setDelayedLoading(true);
    } else {
      timer = setTimeout(() => setDelayedLoading(false), 500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 font-sans">
      {delayedLoading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Loader />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto relative">
          {/* --- Main Table Header (Sticky) --- */}
          <div className="sticky top-0 z-10 grid grid-cols-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-2">Abstract ID</div>
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* --- Table Body --- */}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {detailedEstimate.length > 0 ? (
              detailedEstimate.map((item, index) => {
                const abs = item.abstract_details || {};
                const isExpanded = expandedAbstract === item.abstract_id;

                return (
                  <div
                    key={item.abstract_id || index}
                    className="bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {/* Abstract Row */}
                    <div
                      onClick={() => toggleExpand(item.abstract_id)}
                      className={`grid grid-cols-12 px-4 py-3 items-center cursor-pointer text-sm ${isExpanded ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                    >
                      <div className="col-span-1 text-center text-gray-400 text-xs">
                        {index + 1}
                      </div>
                      <div className="col-span-2 font-semibold text-red-600 dark:text-red-400">
                        {item.abstract_id}
                      </div>
                      <div
                        className="col-span-6 text-gray-800 dark:text-gray-200 truncate pr-4"
                        title={abs.description}
                      >
                        {abs.description || "-"}
                      </div>
                      <div className="col-span-2 text-right font-medium text-gray-900 dark:text-gray-100">
                        {abs.quantity || 0}{" "}
                        <span className="text-xs text-gray-500 font-normal">
                          {abs.unit}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-center text-gray-400">
                        {isExpanded ? (
                          <TbChevronDown size={18} />
                        ) : (
                          <TbChevronRight size={18} />
                        )}
                      </div>
                    </div>

                    {/* Detailed Breakdown (Expanded Area) */}
                    {isExpanded && (
                      <div className="col-span-12 bg-gray-50 dark:bg-black/20 p-4 border-t border-gray-100 dark:border-gray-800 shadow-inner">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-2 font-semibold w-1/3">
                                  Particulars
                                </th>
                                <th className="px-4 py-2 font-semibold text-center w-[10%]">
                                  Nos
                                </th>
                                <th className="px-4 py-2 font-semibold text-right w-[12%]">
                                  Length
                                </th>
                                <th className="px-4 py-2 font-semibold text-right w-[12%]">
                                  Breadth
                                </th>
                                <th className="px-4 py-2 font-semibold text-right w-[12%]">
                                  Depth
                                </th>
                                <th className="px-4 py-2 font-semibold text-right w-[15%] text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                                  Content
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {(item.breakdown || []).length > 0 ? (
                                item.breakdown.map((detail, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                  >
                                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
                                      {detail.particulars}
                                    </td>
                                    <td className="px-4 py-2 text-center text-gray-600 dark:text-gray-400">
                                      {detail.nos}
                                    </td>
                                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                                      {detail.l}
                                    </td>
                                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                                      {detail.b}
                                    </td>
                                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                                      {detail.d_h}
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800/50">
                                      {detail.content}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-gray-400 text-xs italic"
                                  >
                                    No detailed breakdown available for this
                                    item.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No Data Found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try uploading an estimate file.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewInletDet;
