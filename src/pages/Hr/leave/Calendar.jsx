import React, { useState, useEffect, useCallback } from "react";
import { FiCalendar, FiUpload, FiSearch, FiRefreshCw, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { API } from "../../../constant";
import UploadCalendar from "./UploadCalendar";
import AddHolidayModal from "./AddHolidayModal";
import DeleteModal from "../../../components/DeleteModal";
import { useDeleteHoliday } from "./hooks/useLeave";
import { toast } from "react-toastify";

const Calendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Fetch Data ---
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/calendar/list`, { withCredentials: true });
      if (res.data && res.data.data) {
        setHolidays(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMutation = useDeleteHoliday({ onSuccess: fetchHolidays });

  // Initial Load
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // --- Filter Logic ---
  const filteredData = holidays.filter((item) => {
    const lowerSearch = searchTerm.toLowerCase();
    const readableDate = new Date(item.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).toLowerCase();
    const description = item.description ? item.description.toLowerCase() : "";
    return (
      item.name.toLowerCase().includes(lowerSearch) ||
      item.type.toLowerCase().includes(lowerSearch) ||
      description.includes(lowerSearch) ||
      readableDate.includes(lowerSearch)
    );
  });

  const TYPE_COLORS = {
    Weekend: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    National: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    Regional: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Optional: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in-up">

      {/* --- Toolbar --- */}
      <div className="pb-3 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Left: Title */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><FiCalendar /></span>
            Holiday Calendar
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchHolidays}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`text-lg ${loading ? "animate-spin" : ""}`} />
          </button>

          <div className="relative w-full sm:w-56">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={() => { setEditItem(null); setAddModal(true); }}
            className="flex items-center gap-2 bg-darkest-blue hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <FiPlus className="text-base" />
            <span>Add Holiday</span>
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <FiUpload className="text-base" />
            <span>Bulk Upload</span>
          </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
        <table className="w-full text-left border-collapse">
          <thead className="bg-darkest-blue sticky top-0 z-10">
            <tr className="text-white text-[11px] font-bold uppercase tracking-widest">
              <th className="px-6 py-3 rounded-tl-xl">Date</th>
              <th className="px-6 py-3">Holiday Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-layout-dark">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-200 font-medium">
                    {new Date(row.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    <span className="block text-xs text-gray-400 font-normal mt-0.5">
                      {new Date(row.date).toLocaleDateString("en-US", { weekday: "long" })}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800 dark:text-white font-medium">{row.name}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[row.type] || "bg-gray-100 text-gray-600"}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {row.description || <span className="italic text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditItem(row); setAddModal(true); }}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteItem(row)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <FiCalendar className="text-4xl text-gray-300 mb-2" />
                    <p>No holidays found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 flex justify-between">
        <span>Showing {filteredData.length} of {holidays.length} records</span>
      </div>

      {/* Modals */}
      {isUploadModalOpen && (
        <UploadCalendar
          onclose={() => setUploadModalOpen(false)}
          onSuccess={() => { fetchHolidays(); setUploadModalOpen(false); }}
        />
      )}
      {addModal && (
        <AddHolidayModal
          item={editItem}
          onclose={() => { setAddModal(false); setEditItem(null); }}
          onSuccess={fetchHolidays}
        />
      )}
      {deleteItem && (
        <DeleteModal
          deletetitle="Delete Holiday"
          item={deleteItem}
          idKey="_id"
          onclose={() => setDeleteItem(null)}
          onDelete={() => {
            deleteMutation.mutate(deleteItem._id);
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
