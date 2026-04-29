import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAssetCategoryGrouped } from "../categoryMaster/hooks/useAssetCategory";

// Cascading dropdown driven by GET /assetcategory/grouped.
// Lets the user pick Class → Category → Sub-category and emits the picked
// AssetCategoryMaster row (including _id, capability flags, defaultUnit).
const AssetCategoryPicker = ({ value, onChange, classFilter, disabled }) => {
  const { data, isLoading } = useAssetCategoryGrouped();
  const [open, setOpen] = useState(false);

  const tree = useMemo(() => {
    const t = data || {};
    if (!classFilter || !classFilter.length) return t;
    const filtered = {};
    for (const cls of classFilter) {
      if (t[cls]) filtered[cls] = t[cls];
    }
    return filtered;
  }, [data, classFilter]);

  const label = value
    ? [value.assetClass, value.category, value.subCategory].filter(Boolean).join(" / ")
    : "Pick a category…";

  const onPick = (row) => {
    onChange?.(row);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md disabled:opacity-50"
      >
        <span className={value ? "" : "text-gray-400"}>{label}</span>
        <ChevronDown size={14} />
      </button>
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-auto bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-md shadow-lg p-2">
          {isLoading ? (
            <div className="p-3 text-xs text-gray-500">Loading…</div>
          ) : Object.keys(tree).length === 0 ? (
            <div className="p-3 text-xs text-gray-500">No categories.</div>
          ) : (
            Object.keys(tree).sort().map((cls) => (
              <div key={cls} className="mb-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-gray-500">
                  {cls}
                </div>
                {Object.keys(tree[cls]).sort().map((cat) => (
                  <div key={cat} className="ml-2">
                    <div className="px-2 py-0.5 text-[11px] uppercase text-gray-400">
                      {cat}
                    </div>
                    {(tree[cls][cat] || []).map((row) => (
                      <button
                        key={row._id}
                        type="button"
                        onClick={() => onPick(row)}
                        className={`w-full text-left px-3 py-1 text-xs rounded ${
                          value?._id === row._id
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {row.subCategory || row.category}
                        <span className="ml-2 text-[10px] text-gray-400">
                          {row.defaultUnit || row.trackingMode}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AssetCategoryPicker;
