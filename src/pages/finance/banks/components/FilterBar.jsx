import { Search, Landmark, X } from "lucide-react";
import { ACCOUNT_TYPES } from "./constants";

const FilterBar = ({ search, onSearch, filterType, onFilterType, filterBankCash, onFilterBankCash }) => {
  const hasFilters = search || filterType || filterBankCash;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3 mb-5 flex flex-wrap items-center gap-3 shadow-sm">

      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search code, name or description…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition"
        />
      </div>

      {/* Type pills */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => onFilterType("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === ""
              ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          All
        </button>
        {ACCOUNT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => onFilterType(filterType === t ? "" : t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === t
                ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bank/Cash toggle */}
      <button
        onClick={() => onFilterBankCash(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
          filterBankCash
            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300"
        }`}
      >
        <Landmark size={12} />
        Bank / Cash
      </button>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => { onSearch(""); onFilterType(""); onFilterBankCash(false); }}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
