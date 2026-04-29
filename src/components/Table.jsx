import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Title from "./Title";
import Button from "./Button";
import { HiArrowsUpDown } from "react-icons/hi2";
import {
  Pencil,
  Settings2,
  Check,
  Trash2,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import {
  RiDeleteBinLine,
  RiLayoutGridFill,
  RiTableLine,
  RiListUnordered,
  RiLayoutLeft2Line,
} from "react-icons/ri";
import { TbFileExport } from "react-icons/tb";
import { BiFilterAlt } from "react-icons/bi";
import Pagination from "./Pagination";
import { useSearch } from "../context/SearchBar";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTheme } from "../context/ThemeContext";
import { HexColorPicker } from "react-colorful";

const BADGE_STYLES = {
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
  gray: "bg-gray-100 text-gray-600 ring-1 ring-gray-500/20",
};

const DENSITY_MAP = {
  compact: { th: "px-5 py-2", td: "px-4 py-2", sno: "px-5 py-2" },
  standard: { th: "px-5 py-4", td: "px-4 py-3.5", sno: "px-5 py-4" },
  tall: { th: "px-5 py-5", td: "px-4 py-5", sno: "px-5 py-5" },
};

const BG_PRESETS = [
  "#0f2a47",
  "#1e3a5f",
  "#334155",
  "#27272a",
  "#047857",
  "#0f766e",
  "#1d4ed8",
  "#6d28d9",
  "#be123c",
  "#b45309",
  "#374151",
  "#f3f4f6",
];

const VIEW_MODES = [
  { id: "table", label: "Table", icon: RiTableLine },
  { id: "grid", label: "Grid", icon: RiLayoutGridFill },
  { id: "list", label: "List", icon: RiListUnordered },
  { id: "split", label: "Split", icon: RiLayoutLeft2Line },
];

const truncateText = (text, wordLimit = 7) => {
  if (!text) return { displayText: "", isTruncated: false };
  const rawText = String(text);
  const words = rawText.trim().split(/\s+/);
  if (words.length <= wordLimit)
    return { displayText: rawText, isTruncated: false };
  return {
    displayText: `${words.slice(0, wordLimit).join(" ")}...`,
    isTruncated: true,
  };
};

const resolveCell = (col, item) => {
  const raw = col.render ? col.render(item) : item[col.key];
  if (React.isValidElement(raw)) return { node: raw, rawText: "" };
  const isBlank = (v) =>
    v === null ||
    v === undefined ||
    v === "" ||
    (typeof v === "string" && v.trim().toLowerCase() === "undefined");
  if (isBlank(raw)) return { node: "-", rawText: "" };
  if (typeof raw === "object") return { node: "-", rawText: "" };

  if (col.formatter) {
    const formatted = col.formatter(raw);
    const str =
      formatted === null || formatted === undefined ? "-" : String(formatted);
    if (!str.trim() || isBlank(str)) return { node: "-", rawText: "" };
    if (col.colorMap) {
      const colorKey = col.colorMap[str];
      if (colorKey)
        return {
          node: (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${BADGE_STYLES[colorKey] || BADGE_STYLES.gray}`}
            >
              {str}
            </span>
          ),
          rawText: str,
        };
    }
    return { node: str, rawText: str };
  }

  const str = String(raw);
  if (!str.trim() || isBlank(str)) return { node: "-", rawText: "" };
  if (col.colorMap) {
    const colorKey = col.colorMap[str];
    if (colorKey)
      return {
        node: (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${BADGE_STYLES[colorKey] || BADGE_STYLES.gray}`}
          >
            {str}
          </span>
        ),
        rawText: str,
      };
    if (col.render) return { node: str, rawText: str };
  }

  if (col.render) return { node: str, rawText: str };
  const { displayText } = truncateText(str, 7);
  return { node: displayText, rawText: str };
};

