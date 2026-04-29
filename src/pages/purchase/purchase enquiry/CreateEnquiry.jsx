import React, { useState, useEffect, useRef } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import SearchableSelect from "../../../components/SearchableSelect";

// --- INITIAL STATES ---
const initialMaterial = {
  materialName: "",
  quantity: "",
  unit: "",
  // New HSN Fields
  hsnSac: "",
  type: "",
  shortDescription: "",
  taxStructure: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
};

const initialVendor = { vendorId: "", vendorName: "" };

// --- HSN AUTOCOMPLETE COMPONENT ---
const HsnAutocomplete = ({ isReadOnly, material, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Sync internal input with parent state
  useEffect(() => {
    if (material.hsnSac) {
      // Show Code + Short Desc if available, else just Code
      const label = material.shortDescription
        ? `${material.hsnSac} - ${material.shortDescription}`
        : material.hsnSac;
      setSearchTerm(label);
    } else {
      setSearchTerm("");
    }
  }, [material.hsnSac, material.shortDescription]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // API Call
  const searchHsn = async (query) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/hsn/getall?search=${query}&limit=10`);
      setOptions(res.data?.data || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to fetch HSN codes", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Logic
  useEffect(() => {
    if (!isOpen || !searchTerm) return;
    const delayDebounceFn = setTimeout(() => {
      searchHsn(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelect = (item) => {
    setSearchTerm(`${item.code} - ${item.shortDescription || item.description}`);
    setIsOpen(false);
    onSelect({
      hsnSac: item.code,
      type: item.type,
      shortDescription: item.shortDescription || item.description,
      taxStructure: item.taxStructure || { igst: 0, cgst: 0, sgst: 0, cess: 0 },
    });
  };

  if (isReadOnly) {
    return (
      <span className="text-gray-800 dark:text-gray-200 text-xs">
        {material.hsnSac ? `${material.hsnSac}` : "-"}
      </span>
    );
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onClick={() => {
            setIsOpen(true);
            if (!options.length && searchTerm) searchHsn(searchTerm);
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            // Clear parent state if input is cleared
            if (e.target.value === "") {
              onSelect({
                hsnSac: "",
                type: "",
                shortDescription: "",
                taxStructure: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
              });
            }
          }}
          className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none text-gray-800 dark:text-gray-200 py-1 transition-colors pr-6 text-xs"
          placeholder="Search Code..."
        />
        <IoSearch className="absolute right-1 text-gray-400" size={14} />
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full min-w-[250px] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto text-xs">
          {loading ? (
            <li className="p-2 text-gray-500 text-center">Loading...</li>
          ) : options.length > 0 ? (
            options.map((item) => (
              <li
                key={item._id}
                onClick={() => handleSelect(item)}
                className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-none"
              >
                <div className="font-bold text-gray-800 dark:text-gray-200">
                  {item.code} <span className="text-[10px] text-blue-500 ml-1">({item.type})</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 truncate">
                  {item.shortDescription || item.description}
                </div>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500 text-center">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const CreateEnquiry = ({ onclose, onSuccess }) => {
  const [entryType, setEntryType] = useState("");

  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [projectVendors, setProjectVendors] = useState([]);

  // Selected values
  const [projectId, setProjectId] = useState("");
  const [requestId, setRequestId] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteIncharge, setSiteIncharge] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");

  const [materials, setMaterials] = useState([{ ...initialMaterial }]);
  const [selectedVendors, setSelectedVendors] = useState([{ ...initialVendor }]);

  const isReadOnly = entryType === "existing" && requestId;

  /** LOAD PROJECTS */
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await axios.get(`${API}/tender/gettendersid`);
      setProjects(res.data?.data || []);
    } catch {
      toast.error("Failed to load projects");
    }
  };

  /** FETCH VENDORS FOR PROJECT */
  const loadVendors = async (id) => {
    try {
      const res = await axios.get(`${API}/permittedvendor/getvendor/${id}`);
      setProjectVendors(res.data?.data?.permitted_vendors || []);
    } catch (err) {
      console.error("Failed to load vendors", err);
      setProjectVendors([]);
    }
  };

  /** RESET FORM FIELDS */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSiteName("");
    setSiteLocation("");
    setSiteIncharge("");
    setRequiredByDate("");
    setMaterials([{ ...initialMaterial }]);
    setSelectedVendors([{ ...initialVendor }]);
  };

  /** PROJECT SELECTION */
  const handleProjectSelect = async (id) => {
    setProjectId(id);
    setRequestId("");
    setRequests([]);
    resetForm();

    if (id) {
      loadVendors(id);
    }

    if (entryType !== "existing") return;

    try {
      const res = await axios.get(`${API}/purchaseorderrequest/api/getbyId/${id}`);
      const pendingRequests = (res.data?.data || []).filter(
        (r) => r.status === "Request Raised"
      );
      setRequests(pendingRequests);
    } catch {
      toast.error("No Purchase Requests Found");
    }
  };

  /** REQUEST AUTO FILL */
  const handleRequestSelect = async (id) => {
    setRequestId(id);

    try {
      const res = await axios.get(
        `${API}/purchaseorderrequest/api/getdetailbyId/${projectId}/${id}`
      );

      const d = res.data?.data || {};

      setTitle(d.title || "");
      setDescription(d.description || "");
      setSiteName(d.siteDetails?.siteName || "");
      setSiteLocation(d.siteDetails?.location || "");
      setSiteIncharge(d.siteDetails?.siteIncharge || "");
      setRequiredByDate(d.requiredByDate?.substring(0, 10) || "");

      // Map existing materials and ensure HSN defaults are set if missing from DB
      if (d.materialsRequired && d.materialsRequired.length > 0) {
        const mappedMaterials = d.materialsRequired.map((m) => ({
          ...initialMaterial,
          ...m,
          taxStructure: m.taxStructure || { igst: 0, cgst: 0, sgst: 0, cess: 0 },
        }));
        setMaterials(mappedMaterials);
      } else {
        setMaterials([{ ...initialMaterial }]);
      }
    } catch {
      toast.error("Failed to load request details");
    }
  };

  /** MATERIAL ROW HANDLERS */
  const handleAddRow = () => setMaterials([...materials, { ...initialMaterial }]);

  const handleDeleteRow = (index) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (i, field, value) => {
    const updated = [...materials];
    updated[i][field] = value;
    setMaterials(updated);
  };

  // Handle HSN Selection
  const handleHsnSelect = (i, hsnData) => {
    const updated = [...materials];
    updated[i] = { ...updated[i], ...hsnData };
    setMaterials(updated);
  };

  /** VENDOR ROW HANDLERS */
  const handleAddVendor = () =>
    setSelectedVendors([...selectedVendors, { ...initialVendor }]);

  const handleDeleteVendor = (index) => {
    if (selectedVendors.length === 1) return;
    setSelectedVendors(selectedVendors.filter((_, i) => i !== index));
  };

  const handleVendorChange = (i, field, value) => {
    const updated = [...selectedVendors];
    updated[i][field] = value;

    // Auto-fill Logic
    if (field === "vendorId") {
      const vendor = projectVendors.find((v) => v.vendor_id === value);
      if (vendor) updated[i].vendorName = vendor.vendor_name;
    } else if (field === "vendorName") {
      const vendor = projectVendors.find((v) => v.vendor_name === value);
      if (vendor) updated[i].vendorId = vendor.vendor_id;
    }

    setSelectedVendors(updated);
  };

  /** SUBMIT */
  const handleSubmit = async () => {
    if (!projectId) return toast.warning("Project is required");

    const validVendors = selectedVendors.filter(
      (v) => v.vendorId && v.vendorName
    );
    if (validVendors.length === 0)
      return toast.warning("At least one valid vendor is required");

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
      materialsRequired: materials,
      status: "Quotation Requested",
      permittedVendor: validVendors.map((v) => ({
        vendorId: v.vendorId,
        vendorName: v.vendorName,
      })),
    };

    console.log("payload", payload);
    

    try {
      if (entryType === "existing") {
        if (!requestId) return toast.warning("Select Request ID for existing entry");

        await axios.put(
          `${API}/purchaseorderrequest/api/updateStatus/${requestId}`,
          {
            status: "Quotation Requested",
            permittedVendor: payload.permittedVendor,
            materialsRequired: payload.materialsRequired,
          }
        );
      } else {
        await axios.post(`${API}/purchaseorderrequest/api/create`, payload);
      }

      toast.success("Enquiry Sent Successfully!");
      if (onSuccess) onSuccess();
      onclose();
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky top-0 z-[60]">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Create Enquiry
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Send enquiry for materials to vendors
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
          {/* TOP CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Entry Type
              </label>
              <SearchableSelect
                value={entryType}
                onChange={(val) => {
                  setEntryType(val);
                  setProjectId("");
                  setRequestId("");
                  resetForm();
                  setRequests([]);
                }}
                options={[
                  { value: "manual", label: "Manual Entry" },
                  { value: "existing", label: "Existing Request" },
                ]}
                placeholder="Select"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Project
              </label>
              <SearchableSelect
                value={projectId}
                onChange={(val) => handleProjectSelect(val)}
                disabled={isReadOnly}
                options={projects.map((p) => ({ value: p.tender_id, label: p.tender_id }))}
                placeholder="Select Project"
              />
            </div>

            {/* Conditional Request ID */}
            {entryType === "existing" && projectId && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Request ID
                </label>
                <SearchableSelect
                  value={requestId}
                  onChange={(val) => handleRequestSelect(val)}
                  options={requests.map((r) => ({ value: r.requestId, label: r.requestId }))}
                  placeholder="Select Request"
                />
              </div>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* SELECT VENDORS SECTION */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span> Select Vendors
              </h3>
              <button onClick={handleAddVendor} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                + Add Vendor
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Vendor ID</th>
                    <th className="px-4 py-3">Vendor Name</th>
                    <th className="px-4 py-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {selectedVendors.map((row, i) => (
                    <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <SearchableSelect
                          value={row.vendorId}
                          onChange={(val) => handleVendorChange(i, "vendorId", val)}
                          options={Array.isArray(projectVendors) ? projectVendors.map((v) => ({ value: v.vendor_id, label: v.vendor_id })) : []}
                          placeholder="Select ID"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <SearchableSelect
                          value={row.vendorName}
                          onChange={(val) => handleVendorChange(i, "vendorName", val)}
                          options={Array.isArray(projectVendors) ? projectVendors.map((v) => ({ value: v.vendor_name, label: v.vendor_name })) : []}
                          placeholder="Select Name"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {selectedVendors.length > 1 && (
                          <button
                            onClick={() => handleDeleteVendor(i)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
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
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* TITLE & DESCRIPTION */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Title
              </label>
              <input
                value={title}
                readOnly={isReadOnly}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none ${
                  isReadOnly ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800/50" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Description
              </label>
              <textarea
                value={description}
                readOnly={isReadOnly}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none ${
                  isReadOnly ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800/50" : ""
                }`}
                rows={2}
              />
            </div>
          </div>

          {/* SITE DETAILS SECTION */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 mt-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span> Site Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Name</label>
                <input
                  value={siteName}
                  readOnly={isReadOnly}
                  onChange={(e) => setSiteName(e.target.value)}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none ${
                    isReadOnly ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800/50" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                <input
                  value={siteLocation}
                  readOnly={isReadOnly}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none ${
                    isReadOnly ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800/50" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site Incharge</label>
                <input
                  value={siteIncharge}
                  readOnly={isReadOnly}
                  onChange={(e) => setSiteIncharge(e.target.value)}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none ${
                    isReadOnly ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800/50" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Required By</label>
                <input
                  type="date"
                  value={requiredByDate}
                  readOnly={isReadOnly}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none ${
                    isReadOnly ? "cursor-not-allowed bg-gray-50 dark:bg-gray-800/50" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* MATERIALS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span> Materials Required
              </h3>

              {!isReadOnly && (
                <button
                  onClick={handleAddRow}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  + Add Item
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 pb-32">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">#</th>
                    <th className="px-4 py-3 min-w-[180px]">Material Name</th>
                    {/* HSN Column */}
                    <th className="px-4 py-3 min-w-[220px]">HSN/SAC Code</th>
                    <th className="px-4 py-3 w-32">Qty</th>
                    <th className="px-4 py-3 w-24">Unit</th>
                    {!isReadOnly && <th className="px-4 py-3 w-16 text-center">Act</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {materials.map((row, i) => (
                    <tr
                      key={i}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-gray-400">{i + 1}</td>

                      <td className="px-4 py-3 align-top">
                        {isReadOnly ? (
                          <span className="text-gray-800 dark:text-gray-200 block mt-1">
                            {row.materialName}
                          </span>
                        ) : (
                          <input
                            value={row.materialName}
                            onChange={(e) => handleMaterialChange(i, "materialName", e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none text-gray-800 dark:text-gray-200 py-1 transition-colors text-xs"
                            placeholder="Enter material name"
                          />
                        )}
                      </td>

                      {/* HSN COLUMN (Always Editable via Dropdown) */}
                      <td className="px-4 py-3 align-top">
                        <HsnAutocomplete
                          // KEY CHANGE: Set to false so it's ALWAYS editable, even if row is from existing request
                          isReadOnly={false}
                          material={row}
                          onSelect={(hsnData) => handleHsnSelect(i, hsnData)}
                        />
                        {row.hsnSac && (
                          <div className="text-[10px] text-gray-400 mt-1 pl-1">
                            GST: {(row.taxStructure?.igst || 0) + (row.taxStructure?.cess || 0)}%  | CGST: {(row.taxStructure?.cgst || 0)}% | SGST: {(row.taxStructure?.sgst || 0)}%
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {isReadOnly ? (
                          <span className="text-gray-800 dark:text-gray-200 block mt-1">
                            {row.quantity}
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => handleMaterialChange(i, "quantity", e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none text-gray-800 dark:text-gray-200 py-1 transition-colors text-xs"
                            placeholder="0.00"
                          />
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {isReadOnly ? (
                          <span className="text-gray-800 dark:text-gray-200 block mt-1">
                            {row.unit}
                          </span>
                        ) : (
                          <input
                            value={row.unit}
                            onChange={(e) => handleMaterialChange(i, "unit", e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none text-gray-800 dark:text-gray-200 py-1 transition-colors text-xs"
                            placeholder="Unit"
                          />
                        )}
                      </td>

                      {!isReadOnly && (
                        <td className="px-4 py-3 text-center align-top pt-4">
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onclose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all"
            >
              Save Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEnquiry;