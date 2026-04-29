import { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Sparkles,
  Trash2,
  Power,
  Search,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import {
  useAssetCategoryList,
  useAssetCategoryDetail,
  useToggleAssetCategoryStatus,
  useDeleteAssetCategory,
  useSeedAssetCategories,
} from "./hooks/useAssetCategory";
import { useDebounce } from "../../../hooks/useDebounce";
import CategoryForm from "./CategoryForm";
import DeleteModal from "../../../components/DeleteModal";
import Loader from "../../../components/Loader";

// Group flat category list by class → category → [items]
const groupByClass = (rows = []) => {
  const tree = {};
  for (const r of rows) {
    const cls = r.assetClass || "Other";
    const cat = r.category || "—";
    if (!tree[cls]) tree[cls] = {};
    if (!tree[cls][cat]) tree[cls][cat] = [];
    tree[cls][cat].push(r);
  }
  return tree;
};

const CategoryMaster = () => {
  const { canAccess } = useAuth();
  const canCreate = canAccess(ASSET_MODULE, ASSET_SUB.CATEGORY_MASTER, ASSET_ACTION.CREATE);
  const canEdit = canAccess(ASSET_MODULE, ASSET_SUB.CATEGORY_MASTER, ASSET_ACTION.EDIT);
  const canDelete = canAccess(ASSET_MODULE, ASSET_SUB.CATEGORY_MASTER, ASSET_ACTION.DELETE);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSeed, setConfirmSeed] = useState(false);

  const { data, isLoading, isFetching, refetch } = useAssetCategoryList({
    page: 1,
    limit: 500,
    search: debouncedSearch,
  });
  const rows = useMemo(() => {
    const list = data?.data || data || [];
    return Array.isArray(list) ? list : list?.rows || [];
  }, [data]);

  const tree = useMemo(() => groupByClass(rows), [rows]);

  const { data: detail, isLoading: detailLoading } = useAssetCategoryDetail(
    creating ? null : selectedId,
  );

  const { mutate: toggleStatus, isPending: toggling } = useToggleAssetCategoryStatus();
  const { mutate: del, isPending: deleting } = useDeleteAssetCategory({
    onDone: () => {
      setSelectedId(null);
      setConfirmDelete(null);
    },
  });
  const { mutate: seed, isPending: seeding } = useSeedAssetCategories({
    onDone: () => setConfirmSeed(false),
  });

  const toggleClass = (cls) => setExpanded((e) => ({ ...e, [cls]: !e[cls] }));

  const startCreate = () => {
    setCreating(true);
    setSelectedId(null);
  };

  const onSelect = (id) => {
    setSelectedId(id);
    setCreating(false);
  };

  const onSaved = (saved) => {
    setCreating(false);
    if (saved?._id) setSelectedId(saved._id);
  };

  return (
    <div className="font-roboto-flex flex flex-col h-[calc(100vh-80px)] p-4 gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Asset Category Master
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {rows.length} categor{rows.length === 1 ? "y" : "ies"} across{" "}
            {Object.keys(tree).length} class{Object.keys(tree).length === 1 ? "" : "es"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Refresh"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
          {canCreate && (
            <button
              onClick={() => setConfirmSeed(true)}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-amber-300 text-amber-700 dark:text-amber-300 dark:border-amber-700 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <Sparkles size={14} /> Seed Defaults
            </button>
          )}
          {canCreate && (
            <button
              onClick={startCreate}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Plus size={14} /> New Category
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        <aside className="col-span-12 md:col-span-4 xl:col-span-3 bg-white dark:bg-layout-dark rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col min-h-0">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {isLoading ? (
              <Loader />
            ) : Object.keys(tree).length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
                No categories yet.
                {canCreate && (
                  <div className="mt-2">
                    <button
                      onClick={() => setConfirmSeed(true)}
                      className="cursor-pointer text-blue-600 hover:underline"
                    >
                      Seed defaults
                    </button>{" "}
                    to get the built-in 120+ taxonomy.
                  </div>
                )}
              </div>
            ) : (
              Object.keys(tree).sort().map((cls) => (
                <div key={cls} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className="cursor-pointer w-full flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  >
                    {expanded[cls] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{cls}</span>
                    <span className="ml-auto text-[10px] font-normal text-gray-500">
                      {Object.values(tree[cls]).reduce((n, arr) => n + arr.length, 0)}
                    </span>
                  </button>
                  {expanded[cls] && (
                    <div className="ml-4">
                      {Object.keys(tree[cls]).sort().map((cat) => (
                        <div key={cat} className="mt-0.5">
                          <div className="px-2 py-0.5 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {cat}
                          </div>
                          {tree[cls][cat].map((row) => (
                            <button
                              key={row._id}
                              type="button"
                              onClick={() => onSelect(row._id)}
                              className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 ${
                                selectedId === row._id
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              <span className="flex-1 truncate">
                                {row.subCategory || row.category}
                              </span>
                              {!row.isActive && (
                                <span className="text-[9px] font-bold text-amber-600 uppercase">
                                  inactive
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="col-span-12 md:col-span-8 xl:col-span-9 bg-white dark:bg-layout-dark rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col min-h-0">
          {creating ? (
            <CategoryForm
              category={null}
              onCancel={() => setCreating(false)}
              onSaved={onSaved}
            />
          ) : selectedId ? (
            detailLoading ? (
              <Loader />
            ) : detail ? (
              <>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {detail.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        detail.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {detail.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => toggleStatus(detail._id)}
                        disabled={toggling}
                        className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                      >
                        <Power size={12} />
                        {detail.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setConfirmDelete(detail)}
                        className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-300 text-red-600 dark:text-red-300 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                </div>
                <CategoryForm
                  category={detail}
                  onCancel={null}
                  onSaved={onSaved}
                />
              </>
            ) : (
              <EmptyPane>Select a category from the tree.</EmptyPane>
            )
          ) : (
            <EmptyPane>
              {canCreate
                ? "Select a category from the tree, or create a new one."
                : "Select a category from the tree to view details."}
            </EmptyPane>
          )}
        </section>
      </div>

      {confirmDelete && (
        <DeleteModal
          deletetitle="category"
          onclose={() => setConfirmDelete(null)}
          onDelete={() => del(confirmDelete._id)}
          idKey="_id"
          item={confirmDelete}
        />
      )}

      {confirmSeed && (
        <div className="fixed inset-0 z-30 grid place-items-center backdrop-blur-xs">
          <div className="bg-white dark:bg-layout-dark rounded-xl p-6 max-w-md mx-4 shadow-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Seed Default Categories
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will load the built-in 120+ category taxonomy. The operation
              is idempotent — existing categories will not be duplicated.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmSeed(false)}
                disabled={seeding}
                className="cursor-pointer px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => seed()}
                disabled={seeding}
                className="cursor-pointer px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md disabled:opacity-50"
              >
                {seeding ? "Seeding…" : "Seed Defaults"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(toggling || deleting) && (
        <div className="fixed bottom-4 right-4 px-3 py-1.5 text-xs bg-gray-900 text-white rounded shadow">
          Working…
        </div>
      )}
    </div>
  );
};

const EmptyPane = ({ children }) => (
  <div className="flex-1 grid place-items-center text-sm text-gray-500 dark:text-gray-400 px-6 text-center">
    {children}
  </div>
);

export default CategoryMaster;
