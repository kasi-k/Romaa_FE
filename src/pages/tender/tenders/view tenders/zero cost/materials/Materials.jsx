import React, { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../../constant"; // Adjust path as needed
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { FaTruckMonster, FaGasPump } from "react-icons/fa";

// ============================================================================
// FORMATTERS & UTILITIES
// ============================================================================

const toLakhs = (rs) => (rs || 0) / 100000;

const formatCurrency = (value) =>
  value !== undefined && value !== null && !isNaN(value)
    ? Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

// ============================================================================
// MAIN COMPONENT: MATERIALS
// ============================================================================

const Materials = () => {
  const { tender_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("consumable_material");
  const [freezed, setFreezed] = useState(false);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMachines = useCallback(async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/raquantities/quantites/${tender_id}/${activeTab}`);
      const { data, freeze } = res.data.data || {};
      setFreezed?.(!!freeze);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error(`Error fetching ${activeTab.replace("_", " ")} data`);
    } finally {
      setLoading(false);
    }
  }, [tender_id, activeTab]);

  useEffect(() => {
    fetchMachines();
    setIsEditing(false); // Reset edit mode on tab change
  }, [fetchMachines]);

  // --- CALCULATION LOGIC ---
  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      // Parse value safely
      const val = parseFloat(value) || 0;
      item[field] = val;

      // Recalculate derived fields
      const qty = item.total_item_quantity || 0;
      const rate = item.unit_rate || 0;
      const taxPercent = item.tax_percent || 0;
      const escalationPercent = item.escalation_percent || 0;

      const totalAmount = rate * qty;
      const taxAmount = totalAmount * (taxPercent / 100);
      const escalationAmount = totalAmount * (escalationPercent / 100);
      const finalAmount = totalAmount + taxAmount + escalationAmount;

      // Update item with calculated values
      item.tax_amount = Number(taxAmount.toFixed(2));
      item.escalation_amount = Number(escalationAmount.toFixed(2));
      item.total_amount = Number(totalAmount.toFixed(2));
      item.final_amount = Number(finalAmount.toFixed(2)); 

      copy[index] = item;
      return copy;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setIsSaving(true);

      const payload = {
        tender_id,
        type: activeTab,
        items: items,
      };

      const res = await axios.put(`${API}/raquantities/quantites/update/${tender_id}/${activeTab}`, payload);

      if (res.status === 200) {
        toast.success(`${activeTab.replace("_", " ")} updated successfully`);
        setIsEditing(false);
        fetchMachines();
      }
    } catch (err) {
      toast.error("Failed to save data");
      console.error(err);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  // --- RENDER HELPER FOR INPUTS ---
  const renderEditableField = (value, fieldName, index) => {
    if (!isEditing) {
      return (
        <span className="tabular-nums tracking-tight text-slate-700 dark:text-slate-300">
          {Number.isFinite(Number(value)) ? formatCurrency(value) : value || "0.00"}
        </span>
      );
    }
    return (
      <input
        type="number"
        className="w-24 px-2 py-1 text-xs text-right tabular-nums bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
        value={value ?? ""}
        onChange={(e) => updateItem(index, fieldName, e.target.value)}
        placeholder="0.00"
      />
    );
  };

  // --- TOTALS CALCULATION ---
  const totalCost = useMemo(() => items.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0), [items]);

  return (
    <div className="flex flex-col gap-4 p-1 relative h-full">
      {/* 1. ERP HEADER & TABS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
        
        {/* Animated Pill Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => !isEditing && setActiveTab("consumable_material")}
            disabled={isEditing}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
              activeTab === "consumable_material"
                ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <FaGasPump size={14} className={activeTab === "consumable_material" ? "text-blue-500" : "opacity-50"} />
            Consumable Material
          </button>
          <button
            onClick={() => !isEditing && setActiveTab("bulk_material")}
            disabled={isEditing}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
              activeTab === "bulk_material"
                ? "bg-white dark:bg-slate-950 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <FaTruckMonster size={14} className={activeTab === "bulk_material" ? "text-orange-500" : "opacity-50"} />
            Bulk Material
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
        {!isEditing && !freezed && !loading && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <FiEdit2 size={14} />
              Edit Quantities
            </button>
          )}

          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchMachines(); // Revert changes
                }}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <FiX size={14} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <FiSave size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. MAIN DATA GRID */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded shadow-sm overflow-hidden flex flex-col grow">
        
        {/* Table Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {activeTab.replace("_", " ")}
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {items.length} Records
          </span>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar relative">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 w-12 border-b border-slate-200 dark:border-slate-700">Sr.</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Item Description</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">Res Group</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 text-center border-b border-slate-200 dark:border-slate-700">Unit</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 text-right border-b border-slate-200 dark:border-slate-700">Qty</th>
                <th className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400 text-right border-b border-slate-200 dark:border-slate-700">Rate (₹)</th>
                <th className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400 text-right border-b border-slate-200 dark:border-slate-700">Tax %</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 text-right border-b border-slate-200 dark:border-slate-700">Total Amt</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 text-right border-b border-slate-200 dark:border-slate-700">Tax Amt</th>
                <th className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100 text-right border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">Final Amt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && !isSaving ? (
                // Professional Skeleton Loader for rows
                Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FaGasPump size={24} className="opacity-20" />
                      <p>No materials found for this category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr 
                    key={item._id || index} 
                    className={`transition-colors ${isEditing ? 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <td className="px-4 py-2.5 text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200 truncate max-w-xs" title={item.item_description}>
                      {item.item_description || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                      {item.resourceGroup || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                        {item.unit || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {Number.isFinite(Number(item.total_item_quantity)) ? Number(item.total_item_quantity).toLocaleString('en-IN') : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {renderEditableField(item.unit_rate, 'unit_rate', index)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {renderEditableField(item.tax_percent, 'tax_percent', index)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums tracking-tight text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.total_amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums tracking-tight text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.tax_amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/30">
                      {formatCurrency(item.final_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. ERP STICKY FOOTER SUMMARY */}
        <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 mt-auto">
           <div className="text-xs text-slate-500 dark:text-slate-400">
             Values automatically calculate Tax & Escalation percentages based on the updated Unit Rate.
           </div>
           <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Total Cost (Lakhs)</p>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                  {toLakhs(totalCost).toFixed(2)} L
                </p>
             </div>
             <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
             <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 mb-0.5">Grand Total (₹)</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  ₹ {totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================================
// INTERNAL SUB-COMPONENTS
// ============================================================================

/**
 * Animated skeleton row for seamless loading UX
 */
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
    <td className="px-4 py-3"><div className="h-3 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3 flex justify-center"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-6 w-20 bg-blue-100 dark:bg-blue-900/50 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-6 w-12 bg-blue-100 dark:bg-blue-900/50 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3 bg-slate-50 dark:bg-slate-800/30"><div className="h-3 w-20 bg-slate-300 dark:bg-slate-600 rounded ml-auto"></div></td>
  </tr>
);

export default Materials;