const SkeletonRow = ({ colCount, hasAction, hasCheckbox, d }) => (
  <tr className="animate-pulse border-b border-gray-100">
    {hasCheckbox && (
      <td className="w-10 px-4">
        <div className="w-4 h-4 bg-gray-200 rounded mx-auto" />
      </td>
    )}
    <td className={`${d.sno} w-16 text-center`}>
      <div className="h-2.5 w-6 bg-gray-200 rounded mx-auto" />
    </td>
    {Array.from({ length: colCount }).map((_, i) => (
      <td key={i} className={`${d.td} text-center`}>
        <div
          className="h-2.5 bg-gray-200 rounded mx-auto"
          style={{ width: `${[60, 75, 50, 80, 55, 70, 45][i % 7]}%` }}
        />
      </td>
    ))}
    {hasAction && (
      <td className={`${d.td} sticky right-0 bg-white`}>
        <div className="flex justify-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="w-4 h-4 bg-gray-200 rounded" />
        </div>
      </td>
    )}
  </tr>
);

const SortableColumnItem = ({ id, col, isVisible, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 rounded-md transition-all ${isDragging ? "bg-white shadow-xl ring-2 ring-blue-500/50" : isVisible ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800 opacity-70"}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
        >
          <GripVertical size={14} />
        </div>
        <span
          className={`text-xs font-semibold truncate ${isVisible ? "text-blue-900 dark:text-blue-100" : "text-gray-600 dark:text-gray-400"}`}
        >
          {col.label}
        </span>
      </div>
      <div
        onClick={() => onToggle(col.key)}
        className={`w-8 h-4.5 rounded-full relative cursor-pointer transition-colors duration-300 shrink-0 ${isVisible ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isVisible ? "translate-x-[14px]" : "translate-x-0.5"}`}
        />
      </div>
    </div>
  );
};

const Table = ({
  endpoint = [],
  columns = [],
  AddModal,
  routepoint,
  editroutepoint,
  Datecontent,
  addroutepoint,
  addButtonLabel,
  addButtonIcon,
  EditModal,
  ViewModal,
  DeleteModal,
  deletetitle,
  FilterModal,
  exportModal = true,
  UploadModal,
  title,
  subtitle,
  pagetitle,
  onExport,
  loading = false,
  contentMarginTop = "mt-4",
  totalPages = 1,
  currentPage = 1,
  setCurrentPage = () => {},
  filterParams,
  setFilterParams = () => {},
  onUpdated,
  onSuccess,
  onDelete,
  idKey,
  id2Key,
  name = "no data",
  onRowClick,
  pagination = true,
  freeze,
  freezeButtonLabel,
  freezeButtonIcon,
  onfreeze,
  multiSelect = false,
  onBulkDelete,
  onBulkExport,
 uploadModalProps = {},
}) => {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();

  const storageKey = `table_prefs_${(title || "default").replace(/\s+/g, "_")}_${(subtitle || pagetitle || "").replace(/\s+/g, "_")}`;
  const columnsKey = columns.map((c) => c.key).join(",");

  const [selectedItem, setSelectedItem] = useState(null);
  const [splitSelectedItem, setSplitSelectedItem] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
  });

  const { brandColor: headerBgColor, setBrandColor: setHeaderBgColor } =
    useTheme();

  const [selectedRows, setSelectedRows] = useState(new Set());
  const masterCheckRef = useRef(null);
  const settingsRef = useRef(null);
  const viewDropdownRef = useRef(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  const [viewMode, setViewMode] = useState("table");
  const [density, setDensity] = useState("standard");
  const [visibleColumns, setVisibleColumns] = useState(new Set());
  const [columnOrder, setColumnOrder] = useState([]);

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem(storageKey) || "{}");
    setDensity(p.density || "standard");
    setViewMode(p.viewMode || "table");

    const hidden = new Set(
      Array.isArray(p.hiddenColumns) ? p.hiddenColumns : [],
    );
    const newVisible = new Set(
      columns.map((c) => c.key).filter((k) => !hidden.has(k)),
    );
    setVisibleColumns(newVisible);

    const savedOrder = Array.isArray(p.columnOrder) ? p.columnOrder : [];
    const allKeys = columns.map((c) => c.key);
    // Only restore saved order when it was saved for the same column set.
    // If the fingerprint differs (e.g. stale data from a different table that
    // shares the same storageKey), fall back to the default column order so
    // that no column accidentally ends up in the wrong position.
    const orderIsCompatible = p.columnsKey === columnsKey;
    const validSavedOrder = orderIsCompatible
      ? savedOrder.filter((k) => columns.some((c) => c.key === k))
      : [];
    const missingKeys = allKeys.filter((k) => !validSavedOrder.includes(k));
    setColumnOrder([...validSavedOrder, ...missingKeys]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, columnsKey]);

  const itemsPerPage = 10;

  useEffect(() => {
    if (columns.length === 0 || columnOrder.length === 0) return;
    try {
      const hiddenColumns = columns
        .map((c) => c.key)
        .filter((k) => !visibleColumns.has(k));
      localStorage.setItem(
        storageKey,
        JSON.stringify({ hiddenColumns, density, viewMode, columnOrder, columnsKey }),
      );
    } catch (e) {
      console.warn("Could not save table preferences to localStorage", e);
    }
  }, [visibleColumns, density, viewMode, columnOrder, storageKey, columns, columnsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumnOrder((items) =>
        arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)),
      );
    }
  };

  useEffect(() => {
    if (masterCheckRef.current)
      masterCheckRef.current.indeterminate =
        selectedRows.size > 0 && selectedRows.size < endpoint.length;
  }, [selectedRows.size, endpoint.length]);

  useEffect(() => {
    setSelectedRows(new Set());
  }, [currentPage]);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target))
        setShowSettings(false);
      if (
        viewDropdownRef.current &&
        !viewDropdownRef.current.contains(e.target)
      )
        setShowViewDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let t;
    if (loading) setDelayedLoading(true);
    else t = setTimeout(() => setDelayedLoading(false), 1200);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterParams, setCurrentPage]);

  const d = DENSITY_MAP[density] || DENSITY_MAP.standard;

  const showTooltip = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      text,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };
  const hideTooltip = () => setTooltip((prev) => ({ ...prev, visible: false }));

  const handleViewAction = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onRowClick) onRowClick(item);
    if (routepoint && typeof routepoint === "string") {
      if (idKey) localStorage.setItem(`selected${idKey}`, JSON.stringify(item));
      let path = routepoint;
      if (idKey && id2Key)
        path = `${routepoint}/${item[idKey]}/${item[id2Key]}`;
      else if (idKey && routepoint.includes(`:${idKey}`))
        path = routepoint.replace(`:${idKey}`, item[idKey]);
      else if (idKey) path = `${routepoint}/${item[idKey]}`;
      navigate(path, { state: { item } });
    }
    if (ViewModal === true) setShowView(false);
    else if (ViewModal) {
      setSelectedItem(item);
      setShowView(true);
    }
  };

  const handleFilter = ({ fromdate, todate }) => {
    setFilterParams({ fromdate, todate });
    setShowFilter(false);
    setCurrentPage(1);
  };
  const clearFilterChip = (key) => {
    setFilterParams((prev) => ({ ...prev, [key]: "" }));
    setCurrentPage(1);
  };

  const getRowId = useCallback(
    (item, absoluteIndex) =>
      idKey ? String(item[idKey]) : String(absoluteIndex),
    [idKey],
  );
  const toggleRow = (item, absoluteIndex, e) => {
    e.stopPropagation();
    setSelectedRows((prev) => {
      const next = new Set(prev);
      const id = getRowId(item, absoluteIndex);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedRows.size === endpoint.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(endpoint.map((item, i) => getRowId(item, i))));
  };
  const clearSelection = () => setSelectedRows(new Set());

  const toggleColumn = (key) =>
    setVisibleColumns((prev) => {
      if (prev.has(key) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const resetSettings = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const allKeys = columns.map((c) => c.key);
    setVisibleColumns(new Set(allKeys));
    setColumnOrder(allKeys);
    setDensity("standard");
    setViewMode("table");
    setHeaderBgColor("#0f2a47");
  };

  const sortedItems = useMemo(() => {
    const items = [...endpoint];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const av = a[sortConfig.key],
          bv = b[sortConfig.key];
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [endpoint, sortConfig]);

  const selectedItems = useMemo(
    () => sortedItems.filter((item, i) => selectedRows.has(getRowId(item, i))),
    [sortedItems, selectedRows, getRowId],
  );
  const handleBulkDelete = () => {
    if (onBulkDelete) onBulkDelete(selectedItems);
    clearSelection();
  };
  const handleBulkExport = () => {
    if (onBulkExport) onBulkExport(selectedItems);
  };

  const visibleCols = useMemo(() => {
    const filtered = columns.filter((c) => visibleColumns.has(c.key));
    return filtered.sort((a, b) => {
      const indexA = columnOrder.indexOf(a.key);
      const indexB = columnOrder.indexOf(b.key);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [columns, visibleColumns, columnOrder]);

  const filterChips = useMemo(() => {
    const chips = [];
    if (filterParams?.fromdate)
      chips.push({
        key: "fromdate",
        label: "From",
        value: filterParams.fromdate,
      });
    if (filterParams?.todate)
      chips.push({ key: "todate", label: "To", value: filterParams.todate });
    return chips;
  }, [filterParams]);

  // --- NEW: Apply the Pagination Slice ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  // This physically limits the DOM to only rendering the current 10 items

  // Change it to this:
  const paginatedItems = sortedItems; // The API already sliced the data

  const hasActionColumn = EditModal || editroutepoint || DeleteModal;
  const colSpan =
    visibleCols.length + (hasActionColumn ? 2 : 1) + (multiSelect ? 1 : 0);

  const activeViewObj =
    VIEW_MODES.find((m) => m.id === viewMode) || VIEW_MODES[0];
  const ActiveViewIcon = activeViewObj.icon;

  return (
    <div className="font-roboto-flex flex flex-col h-full w-full overflow-hidden bg-transparent">
      <div className="py-3 px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 bg-transparent">
        <div className="flex-1">
          <Title title={title} sub_title={subtitle} page_title={pagetitle} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={viewDropdownRef}>
            <button
              onClick={() => setShowViewDropdown((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ActiveViewIcon size={15} className="text-brand" />
              <span>{activeViewObj.label}</span>
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showViewDropdown && (
              <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden py-1">
                {VIEW_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = viewMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setViewMode(mode.id);
                        // Start Split view focused on the first item of the CURRENT page
                        if (mode.id === "split" && !splitSelectedItem)
                          setSplitSelectedItem(paginatedItems[0] || null);
                        setShowViewDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors ${isActive ? "bg-brand/10 text-brand" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                      <Icon
                        size={15}
                        className={isActive ? "text-brand" : "opacity-60"}
                      />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {Datecontent && (
            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                Date:{" "}
                <span className="font-bold text-gray-900 dark:text-white pl-1">
                  17.05.2025
                </span>
              </p>
            </div>
          )}
          {AddModal && (
            <Button
              button_name={addButtonLabel}
              button_icon={addButtonIcon}
              onClick={() => {
                if (addroutepoint) navigate(addroutepoint);
                setShowAdd(AddModal !== true);
              }}
            />
          )}
          {freeze && (
            <Button
              button_name={freezeButtonLabel}
              button_icon={freezeButtonIcon}
              bgColor="bg-white border border-gray-200"
              textColor="text-gray-700"
              onClick={onfreeze}
            />
          )}
          {UploadModal && (
            <Button
              button_icon={<TbFileExport size={18} />}
              button_name="Upload"
              bgColor="bg-white border border-gray-200"
              textColor="text-gray-700"
              onClick={() => setShowUpload(true)}
            />
          )}
          {exportModal && (
            <Button
              button_icon={<TbFileExport size={18} />}
              button_name="Export"
              bgColor="bg-white border border-gray-200"
              textColor="text-gray-700"
              onClick={onExport}
            />
          )}
          {FilterModal && (
            <Button
              button_icon={<BiFilterAlt size={18} />}
              button_name="Filter"
              bgColor="bg-white border border-gray-200"
              textColor="text-gray-700"
              onClick={() => setShowFilter(true)}
            />
          )}
          {FilterModal && (filterParams?.fromdate || filterParams?.todate) && (
            <Button
              button_icon={<IoClose size={16} />}
              button_name="Clear"
              bgColor="bg-red-50 border-red-100"
              textColor="text-red-600"
              onClick={() => {
                setFilterParams({ fromdate: "", todate: "" });
                setCurrentPage(1);
              }}
            />
          )}

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border transition-all shadow-sm ${showSettings ? "bg-brand text-brand-contrast border-brand" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"}`}
            >
              <Settings2 size={14} /> Settings
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-2 z-50 w-[340px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
                  <div className="flex items-center gap-2">
                    <Settings2 size={14} className="text-gray-400" />
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">
                      Table Settings
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={resetSettings}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all"
                    >
                      Reset Default
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <IoClose size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-6 max-h-[50vh] overflow-y-auto scrollbar-thin">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Visible Columns
                      </p>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={columnOrder}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {columnOrder.map((key) => {
                            const col = columns.find((c) => c.key === key);
                            if (!col) return null;
                            return (
                              <SortableColumnItem
                                key={col.key}
                                id={col.key}
                                col={col}
                                isVisible={visibleColumns.has(col.key)}
                                onToggle={toggleColumn}
                              />
                            );
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Row Density
                    </p>
                    <div className="flex gap-1.5 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                      {["compact", "standard", "tall"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setDensity(opt)}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all capitalize ${density === opt ? "bg-white dark:bg-gray-700 text-brand shadow-sm border border-gray-200 dark:border-gray-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 border border-transparent"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Brand Theme Color
                    </p>
                    <div className="mb-4">
                      <HexColorPicker
                        color={headerBgColor}
                        onChange={setHeaderBgColor}
                        style={{ width: "100%", height: "160px" }}
                      />
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                      <div
                        className="w-8 h-8 rounded shadow-sm border border-black/10"
                        style={{ backgroundColor: headerBgColor }}
                      />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Hex
                      </span>
                      <input
                        type="text"
                        value={headerBgColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#?[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setHeaderBgColor(
                              val.startsWith("#") ? val : "#" + val,
                            );
                          }
                        }}
                        maxLength={7}
                        className="flex-1 bg-transparent text-sm font-mono font-bold outline-none text-gray-700 dark:text-gray-300 text-right uppercase"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">
                      Presets
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {BG_PRESETS.map((hex) => (
                        <button
                          key={hex}
                          onClick={() => setHeaderBgColor(hex)}
                          className={`h-6 rounded-md border-2 transition-all ${headerBgColor.toLowerCase() === hex.toLowerCase() ? "border-blue-500 scale-110 shadow-md z-10" : "border-transparent hover:scale-105"}`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filterChips.length > 0 && (
        <div className="px-4 pt-2.5 pb-0 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            Filters:
          </span>
          {filterChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 shadow-sm"
            >
              <span className="text-blue-500 font-medium">{chip.label}:</span>
              <span>{chip.value}</span>
              <button
                onClick={() => clearFilterChip(chip.key)}
                className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
              >
                <IoClose size={10} />
              </button>
            </span>
          ))}
          {filterChips.length > 1 && (
            <button
              onClick={() => {
                setFilterParams({ fromdate: "", todate: "" });
                setCurrentPage(1);
              }}
              className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* --- RENDER LOGIC MULTI-VIEW --- */}
      <div
        className={`flex-1 overflow-hidden relative ${contentMarginTop} px-4 pb-4 flex flex-col`}
      >
        {viewMode === "table" || viewMode === "list" ? (
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto scrollbar-thin">
              <table className="min-w-full border-collapse text-left">
                <thead
                  className={`whitespace-nowrap sticky top-0 ${viewMode === "list" ? "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" : "bg-brand text-brand-contrast"}`}
                >
                  <tr className="divide-x divide-white/10">
                    {multiSelect && (
                      <th
                        className={`${viewMode === "list" ? "px-3 py-2 w-10 text-center" : d.sno + " w-10 text-center"}`}
                      >
                        <input
                          ref={masterCheckRef}
                          type="checkbox"
                          checked={
                            selectedRows.size > 0 &&
                            selectedRows.size === endpoint.length
                          }
                          onChange={toggleAll}
                          className={`w-4 h-4 rounded cursor-pointer ${viewMode === "list" ? "accent-brand" : "accent-white"}`}
                        />
                      </th>
                    )}
                    <th
                      className={`${viewMode === "list" ? "px-3 py-2 text-[10px] text-gray-500 w-16 text-center" : d.sno + " text-[11px] text-brand-contrast w-16 text-center"} font-bold uppercase tracking-widest`}
                    >
                      S.No
                    </th>
                    {visibleCols.map((col) => (
                      <th
                        key={col.key}
                        className={`${viewMode === "list" ? "px-3 py-2 text-[10px] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800" : d.th + " text-[11px] text-brand-contrast hover:bg-black/10"} font-bold uppercase tracking-widest cursor-pointer group transition-colors text-center`}
                        onClick={() => {
                          const dir =
                            sortConfig.key === col.key &&
                            sortConfig.direction === "asc"
                              ? "desc"
                              : "asc";
                          setSortConfig({ key: col.key, direction: dir });
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {col.label}
                          <HiArrowsUpDown
                            size={14}
                            className={
                              sortConfig.key === col.key
                                ? viewMode === "list"
                                  ? "opacity-100 text-brand"
                                  : "opacity-100"
                                : "opacity-40"
                            }
                          />
                        </div>
                      </th>
                    ))}
                    {hasActionColumn && (
                      <th
                        className={`${viewMode === "list" ? "px-3 py-2 text-[10px] text-gray-500 bg-white dark:bg-gray-900" : d.th + " text-[11px] text-brand-contrast bg-brand"} font-bold uppercase tracking-widest w-24 sticky right-0 shadow-[-4px_0_12px_rgba(0,0,0,0.15)] z-30 text-center`}
                      >
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y divide-gray-100 dark:divide-gray-800 ${viewMode === "list" ? "text-xs" : "text-sm"}`}
                >
                  {delayedLoading ? (
                    Array.from({ length: itemsPerPage }).map((_, i) => (
                      <SkeletonRow
                        key={i}
                        colCount={visibleCols.length}
                        hasAction={!!hasActionColumn}
                        hasCheckbox={multiSelect}
                        d={d}
                      />
                    ))
                  ) : paginatedItems.length > 0 ? (
                    // --- MAPPED USING paginatedItems ---
                    paginatedItems.map((item, index) => {
                      const absoluteIndex = startIndex + index;
                      const rowId = getRowId(item, absoluteIndex);
                      const isChecked = selectedRows.has(rowId);
                      return (
                        <tr
                          key={absoluteIndex}
                          className={`group/row transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${isChecked ? "bg-blue-50/60 dark:bg-blue-900/20" : ""}`}
                        >
                          {multiSelect && (
                            <td className="px-4 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  toggleRow(item, absoluteIndex, e)
                                }
                                className="w-3.5 h-3.5 rounded cursor-pointer accent-brand"
                              />
                            </td>
                          )}
                          <td
                            className={`${viewMode === "list" ? "px-3 py-1.5" : d.sno} font-semibold text-gray-400 group-hover/row:text-brand transition-colors text-center`}
                          >
                            {String(absoluteIndex + 1).padStart(2, "0")}
                          </td>
                          {visibleCols.map((col) => {
                            const { node, rawText } = resolveCell(col, item);
                            const alignClass = col.className || "text-center";
                            const isNameOrId =
                              col.key.toLowerCase().includes("name") ||
                              col.key.toLowerCase().includes("id");
                            const isLong = rawText.length > 40;
                            return (
                              <td
                                key={col.key}
                                className={`${viewMode === "list" ? "px-3 py-1.5" : d.td} whitespace-nowrap text-gray-700 dark:text-gray-200 ${alignClass}`}
                                onMouseEnter={
                                  isLong
                                    ? (e) => showTooltip(e, rawText)
                                    : undefined
                                }
                                onMouseLeave={isLong ? hideTooltip : undefined}
                              >
                                {isNameOrId && (ViewModal || routepoint) ? (
                                  <span
                                    onClick={(e) => handleViewAction(item, e)}
                                    className="font-bold text-brand dark:text-brand-contrast cursor-pointer hover:underline decoration-2 underline-offset-4"
                                  >
                                    {node}
                                  </span>
                                ) : (
                                  node
                                )}
                              </td>
                            );
                          })}
                          {hasActionColumn && (
                            <td
                              className={`${viewMode === "list" ? "px-3 py-1.5" : d.td} sticky right-0 bg-white group-hover/row:bg-[#f8fafc] dark:bg-gray-900 text-center shadow-[-4px_0_12px_rgba(0,0,0,0.03)] `}
                            >
                              <div className="flex justify-center gap-3">
                                {(EditModal || editroutepoint) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (editroutepoint)
                                        navigate(editroutepoint, {
                                          state: { item },
                                        });
                                      else {
                                        setSelectedItem(item);
                                        setShowEdit(true);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-brand transition-colors hover:scale-110 transform"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                                {DeleteModal && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedItem(item);
                                      setShowDelete(true);
                                    }}
                                    className="text-slate-400 hover:text-rose-600 transition-colors hover:scale-110 transform"
                                  >
                                    <RiDeleteBinLine size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={colSpan}
                        className="px-6 py-20 text-center text-gray-500 font-medium"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-auto p-1 scrollbar-thin">
            {delayedLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                  >
                    <div className="h-14 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-5 flex flex-col gap-3">
                      {[4, 3, 2, 3].map((w, j) => (
                        <div
                          key={j}
                          className={`h-2.5 bg-gray-200 rounded w-${w}/5`}
                        />
                      ))}
                    </div>
                  </div>
                ))
              : paginatedItems.map((item, index) => {
                  // --- MAPPED USING paginatedItems ---
                  const absoluteIndex = startIndex + index;
                  const firstCol = visibleCols[0] || columns[0];
                  const { node: headerNode, rawText: headerText } = resolveCell(
                    firstCol,
                    item,
                  );
                  const rowId = getRowId(item, absoluteIndex);
                  const isChecked = selectedRows.has(rowId);
                  return (
                    <div
                      key={absoluteIndex}
                      className={`bg-white dark:bg-gray-900 border rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group/card h-fit ${isChecked ? "border-brand ring-2 ring-brand/50" : "border-gray-200 dark:border-gray-700"}`}
                    >
                      <div className="px-5 py-4 rounded-t-xl flex justify-between items-center gap-4 bg-brand text-brand-contrast">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {multiSelect && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                toggleRow(item, absoluteIndex, e)
                              }
                              className="w-4 h-4 rounded shrink-0 cursor-pointer accent-white"
                            />
                          )}
                          <span
                            onClick={(e) => handleViewAction(item, e)}
                            className="font-bold text-[15px] cursor-pointer hover:opacity-80 truncate block transition-colors"
                          >
                            {React.isValidElement(headerNode)
                              ? headerNode
                              : truncateText(
                                  headerText || String(headerNode || ""),
                                  10,
                                ).displayText}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          {(EditModal || editroutepoint) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editroutepoint)
                                  navigate(editroutepoint, { state: { item } });
                                else {
                                  setSelectedItem(item);
                                  setShowEdit(true);
                                }
                              }}
                              className="transition-transform hover:scale-110 opacity-75 hover:opacity-100"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {DeleteModal && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                                setShowDelete(true);
                              }}
                              className="transition-transform hover:scale-110 opacity-75 hover:opacity-100"
                            >
                              <RiDeleteBinLine size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-b-xl border-x border-b border-gray-100 flex-1">
                        {visibleCols.slice(1).map((col) => {
                          const { node } = resolveCell(col, item);
                          const isNameOrId =
                            col.key.toLowerCase().includes("name") ||
                            col.key.toLowerCase().includes("id");
                          return (
                            <div key={col.key} className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {col.label}
                              </span>
                              <div className="flex items-center justify-between min-w-0 flex-1">
                                {isNameOrId && (ViewModal || routepoint) ? (
                                  <span
                                    className="text-brand cursor-pointer hover:underline font-bold text-sm truncate block"
                                    onClick={(e) => handleViewAction(item, e)}
                                  >
                                    {node}
                                  </span>
                                ) : (
                                  <span className="text-slate-800 dark:text-slate-200 font-bold text-sm truncate block">
                                    {node}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
          </div>
        ) : viewMode === "split" ? (
          <div className="flex-1 flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
            {/* Left Panel: Navigation List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-brand text-brand-contrast">
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  Select Record
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {paginatedItems.map((item, index) => {
                  // --- MAPPED USING paginatedItems ---
                  const absoluteIndex = startIndex + index;
                  const firstCol = visibleCols[0] || columns[0];
                  const isSelected = splitSelectedItem === item;
                  return (
                    <div
                      key={absoluteIndex}
                      onClick={() => setSplitSelectedItem(item)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${isSelected ? "bg-brand/10 border-l-4 border-l-brand" : "hover:bg-white dark:hover:bg-gray-800 border-l-4 border-transparent"}`}
                    >
                      <span
                        className={`font-bold text-sm block truncate ${isSelected ? "text-brand" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {resolveCell(firstCol, item).node}
                      </span>
                      <span className="text-[11px] text-gray-500 mt-1 block truncate">
                        {visibleCols[1]
                          ? resolveCell(visibleCols[1], item).rawText
                          : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Right Panel: Detail View */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto scrollbar-thin">
              {splitSelectedItem ? (
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {
                          resolveCell(
                            visibleCols[0] || columns[0],
                            splitSelectedItem,
                          ).node
                        }
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Detailed View
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(EditModal || editroutepoint) && (
                        <Button
                          button_name="Edit"
                          button_icon={<Pencil size={14} />}
                          bgColor="bg-brand/10 border-transparent text-brand hover:bg-brand/20"
                          onClick={() => {
                            if (editroutepoint)
                              navigate(editroutepoint, {
                                state: { item: splitSelectedItem },
                              });
                            else {
                              setSelectedItem(splitSelectedItem);
                              setShowEdit(true);
                            }
                          }}
                        />
                      )}
                      {DeleteModal && (
                        <Button
                          button_name="Delete"
                          button_icon={<Trash2 size={14} />}
                          bgColor="bg-rose-50 border-transparent text-rose-600 hover:bg-rose-100"
                          onClick={() => {
                            setSelectedItem(splitSelectedItem);
                            setShowDelete(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {visibleCols.map((col) => {
                      const isNameOrId =
                        col.key.toLowerCase().includes("name") ||
                        col.key.toLowerCase().includes("id");
                      const { node } = resolveCell(col, splitSelectedItem);
                      return (
                        <div key={col.key}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {col.label}
                          </span>
                          <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">
                            {isNameOrId && (ViewModal || routepoint) ? (
                              <span
                                onClick={(e) =>
                                  handleViewAction(splitSelectedItem, e)
                                }
                                className="text-brand cursor-pointer hover:underline font-bold transition-all"
                              >
                                {node}
                              </span>
                            ) : (
                              node
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <RiLayoutLeft2Line size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">
                    Select an item from the list to view details.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {pagination && !loading && (
        <Pagination
          totalItems={sortedItems.length}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {AddModal && showAdd && (
        <AddModal onclose={() => setShowAdd(false)} onSuccess={onSuccess} />
      )}
      {EditModal && EditModal !== true && showEdit && (
        <EditModal
          onclose={() => setShowEdit(false)}
          item={selectedItem}
          onUpdated={onUpdated}
        />
      )}
      {ViewModal && showView && (
        <ViewModal onclose={() => setShowView(false)} item={selectedItem} />
      )}
      {DeleteModal && showDelete && (
        <DeleteModal
          onclose={() => setShowDelete(false)}
          item={selectedItem}
          deletetitle={deletetitle}
          onDelete={onDelete}
          idKey={idKey}
        />
      )}
      {FilterModal && showFilter && (
        <FilterModal
          onclose={() => setShowFilter(false)}
          onFilter={handleFilter}
        />
      )}
      {UploadModal && showUpload && (
        <UploadModal
          onclose={() => setShowUpload(false)}
          onSuccess={onSuccess}
          name={name}
          {...uploadModalProps}
        />
      )}

      {multiSelect && selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold">
                {selectedRows.size} selected
              </span>
            </div>
            <div className="w-px h-5 bg-white/20" />
            {onBulkExport && (
              <button
                onClick={handleBulkExport}
                className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-brand transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <TbFileExport size={15} /> Export
              </button>
            )}
            {onBulkDelete && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-rose-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            <div className="w-px h-5 bg-white/20" />
            <button
              onClick={clearSelection}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <IoClose size={16} />
            </button>
          </div>
        </div>
      )}

      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="bg-slate-900 text-white text-[10px] font-medium rounded px-2 py-1 shadow-2xl border border-slate-700/50 leading-relaxed whitespace-normal wrap-break-word max-w-[300px]"
        >
          {tooltip.text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export default Table;
