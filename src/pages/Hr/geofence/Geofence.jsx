import React, { useState, useMemo } from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { MapPin, Pencil, Trash2, ToggleLeft, ToggleRight, Plus } from "lucide-react";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { useGeofences, useDeleteGeofence, useToggleGeofence } from "./hooks/useGeofence";
import AddGeofenceModal from "./AddGeofenceModal";
import DeleteModal from "../../../components/DeleteModal";
import Pagination from "../../../components/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";

const Geofence = () => {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const debouncedSearch = useDebounce(search, 500);
  const limit = 15;

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit,
    search: debouncedSearch,
    isActive: filterActive === "all" ? undefined : filterActive === "active",
  }), [currentPage, debouncedSearch, filterActive]);

  const { data, isLoading, isFetching, refetch } = useGeofences(queryParams);

  const deleteMutation = useDeleteGeofence({ onSuccess: refetch });
  const toggleMutation = useToggleGeofence();

  const allGeofences = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const filtered = allGeofences;

  return (
    <div className="font-layout-font h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <Title title="HR Management" sub_title="Geofence" page_title="Geofence Zones" />
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`text-lg ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <ButtonBg
            button_icon={<Plus size={18} />}
            button_name="Add Zone"
            onClick={() => { setEditItem(null); setAddModal(true); }}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-layout-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search zones..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilterActive(f); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                filterActive === f
                  ? "bg-darkest-blue text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Zones", value: allGeofences.length, color: "blue" },
          { label: "Active", value: allGeofences.filter((g) => g.isActive).length, color: "emerald" },
          { label: "Inactive", value: allGeofences.filter((g) => !g.isActive).length, color: "rose" },
          { label: "Showing", value: filtered.length, color: "amber" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`bg-white dark:bg-layout-dark border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm`}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-layout-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-darkest-blue text-white text-[11px] font-bold uppercase tracking-widest">
              <th className="px-5 py-3 rounded-tl-xl">Zone Name</th>
              <th className="px-5 py-3">Coordinates</th>
              <th className="px-5 py-3">Radius</th>
              <th className="px-5 py-3">Linked Project</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <MapPin size={36} className="text-gray-200" />
                    <p className="font-medium">No geofence zones found</p>
                    <button
                      onClick={() => { setEditItem(null); setAddModal(true); }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Create your first zone
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((geo) => (
                <tr
                  key={geo._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <MapPin size={15} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {geo.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {geo.latitude?.toFixed(4)}, {geo.longitude?.toFixed(4)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {geo.radiusMeters}m
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                    {geo.tenderId?.tender_project_name || <span className="italic text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                    {geo.description || <span className="italic text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        geo.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {geo.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleMutation.mutate(geo._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          geo.isActive
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title={geo.isActive ? "Deactivate" : "Activate"}
                      >
                        {geo.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => { setEditItem(geo); setAddModal(true); }}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteItem(geo)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {filtered.length} zone{filtered.length !== 1 ? "s" : ""}
        </span>
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        )}
      </div>

      {/* Modals */}
      {addModal && (
        <AddGeofenceModal
          item={editItem}
          onclose={() => { setAddModal(false); setEditItem(null); }}
          onSuccess={refetch}
        />
      )}
      {deleteItem && (
        <DeleteModal
          deletetitle="Delete Geofence Zone"
          item={deleteItem}
          idKey="_id"
          onclose={() => setDeleteItem(null)}
          onDelete={() => {
            deleteMutation.mutate(deleteItem._id);
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Geofence;
