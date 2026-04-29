import React, { useState, useEffect, useRef } from "react";
import { TbPlus, TbTrash, TbX, TbDeviceFloppy, TbChevronDown, TbCalculator } from "react-icons/tb";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";

// --- 1. Custom Searchable Select ---
const SearchableSelect = ({ options, value, onChange, placeholder, labelKey = "label", valueKey = "value" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight when filtered list changes
  useEffect(() => { setHighlightedIndex(-1); }, [search]);

  const filteredOptions = options.filter((opt) =>
    opt[labelKey].toLowerCase().includes(search.toLowerCase())
  );
  const selectedOption = options.find((opt) => opt[valueKey] === value);

  const selectOption = (opt) => {
    onChange(opt[valueKey]);
    setSearch("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") { setIsOpen(true); setHighlightedIndex(0); e.preventDefault(); }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = highlightedIndex < filteredOptions.length - 1 ? highlightedIndex + 1 : 0;
      setHighlightedIndex(next);
      scrollToItem(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = highlightedIndex > 0 ? highlightedIndex - 1 : filteredOptions.length - 1;
      setHighlightedIndex(prev);
      scrollToItem(prev);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Tab") {
      // Close dropdown and let Tab move focus to next field naturally
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const scrollToItem = (index) => {
    if (listRef.current) {
      const item = listRef.current.children[index];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 cursor-pointer placeholder-gray-400 font-medium"
          placeholder={placeholder}
          value={isOpen ? search : (selectedOption ? selectedOption[labelKey] : "")}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => { setSearch(""); setIsOpen(true); }}
          onKeyDown={handleKeyDown}
        />
        <TbChevronDown className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && (
        <div ref={listRef} className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <div
                key={opt[valueKey]}
                className={`px-3 py-2 text-sm cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700 transition-colors ${
                  idx === highlightedIndex
                    ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                }`}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => selectOption(opt)}
              >
                {opt[labelKey]}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400 text-center">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 2. Focus Trap Hook ---
const useFocusTrap = (ref) => {
  useEffect(() => {
    const FOCUSABLE = 'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const handleKeyDown = (e) => {
      if (e.key !== "Tab" || !ref.current) return;
      const focusable = Array.from(ref.current.querySelectorAll(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ref]);
};

// --- 3. Main Component ---
const BulkLogModal = ({ onClose, onSuccess }) => {
  const modalRef = useRef(null);
  useFocusTrap(modalRef);

  const [commonData, setCommonData] = useState({
    logDate: new Date().toISOString().split("T")[0],
    projectId: localStorage.getItem("tenderId") || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assets, setAssets] = useState([]);
  
  // New States for BOQ Logic
  const [boqItems, setBoqItems] = useState([]);
  const [bidId, setBidId] = useState(""); // Stores the parent Bid Document ID (_id)

  // Template
  const emptyRow = {
    id: Date.now(),
    assetId: "", 
    item_id: "", // Stores 'ABS001'
    vendorId: "", // Stores 'Machinery' collection vendorId
    vendorName: "", // Stores 'Machinery' collection vendorName
    rent: "",
    startReading: "", endReading: "", netUsage: 0,
    fuelOpening: "", fuelIssued: "", fuelClosing: "", fuelConsumed: 0,
    length: "", breadth: "", depth: "", quantity: 0, unit: "cum", remarks: "",
  };

  const [rows, setRows] = useState([emptyRow]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (!commonData.projectId) return toast.error("Project ID not found.");
      try {
        const [assetRes, boqRes] = await Promise.all([
          axios.get(`${API}/machineryasset/getall/assets`),
          axios.get(`${API}/bid/getitemslite/${commonData.projectId}`)
        ]);

        // 1. Handle Assets — filter by current project, need full doc for vendorId/vendorName
        if (assetRes.data.status) {
          const allAssets = assetRes.data.data || [];
          setAssets(allAssets.filter(a => a.projectId === commonData.projectId));
        }

        // 2. Handle BOQ Items & Bid ID
        if (boqRes.data.status && boqRes.data.data) {
           // Store the parent Bid ID (e.g., 695d2239...)
           setBidId(boqRes.data.data._id);
           // Store the items array (e.g., [{item_id: "ABS001", ...}])
           setBoqItems(boqRes.data.data.items || []);
        }

      } catch (err) { console.error(err); }
    };
    fetchDropdowns();
  }, [commonData.projectId]);

  // Calculations
  const calculateRowValues = (row) => {
    const start = parseFloat(row.startReading) || 0;
    const end = parseFloat(row.endReading) || 0;
    const netUsage = end > start ? (end - start).toFixed(1) : 0;

    const open = parseFloat(row.fuelOpening) || 0;
    const issued = parseFloat(row.fuelIssued) || 0;
    const close = parseFloat(row.fuelClosing) || 0;
    const fuelConsumed = row.fuelClosing ? (open + issued - close).toFixed(1) : 0;

    return { ...row, netUsage, fuelConsumed };
  };

  const handleInputChange = (id, field, value) => {
    setRows((prev) => prev.map((r) => r.id === id ? calculateRowValues({ ...r, [field]: value }) : r));
  };

  const today = new Date().toISOString().split("T")[0];

  const handleBoqChange = (id, itemId) => {
    const selectedBoq = boqItems.find(b => b.item_id === itemId);
    setRows((prev) => prev.map((r) => r.id === id ? calculateRowValues({
      ...r,
      item_id: itemId,
      unit: selectedBoq?.unit || r.unit,
    }) : r));
  };

  const handleAssetChange = (id, assetMongoId) => {
    const selectedAsset = assets.find(a => a._id === assetMongoId);
    setRows((prev) => prev.map((r) => r.id === id ? calculateRowValues({
      ...r,
      assetId: assetMongoId,
      vendorId: selectedAsset?.vendorId || "",
      vendorName: selectedAsset?.vendorName || "",
    }) : r));
  };

  const handleSubmit = async () => {
    if (!commonData.projectId) return toast.error("Project ID is missing");
    if (!bidId) return toast.error("Bid Reference (BOQ) not found for this project.");

    const isValid = rows.every(r => r.assetId && r.item_id && r.startReading && r.endReading);
    if (!isValid) return toast.error("Asset, BOQ Item, and Meter Readings are required.");
    
    setIsSubmitting(true);
    try {
      const payload = rows.map((r) => ({
        projectId: commonData.projectId, 
        logDate: commonData.logDate,
        
        // --- Updated Logic Here ---
        assetId: r.assetId,
        bid_id: bidId,      // Maps to 'Bids' collection _id
        item_id: r.item_id, // Maps to specific item code like 'ABS001'
        // --------------------------
        vendorId: r.vendorId || "", // Maps to 'Machinery' collection vendorId
        vendorName: r.vendorName || "", // Maps to 'Machinery' collection vendorName

        rent: parseFloat(r.rent) || 0,
        startReading: parseFloat(r.startReading), 
        endReading: parseFloat(r.endReading), 
        netUsage: parseFloat(r.netUsage),
        
        fuelOpening: parseFloat(r.fuelOpening), 
        fuelIssued: parseFloat(r.fuelIssued || 0), 
        fuelClosing: parseFloat(r.fuelClosing), 
        fuelConsumed: parseFloat(r.fuelConsumed),
        
        length: parseFloat(r.length) || 0, 
        breadth: parseFloat(r.breadth) || 0, 
        depth: parseFloat(r.depth) || 0, 
        quantity: parseFloat(r.quantity) || 0, 
        unit: r.unit || "",
        
        remarks: r.remarks || ""
      }));
         console.log(payload);
      const res = await axios.post(`${API}/machinerylogs/bulk`, { logs: payload });
   
      
      if (res.data.status) { toast.success("Saved!"); onSuccess(); onClose(); }
    } catch (err) { 
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to save logs"); 
    } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div ref={modalRef} className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800">
        
        {/* --- Header --- */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">DPR</span> Daily Plant Report
            </h2>
            <p className="text-xs text-gray-500 mt-1">Project: <span className="font-bold text-gray-700 dark:text-gray-300">{commonData.projectId}</span></p>
          </div>
          <div className="flex gap-3">
            <input type="date" max={today} className="p-2 text-sm border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700" value={commonData.logDate} onChange={(e) => { if (e.target.value <= today) setCommonData({...commonData, logDate: e.target.value}); }} />
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full dark:hover:bg-gray-800 text-gray-500"><TbX size={22}/></button>
          </div>
        </div>

        {/* --- Scrollable Content --- */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-black/20 p-4 space-y-6">
          {rows.map((row, index) => (
            <div key={row.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden relative group">
              
              {/* Badge & Delete */}
              <div className="absolute top-0 left-0 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
                Log #{index + 1}
              </div>
              <button onClick={() => {if(rows.length > 1) setRows(rows.filter(r => r.id !== row.id))}} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all z-10">
                <TbTrash size={18} />
              </button>

              <div className="p-5 pt-7 flex flex-col gap-5">
                
                {/* === ROW 1: Identity & Rent === */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Machine / Asset</label>
                    <SearchableSelect
                      placeholder="Search Asset..."
                      options={assets.map(a => ({ label: a.assetName, value: a._id }))}
                      value={row.assetId}
                      onChange={(val) => handleAssetChange(row.id, val)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">BOQ Item Reference</label>
                    <SearchableSelect
                      placeholder="Search Work Item..."
                      options={boqItems.map(b => ({ label: `${b.item_id} - ${b.item_name}`, value: b.item_id }))}
                      value={row.item_id}
                      onChange={(val) => handleBoqChange(row.id, val)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rent (Rate)</label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 px-2 py-2">
                      <span className="text-gray-400 mr-1 text-sm">₹</span>
                      <input type="number" placeholder="0.00" className="w-full bg-transparent outline-none text-sm font-semibold" value={row.rent} onChange={(e) => handleInputChange(row.id, "rent", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* === ROW 2: Operational Data (Meter & Fuel) === */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Meter Group */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">
                      <TbCalculator size={14} /> Meter Reading (HMR/Km)
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <InputBox label="Start" value={row.startReading} onChange={(v) => handleInputChange(row.id, "startReading", v)} />
                      <InputBox label="Close" value={row.endReading} onChange={(v) => handleInputChange(row.id, "endReading", v)} />
                      <ReadOnlyBox label="Net Usage" value={row.netUsage} color="text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>

                  {/* Fuel Group */}
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase">
                      <TbCalculator size={14} /> Diesel Log (Liters)
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <InputBox label="Opening" value={row.fuelOpening} onChange={(v) => handleInputChange(row.id, "fuelOpening", v)} />
                      <InputBox label="Issued" value={row.fuelIssued} onChange={(v) => handleInputChange(row.id, "fuelIssued", v)} />
                      <InputBox label="Closing" value={row.fuelClosing} onChange={(v) => handleInputChange(row.id, "fuelClosing", v)} />
                      <ReadOnlyBox label="Consumed" value={row.fuelConsumed} color="text-amber-700 dark:text-amber-300" />
                    </div>
                  </div>
                </div>

                {/* === ROW 3: Production & Remarks === */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  
                  {/* Work Output Group */}
                  <div className="col-span-12 md:col-span-8 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase">
                      <TbCalculator size={14} /> Work Output Dimensions
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <InputBox label="Length (L)" value={row.length} onChange={(v) => handleInputChange(row.id, "length", v)} />
                      <InputBox label="Breadth (B)" value={row.breadth} onChange={(v) => handleInputChange(row.id, "breadth", v)} />
                      <InputBox label="Depth (D)" value={row.depth} onChange={(v) => handleInputChange(row.id, "depth", v)} />
                      <InputBox label="Quantity" value={row.quantity} onChange={(v) => handleInputChange(row.id, "quantity", v)} />
                      {/* Unit — auto-filled from BOQ item */}
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase block mb-1 font-semibold">Unit</label>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded px-2 py-1.5 text-sm font-bold text-center border border-gray-200 dark:border-gray-600 text-emerald-700 dark:text-emerald-300 min-h-[30px]">
                          {row.unit || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Remarks</label>
                    <textarea 
                      rows={2}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Enter specific notes here..."
                      value={row.remarks}
                      onChange={(e) => handleInputChange(row.id, "remarks", e.target.value)}
                    />
                  </div>
                </div>

              </div>
            </div>
          ))}

          <button onClick={() => setRows([...rows, { ...emptyRow, id: Date.now() }])} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all font-bold flex items-center justify-center gap-2">
            <TbPlus size={18} /> Add Another Log Entry
          </button>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-slate-600 hover:bg-slate-700 shadow-lg disabled:opacity-50">
            {isSubmitting ? "Saving..." : <><TbDeviceFloppy size={18}/> Save {rows.length} Records</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Sub-components for cleaner code ---
const InputBox = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] text-gray-400 uppercase block mb-1 font-semibold">{label}</label>
    <input 
      type="number" 
      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-300" 
      placeholder="0"
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

const ReadOnlyBox = ({ label, value, color }) => (
  <div>
    <label className="text-[10px] text-gray-400 uppercase block mb-1 font-semibold">{label}</label>
    <div className={`w-full bg-gray-100 dark:bg-gray-700 rounded px-2 py-1.5 text-sm font-bold text-center border border-gray-200 dark:border-gray-600 ${color}`}>
      {value}
    </div>
  </div>
);

export default BulkLogModal;