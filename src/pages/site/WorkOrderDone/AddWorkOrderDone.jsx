import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiFileText,
} from "react-icons/fi";
import SearchableSelect from "../../../components/SearchableSelect";
import { Calculator, CalendarDays } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import { useProject } from "../../../context/ProjectContext";

const onlyNumbers = (e) => {
  const allowed = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];
  if (allowed.includes(e.key)) return;
  if (e.key === "." && !e.currentTarget.value.includes(".")) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
};
// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptySection = () => ({
  sectionId: Date.now() + Math.random(),
  workOrderId: "",
  contractorName: "",
  items: [],
});

const emptyItem = (mat, quotedRate = 0) => ({
  item_description: mat.materialName,
  description: mat.detailedDescription,
  no1: "",
  no2: "",
  length: "",
  breadth: "",
  height: "",
  quantity: "",
  unit: mat.unit,
  quoted_rate: quotedRate,
  contractor_details: "",
  remarks: "",
  maxQuantity: mat.ex_quantity ?? null,
});

// ─── Validation ───────────────────────────────────────────────────────────────

const validate = (reportDate, sections) => {
  const errs = { reportDate: "", sections: {} };
  let valid = true;

  if (!reportDate) {
    errs.reportDate = "Date is required";
    valid = false;
  }

  sections.forEach((s) => {
    const sErr = { workOrderId: "" };
    if (!s.workOrderId) {
      sErr.workOrderId = "Select a work order";
      valid = false;
    }
    errs.sections[s.sectionId] = sErr;
  });

  return { errs, valid };
};

// ─── Root component ───────────────────────────────────────────────────────────

