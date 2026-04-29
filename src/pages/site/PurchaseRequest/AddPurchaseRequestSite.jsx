import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import SearchableSelect from "../../../components/SearchableSelect";

// Initial row state now includes category
const initialMaterial = { 
  category: "", 
  materialName: "", 
  quantity: "", 
  unit: "", 
  allowedQty: "" 
};

const AddPurchaseRequestSite = ({ onclose, onSuccess }) => {
  const projectId = localStorage.getItem("tenderId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteIncharge, setSiteIncharge] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");
  const [materials, setMaterials] = useState([{ ...initialMaterial }]);
  
  // Store the full list from API
  const [fullMaterialList, setFullMaterialList] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        // Fetching the list which contains category, budgeted, and received info
        const res = await axios.get(`${API}/material/list/${projectId}`);
        setFullMaterialList(res.data.data || []);
      } catch (err) {
        console.error("Error fetching materials:", err);
        toast.error("Failed to load materials");
      }
    };
    if (projectId) {
      fetchMaterials();
    }
  }, [projectId]);

  const handleAddRow = () =>
    setMaterials([...materials, { ...initialMaterial }]);

  const handleDeleteRow = (i) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, idx) => idx !== i));
  };

  const handleChange = (i, field, value) => {
    const updated = [...materials];
    updated[i][field] = value;

    // Logic when Category changes
    if (field === "category") {
      // Reset material details if category changes
      updated[i].materialName = "";
      updated[i].unit = "";
      updated[i].allowedQty = "";
      updated[i].quantity = "";
    }
    
    // Logic when Material changes
    if (field === "materialName") {
      const selectedMaterial = fullMaterialList.find(
        (m) => m.description === value
      );
      if (selectedMaterial) {
        updated[i].unit = selectedMaterial.unit || "";
        
        // Calculate Allowed Qty: Budget - Received
        const budgeted = Number(selectedMaterial.total_budgeted_qty) || 0;
        const received = Number(selectedMaterial.total_received_qty) || 0;
        // Ensure we don't show negative allowed
        const allowed = Math.max(0, budgeted - received);
        
        updated[i].allowedQty = allowed.toFixed(2); // Keep decimal precision
      }
    }

    setMaterials(updated);
  };

  const handleSubmit = async () => {
    if (!title || !description || !siteName || !siteLocation) {
      toast.warning("Please fill all required fields!");
      return;
    }

    const empty = materials.some(
      (m) => !m.category || !m.materialName || !m.quantity || !m.unit
    );
    
    if (empty) {
      toast.warning("Fill all material rows completely!");
      return;
    }

    // Check for quantity exceedance
    const exceed = materials.some(
      (m) => Number(m.quantity) > Number(m.allowedQty)
    );
    if (exceed) {
      toast.error("One or more items exceed the allowed quantity!");
      return;
    }

    const payload = {
      projectId,
      title,
      description,
      siteDetails: {
        siteName,
        location: siteLocation,
        siteIncharge,
      },
      requiredByDate,
      materialsRequired: materials.map((m) => ({
        category: m.category,
        materialName: m.materialName,
        quantity: Number(m.quantity),
        unit: m.unit,
      })),
    };

    try {
      await axios.post(`${API}/purchaseorderrequest/api/create`, payload);
      
      // Note: We are NO LONGER updating 'request_quantity' on the material model directly 
      // here because the new schema calculates pending procurement automatically 
      // or based on the Purchase Request status. 
      // If you still need to update a legacy field, keep the loop, otherwise remove it.

      toast.success("Purchase Request Created Successfully!");
      if (onSuccess) onSuccess();
      onclose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create Purchase Request");
    }
  };

  // Helper to filter materials based on row category
  const getFilteredMaterials = (category) => {
    return fullMaterialList.filter((m) => m.category === category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              New Purchase Request
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Create a request for site materials
            </p>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* GENERAL INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Project ID</label>
              <input
                value={projectId || ""}
                readOnly
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Request Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Cement for Foundation"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={2}
                placeholder="Brief details about the requirement..."
              />
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SITE DETAILS */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span> Site Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Name</label>
                <input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                <input
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Incharge</label>
                <input
                  value={siteIncharge}
                  onChange={(e) => setSiteIncharge(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Required By</label>
                <input
                  type="date"
                  value={requiredByDate}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* MATERIALS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span> Material List
              </h3>
              <button
                onClick={handleAddRow}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3 w-40">Category</th>
                    <th className="px-4 py-3 min-w-[200px]">Material Description</th>
                    <th className="px-4 py-3 w-32 text-right">Allowed Qty</th>
                    <th className="px-4 py-3 w-32 text-right">Request Qty</th>
                    <th className="px-4 py-3 w-24 text-center">Unit</th>
                    <th className="px-4 py-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {materials.map((row, i) => (
                    <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400">{i + 1}</td>
                      
                      {/* Category Selection */}
                      <td className="px-4 py-3">
                        <SearchableSelect
                          value={row.category}
                          onChange={(val) => handleChange(i, "category", val)}
                          placeholder="Select..."
                          options={[
                            { value: "MT-BL", label: "Bulk" },
                            { value: "MT-CM", label: "Consumable" },
                          ]}
                        />
                      </td>

                      {/* Material Dropdown (Filtered) */}
                      <td className="px-4 py-3">
                        <SearchableSelect
                          value={row.materialName}
                          onChange={(val) => handleChange(i, "materialName", val)}
                          disabled={!row.category}
                          placeholder={row.category ? "Select Material" : "Select Category First"}
                          options={getFilteredMaterials(row.category).map((mat) => ({ value: mat.description, label: mat.description }))}
                        />
                      </td>

                      {/* Allowed Quantity (Read Only) */}
                      <td className="px-4 py-3 text-right">
                         <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                           {row.allowedQty || "-"}
                         </span>
                      </td>

                      {/* Request Quantity Input */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => handleChange(i, "quantity", e.target.value)}
                          placeholder="0.00"
                          className={`w-full text-right bg-transparent border-b outline-none py-1 transition-colors ${
                            row.allowedQty && Number(row.quantity) > Number(row.allowedQty)
                              ? "border-red-500 text-red-500"
                              : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 text-gray-800 dark:text-gray-200"
                          }`}
                        />
                      </td>

                      {/* Unit (Read Only) */}
                      <td className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                        {row.unit || "-"}
                      </td>

                      {/* Delete Action */}
                      <td className="px-4 py-3 text-center">
                        {materials.length > 1 && (
                          <button
                            onClick={() => handleDeleteRow(i)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Row"
                          >
                            <IoClose size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Warning Message */}
            {materials.some(m => Number(m.quantity) > Number(m.allowedQty) && m.allowedQty !== "") && (
              <div className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-pulse">
                <IoClose size={14} className="border border-red-500 rounded-full" />
                Warning: Requested quantity exceeds the allowed budget/balance.
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onclose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all flex items-center gap-2"
            >
              Submit Request
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddPurchaseRequestSite;