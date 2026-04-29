import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTruckMonster, FaGasPump } from "react-icons/fa";
import { API } from "../../../constant";
import { useProject } from "../../../context/ProjectContext";
import Title from "../../../components/Title";

const ProjectMaterialQty = () => {
  const { tenderId } = useProject();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("consumable_material");
  const [freezed, setFreezed] = useState(false);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Utility: rupees -> lakhs (Same as reference)
  const toLakhs = (rs) => (rs || 0) / 100000;

  const fetchMachines = async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/raquantities/quantites/${tenderId}/${activeTab}`
      );
      const { data, freeze } = res?.data?.data || {};
      setFreezed?.(!!freeze);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error(`Error fetching ${activeTab} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
    setIsEditing(false); // Reset edit mode on tab change
  }, [tenderId, activeTab]);

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
      item.final_amount = Number(finalAmount.toFixed(2)); // final amount = total amount

      copy[index] = item;
      return copy;
    });
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      setIsSaving(true);

      const payload = {
        tenderId,
        type: activeTab,
        items: items,
      };

      const res = await axios.put(
        `${API}/raquantities/update/${tenderId}/${activeTab}`,
        payload
      );

      if (res.status === 200) {
        toast.success(`${activeTab} updated successfully`);
        setIsEditing(false);
        fetchMachines();
      }
      setLoading(false);
    } catch (err) {
      toast.error("Failed to save data");
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER HELPER (From Reference) ---
  const renderField = (value, inputProps) => {
    if (!isEditing) {
      return (
        <span>
          {/* Check if it's a number to format, else string */}
          {Number.isFinite(Number(value))
            ? Number(value).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })
            : value || "-"}
        </span>
      );
    }
    return (
      <input
        {...inputProps}
        className="w-20 border rounded px-2 py-1.5 bg-transparent text-xs text-right border-gray-300 focus:border-blue-500 outline-none"
        value={value ?? ""}
        placeholder="0"
      />
    );
  };

  // --- TOTALS CALCULATION ---
  const totalCost = useMemo(
    () =>
      items.reduce(
        (acc, curr) => acc + (parseFloat(curr.total_amount) || 0),
        0
      ),
    [items]
  );

  return (
    <div className="font-roboto-flex flex flex-col gap-4 h-full p-2">
      <Title
        title="Project Management"
        sub_title="Basic Material Quantity"
        active_title={activeTab === "consumable_material" ? "Consumable Material" : "Bulk Material"}
      />

      <div className="flex gap-2">
        <button
          onClick={() => !isEditing && setActiveTab("consumable_material")}
          className={`text-xs px-3 py-1.5 rounded border ${activeTab === "consumable_material"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-gray-50 text-gray-600"
            }`}
        >
          Consumable Material
        </button>
        <button
          onClick={() => !isEditing && setActiveTab("bulk_material")}
          className={`text-xs px-3 py-1.5 rounded border ${activeTab === "bulk_material"
              ? "bg-orange-50 border-orange-200 text-orange-700"
              : "bg-gray-50 text-gray-600"
            }`}
        >
          Bulk Material
        </button>
      </div>

      {/* 1. TOP BAR: Title + Edit/Save Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Resource Analysis:{" "}
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>

        {/* VIEW MODE: Edit button */}
        {!isEditing && !freezed && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-1.5 text-sm rounded dark:bg-layout-dark bg-white border border-gray-200 shadow-sm dark:text-white text-darkest-blue hover:bg-gray-50"
          >
            Edit
          </button>
        )}

        {/* EDIT MODE: Save + Cancel */}
        {isEditing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 text-sm rounded bg-emerald-600 text-white disabled:opacity-60 hover:bg-emerald-700"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchMachines(); // Revert
              }}
              className="px-3 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 3. SECTION CARD (The Table) */}
      <div className="bg-white dark:bg-layout-dark rounded-md shadow border border-gray-200 dark:border-border-dark-grey overflow-hidden">
        {/* Card Header (Like Section Title) */}
        <div className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-overall_bg-dark border-b border-gray-200 dark:border-border-dark-grey">
          <span className="text-sm font-semibold flex items-center gap-2 py-1.5">
            {/* {activeTab === 'consumable_material' ? <FaTruckMonster className="text-gray-400"/> : <FaGasPump className="text-gray-400"/>} */}
            {activeTab === "consumable_material"
              ? " Consumable Material "
              : " Bulk Material "}
          </span>
          <span className="text-xs text-gray-500 dark:text-white">
            {items.length} Records found
          </span>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Loading data...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No records found.
          </div>
        ) : (
          <div className="px-0 pb-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-border-dark-grey">
                <tr>
                  <th className="p-2 text-left font-semibold text-gray-600 dark:text-white">
                    SI.No
                  </th>
                  <th className="p-2 text-left font-semibold text-gray-600 dark:text-white">
                    Item Description
                  </th>
                  <th className="p-2 text-center font-semibold text-gray-600 dark:text-white">
                    Unit
                  </th>
                  <th className="p-2 text-right font-semibold text-gray-600 dark:text-white">
                    Qty
                  </th>
                  <th className="p-2 text-right font-semibold text-gray-600 dark:text-white">
                    Rate
                  </th>
                  <th className="p-2 text-right font-semibold text-gray-600 dark:text-white">
                    Tax
                  </th>
                  <th className="p-2 text-right font-semibold text-gray-600 dark:text-white">
                    Total Amount
                  </th>
                  <th className="p-2 text-right font-semibold text-gray-600 dark:text-white">
                    Tax Amount
                  </th>
                  <th className="p-2 text-right font-semibold text-gray-600 dark:text-white">
                    Final Amount
                  </th>
                  {/* <th className="p-2 text-right font-semibold text-gray-600 dark:text-white">Var %</th> */}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="border-b border-gray-100 dark:border-border-dark-grey last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-2.5 text-left align-middle">
                      <div className="font-medium text-gray-700 dark:text-gray-200 pl-2">
                        {index + 1 || "-"}
                      </div>
                    </td>
                    {/* Description */}
                    <td className="p-2.5 text-left align-middle">
                      <div className="font-medium text-gray-700 dark:text-gray-200">
                        {item.item_description || "-"}
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="p-2.5 text-center align-middle text-gray-500">
                      {item.unit || "-"}
                    </td>

                    {/* Qty (Editable) */}
                    <td className="p-2.5 text-right align-middle">
                      {item.total_item_quantity || "-"}
                    </td>

                    {/* Rate (Editable) */}
                    <td className="p-2.5 text-right align-middle">
                      {renderField(item.unit_rate, {
                        type: "number",
                        onChange: (e) =>
                          updateItem(index, "unit_rate", e.target.value),
                      })}
                    </td>

                    {/* Tax (Editable) */}
                    <td className="p-2.5 text-right align-middle text-gray-500">
                      {renderField(item.tax_percent, {
                        type: "number",
                        onChange: (e) =>
                          updateItem(index, "tax_percent", e.target.value),
                      })}
                    </td>

                    <td className="p-2.5 text-right align-middle font-medium ">
                      ₹{" "}
                      {Number(item.total_amount).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Tax Amount (Calculated) */}
                    <td className="p-2.5 text-right align-middle font-medium ">
                      ₹{" "}
                      {Number(item.tax_amount).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Tax Amount (Calculated) */}
                    <td className="p-2.5 text-right align-middle font-medium ">
                      ₹{" "}
                      {Number(item.final_amount).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Variance % (Read only) */}
                    {/* <td className="p-2.5 text-right align-middle">
                         <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {Number(item.percentage_value_of_material).toFixed(2)}%
                         </span>
                      </td> */}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer / Summary */}
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-right text-gray-600 font-medium dark:bg-layout-dark dark:text-white">
              Subtotal: ₹ {totalCost.toLocaleString("en-IN")} |{" "}
              {toLakhs(totalCost).toFixed(2)} L
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMaterialQty;
