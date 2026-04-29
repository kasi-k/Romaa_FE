import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { FiSave, FiPlus, FiTrash2, FiFileText } from "react-icons/fi";
import { CalendarDays } from "lucide-react";
import { useProject } from "../../../context/ProjectContext";
import { useAddWorkDone, useBOQItems } from "./hooks/useWorkDone";
import SearchableSelect from "../../../components/SearchableSelect";

const UNITS = ["Nos", "CUM", "SQM", "RMT", "MT", "KG", "Ltr", "Set", "Pair", "LS"];

const emptyItem = () => ({
  _key: Date.now() + Math.random(),
  item_description: "",
  length: "",
  breadth: "",
  height: "",
  quantity: "",
  unit: "Nos",
  contractor_details: "",
  remarks: "",
});

// ─── BOQ Searchable Dropdown ──────────────────────────────────────────────────
// Uses position:fixed for the list so it's never clipped by any parent overflow.

const DescriptionSelect = ({ boqItems, boqLoading, value, onChange, onSelect, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [listStyle, setListStyle] = useState({});

  // Position the fixed list under the input
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
        placeholder={boqLoading ? "Loading BOQ items…" : "Search BOQ or type description…"}
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
            <div className="px-4 py-4 text-xs text-center">
              {boqItems.length === 0
                ? <span className="text-orange-500">No BOQ items found for this project</span>
                : <span className="text-gray-400">No matches — type freely to use as description</span>}
            </div>
          )}
          {!boqLoading && search.trim() && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(search.trim()); setIsOpen(false); setSearch(""); }}
              className="px-4 py-2.5 text-xs cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-t border-gray-200 dark:border-gray-600 text-gray-500 italic"
            >
              Use &quot;{search.trim()}&quot; as custom description
            </div>
          )}
        </div>
      )}
    </>
  );
};

// ─── Work Item Card ───────────────────────────────────────────────────────────

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const numInput = "w-full text-center border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white transition-colors";
const textInput = "w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-gray-800 dark:text-white transition-colors";

const ItemCard = ({ item, idx, boqItems, boqLoading, errors, onUpdate, onSelectBOQ, onRemove, canRemove }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">

    {/* Row 1 — Description + Unit + Remove */}
    <div className="flex items-start gap-3">
      <span className="mt-2.5 text-xs font-bold text-gray-300 dark:text-gray-600 shrink-0 w-5 text-center">
        {idx + 1}
      </span>

      <div className="flex-1">
        <Field label="Item Description" required>
          <DescriptionSelect
            boqItems={boqItems}
            boqLoading={boqLoading}
            value={item.item_description}
            hasError={!!errors[`${item._key}_item_description`]}
            onChange={(val) => onUpdate(item._key, "item_description", val)}
            onSelect={(b) => onSelectBOQ(item._key, b)}
          />
          {errors[`${item._key}_item_description`] && (
            <p className="text-red-500 text-[10px] mt-0.5">{errors[`${item._key}_item_description`]}</p>
          )}
        </Field>
      </div>

      <div className="w-28 shrink-0">
        <Field label="Unit">
          <SearchableSelect
            value={item.unit}
            onChange={(val) => onUpdate(item._key, "unit", val)}
            options={[
              ...(!UNITS.includes(item.unit) && item.unit ? [{ value: item.unit, label: item.unit }] : []),
              ...UNITS.map((u) => ({ value: u, label: u })),
            ]}
          />
        </Field>
      </div>

      <div className="mt-6 shrink-0">
        {canRemove ? (
          <button
            onClick={() => onRemove(item._key)}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FiTrash2 size={15} />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>

    {/* Row 2 — Dimensions + Qty + Contractor + Remarks */}
    <div className="ml-8 grid grid-cols-6 gap-3">
      {[
        { key: "length", label: "L (m)" },
        { key: "breadth", label: "B (m)" },
        { key: "height", label: "H (m)" },
      ].map(({ key, label }) => (
        <Field key={key} label={label}>
          <input
            type="number"
            step="any"
            placeholder="0"
            value={item[key]}
            onChange={(e) => onUpdate(item._key, key, e.target.value)}
            className={numInput}
          />
        </Field>
      ))}

      <Field label="Quantity" required>
        <input
          type="number"
          step="any"
          value={item.quantity}
          onChange={(e) => onUpdate(item._key, "quantity", e.target.value)}
          className={`${numInput} font-bold ${
            errors[`${item._key}_quantity`]
              ? "border-red-400 bg-red-50 text-red-600"
              : "text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
          }`}
        />
        {errors[`${item._key}_quantity`] && (
          <p className="text-red-500 text-[10px]">{errors[`${item._key}_quantity`]}</p>
        )}
      </Field>

      <Field label="Contractor">
        <input
          type="text"
          value={item.contractor_details}
          onChange={(e) => onUpdate(item._key, "contractor_details", e.target.value)}
          placeholder="NMR"
          className={textInput}
        />
      </Field>

      <Field label="Remarks">
        <input
          type="text"
          value={item.remarks}
          onChange={(e) => onUpdate(item._key, "remarks", e.target.value)}
          placeholder="Notes…"
          className={textInput}
        />
      </Field>
    </div>
  </div>
);

// ─── Root component ───────────────────────────────────────────────────────────

const AddWorkDone = ({ onclose, onSuccess }) => {
  const { tenderId } = useProject();
  const { data: boqItems = [], isLoading: boqLoading } = useBOQItems(tenderId);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState([emptyItem()]);
  const [errors, setErrors] = useState({});

  const { mutate, isPending } = useAddWorkDone({ onSuccess, onClose: onclose });

  const updateItem = (key, field, value) => {
    setItems((prev) => prev.map((it) => it._key === key ? { ...it, [field]: value } : it));
    setErrors((prev) => ({ ...prev, [`${key}_${field}`]: "" }));
  };

  const handleSelectBOQ = (key, b) => {
    setItems((prev) =>
      prev.map((it) =>
        it._key === key
          ? { ...it, item_description: `${b.item_id} - ${b.item_name}`, unit: b.unit ? b.unit.toUpperCase() : it.unit }
          : it
      )
    );
    setErrors((prev) => ({ ...prev, [`${key}_item_description`]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!reportDate) errs.reportDate = "Date is required";
    items.forEach((it) => {
      if (!it.item_description.trim()) errs[`${it._key}_item_description`] = "Required";
      if (!it.quantity || Number(it.quantity) <= 0) errs[`${it._key}_quantity`] = "Required";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!tenderId || !validate()) return;
    const dailyWorkDone = items.map((it) => ({
      item_description: it.item_description.trim(),
      dimensions: {
        length: Number(it.length) || 0,
        breadth: Number(it.breadth) || 0,
        height: Number(it.height) || 0,
      },
      quantity: Number(it.quantity),
      unit: it.unit,
      remarks: it.remarks.trim() || "No Remarks",
      contractor_details: it.contractor_details.trim() || "NMR",
    }));
    mutate({ tender_id: tenderId, report_date: reportDate, dailyWorkDone });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-roboto-flex">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800">

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <FiFileText size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Add Work Done</h2>
              <p className="text-xs text-gray-400">Daily Progress Report — {items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
            <IoClose size={22} />
          </button>
        </div>

        {/* ── Global fields ── */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
          <Field label="Report Date" required>
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={reportDate}
                onChange={(e) => { setReportDate(e.target.value); setErrors((p) => ({ ...p, reportDate: "" })); }}
                className={`w-full pl-9 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${errors.reportDate ? "border-red-400 focus:ring-red-200" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-100"}`}
              />
            </div>
            {errors.reportDate && <p className="text-red-500 text-[10px]">{errors.reportDate}</p>}
          </Field>

          <Field label="Project">
            <input
              value={tenderId || "No project selected"}
              readOnly
              className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed ${!tenderId ? "border-red-300 bg-red-50 text-red-400" : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
            />
            {!tenderId && <p className="text-red-500 text-[10px]">Open a project to continue</p>}
          </Field>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.map((item, idx) => (
            <ItemCard
              key={item._key}
              item={item}
              idx={idx}
              boqItems={boqItems}
              boqLoading={boqLoading}
              errors={errors}
              onUpdate={updateItem}
              onSelectBOQ={handleSelectBOQ}
              onRemove={(key) => setItems((prev) => prev.filter((it) => it._key !== key))}
              canRemove={items.length > 1}
            />
          ))}

          <button
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
            className="w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl text-sm font-medium text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors"
          >
            <FiPlus size={15} /> Add Item
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
          <span className="text-sm text-gray-400">
            Total items: <strong className="text-gray-700 dark:text-gray-200">{items.length}</strong>
          </span>
          <div className="flex gap-3">
            <button
              onClick={onclose}
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !tenderId}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending
                ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                : <FiSave size={14} />}
              {isPending ? "Saving…" : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWorkDone;
