import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../components/Modal";
import { toast } from "react-toastify";
import { Trash2, Box } from "lucide-react";
import { API } from "../../../constant";
import SearchableSelect from "../../../components/SearchableSelect";

// --- Validation Schema ---
const schema = yup.object().shape({
  site_name: yup.string().required("Site Name is required"),
  work_location: yup.string().required("Work Location is required"),
  issued_by: yup.string().required("Issued By is required"),
  issued_items: yup.array().of(
    yup.object().shape({
      item_id: yup.string().required(),
      item_description: yup.string().required("Material is required"),
      unit: yup.string(),
      current_stock: yup.number(),
      issued_quantity: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .required("Required")
        .min(0.001, "Min 0.001")
        .test("max-qty", "Exceeds Stock", function (value) {
          const { current_stock } = this.parent;
          return value <= current_stock;
        }),
      purpose: yup.string().required("Purpose required"), // work_description
      priority: yup.string().default("Normal"),
    })
  ),
});

const AddMaterialIssue = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");
  
  // State
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      site_name: "",
      work_location: "",
      issued_by: "",
      issued_items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "issued_items",
  });

  // Watch for material selection changes in the *last* appended row (or handling separately)
  // For simplicity in this UI, we will have a separate "Add Item" section or just a row-based selector.
  // Here, I will implement a row-based selector where selecting a material auto-fills unit/stock.

  // 1. Fetch Materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${API}/material/list/${tenderId}`);
        const allMaterials = res.data.data || [];
        
        // Filter only items with stock > 0
        const stockAvailable = allMaterials.filter(m => m.current_stock_on_hand > 0);
        setMaterials(stockAvailable);
      } catch (err) {
        console.error("Error fetching materials:", err);
        toast.error("Failed to load material list");
      }
    };

    if (tenderId) fetchMaterials();
  }, [tenderId]);

  // 2. Handle Material Selection for a specific row
  const handleMaterialSelect = (index, selectedDesc) => {
    setValue(`issued_items.${index}.item_description`, selectedDesc, { shouldValidate: true });
    const material = materials.find((m) => m.description === selectedDesc);

    if (material) {
      setValue(`issued_items.${index}.item_id`, material.item_id);
      setValue(`issued_items.${index}.unit`, material.unit);
      setValue(`issued_items.${index}.current_stock`, material.current_stock_on_hand);
      setValue(`issued_items.${index}.issued_quantity`, ""); // Reset qty
    } else {
      // Clear fields if deselected
      setValue(`issued_items.${index}.item_id`, "");
      setValue(`issued_items.${index}.unit`, "");
      setValue(`issued_items.${index}.current_stock`, 0);
    }
  };

  // 3. Add Empty Row
  const handleAddRow = () => {
    append({
      item_id: "",
      item_description: "",
      unit: "",
      current_stock: 0,
      issued_quantity: "",
      purpose: "",
      priority: "Normal",
    });
  };

  // 4. Submit Handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.issued_items.length === 0) {
        toast.warn("Please add at least one material to issue.");
        setLoading(false);
        return;
      }

      // Map to API structure
      const payload = {
        tender_id: tenderId,
        issued_by: data.issued_by,
        issued_items: data.issued_items.map((item) => ({
          item_id: item.item_id,
          item_description: item.item_description, // Send description as fallback/reference
          issued_quantity: item.issued_quantity,
          issued_to: data.site_name, 
          work_location: data.work_location,
          purpose: item.purpose,
          priority: item.priority
        })),
      };

      await axios.post(`${API}/material/addMaterialIssued`, payload);
      
      if (onSuccess) onSuccess();
      toast.success("Materials issued successfully!");
      onclose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || "Failed to issue materials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Issue Materials to Site"
      onclose={onclose}
      widthClassName="w-full max-w-6xl"
      child={
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 font-roboto-flex">
          
          {/* --- Header Inputs (Common for the batch) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            {/* Site / Contractor Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                Issued Site <span className="text-red-500">*</span>
              </label>
              <input
                {...register("site_name")}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                placeholder="e.g. John Doe (Contractor)"
              />
              <p className="text-xs text-red-500 min-h-[16px]">{errors.site_name?.message}</p>
            </div>

            {/* Work Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                Site Location <span className="text-red-500">*</span>
              </label>
              <input
                {...register("work_location")}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                placeholder="e.g. Block A, 1st Floor"
              />
              <p className="text-xs text-red-500 min-h-[16px]">{errors.work_location?.message}</p>
            </div>

            {/* Issued By */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                Issued By (Staff) <span className="text-red-500">*</span>
              </label>
              <input
                {...register("issued_by")}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                placeholder="e.g. Site Engineer"
              />
              <p className="text-xs text-red-500 min-h-[16px]">{errors.issued_by?.message}</p>
            </div>
          </div>

          {/* --- Dynamic Items Table --- */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Materials List</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 dark:bg-gray-700/50 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 min-w-[200px]">Material <span className="text-red-500">*</span></th>
                      <th className="px-4 py-3 w-20 text-center">Unit</th>
                      <th className="px-4 py-3 w-24 text-center">Stock</th>
                      <th className="px-4 py-3 w-32">Issue Qty <span className="text-red-500">*</span></th>
                      <th className="px-4 py-3 min-w-[150px]">Purpose / Work</th>
                      <th className="px-4 py-3 w-28">Priority</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {fields.map((item, index) => (
                      <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        
                        {/* Material Select */}
                        <td className="px-4 py-2">
                          <SearchableSelect
                            value={watch(`issued_items.${index}.item_description`)}
                            onChange={(val) => handleMaterialSelect(index, val)}
                            placeholder="Select Material"
                            options={materials.map((mat) => ({ value: mat.description, label: mat.description }))}
                            hasError={!!errors.issued_items?.[index]?.item_description}
                          />
                          {errors.issued_items?.[index]?.item_description && (
                            <p className="text-[10px] text-red-500 mt-0.5">Required</p>
                          )}
                        </td>

                        {/* Unit (Read Only) */}
                        <td className="px-4 py-2 text-center text-gray-500">
                          <input 
                            {...register(`issued_items.${index}.unit`)} 
                            readOnly 
                            className="w-full bg-transparent text-center border-none focus:ring-0 p-0 text-xs" 
                          />
                        </td>

                        {/* Stock (Read Only) */}
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              {watch(`issued_items.${index}.current_stock`)}
                            </span>
                          </div>
                        </td>

                        {/* Issue Qty Input */}
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="any"
                            {...register(`issued_items.${index}.issued_quantity`)}
                            className={`w-full rounded border px-2 py-1.5 text-sm ${
                              errors.issued_items?.[index]?.issued_quantity 
                                ? "border-red-500 bg-red-50" 
                                : "border-gray-300 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
                            }`}
                            placeholder="0.00"
                          />
                          {errors.issued_items?.[index]?.issued_quantity && (
                            <p className="text-[10px] text-red-500 mt-0.5 whitespace-nowrap">
                              {errors.issued_items[index].issued_quantity.message || "Exceeds Stock"}
                            </p>
                          )}
                        </td>

                        {/* Purpose Input */}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            {...register(`issued_items.${index}.purpose`)}
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600"
                            placeholder="e.g. Plastering"
                          />
                          {errors.issued_items?.[index]?.purpose && (
                            <p className="text-[10px] text-red-500 mt-0.5">Required</p>
                          )}
                        </td>

                        {/* Priority Select */}
                        <td className="px-4 py-2">
                          <SearchableSelect
                            value={watch(`issued_items.${index}.priority`)}
                            onChange={(val) => setValue(`issued_items.${index}.priority`, val, { shouldValidate: true })}
                            options={[
                              { value: "Normal", label: "Normal" },
                              { value: "Urgent", label: "Urgent" },
                            ]}
                          />
                        </td>

                        {/* Remove Button */}
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Empty State */}
                    {fields.length === 0 && (
                      <tr>
                        <td colSpan="7">
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                            <Box size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                            <p className="text-sm">No items added yet.</p>
                            <button 
                              type="button" 
                              onClick={handleAddRow}
                              className="mt-2 text-blue-600 text-xs font-medium hover:underline"
                            >
                              Add first item
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- Footer Actions --- */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onclose}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fields.length === 0}
              className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed dark:disabled:bg-gray-700 transition-all"
            >
              {loading ? "Saving..." : "Save Issue Entry"}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default AddMaterialIssue;