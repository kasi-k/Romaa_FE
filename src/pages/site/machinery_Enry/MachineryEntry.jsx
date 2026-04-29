import React, { useState, useEffect, useCallback } from "react";
import { TbPlus, TbRefresh, TbSearch } from "react-icons/tb";
import axios from "axios";
import { toast } from "react-toastify";
import BulkLogModal from "./BulkLogModal";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { API } from "../../../constant";

const MachineryEntry = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [assetSearch, setAssetSearch] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const projectId = localStorage.getItem("tenderId");

  // Fetch Logs Function
  const fetchLogs = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/machinerylogs/project/${projectId}`, {
        params: { 
          startDate, 
          endDate, 
          assetName: assetSearch // Pass asset filter to API
        },
      });
      if (res.data.status) {
        setData(res.data.data || []);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, [projectId, startDate, endDate, assetSearch]);

  // Debounce Effect: Triggers fetch 500ms after user stops typing or changing dates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 font-sans">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row  items-start md:items-center px-6 py-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 gap-4">
        <Title
          title="Machinery Management"
          
        />
         

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Asset Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TbSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Filter by Asset Name..."
              className="pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all w-40 focus:w-56 placeholder-gray-400"
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <input
              type="date"
              className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 outline-none px-2 cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 outline-none px-2 cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

         
          <button
            onClick={fetchLogs}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
            title="Refresh Data"
          >
            <TbRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>

         <Button
            button_name="Add Daily Log"
            button_icon={<TbPlus size={18} />}
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          />
        </div>
        
      </div>

      {/* --- Table Container --- */}
      <div className="flex-1 overflow-auto ">
        <div className=" overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left border-collapse min-w-[1600px]">
              {/* --- Grouped Headers --- */}
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase font-bold text-gray-500 dark:text-gray-400 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-28 bg-gray-50 dark:bg-gray-900 sticky left-0 z-20 text-center"
                  >
                    #
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-28 bg-gray-50 dark:bg-gray-900 sticky left-10 z-20"
                  >
                    Date
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-36 bg-gray-50 dark:bg-gray-900 sticky left-27 z-20"
                  >
                    Asset
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-64"
                  >
                    Description of Work (BOQ)
                  </th>

                  {/* Meter Group */}
                  <th
                    colSpan={3}
                    className="px-2 py-1 border-b border-r border-gray-200 dark:border-gray-700 text-center bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400"
                  >
                    Meter Reading
                  </th>

                  {/* Fuel Group */}
                  <th
                    colSpan={4}
                    className="px-2 py-1 border-b border-r border-gray-200 dark:border-gray-700 text-center bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400"
                  >
                    Fuel Log (Liters)
                  </th>

                  {/* Dimensions Group */}
                  <th
                    colSpan={3}
                    className="px-2 py-1 border-b border-r border-gray-200 dark:border-gray-700 text-center bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400"
                  >
                    Dimensions
                  </th>

                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 text-right w-24 bg-emerald-50/20 dark:bg-emerald-900/5"
                  >
                    Total Qty
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16"
                  >
                    Unit
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 text-right w-24"
                  >
                    Rent (₹)
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 w-48"
                  >
                    Remarks
                  </th>
                </tr>

                {/* Sub Headers */}
                <tr>
                  {/* Meter Sub */}
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-20 bg-blue-50/20">
                    Start
                  </th>
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-20 bg-blue-50/20">
                    End
                  </th>
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-20 bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    Net
                  </th>

                  {/* Fuel Sub */}
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16 bg-amber-50/20">
                    Open
                  </th>
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16 bg-amber-50/20">
                    Issued
                  </th>
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16 bg-amber-50/20">
                    Close
                  </th>
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16 bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                    Used
                  </th>

                  {/* Dims Sub */}
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16 bg-emerald-50/20">
                    L
                  </th>
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16 bg-emerald-50/20">
                    B
                  </th>
                  <th className="px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16 bg-emerald-50/20">
                    D
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan="16"
                      className="px-4 py-12 text-center text-gray-500 animate-pulse font-medium"
                    >
                      Loading logs...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="16"
                      className="px-4 py-12 text-center text-gray-400 italic"
                    >
                      No logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr
                      key={row._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                    >
                      {/* Fixed Columns */}
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 whitespace-nowrap text-gray-600 dark:text-gray-300 font-mono text-xs bg-white dark:bg-gray-800 sticky left-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40 z-10 text-center">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 whitespace-nowrap text-gray-600 dark:text-gray-300 font-mono text-xs bg-white dark:bg-gray-800 sticky left-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40 z-10">
                        {new Date(row.logDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-xs font-semibold text-blue-600 dark:text-blue-400 truncate bg-white dark:bg-gray-800 sticky left-27 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40 z-10">
                        {row.assetName}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs min-w-[250px]">
                        <div className="font-bold text-[10px] text-gray-400 mb-0.5">
                          {row.item_id}
                        </div>
                        <div className="line-clamp-2" title={row.itemName}>
                          {row.itemName}
                        </div>
                      </td>

                      {/* Meter Data */}
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono">
                        {row.startReading}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono">
                        {row.endReading}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center font-bold text-blue-700 bg-blue-50/10 dark:text-blue-400">
                        {row.netUsage}
                      </td>

                      {/* Fuel Data */}
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono">
                        {row.fuelOpening}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-800 dark:text-gray-200 font-bold text-xs font-mono">
                        {row.fuelIssued}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono">
                        {row.fuelClosing}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center font-bold text-amber-700 bg-amber-50/10 dark:text-amber-400">
                        {row.fuelConsumed}
                      </td>

                      {/* Dimensions */}
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono">
                        {row.length || "-"}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono">
                        {row.breadth || "-"}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono">
                        {row.depth || "-"}
                      </td>

                      {/* Output */}
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-right font-bold text-emerald-600 bg-emerald-50/5 dark:text-emerald-400">
                        {row.quantity}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                        {row.unit}
                      </td>

                      {/* Rent */}
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-right font-medium text-gray-800 dark:text-gray-200 font-mono">
                        {row.rent?.toLocaleString() || 0}
                      </td>

                      {/* Remarks */}
                      <td
                        className="px-4 py-3 text-xs text-gray-500 italic truncate max-w-[150px]"
                        title={row.remarks}
                      >
                        {row.remarks || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          {!loading && data.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex gap-6 overflow-x-auto">
              <span>
                Entries: <b>{data.length}</b>
              </span>
              <span>
                Total Usage:{" "}
                <b>
                  {data
                    .reduce((sum, r) => sum + (r.netUsage || 0), 0)
                    .toFixed(1)}
                </b>
              </span>
              <span>
                Fuel Consumed:{" "}
                <b>
                  {data
                    .reduce((sum, r) => sum + (r.fuelConsumed || 0), 0)
                    .toFixed(1)}{" "}
                  L
                </b>
              </span>
              <span>
                Fuel Issued:{" "}
                <b>
                  {data
                    .reduce((sum, r) => sum + (r.fuelIssued || 0), 0)
                    .toFixed(1)}{" "}
                  L
                </b>
              </span>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <BulkLogModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchLogs}
        />
      )}
    </div>
  );
};

export default MachineryEntry;