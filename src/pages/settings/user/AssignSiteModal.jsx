import React, { useState } from "react";
import { FiX, FiSearch, FiMapPin, FiCheck, FiSave, FiAlertCircle } from "react-icons/fi";
import { useTendersForAssignment } from "./hooks/useUsers";
import Loader from "../../../components/Loader";


const AssignSitesModal = ({ initialSelected = [], onClose, onSave }) => {
  const [selectedIds, setSelectedIds] = useState(initialSelected); // Stores _id strings
  const [search, setSearch] = useState("");

  // --- Fetch Data using TanStack Query ---
  const { data: tenders = [], isLoading: loading } = useTendersForAssignment();

  // --- Toggle Selection ---
  const toggleSite = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) 
        ? prev.filter((item) => item !== id) // Remove
        : [...prev, id] // Add
    );
  };

  // --- Filter Logic ---
  const filteredTenders = tenders.filter((t) => 
    t.tender_id.toLowerCase().includes(search.toLowerCase()) ||
    (t.tender_project_name && t.tender_project_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/20 dark:text-purple-400">
                <FiMapPin size={20} />
              </span>
              Assign Sites
            </h2>
            <p className="text-xs text-gray-500 mt-1">Select projects to assign to this employee</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <FiX size={22} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Tender ID or Project Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <Loader />
          ) : filteredTenders.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center text-gray-400">
                <FiAlertCircle size={30} className="mb-2 opacity-50"/>
                <p>No sites found matching "{search}"</p>
            </div>
          ) : (
            filteredTenders.map((tender) => {
              const isSelected = selectedIds.includes(tender._id);
              return (
                <div 
                  key={tender._id}
                  onClick={() => toggleSite(tender._id)}
                  className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" 
                      : "bg-white border-gray-100 hover:border-purple-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-purple-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? "bg-purple-600 border-purple-600 text-white" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    }`}>
                      {isSelected && <FiCheck size={12} />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-gray-800 dark:text-gray-200"}`}>
                        {tender.tender_id}
                      </p>
                      {tender.tender_project_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {tender.tender_project_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500">
            {selectedIds.length} site(s) selected
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button 
              onClick={() => onSave(selectedIds)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <FiSave /> Save Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignSitesModal;