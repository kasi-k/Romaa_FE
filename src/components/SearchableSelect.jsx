import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiSearch } from "react-icons/fi";

/**
 * SearchableSelect — unified dropdown with search + full keyboard nav.
 *
 * Usage A (direct state):
 *   <SearchableSelect value={val} onChange={setVal} options={[{value,label}]} />
 *
 * Usage B (react-hook-form via watch/setValue):
 *   <SearchableSelect name="field" watch={watch} setValue={setValue} options={[{value,label}]} />
 *
 * Usage C (with label + error wrapper):
 *   <SearchableSelect label="Gender *" name="gender" watch={watch} setValue={setValue}
 *     options={["Male","Female","Other"]} error={errors.gender} />
 *
 * Keyboard: Arrow Up/Down to navigate, Enter to select, Escape to close, Tab to close + advance.
 * options: array of strings OR array of {value, label} objects
 */
const SearchableSelect = ({
  // Direct mode
  value: valueProp,
  onChange,
  // RHF mode
  name,
  watch,
  setValue,
  // Common
  options = [],
  placeholder,
  disabled,
  hasError,
  // When true, the trigger shows the raw value (e.g. an ID) instead of the label after selection
  showValueSelected,
  // Override trigger styling (e.g. "rounded-xl py-3 px-4" for forms with taller inputs)
  triggerClassName,
  // Wrapper
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const dropdownRef = useRef(null);

  // Normalize options to {value, label}
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  // Resolve current value
  const currentValue =
    valueProp !== undefined
      ? valueProp
      : watch
        ? watch(name)
        : "";

  // Resolve onChange handler
  const handleChange = (val) => {
    if (onChange) onChange(val);
    else if (setValue && name) setValue(name, val);
  };

  const selectedLabel = showValueSelected
    ? currentValue || ""
    : normalizedOptions.find((opt) => opt.value === currentValue)?.label || "";

  const showError = hasError || !!error;

  const filtered = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset highlight when search changes
  useEffect(() => { setHighlightedIndex(-1); }, [searchTerm]);

  // Calculate fixed dropdown position from trigger element
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const openDropdown = () => {
    if (disabled) return;
    updateDropdownPosition();
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const selectOption = (val) => {
    handleChange(val);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const scrollToHighlighted = (index) => {
    if (listRef.current) {
      const item = listRef.current.children[index];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  };

  // Keep dropdown anchored to trigger when page scrolls or resizes
  useEffect(() => {
    if (!isOpen) return;
    const handleUpdate = () => updateDropdownPosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inWrapper = wrapperRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inWrapper && !inDropdown) closeDropdown();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard handler for the trigger div (closed state)
  const handleTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      updateDropdownPosition();
      setIsOpen(true);
      setHighlightedIndex(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      updateDropdownPosition();
      setIsOpen(true);
      setHighlightedIndex(filtered.length - 1);
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  // Keyboard handler for the search input (open state)
  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = highlightedIndex < filtered.length - 1 ? highlightedIndex + 1 : 0;
      setHighlightedIndex(next);
      scrollToHighlighted(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = highlightedIndex > 0 ? highlightedIndex - 1 : filtered.length - 1;
      setHighlightedIndex(prev);
      scrollToHighlighted(prev);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        selectOption(filtered[highlightedIndex].value);
      }
    } else if (e.key === "Escape") {
      closeDropdown();
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      // Close dropdown and let Tab advance focus naturally
      closeDropdown();
    }
  };

  const trigger = (
    <div
      ref={triggerRef}
      onClick={() => (isOpen ? closeDropdown() : openDropdown())}
      onKeyDown={handleTriggerKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={`w-full border text-sm bg-white dark:bg-gray-900 dark:text-white flex justify-between items-center transition-all outline-none ${
        triggerClassName ?? "rounded-lg px-3 py-2"
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
          : "cursor-pointer"
      } ${
        showError
          ? "border-red-400"
          : isOpen
            ? "border-blue-500 ring-1 ring-blue-500"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
      }`}
    >
      <span className={!selectedLabel ? "text-gray-400" : "text-gray-800 dark:text-white"}>
        {selectedLabel || placeholder || "Select..."}
      </span>
      <FiChevronDown
        size={14}
        className={`text-gray-400 transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
      />
    </div>
  );

  // Dropdown rendered via portal to document.body so it escapes any ancestor
  // CSS transform / overflow / stacking-context (e.g. modals with scale-100).
  const dropdownPanel = isOpen && (
    <div
      ref={dropdownRef}
      style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
      className="fixed z-[9999] mt-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-56 flex flex-col overflow-hidden"
    >
      <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <FiSearch size={13} className="text-gray-400 shrink-0" />
        <input
          autoFocus
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search..."
          className="w-full text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200"
        />
      </div>
      <div ref={listRef} className="overflow-y-auto flex-1" role="listbox">
        {filtered.length > 0 ? (
          filtered.map((opt, idx) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={currentValue === opt.value}
              onMouseDown={(e) => {
                // Use mousedown so it fires before the clickOutside blur
                e.preventDefault();
                selectOption(opt.value);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`px-3 py-2 text-sm cursor-pointer ${
                idx === highlightedIndex
                  ? "bg-blue-600 text-white"
                  : currentValue === opt.value
                    ? "bg-blue-50 dark:bg-blue-900/30 font-medium text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              }`}
            >
              {opt.label}
            </div>
          ))
        ) : (
          <div className="px-3 py-3 text-xs text-gray-400 text-center">
            No results found
          </div>
        )}
      </div>
    </div>
  );

  const dropdown = dropdownPanel && createPortal(dropdownPanel, document.body);

  // If label is provided, wrap with label + error
  if (label !== undefined) {
    return (
      <div className="w-full" ref={wrapperRef}>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        {trigger}
        {dropdown}
        {error && (
          <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full" ref={wrapperRef}>
      {trigger}
      {dropdown}
    </div>
  );
};

export default SearchableSelect;
