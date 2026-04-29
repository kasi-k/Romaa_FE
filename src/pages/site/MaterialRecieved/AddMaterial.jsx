import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../components/Modal";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import { Box } from "lucide-react"; // Added for empty state UI
import SearchableSelect from "../../../components/SearchableSelect";

// --- Validation Schema ---
const schema = yup.object().shape({
  requestId: yup.string().required("Request ID is required"),
  invoice_no: yup.string().required("Invoice/Challan No is required"),
  received_items: yup.array().of(
    yup.object().shape({
      item_description: yup.string().required(),
      received_quantity: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .min(0, "Min 0")
        .test("max-qty", "Exceeds Balance", function (value) {
          const { balance_quantity } = this.parent;
          return value <= balance_quantity;
        }),
      ordered_date: yup.string().required("Date required"),
    })
  ),
});

const AddMaterial = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");

  // State
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState("invoice"); // "invoice" | "dc"

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
      requestId: "",
      invoice_no: "",
      site_name: "",
      received_items: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "received_items",
  });

  // 1. Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const poRes = await axios.get(
          `${API}/purchaseorderrequest/api/getbyIdMaterialReceived/${tenderId}`
        );
        setPurchaseRequests(poRes.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load Purchase Requests");
      }
    };

    if (tenderId) fetchInitialData();
  }, [tenderId]);

  // 2. Handle Request ID Change
  const handleRequestSelect = async (selectedId) => {
    setValue("requestId", selectedId);

    if (!selectedId) {
      replace([]);
      setValue("site_name", "");
      return;
    }

    const selectedPO = purchaseRequests.find((r) => r.requestId === selectedId);
    if (!selectedPO) return;

    if (selectedPO.selectedVendor?.vendorName) {
      setValue("site_name", selectedPO.selectedVendor.vendorName);
    }

    setLoading(true);

    try {
      const historyRes = await axios.get(
        `${API}/material/getPOReceivedHistory/${tenderId}/${selectedId}`
      );
      
      const inventoryHistory = historyRes.data?.data || [];

      const formItems = selectedPO.materialsRequired.map((poItem) => {
        const historyItem = inventoryHistory.find(
          (h) => h.item_description === poItem.materialName
        );

        const previouslyReceived = historyItem ? historyItem.total_received_for_po : 0;
        const poQty = poItem.quantity || 0;
        const balance = Math.max(0, poQty - previouslyReceived);

        return {
          item_description: poItem.materialName,
          unit: poItem.unit,
          po_quantity: poQty,
          prev_received: previouslyReceived,
          balance_quantity: balance,
          received_quantity: 0,
          ordered_date: new Date().toISOString().split("T")[0],
        };
      });

      replace(formItems);

    } catch (err) {
      console.error("Failed to fetch PO history", err);
      toast.error("Could not fetch received history");
      replace([]);
    } finally {
      setLoading(false);
    }
  };

 // 3. Submit Handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Filter out valid items to submit
      const itemsToSubmit = data.received_items.filter(
        (i) => i.received_quantity > 0
      );

      if (itemsToSubmit.length === 0) {
        toast.warn("Please enter a quantity greater than 0 for at least one item.");
        setLoading(false);
        return;
      }

      const payload = {
        tender_id: tenderId,
        requestId: data.requestId,
        invoice_challan_no: docType === "invoice" ? data.invoice_no : "",
        dc_no:              docType === "dc"      ? data.invoice_no : "",
        site_name: data.site_name,
        received_items: itemsToSubmit,
      };

      // 2. Call Primary API: Add Material Received
      await axios.post(`${API}/material/addMaterialReceived`, payload);
      toast.success("Material received successfully!");

      // 3. Check if PO is Fully Completed
      // Logic: If for EVERY item, (Balance - Received_Now) <= 0, then PO is done.
      const isPOFullyReceived = data.received_items.every((item) => {
        const currentBalance = Number(item.balance_quantity || 0);
        const receivingNow = Number(item.received_quantity || 0);
        
        // If balance was already 0, or we just received the full remainder
        return currentBalance - receivingNow <= 0;
      });

      // 4. If Complete, Call Pass PO API
      if (isPOFullyReceived) {
        try {
          await axios.put(`${API}/purchaseorderrequest/api/pass_po/${data.requestId}`, {
            status: "Completed",
          });
          toast.info(`PO ${data.requestId} automatically marked as Completed.`);
        } catch (poError) {
          console.error("Auto-close PO failed", poError);
          // We don't block the UI here since material entry was successful
        }
      }

      if (onSuccess) onSuccess();
      onclose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to receive material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Inward Material Entry (GRN)"
      onclose={onclose}
      widthClassName="w-full max-w-5xl"
      child={
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 font-roboto-flex">
          
          {/* --- Header Inputs --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {/* Purchase Order Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Purchase Order <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                name="requestId"
                watch={watch}
                setValue={(name, val) => handleRequestSelect(val)}
                placeholder="-- Select PO --"
                options={purchaseRequests.map((r) => ({ value: r.requestId, label: `${r.requestId} - ${r.title}` }))}
                hasError={!!errors.requestId}
              />
              <p className="text-xs text-red-500 min-h-[16px]">{errors.requestId?.message}</p>
            </div>

            {/* Site Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Site Name
              </label>
              <input
                {...register("site_name")}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Enter Site Name"
              />
            </div>

            {/* Invoice / DC No */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Document No <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                {/* Toggle */}
                <div className="flex flex-shrink-0 border-r border-gray-300 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => setDocType("invoice")}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                      docType === "invoice"
                        ? "bg-slate-700 text-white"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType("dc")}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wide border-l border-gray-300 dark:border-gray-600 transition-colors ${
                      docType === "dc"
                        ? "bg-slate-700 text-white"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    DC
                  </button>
                </div>
                {/* Input */}
                <input
                  {...register("invoice_no")}
                  className="flex-1 min-w-0 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none"
                  placeholder={docType === "invoice" ? "Enter Invoice No" : "Enter DC No"}
                />
              </div>
              <p className="text-xs text-red-500 min-h-[16px]">{errors.invoice_no?.message}</p>
            </div>
          </div>

          {/* --- Dynamic Table --- */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 dark:bg-gray-700/50 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 min-w-[200px]">Material</th>
                    <th className="px-4 py-3 min-w-[100px]">Unit</th>
                    <th className="px-4 py-3 text-center">PO Qty</th>
                    <th className="px-4 py-3 text-center">Prev. Recv</th>
                    <th className="px-4 py-3 text-center text-blue-600 dark:text-blue-400">Balance</th>
                    <th className="px-4 py-3 w-36">Received Now</th>
                    {/* <th className="px-4 py-3 min-w-[140px]">Date</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {fields.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {/* Material Name */}
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                        {item.item_description}
                        <input type="hidden" {...register(`received_items.${index}.item_description`)} />
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {item.unit}
                        </span>
                      </td>
                      
                      {/* PO Qty (Read Only) */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {item.po_quantity}
                        </span>
                      </td>

                      {/* Prev Received (Read Only) */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-500 dark:text-gray-500">
                          {item.prev_received}
                        </span>
                      </td>

                      {/* Balance (Read Only) */}
                      <td className="px-4 py-3 text-center">
                        <div className="mx-auto w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {item.balance_quantity}
                        </div>
                        <input type="hidden" {...register(`received_items.${index}.balance_quantity`)} />
                      </td>

                      {/* Received Now Input */}
                      <td className="px-4 py-3">
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            {...register(`received_items.${index}.received_quantity`)}
                            className={`w-full rounded-md border px-2 py-1.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
                              errors.received_items?.[index]?.received_quantity 
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900 dark:bg-red-900/10 dark:text-red-200" 
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900/30"
                            }`}
                            placeholder="0"
                            disabled={item.balance_quantity === 0}
                          />
                        </div>
                        {errors.received_items?.[index]?.received_quantity && (
                          <p className="absolute text-[10px] text-red-500 mt-0.5 font-medium">
                             {errors.received_items[index].received_quantity.message || "Invalid"}
                          </p>
                        )}
                      </td>

                      {/* Date Input */}
                      {/* <td className="px-4 py-3">
                        <input
                          type="date"
                          {...register(`received_items.${index}.ordered_date`)}
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900/30"
                          disabled={item.balance_quantity === 0}
                        />
                      </td> */}
                    </tr>
                  ))}

                  {/* Empty State */}
                  {fields.length === 0 && (
                    <tr>
                      <td colSpan="7">
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                          <Box size={40} strokeWidth={1.5} className="mb-2 opacity-50" />
                          <p className="text-sm font-medium">
                            {loading ? "Fetching material details..." : "Select a Purchase Order to start receiving materials"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Footer Actions --- */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onclose}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fields.length === 0}
              className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:focus:ring-offset-gray-900 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Material Entry"
              )}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default AddMaterial;