import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAllowedQuantities, useCreateWorkOrderRequest, usePermittedContractors } from "../../hooks/useProjects";
import { useBOQItems } from "../../../site/WorkDone/hooks/useWorkDone";
import SearchableSelect from "../../../../components/SearchableSelect";

// ── Item Description dropdown (same as AddWorkDone DescriptionSelect) ────────
const ItemDescriptionSelect = ({ boqItems, boqLoading, value, onSelect, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [listStyle, setListStyle] = useState({});

  const openList = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setListStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setSearch("");
    setIsOpen(true);
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const q = search.toLowerCase();
  const filtered = boqItems.filter((b) => {
    const name = (b.item_name || "").toLowerCase();
    const id = String(b.item_id || "").toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? search : value}
        placeholder={boqLoading ? "Loading BOQ items…" : "Search BOQ item…"}
        onChange={(e) => { setSearch(e.target.value); if (!isOpen) openList(); }}
        onFocus={openList}
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
          hasError
            ? "border-red-400 focus:ring-red-200"
            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-100"
        }`}
      />
      {isOpen && (
        <div
          ref={listRef}
          style={listStyle}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
        >
          {boqLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-4 text-xs text-gray-400">
              <span className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full" />
              Loading BOQ items…
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((b) => (
              <div
                key={b.item_id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(b); setIsOpen(false); setSearch(""); }}
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-50 dark:border-gray-700/50 last:border-0 flex items-center justify-between gap-3"
              >
                <span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">{b.item_id}</span>
                  <span className="text-gray-700 dark:text-gray-200 ml-2">{b.item_name}</span>
                </span>
                {b.unit && (
                  <span className="shrink-0 text-[10px] font-bold uppercase text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {b.unit}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-xs text-center text-orange-500">
              {boqItems.length === 0 ? "No BOQ items found for this project" : "No matches found"}
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ---------------- Validation Schema ---------------- */
const workOrderSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  siteDetails: yup.object().shape({
    siteName: yup.string().required("Site name required"),
    location: yup.string().required("Location required"),
    siteIncharge: yup.string().required("Site incharge required"),
  }),
  requiredByDate: yup.string().required("Required by date is required"),
});

const defaultValues = {
  title: "",
  description: "",
  siteDetails: { siteName: "", location: "", siteIncharge: "" },
  requiredByDate: "",
};

const CreateRequest = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(workOrderSchema),
    defaultValues,
  });

  // --- Fetch Data using TanStack Query ---
  const { data: contractors = [] } = usePermittedContractors(tenderId);
  const { data: availableItems = [] } = useAllowedQuantities(tenderId);
  const { data: boqItems = [], isLoading: boqLoading } = useBOQItems(tenderId);
  const { mutateAsync: createRequest, isPending: loading } = useCreateWorkOrderRequest();

  // --- State ---
  const [materials, setMaterials] = useState([]);

  // Contractor Selection State
  const [selectedContractors, setSelectedContractors] = useState([{ contractorId: "", contractorName: "" }]);

  // Material Input State
  const [materialInput, setMaterialInput] = useState({
    materialName: "",
    boqDescription: "",
    detailedDescription: "",
    quantity: "",
    unit: "",
    maxQuantity: 0,
  });

  /* ---------------- Contractor Handlers ---------------- */
  const handleAddContractor = () => {
    setSelectedContractors([...selectedContractors, { contractorId: "", contractorName: "" }]);
  };

  const handleRemoveContractor = (index) => {
    if (selectedContractors.length === 1) return;
    setSelectedContractors(selectedContractors.filter((_, i) => i !== index));
  };

  const handleContractorChange = (index, value) => {
    const updated = [...selectedContractors];
    const found = contractors.find(v => v.contractor_id === value);
    updated[index] = {
      contractorId: found?.contractor_id || "",
      contractorName: found?.contractor_name || "",
    };
    setSelectedContractors(updated);
  };

  /* ---------------- Material Handlers ---------------- */

  // Existing Item Description dropdown (useAllowedQuantities)
  const handleItemSelect = (selectedName) => {
    const item = availableItems.find(i => i.item_description === selectedName);
    if (item) {
      setMaterialInput(prev => ({
        ...prev,
        materialName: item.item_description,
        unit: item.unit,
        maxQuantity: item.ex_quantity,
        quantity: "",
      }));
    } else {
      setMaterialInput(prev => ({ ...prev, materialName: "", unit: "", maxQuantity: 0 }));
    }
  };

  // New BOQ Item Description dropdown (useBOQItems — same as AddWorkDone)
  const handleBOQSelect = (b) => {
    setMaterialInput(prev => ({
      ...prev,
      boqDescription: `${b.item_id} - ${b.item_name}`,
      unit: prev.unit || (b.unit ? b.unit.toUpperCase() : ""),
    }));
  };

  // Handle Quantity Change with Validation
  const handleQuantityChange = (e) => {
    const val = parseFloat(e.target.value);
    const max = materialInput.maxQuantity;
    if (max > 0 && val > max) {
      toast.warning(`Quantity cannot exceed available limit: ${max}`);
    }
    setMaterialInput({ ...materialInput, quantity: e.target.value });
  };

  const handleMaterialAdd = () => {
    const { materialName, boqDescription, quantity, unit, maxQuantity, detailedDescription } = materialInput;

    if (!materialName || !boqDescription || !quantity || !unit || !detailedDescription) {
      toast.warning("Please fill all material fields.");
      return;
    }

    if (maxQuantity > 0 && parseFloat(quantity) > maxQuantity) {
      toast.error(`Quantity exceeds available limit (${maxQuantity} ${unit})`);
      return;
    }

    setMaterials((prev) => [...prev, materialInput]);
    setMaterialInput({ materialName: "", boqDescription: "", quantity: "", unit: "", maxQuantity: 0, detailedDescription: "" });
  };

  const handleMaterialDelete = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data) => {
    if (materials.length === 0) {
      toast.warning("Please add at least one material.");
      return;
    }

    const validContractors = selectedContractors.filter(v => v.contractorId && v.contractorName);
    if (validContractors.length === 0) {
      toast.warning("Please select at least one valid contractor.");
      return;
    }

    const finalData = {
      ...data,
      projectId: tenderId,
      // eslint-disable-next-line no-unused-vars
      materialsRequired: materials.map(({ maxQuantity, ...rest }) => rest),
      permittedContractor: validContractors.map(v => ({
        contractorId: v.contractorId,
        contractorName: v.contractorName,
      })),
    };

    try {
      await createRequest(finalData);
      toast.success("Request created successfully!");
      reset();
      setMaterials([]);
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create request.");
    }
  };

  // Only Item Description hides already-added items; BOQ dropdown shows all items always
  const filteredAvailableItems = availableItems.filter(
    (item) => !materials.some((m) => m.materialName === item.item_description)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Create Work Order Request
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Submit a new purchase request for approval
            </p>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

          {/* SECTION 1: REQUEST DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Title</label>
              <input
                {...register("title")}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="E.g. Cement Procurement"
              />
              <p className="text-xs text-red-500 mt-1">{errors.title?.message}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Required By Date</label>
              <input
                type="date"
                {...register("requiredByDate")}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-red-500 mt-1">{errors.requiredByDate?.message}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
              <textarea
                rows={2}
                {...register("description")}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Brief details about the requirement..."
              />
              <p className="text-xs text-red-500 mt-1">{errors.description?.message}</p>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SECTION 2: SITE DETAILS */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span> Site Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Name</label>
                <input
                  {...register("siteDetails.siteName")}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Site Name"
                />
                <p className="text-xs text-red-500 mt-1">{errors.siteDetails?.siteName?.message}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                <input
                  {...register("siteDetails.location")}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Location"
                />
                <p className="text-xs text-red-500 mt-1">{errors.siteDetails?.location?.message}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Incharge</label>
                <input
                  {...register("siteDetails.siteIncharge")}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Incharge Name"
                />
                <p className="text-xs text-red-500 mt-1">{errors.siteDetails?.siteIncharge?.message}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SECTION 3: CONTRACTOR SELECTION */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span> Select Contractors
              </h3>
              {selectedContractors[selectedContractors.length - 1]?.contractorId &&
                selectedContractors.filter(r => r.contractorId).length < contractors.length && (
                <button
                  type="button"
                  onClick={handleAddContractor}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  + Add Contractor
                </button>
              )}
            </div>

            <div className="space-y-2">
              {selectedContractors.map((row, i) => {
                const takenIds = selectedContractors
                  .filter((_, idx) => idx !== i)
                  .map((r) => r.contractorId)
                  .filter(Boolean);
                const availableContractors = contractors.filter(
                  (v) => !takenIds.includes(v.contractor_id)
                );
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-center shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <SearchableSelect
                        value={row.contractorId}
                        onChange={(val) => handleContractorChange(i, val)}
                        options={availableContractors.map((v) => ({
                          value: v.contractor_id,
                          label: `${v.contractor_name} (${v.contractor_id})`,
                        }))}
                        placeholder="Select Contractor"
                      />
                    </div>
                    {selectedContractors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContractor(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <IoClose size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SECTION 4: MATERIALS */}
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span> Material Requirements
              </h3>
              <button
                type="button"
                onClick={handleMaterialAdd}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

                {/* 1. Item Description — existing dropdown (useAllowedQuantities) */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Item Description</label>
                  <SearchableSelect
                    value={materialInput.materialName}
                    onChange={handleItemSelect}
                    options={filteredAvailableItems.map((item) => ({ value: item.item_description, label: item.item_description }))}
                    placeholder="Select Item"
                  />
                </div>

                {/* 2. Quantity */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">
                    Qty {materialInput.maxQuantity > 0 && <span className="text-blue-500 text-[10px]">(Max: {materialInput.maxQuantity})</span>}
                  </label>
                  <input
                    type="number"
                    value={materialInput.quantity}
                    onChange={handleQuantityChange}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>

                {/* 3. Unit */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Unit</label>
                  <input
                    value={materialInput.unit}
                    readOnly
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                    placeholder="Unit"
                  />
                </div>
              </div>

              {/* BOQ Description — new dropdown (useBOQItems, same as AddWorkDone) */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">BOQ Description</label>
                <ItemDescriptionSelect
                  boqItems={boqItems}
                  boqLoading={boqLoading}
                  value={materialInput.boqDescription}
                  onSelect={handleBOQSelect}
                />
              </div>

              {/* 4. Detailed Specifications */}
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Detailed Specifications</label>
                  <textarea
                    rows={2}
                    value={materialInput.detailedDescription || ""}
                    onChange={(e) => setMaterialInput({ ...materialInput, detailedDescription: e.target.value })}
                    placeholder="Enter technical specs, brand preference, or specific grade (e.g., Grade 43 OPC, 500 TMT)..."
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Materials Table */}
            {materials.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[11px] uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3">Material & Specs</th>
                      <th className="px-4 py-3 w-24 text-center">Qty</th>
                      <th className="px-4 py-3 w-24 text-center">Unit</th>
                      <th className="px-4 py-3 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {materials.map((mat, i) => (
                      <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-center text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800 dark:text-gray-200">{mat.materialName}</div>
                          {mat.boqDescription && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                              BOQ: {mat.boqDescription}
                            </div>
                          )}
                          {mat.detailedDescription && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5 line-clamp-1">
                              {mat.detailedDescription}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{mat.quantity}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{mat.unit}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleMaterialDelete(i)}
                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                          >
                            <IoClose size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onclose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
