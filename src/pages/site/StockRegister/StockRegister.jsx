import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API } from "../../../constant";
import {
  Package,

  AlertTriangle,
  CheckCircle2,
  Search,

  XCircle,
  Layers,
  Archive
} from "lucide-react";

// --- Components ---

// Progress Bar Component
const ProgressBar = ({ received, total }) => {
  // Prevent division by zero
  const percentage = total > 0 ? Math.min((received / total) * 100, 100) : 0;

  let colorClass = "bg-blue-500";
  if (percentage >= 100) colorClass = "bg-green-500";
  else if (percentage > 80) colorClass = "bg-yellow-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

// Stock Status Badge
const StockStatusBadge = ({ currentStock, budget }) => {
  const percentage = budget > 0 ? (currentStock / budget) * 100 : 0;

  if (currentStock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
        <XCircle size={14} /> Out of Stock
      </span>
    );
  }
  // Low Stock Warning (< 25%)
  if (percentage <= 25) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
        <AlertTriangle size={14} /> Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
      <CheckCircle2 size={14} /> In Stock
    </span>
  );
};

const StockRegister = () => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All"); // All, InStock, LowStock, OutOfStock
  const [categoryFilter, setCategoryFilter] = useState("All"); // All, MT-BL, MT-CM

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/material/list/${tenderId}`);
      setMaterials(res.data.data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) fetchMaterials();
  }, [tenderId]);

  // Filtering Logic
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      // 1. Search Text
      const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Category Filter
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      // 3. Status Filter
      let matchesStatus = true;

      // Use current stock vs total received
      const percentage =
        item.total_received_qty > 0
          ? (item.current_stock_on_hand / item.total_received_qty) * 100
          : 0;

      if (statusFilter === "OutOfStock") {
        matchesStatus = item.current_stock_on_hand === 0;
      } else if (statusFilter === "LowStock") {
        // Low stock if some stock is present but <= 25% of received
        matchesStatus =
          item.current_stock_on_hand > 0 && percentage <= 25;
      } else if (statusFilter === "InStock") {
        // Healthy stock if > 25% of received
        matchesStatus =
          item.current_stock_on_hand > 0 && percentage > 25;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materials, searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="h-full flex flex-col dark:bg-[#0b0f19] p-3 sm:p-6 font-roboto-flex">

      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="text-blue-600" /> Stock Register
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time inventory tracking and material status
          </p>
        </div>

        {/* Category Toggle */}
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          {["All", "MT-BL", "MT-CM"].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${categoryFilter === cat
                ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              {cat === "MT-BL" ? "Bulk" : cat === "MT-CM" ? "Consumable" : "All Items"}
            </button>
          ))}
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded  border border-gray-200 dark:border-gray-700 mb-2 space-y-4">

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Status Tabs */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {[
              { id: "All", label: "All Stock" },
              { id: "InStock", label: "In Stock" },
              { id: "LowStock", label: "Low Stock (<25%)" },
              { id: "OutOfStock", label: "Out of Stock" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- Content Grid --- */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Package size={48} className="mb-3 opacity-20" />
          <p>No materials found matching your filters.</p>
          <button
            onClick={() => { setSearchTerm(""); setStatusFilter("All"); setCategoryFilter("All") }}
            className="mt-2 text-blue-600 hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-white flex-1 min-h-0 overflow-auto dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Opening Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Issued
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Procurement
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredMaterials.map((item, index) => {
                  const percentage =
                    item.total_budgeted_qty > 0
                      ? (item.total_received_qty / item.total_budgeted_qty) * 100
                      : 0;

                  return (
                    <tr
                      key={item.item_id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors"
                    >
                      {/* Material description */}
                      <td className="px-4 py-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="w-[120px] ">
                          <div
                            className="font-semibold text-gray-900 dark:text-gray-100 truncate"
                            title={item.description}
                          >
                            {item.description}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.category === "MT-BL"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                                }`}
                            >
                              {item.category === "MT-BL" ? (
                                <Layers size={10} />
                              ) : (
                                <Archive size={10} />
                              )}
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category / unit */}
                      <td className="px-4 py-3 text-center">

                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {item.unit}
                        </span>

                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {item.total_received_qty?.toLocaleString()}
                        </div>
                      </td>

                      {/* Current stock */}
                      <td className="px-4 py-3 text-center">
                        <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {item.current_stock_on_hand?.toLocaleString()}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {item.total_issued_qty?.toLocaleString()}
                        </div>
                      </td>

                      {/* Procurement progress */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            <span>
                              {item.total_received_qty?.toLocaleString()} /{" "}
                              {item.total_budgeted_qty?.toLocaleString()}
                            </span>
                            <span className="font-medium">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                          <ProgressBar
                            received={item.total_received_qty}
                            total={item.total_budgeted_qty}
                          />
                          <span className="text-[10px] text-right mt-0.5 text-gray-500 dark:text-gray-400">
                            {item.pending_procurement_qty > 0 ? (
                              <>Pending: {item.pending_procurement_qty?.toLocaleString()}</>
                            ) : (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Procurement Complete
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Stock status */}
                      <td className="px-4 py-3 align-top">
                        <StockStatusBadge
                          currentStock={item.current_stock_on_hand}
                          budget={item.total_received_qty}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockRegister;