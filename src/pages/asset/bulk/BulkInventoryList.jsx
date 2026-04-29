import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useDebounce } from "../../../hooks/useDebounce";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import { useBulkInventoryList } from "./hooks/useBulkInventory";
import Modal from "../../../components/Modal";
import Loader from "../../../components/Loader";
import BulkItemForm from "./BulkItemForm";

const CLASSES = ["Formwork", "SafetyEquipment", "SiteInfra", "Tool"];

const BulkInventoryList = () => {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canCreate = canAccess(ASSET_MODULE, ASSET_SUB.BULK_INVENTORY, ASSET_ACTION.CREATE);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [filters, setFilters] = useState({
    asset_class: "",
    is_active: "",
    location_id: "",
    low_stock: false,
  });
  const [creating, setCreating] = useState(false);

  const params = useMemo(() => ({
    page,
    limit: 20,
    search: debounced || undefined,
    asset_class: filters.asset_class || undefined,
    is_active: filters.is_active || undefined,
    location_id: filters.location_id || undefined,
    low_stock: filters.low_stock || undefined,
  }), [page, debounced, filters]);

  const { data, isLoading, isFetching, refetch } = useBulkInventoryList(params);
  const rows = data?.data?.rows || data?.data || [];
  const totalPages = data?.meta?.totalPages || data?.totalPages || 1;

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Inventory</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Quantity-tracked stock</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className={btnSecondary}>
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
          {canCreate && (
            <button onClick={() => setCreating(true)} className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              <Plus size={14} /> New Item
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Item ID / name / brand…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
            />
          </div>
          <select value={filters.asset_class} onChange={(e) => { setFilters((f) => ({ ...f, asset_class: e.target.value })); setPage(1); }} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded">
            <option value="">Class: All</option>
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filters.is_active} onChange={(e) => setFilters((f) => ({ ...f, is_active: e.target.value }))} className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded">
            <option value="">Status: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <input value={filters.location_id} onChange={(e) => setFilters((f) => ({ ...f, location_id: e.target.value }))} placeholder="Location ID" className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded w-32" />
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" checked={filters.low_stock} onChange={(e) => setFilters((f) => ({ ...f, low_stock: e.target.checked }))} className="cursor-pointer accent-blue-600" />
            Low stock only
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <Th>Item ID</Th>
                <Th>Name</Th>
                <Th>Class</Th>
                <Th>UoM</Th>
                <Th className="text-right">Available</Th>
                <Th className="text-right">In Use</Th>
                <Th className="text-right">Damaged</Th>
                <Th className="text-right">Min Level</Th>
                <Th className="text-right">Cost / Unit</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="p-12"><Loader /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="p-12 text-center text-gray-500">No items.</td></tr>
              ) : rows.map((r) => {
                const low = r.total_qty_available < r.min_stock_level;
                return (
                  <tr
                    key={r.item_id}
                    onClick={() => navigate(`/asset/bulk-inventory/${r.item_id}`)}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                  >
                    <Td className="font-mono">{r.item_id}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{r.item_name}</span>
                        {low && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">LOW</span>}
                        {r.total_qty_damaged > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">DAMAGED</span>}
                      </div>
                      {r.brand && <div className="text-[10px] text-gray-500">{r.brand}{r.model ? ` · ${r.model}` : ""}</div>}
                    </Td>
                    <Td>{r.asset_class}</Td>
                    <Td>{r.unit_of_measure}</Td>
                    <Td className="text-right font-mono">{r.total_qty_available}</Td>
                    <Td className="text-right font-mono">{r.total_qty_in_use}</Td>
                    <Td className="text-right font-mono">{r.total_qty_damaged}</Td>
                    <Td className="text-right font-mono">{r.min_stock_level}</Td>
                    <Td className="text-right font-mono">₹ {Number(r.standard_cost || 0).toLocaleString()}</Td>
                    <Td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {creating && (
        <Modal onclose={() => setCreating(false)} title="New Item" widthClassName="lg:w-[800px] md:w-[700px] w-[95vw]">
          <BulkItemForm
            item={null}
            onCancel={() => setCreating(false)}
            onSaved={(saved) => {
              setCreating(false);
              if (saved?.item_id) navigate(`/asset/bulk-inventory/${saved.item_id}`);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

const btnSecondary = "cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800";
const Th = ({ children, className = "" }) => <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;

export default BulkInventoryList;
