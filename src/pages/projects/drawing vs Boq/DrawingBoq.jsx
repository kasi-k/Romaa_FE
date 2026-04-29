import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useProject } from "../../../context/ProjectContext";
import { useDrawingBoq, useUpdateDrawingBoq } from "../hooks/useProjects";


const DrawingBoq = () => {
  const { tenderId } = useProject();
  
  // Local state for table editing
  const [localItems, setLocalItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [modifiedCodes, setModifiedCodes] = useState(new Set());

  // 1. Fetch Data (TanStack Query)
  const { 
    data: boqItems = [], 
    isLoading, 
  } = useDrawingBoq(tenderId);

  // 2. Sync server data to local state for editing
  useEffect(() => {
    setLocalItems(boqItems);
    setModifiedCodes(new Set()); // Reset tracking when fresh data arrives
  }, [boqItems, isEditing]); // Reset when editing is toggled off too

  // 3. Mutation Setup
  const { mutate: saveDrawingBoq, isPending: isSaving } = useUpdateDrawingBoq({
    onSuccess: () => {
      toast.success(`Updated successfully`);
      setIsEditing(false);
      setModifiedCodes(new Set());
    }
  });

  // --- Calculations & Handlers ---
  const handleQuantityChange = (index, newVal) => {
    const itemCode = localItems[index].item_id || localItems[index].item_code;
    setModifiedCodes(prev => new Set(prev).add(itemCode));

    setLocalItems((prevItems) => {
      const updatedItems = [...prevItems];
      const item = { ...updatedItems[index] };

      const newDrawingQty = newVal === "" ? 0 : Number(newVal);
      item.drawing_quantity = newDrawingQty;

      if (newDrawingQty === 0) {
        item.variable_quantity = 0;
      } else {
        item.variable_quantity = item.quantity - newDrawingQty;
      }

      item.variable_amount = item.variable_quantity * item.n_rate;
      updatedItems[index] = item;
      return updatedItems;
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setModifiedCodes(new Set());
    setLocalItems(boqItems); // Revert to cached server data instantly
  };

  const handleSave = () => {
    if (modifiedCodes.size === 0) {
      toast.info("No changes to save");
      setIsEditing(false);
      return;
    }

    const changedItems = localItems.filter(item =>
      modifiedCodes.has(item.item_id || item.item_code)
    );

    const payload = {
      items: changedItems.map(i => ({
        item_code: i.item_id || i.item_code,
        drawing_quantity: i.drawing_quantity,
      }))
    };

    // Trigger the mutation
    saveDrawingBoq({ tenderId, payload });
  };

  // --- Formatters ---
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const grandTotal = useMemo(() =>
    localItems.reduce((sum, item) => sum + (item.variable_amount || 0), 0),
    [localItems]
  );

  // --- Render ---
  if (!tenderId) {
    return <div className="p-8 text-center text-gray-500">Please select a project to view Drawing BOQ.</div>;
  }

  if (isLoading && !localItems.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="font-roboto-flex flex flex-col gap-0.5 h-full py-2 overflow-hidden">
      {/* Header Panel */}
      <div className="flex items-center justify-between bg-white dark:bg-layout-dark p-4 border border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Drawing vs BOQ / {tenderId}</h2>
          <span className="text-sm text-gray-500 font-normal"> Variance Amount:</span>
          <span className={`text-sm font-semibold ${grandTotal < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {formatCurrency(grandTotal)}
          </span>
        </div>

        {/* Action Buttons */}
        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 text-sm font-medium rounded-md bg-slate-600 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Edit Quantities
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {isSaving ? "Saving..." : `Save (${modifiedCodes.size})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 ">#</th>
              <th className="px-4 py-3 w-30">Item Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-left w-30">BOQ Qty</th>
              <th className="px-4 py-3 text-left bg-blue-50/50 dark:bg-blue-900/10 w-40">Drawing Qty</th>
              <th className="px-4 py-3 text-left w-30">Var. Qty</th>
              <th className="px-4 py-3 text-left w-30">Variance </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {localItems.map((item, index) => {
              const isModified = modifiedCodes.has(item.item_id || item.item_code);
              const rowClass = isModified
                ? "bg-blue-50/40 dark:bg-blue-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50";

              return (
                <tr key={item.item_id || index} className={`${rowClass} transition-colors`}>
                  <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                    {item.item_id || item.item_code}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-md truncate" title={item.item_name}>
                    {item.item_name}
                  </td>
                  <td className="px-4 py-3 text-left font-medium">
                    {item.quantity}
                  </td>

                  {/* Editable Field */}
                  <td className="px-4 py-2 text-left bg-blue-50/30 dark:bg-blue-900/5">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.drawing_quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-full text-left border border-blue-300 dark:border-blue-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800"
                        placeholder="0"
                      />
                    ) : (
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        {item.drawing_quantity}
                      </span>
                    )}
                  </td>

                  {/* Calculated Fields */}
                  <td className={`px-4 py-3 text-left font-medium ${item.variable_quantity < 0 ? "text-red-500" : "text-gray-600"}`}>
                    {item.variable_quantity?.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-left font-medium ${item.variable_amount < 0 ? "text-red-600" : "text-gray-800 dark:text-gray-200"}`}>
                    {formatCurrency(item.variable_amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {localItems.length === 0 && !isLoading && (
          <div className="p-8 text-center text-gray-500">No items found for this tender.</div>
        )}
      </div>
    </div>
  );
};

export default DrawingBoq;