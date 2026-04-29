import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import { useTenderIds } from "../debit_creditnote/hooks/useDebitCreditNote";
import Button from "../../../components/Button";

/* ── Shared dropdown classes ── */
const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-gray-400";

/* ── Searchable Select ── */
const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search...", disabled = false, isLoading = false }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Reset highlight when search changes
  useEffect(() => { setHighlightedIndex(-1); }, [search]);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  const selectOption = (opt) => {
    onChange(opt);
    setOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
  };

  const scrollToIndex = (idx) => {
    if (listRef.current) {
      const item = listRef.current.children[idx];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = highlightedIndex < filtered.length - 1 ? highlightedIndex + 1 : 0;
      setHighlightedIndex(next);
      scrollToIndex(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = highlightedIndex > 0 ? highlightedIndex - 1 : filtered.length - 1;
      setHighlightedIndex(prev);
      scrollToIndex(prev);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        selectOption(filtered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen(o => !o); setSearch(""); } }}
        className={`${inputCls} flex items-center justify-between text-left ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`truncate ${selected ? "text-gray-800 dark:text-white font-medium" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        {isLoading
          ? <span className="shrink-0 ml-1 w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          : <FiChevronDown className={`text-gray-400 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {open && !disabled && (
        <div className="absolute z-[200] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Type to search..."
              onClick={e => e.stopPropagation()}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div ref={listRef} className="overflow-y-auto">
            {isLoading ? (
              <p className="text-xs text-gray-400 px-3 py-2 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin inline-block" />
                Loading references...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2">No projects found</p>
            ) : (
              filtered.map((o, idx) => (
                <div
                  key={o.value}
                  onMouseDown={(e) => { e.preventDefault(); selectOption(o); }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    idx === highlightedIndex
                      ? "bg-blue-600 text-white"
                      : o.value === value
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  }`}
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


/* ── Main Modal Component ── */
const ProjectSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  
  // API Hook for tenders precisely matching the requested reference context
  const { data: tendersRaw = [], isLoading: loadingTenders } = useTenderIds();

  // Create options list for dropdown
  const tenderOptions = tendersRaw.map(t => ({
    value: t.tender_id,
    label: t.tender_project_name ? `${t.tender_id} – ${t.tender_project_name}` : t.tender_id,
  }));

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedProjectId) {
      onSelect(selectedProjectId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Project Context</h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose a tender to view client billing history.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Project / Tender 
            <span className="text-red-400 ml-0.5">*</span>
          </label>
          
          <SearchableSelect
            options={tenderOptions}
            value={selectedProjectId}
            onChange={(opt) => setSelectedProjectId(opt.value)}
            placeholder="Search and select project..."
            isLoading={loadingTenders}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 flex justify-end gap-3 items-center rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div onClick={handleApply} className={!selectedProjectId ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}>
            <Button
              button_name="Okay"
              className="py-2 px-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;
