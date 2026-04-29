import React, { useState, useEffect, useCallback } from "react";
import {
  TbPlus,
  TbRefresh,
  TbSearch,
  TbFilterOff,
  TbBuildingArch,
  TbCalendar,
} from "react-icons/tb";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { API } from "../../../constant";
import Loader from "../../../components/Loader";

const MachineryTracking = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Filter States ---
  const [filters, setFilters] = useState({
    projectId: "", // Default to current project, but editable
    assetName: "",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0], // Start of month
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  // Handle Input Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Clear all filters to fetch EVERYTHING
  const clearFilters = () => {
    setFilters({
      projectId: "",
      assetName: "",
      startDate: "",
      endDate: "",
    });
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Build query object, removing empty keys
      const params = {};
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.assetName) params.assetName = filters.assetName;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axios.get(`${API}/machinerylogs/getall-logs`, {
        params,
      });

      if (res.data.status) {
        setData(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce Fetch on Filter Change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 600); // 600ms delay for smooth typing
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 font-sans">
      {/* --- Header & Search Bar --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center px-6 py-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 gap-4">
        <Title title="Machinery Management" active_title="All Logs" />

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* Project Filter */}
          <div className="relative group flex-1 xl:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TbBuildingArch className="text-gray-400" />
            </div>
            <input
              type="text"
              name="projectId"
              placeholder="All Projects"
              className="pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500 w-full xl:w-32 uppercase placeholder-gray-500"
              value={filters.projectId}
              onChange={handleFilterChange}
            />
          </div>

          {/* Asset Filter */}
          <div className="relative group flex-1 xl:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TbSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              name="assetName"
              placeholder="Search Asset..."
              className="pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 w-full xl:w-48"
              value={filters.assetName}
              onChange={handleFilterChange}
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <TbCalendar className="text-gray-400 ml-1" size={16} />
            <input
              type="date"
              name="startDate"
              className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 outline-none w-24"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              name="endDate"
              className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 outline-none w-24"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          {/* Actions */}
          <button
            onClick={clearFilters}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
            title="Clear Filters"
          >
            <TbFilterOff size={18} />
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
            title="Refresh"
          >
            <TbRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="flex-1 overflow-hidden px-1  flex flex-col">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <table className="w-full text-sm text-left border-collapse min-w-[1600px]">
              {/* --- Headers --- */}
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase font-bold text-gray-500 dark:text-gray-400 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-10 bg-gray-50 dark:bg-gray-900 sticky left-0 z-20"
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
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-24 bg-gray-50 dark:bg-gray-900 sticky left-38 z-20"
                  >
                    Project
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-36 bg-gray-50 dark:bg-gray-900 sticky left-62 z-20"
                  >
                    Asset
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-b border-r border-gray-200 dark:border-gray-700 w-64"
                  >
                    Description (BOQ)
                  </th>

                  <th
                    colSpan={3}
                    className="px-2 py-1 border-b border-r border-gray-200 dark:border-gray-700 text-center bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400"
                  >
                    Meter Reading
                  </th>
                  <th
                    colSpan={4}
                    className="px-2 py-1 border-b border-r border-gray-200 dark:border-gray-700 text-center bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400"
                  >
                    Fuel Log (L)
                  </th>
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
                <tr>
                  <th className="th-sub bg-blue-50/20">Start</th>{" "}
                  <th className="th-sub bg-blue-50/20">End</th>{" "}
                  <th className="th-sub bg-blue-100/50 dark:bg-blue-900/30 text-blue-800">
                    Net
                  </th>
                  <th className="th-sub bg-amber-50/20">Open</th>{" "}
                  <th className="th-sub bg-amber-50/20">Issued</th>{" "}
                  <th className="th-sub bg-amber-50/20">Close</th>{" "}
                  <th className="th-sub bg-amber-100/50 dark:bg-amber-900/30 text-amber-800">
                    Used
                  </th>
                  <th className="th-sub bg-emerald-50/20">L</th>{" "}
                  <th className="th-sub bg-emerald-50/20">B</th>{" "}
                  <th className="th-sub bg-emerald-50/20">D</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="17">
                      <Loader />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="17"
                      className="px-4 py-20 text-center text-gray-400 italic"
                    >
                      No logs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr
                      key={row._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                    >
                      {/* Fixed Columns */}
                      <td className="td-fixed text-center left-0 w-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40">
                        {index + 1}
                      </td>
                      <td className="td-fixed text-center left-10 w-28 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40">
                        {new Date(row.logDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="td-fixed text-center left-38 w-24 font-bold text-gray-500 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40">
                        {row.projectId}
                      </td>
                      <td
                        className="td-fixed text-center left-62 w-36 font-bold text-blue-600 dark:text-blue-400 truncate group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40"
                        title={row.assetName}
                      >
                        {row.assetName}
                      </td>

                      {/* BOQ */}
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs min-w-[250px]">
                        <div className="font-bold text-[10px] text-gray-400">
                          {row.item_id}
                        </div>
                        <div className="line-clamp-1" title={row.itemName}>
                          {row.itemName || "Unknown Item"}
                        </div>
                      </td>

                      {/* Values */}
                      <td className="td-num">{row.startReading}</td>
                      <td className="td-num">{row.endReading}</td>
                      <td className="td-num font-bold text-blue-700 bg-blue-50/10">
                        {row.netUsage}
                      </td>

                      <td className="td-num">{row.fuelOpening}</td>
                      <td className="td-num font-bold text-gray-800 dark:text-white">
                        {row.fuelIssued}
                      </td>
                      <td className="td-num">{row.fuelClosing}</td>
                      <td className="td-num font-bold text-amber-700 bg-amber-50/10">
                        {row.fuelConsumed}
                      </td>

                      <td className="td-num">{row.length || "-"}</td>
                      <td className="td-num">{row.breadth || "-"}</td>
                      <td className="td-num">{row.depth || "-"}</td>

                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-right font-bold text-emerald-600 bg-emerald-50/5">
                        {row.quantity}
                      </td>
                      <td className="px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                        {row.unit}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-right font-medium font-mono">
                        {row.rent?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 italic truncate max-w-[150px]">
                        {row.remarks || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          {!loading && data.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex gap-8 overflow-x-auto font-mono">
              <span>
                RECORDS:{" "}
                <b className="text-gray-900 dark:text-white">{data.length}</b>
              </span>
              <span>
                TOTAL USAGE:{" "}
                <b className="text-blue-600">
                  {data
                    .reduce((sum, r) => sum + (r.netUsage || 0), 0)
                    .toFixed(1)}
                </b>
              </span>
              <span>
                TOTAL FUEL:{" "}
                <b className="text-amber-600">
                  {data
                    .reduce((sum, r) => sum + (r.fuelConsumed || 0), 0)
                    .toFixed(1)}{" "}
                  L
                </b>
              </span>
              <span>
                TOTAL RENT:{" "}
                <b className="text-emerald-600">
                  ₹{" "}
                  {data
                    .reduce((sum, r) => sum + (r.rent || 0), 0)
                    .toLocaleString()}
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

      <style>{`
        .th-sub { @apply px-2 py-2 border-b border-r border-gray-200 dark:border-gray-700 text-center w-16; }
        .td-fixed { @apply px-4 py-3 border-r border-gray-100 dark:border-gray-800 text-xs bg-white dark:bg-gray-800 sticky z-10 font-mono text-gray-600 dark:text-gray-300; }
        .td-num { @apply px-2 py-3 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500 text-xs font-mono; }
      `}</style>
    </div>
  );
};

export default MachineryTracking;
