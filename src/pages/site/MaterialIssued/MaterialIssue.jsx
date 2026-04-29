import React, { useEffect, useState } from "react";
import { TbPlus, TbFilter, TbSearch, TbEye } from "react-icons/tb";
import axios from "axios";
import { API } from "../../../constant";
import { Box,  } from "lucide-react"; // Icon for empty state
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import AddMaterialIssue from "./AddMaterialIssue";


const MaterialIssue = () => {
  const tenderId = localStorage.getItem("tenderId");

  const navigate = useNavigate();

  // --- State ---
  const [bulkMaterials, setBulkMaterials] = useState([]);
  const [consumableMaterials, setConsumableMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Bulk Material");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Fetch Data ---
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/material/list/${tenderId}`);
      const data = res.data.data || [];

      const bulk = data.filter((item) => item.category === "MT-BL");
      const consumable = data.filter((item) => item.category === "MT-CM");

      setBulkMaterials(bulk);
      setConsumableMaterials(consumable);
    } catch (err) {
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) fetchMaterials();
  }, [tenderId]);

  // --- Filtering Logic ---
  const rawData = activeTab === "Bulk Material" ? bulkMaterials : consumableMaterials;
  
  const currentData = rawData.filter((item) =>
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

const handleView = (itemId) => {
  navigate(`/site/materialissuedsite/viewmaterialissued`,
    {
      state: {
        itemId,
        tenderId,
      },
    }
  );
};

  return (
    <div className="h-full flex flex-col  dark:bg-[#0b0f19] p-2 font-roboto-flex overflow-hidden">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Material Received</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Site Management / <span className="font-medium text-gray-700 dark:text-gray-300">{activeTab}</span>
          </p>
        </div>

           <Button
              button_name=" Add Material Issue"
              button_icon={<TbPlus size={18} />}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            />
        
      </div>

      {/* --- Tabs & Toolbar --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-4 gap-4">
        
        {/* Tabs */}
        <div className="flex space-x-6 w-full sm:w-auto overflow-x-auto">
          {["Bulk Material", "Consumable Material"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto pb-2 sm:pb-0">
          <div className="relative w-full sm:w-64">
            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <TbFilter className="text-lg" />
          </button>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="flex-1 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto h-full custom-scrollbar">
          <table className="w-full text-sm text-left">
            
            {/* Table Header */}
            <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500 dark:bg-gray-700/50 dark:text-gray-300 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4 min-w-[200px]">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Unit</th>
                <th className="px-6 py-4 text-center">Budgeted Qty</th>
                <th className="px-6 py-4 text-center">Total Issued Qty</th>
                <th className="px-6 py-4 text-center">Action</th>

              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                /* Loading Skeleton Rows */
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-2">{i + 1}</td>
                    <td className="px-6 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div></td>
                    <td className="px-6 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div></td>
                    <td className="px-6 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-12 mx-auto"></div></td>
                    <td className="px-6 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-16 mx-auto"></div></td>
                    <td className="px-6 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-16 mx-auto"></div></td>
                    <td className="px-6 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : currentData.length > 0 ? (
                /* Data Rows */
                currentData.map((item, index) => {
                  // Logic for status badge (Example logic: received > 0 means active)
                  const isActive = item.total_received_qty > 0;
                  
                  return (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {item.description}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400">
                        {item.unit}
                      </td>
                      <td className="px-6 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        {item.total_budgeted_qty?.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="font-bold text-slate-900 dark:text-slate-400  px-2.5 py-0.5">
                          {item.total_issued_qty?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button onClick={() => handleView(item.item_id)} className=" flex items-center gap-2  hover:bg-gray-50  dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                         <TbEye size={16} /> <p className="text-xs">View</p>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan="7">  
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                      <Box size={48} strokeWidth={1} className="mb-3 opacity-50" />
                      <p className="text-sm font-medium">No materials found for {activeTab}</p>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 text-blue-600 hover:underline text-sm font-medium"
                      >
                        Add your first entry
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modals --- */}
      {isAddModalOpen && (
        <AddMaterialIssue 
          onclose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            fetchMaterials();
          }} 
        />
      )}

    </div>
  );
};

export default MaterialIssue;