const AddWorkOrderDone = ({ onclose, onSuccess }) => {
  const { tenderId } = useProject();
  const [workOrders, setWorkOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [sections, setSections] = useState([emptySection()]);
  const [errors, setErrors] = useState({ reportDate: "", sections: {} });

  // Fetch available work orders once
  useEffect(() => {
    if (!tenderId) return;
    axios
      .get(
        `${API}/workorderrequest/api/getWorkOrderIssuedForWorkDone/${tenderId}`,
      )
      .then((res) => setWorkOrders(res.data?.data || []))
      .catch(() => toast.error("Failed to load work orders"));
  }, [tenderId]);

  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const clearSectionError = (sectionId, field) =>
    setErrors((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: { ...(prev.sections[sectionId] || {}), [field]: "" },
      },
    }));

  const addSection = () => setSections((prev) => [...prev, emptySection()]);

  const removeSection = (id) =>
    setSections((prev) => prev.filter((s) => s.sectionId !== id));

  const updateWorkOrder = (sectionId, workOrderId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.sectionId === sectionId
          ? { ...s, workOrderId, contractorName: "", items: [] }
          : s,
      ),
    );
    clearSectionError(sectionId, "workOrderId");
  };

  const updateContractorName = (sectionId, contractorName) =>
    setSections((prev) =>
      prev.map((s) => (s.sectionId === sectionId ? { ...s, contractorName } : s)),
    );

  const updateItems = (sectionId, items) =>
    setSections((prev) =>
      prev.map((s) => (s.sectionId === sectionId ? { ...s, items } : s)),
    );

  const updateItemField = (sectionId, idx, field, value) =>
    setSections((prev) =>
      prev.map((s) => {
        if (s.sectionId !== sectionId) return s;
        const items = [...s.items];
        items[idx] = { ...items[idx], [field]: value };
        return { ...s, items };
      }),
    );

  const usedWorkOrderIds = sections.map((s) => s.workOrderId).filter(Boolean);

  const handleSubmit = async () => {
    if (!tenderId) return toast.error("No project selected");

    const { errs, valid } = validate(reportDate, sections);
    setErrors(errs);
    if (!valid) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    // Build payloads — validate items per section
    const payloads = [];
    for (const s of sections) {
      if (!s.workOrderId) continue;

      const validItems = [];
      for (const item of s.items) {
        const qty = Number(item.quantity) || 0;
        const hasDimensions =
          Number(item.length) > 0 && Number(item.breadth) > 0;
        if (qty === 0 && !hasDimensions) continue;

        if (item.maxQuantity !== null && qty > item.maxQuantity) {
          toast.error(
            `"${item.item_description}" exceeds max qty of ${item.maxQuantity}`,
          );
          return;
        }
        if (!item.contractor_details?.trim()) {
          toast.warning(`Fill Contractor for "${item.item_description}"`);
          return;
        }
        if (!item.remarks?.trim()) {
          toast.warning(`Fill Remarks for "${item.item_description}"`);
          return;
        }

        validItems.push({
          item_description: item.item_description,
          description: item.description,
          no1: Number(item.no1) || 0,
          no2: Number(item.no2) || 0,
          length: Number(item.length) || 0,
          breadth: Number(item.breadth) || 0,
          height: Number(item.height) || 0,
          quantity: qty,
          unit: item.unit,
          quoted_rate: Number(item.quoted_rate) || 0,
          contractor_details: item.contractor_details,
          remarks: item.remarks,
        });
      }

      if (validItems.length === 0) {
        toast.warning(`No items filled for Work Order "${s.workOrderId}"`);
        return;
      }

      payloads.push({
        tender_id: tenderId,
        work_order_id: s.workOrderId,
        contractor_name: s.contractorName,
        report_date: reportDate,
        dailyWorkDone: validItems,
        created_by: "Site Engineer",
      });
    }

    if (payloads.length === 0) {
      toast.warning("Add at least one work order with items");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API}/workorderdone/api/bulk-create`, payloads);

      // Auto-completion check for each work order
      for (const payload of payloads) {
        const checkRes = await axios.get(
          `${API}/workorderrequest/api/getdetailbyId/${tenderId}/${payload.work_order_id}`,
        );
        const updatedWO = Array.isArray(checkRes.data?.data)
          ? checkRes.data.data[0]
          : checkRes.data?.data;

        if (
          updatedWO?.materialsRequired?.every((m) => (m.ex_quantity ?? 0) <= 0)
        ) {
          await axios.put(
            `${API}/workorderrequest/api/pass_wo/${payload.work_order_id}`,
            { status: "Completed" },
          );
          toast.info(`Work Order ${payload.work_order_id} marked as Completed`);
        }
      }

      toast.success(
        `${payloads.length} Daily Work Report${payloads.length > 1 ? "s" : ""} Submitted!`,
      );
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FiFileText />
              </span>
              Daily Progress Report (DPR)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 ml-11">
              Work Done Entry
            </p>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {/* Global fields */}
          <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Report Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarDays
                  size={14}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => {
                    setReportDate(e.target.value);
                    clearFieldError("reportDate");
                  }}
                  className={`w-full pl-9 border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 ${errors.reportDate ? "border-red-400 focus:ring-red-300" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"}`}
                />
              </div>
              {errors.reportDate && (
                <p className="text-red-500 text-[10px] mt-0.5">
                  {errors.reportDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Project
              </label>
              <input
                value={tenderId || "No project selected"}
                readOnly
                className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed ${!tenderId ? "border-red-300 bg-red-50 text-red-400" : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
              />
              {!tenderId && (
                <p className="text-red-500 text-[10px] mt-0.5">
                  Open a project to continue
                </p>
              )}
            </div>
          </div>

          {/* Work Order Sections */}
          <div className="px-6 py-5 space-y-6">
            {sections.map((section, idx) => (
              <WorkOrderSection
                key={section.sectionId}
                section={section}
                sectionIndex={idx}
                workOrders={workOrders}
                tenderId={tenderId}
                usedWorkOrderIds={usedWorkOrderIds.filter(
                  (id) => id !== section.workOrderId,
                )}
                canRemove={sections.length > 1}
                sectionErrors={errors.sections[section.sectionId] || {}}
                onChangeWorkOrder={(woId) =>
                  updateWorkOrder(section.sectionId, woId)
                }
                onContractorLoaded={(name) =>
                  updateContractorName(section.sectionId, name)
                }
                onItemsLoaded={(items) => updateItems(section.sectionId, items)}
                onItemChange={(i, field, val) =>
                  updateItemField(section.sectionId, i, field, val)
                }
                onRemoveSection={() => removeSection(section.sectionId)}
              />
            ))}

            <button
              onClick={addSection}
              className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors"
            >
              <FiPlus size={16} /> Add Work Order
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <span className="text-sm text-gray-500">
            Work Orders:{" "}
            <strong className="text-gray-800 dark:text-white">
              {sections.filter((s) => s.workOrderId).length}
            </strong>
          </span>
          <div className="flex gap-3">
            <button
              onClick={onclose}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FiSave />
              )}
              {loading ? "Saving..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Work Order Section ───────────────────────────────────────────────────────

const WorkOrderSection = ({
  section,
  sectionIndex,
  workOrders,

  tenderId,
  usedWorkOrderIds,
  canRemove,
  sectionErrors,
  onChangeWorkOrder,
  onContractorLoaded,

  onItemsLoaded,
  onItemChange,
  onRemoveSection,
}) => {
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (!section.workOrderId || !tenderId) {
      onItemsLoaded([]);
      return;
    }

    const load = async () => {
      try {
        setFetchLoading(true);
        const res = await axios.get(
          `${API}/workorderrequest/api/getQuotationApproved/${section.workOrderId}`,
        );
        const details = Array.isArray(res.data?.data)
          ? res.data.data[0]
          : res.data?.data;

        // Auto-fill vendor name
        onContractorLoaded(details?.selectedContractor?.contractorName || "");

        const quoteItems = details?.selectedContractor?.quoteItems || [];
        const rateByName = Object.fromEntries(
          quoteItems.map((q) => [q.materialName, q.quotedUnitRate ?? 0]),
        );
        onItemsLoaded(
          details?.materialsRequired?.map((mat) =>
            emptyItem(mat, rateByName[mat.materialName] ?? 0),
          ) || [],
        );
      } catch {
        toast.error("Failed to load work order items");
        onContractorLoaded("");
        onItemsLoaded([]);
      } finally {
        setFetchLoading(false);
      }
    };

    load();
  }, [section.workOrderId, tenderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const woError = sectionErrors.workOrderId || "";
  const availableOrders = workOrders.filter(
    (wo) => !usedWorkOrderIds.includes(wo.requestId),
  );

  // Build options for WO searchable select
  const woOptions = [
    ...availableOrders.map((wo) => ({
      value: wo.requestId,
      label: wo.requestId,
    })),
    ...(section.workOrderId &&
    !availableOrders.find((wo) => wo.requestId === section.workOrderId)
      ? [{ value: section.workOrderId, label: section.workOrderId }]
      : []),
  ];

  return (
    <div
      className={`rounded-xl border ${woError ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"} bg-white dark:bg-gray-900`}
    >
      {/* Section header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <div className="flex items-start gap-3">
          <span className="text-xs font-bold text-gray-400 shrink-0 mt-2">
            #{sectionIndex + 1}
          </span>

          {/* Row: WO + Vendor + Manager + Delete */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            {/* Work Order searchable select */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Work Order <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={section.workOrderId}
                onChange={onChangeWorkOrder}
                options={woOptions}
                placeholder="Select Work Order"
                hasError={!!woError}
              />
              {woError && (
                <p className="text-red-500 text-[10px] mt-0.5">{woError}</p>
              )}
            </div>

            {/* Contractor Name auto-fill */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Contractor Name
              </label>
              <input
                readOnly
                value={section.contractorName}
                placeholder={
                  section.workOrderId
                    ? "No contractor linked"
                    : "Auto-filled on WO select"
                }
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

           
          </div>

          {canRemove && (
            <button
              onClick={onRemoveSection}
              className="p-1.5 mt-5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Items table */}
      {!section.workOrderId ? (
        <div className="py-10 text-center text-sm text-gray-400">
          Select a work order to load items
        </div>
      ) : fetchLoading ? (
        <div className="py-10 flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Loading items...
        </div>
      ) : section.items.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          No items found in this work order
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 min-w-[200px] font-semibold text-xs text-gray-600 dark:text-gray-300">
                  Description
                </th>
                <th className="px-2 py-3 w-16 text-center font-semibold text-xs text-gray-600 dark:text-gray-300">
                  No 1
                </th>
                <th className="px-2 py-3 w-16 text-center font-semibold text-xs text-gray-600 dark:text-gray-300">
                  No 2
                </th>
                <th className="px-2 py-3 w-20 text-center font-semibold text-xs text-gray-600 dark:text-gray-300">
                  L
                </th>
                <th className="px-2 py-3 w-20 text-center font-semibold text-xs text-gray-600 dark:text-gray-300">
                  B
                </th>
                <th className="px-2 py-3 w-20 text-center font-semibold text-xs text-gray-600 dark:text-gray-300">
                  H
                </th>
                <th className="px-4 py-3 w-32 font-semibold text-xs text-gray-600 dark:text-gray-300">
                  Total Qty <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 w-24 font-semibold text-xs text-gray-600 dark:text-gray-300">
                  Unit
                </th>
                <th className="px-4 py-3 w-28 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                  Quoted Rate
                </th>
                <th className="px-4 py-3 min-w-[160px] font-semibold text-xs text-gray-600 dark:text-gray-300">
                  NMR <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 min-w-[180px] font-semibold text-xs text-gray-600 dark:text-gray-300">
                  Remarks <span className="text-red-500">*</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {section.items.map((item, idx) => {
                const qty = Number(item.quantity) || 0;
                const maxQty = item.maxQuantity ?? 0;
                const isExceeded = qty > 0 && maxQty > 0 && qty > maxQty;
                const isCompleted = maxQty === 0;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-blue-50/30 dark:hover:bg-gray-700/20 transition-colors ${isCompleted ? "opacity-60 bg-gray-50 dark:bg-gray-900/50" : ""}`}
                  >
                    <td className="px-4 py-2 align-top">
                      <div className="py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {item.description}
                        {isCompleted && (
                          <span className="ml-2 text-green-600 text-xs font-bold">
                            (Completed)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* No1, No2 */}
                    {["no1", "no2"].map((dim) => (
                      <td key={dim} className="px-2 py-2 align-top">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          disabled={isCompleted}
                          value={item[dim]}
                          onKeyDown={onlyNumbers}
                          onChange={(e) =>
                            onItemChange(idx, dim, e.target.value)
                          }
                          className="w-full text-center rounded-lg border border-gray-300 dark:border-gray-600 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-900 dark:text-white transition-all"
                        />
                      </td>
                    ))}

                    {/* L, B, H */}
                    {["length", "breadth", "height"].map((dim) => (
                      <td key={dim} className="px-2 py-2 align-top">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          disabled={isCompleted}
                          value={item[dim]}
                          onKeyDown={onlyNumbers}
                          onChange={(e) =>
                            onItemChange(idx, dim, e.target.value)
                          }
                          className="w-full text-center rounded-lg border border-gray-300 dark:border-gray-600 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-900 dark:text-white transition-all"
                        />
                      </td>
                    ))}

                    {/* Total Qty */}
                    <td className="px-4 py-2 align-top">
                      <div className="relative">
                        <Calculator
                          size={13}
                          className="absolute left-2 top-2.5 text-gray-400"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled={isCompleted}
                          value={item.quantity}
                          onKeyDown={onlyNumbers}
                          onChange={(e) =>
                            onItemChange(idx, "quantity", e.target.value)
                          }
                          className={`w-full pl-8 rounded-lg border py-1.5 text-sm font-bold outline-none transition-all ${isExceeded ? "border-red-500 text-red-600 bg-red-50" : "border-gray-300 text-blue-700 bg-blue-50/50 focus:border-blue-500"} disabled:bg-gray-100 dark:bg-gray-900 dark:border-gray-600 dark:text-blue-400`}
                        />
                      </div>
                      <p
                        className={`text-[10px] mt-0.5 ${isExceeded ? "text-red-500 font-bold" : "text-gray-400"}`}
                      >
                        Max: {maxQty}
                      </p>
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-2 align-top">
                      <div className="py-1.5 text-sm text-gray-600 dark:text-gray-400">
                        {item.unit}
                      </div>
                    </td>

                    {/* Quoted Rate */}
                    <td className="px-4 py-2 align-top text-center">
                      {item.quoted_rate > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          ₹{Number(item.quoted_rate).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Contractor */}
                    <td className="px-4 py-2 align-top">
                      <input
                        type="text"
                        disabled={isCompleted}
                        value={item.contractor_details}
                        onChange={(e) =>
                          onItemChange(
                            idx,
                            "contractor_details",
                            e.target.value,
                          )
                        }
                        placeholder={isCompleted ? "N/A" : "Enter Contractor"}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-900 dark:text-white transition-all"
                      />
                    </td>

                    {/* Remarks */}
                    <td className="px-4 py-2 align-top">
                      <input
                        type="text"
                        disabled={isCompleted}
                        value={item.remarks}
                        onChange={(e) =>
                          onItemChange(idx, "remarks", e.target.value)
                        }
                        placeholder="Notes..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-900 dark:text-white transition-all"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


export default AddWorkOrderDone;
