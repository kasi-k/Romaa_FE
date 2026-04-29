import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  PackageCheck,
  Calendar,
  Search,
  X,
  Building2,
  Truck,
  FileText,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import Title from "../../../components/Title";
import Button from "../../../components/Button";

// ── Stat chip ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-layout-dark rounded-md border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  </div>
);

const ViewGoodReceipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.item || {};

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    vendor_id: "",
    vendor_name: "",
    item_description: "",
    grn_bill_no: "",
    purchase_request_ref: "",
  });
  const [vendorMode, setVendorMode] = useState("name"); // "id" | "name"
  const [vendorInput, setVendorInput] = useState("");
  const [applied, setApplied] = useState({});

  const fetchEntries = useCallback(
    async (activeFilters = {}) => {
      if (!project.tender_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== ""),
        );
        const res = await axios.get(
          `${API}/material/grn/entries/${project.tender_id}`,
          { params },
        );
        setEntries(res.data?.data || []);
      } catch {
        toast.error("Failed to load GRN entries");
      } finally {
        setLoading(false);
      }
    },
    [project.tender_id],
  );

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleApply = () => {
    const resolved = {
      ...filters,
      vendor_id: vendorMode === "id" ? vendorInput : "",
      vendor_name: vendorMode === "name" ? vendorInput : "",
    };
    setApplied(resolved);
    fetchEntries(resolved);
  };

  const handleClear = () => {
    const empty = {
      from: "",
      to: "",
      vendor_id: "",
      vendor_name: "",
      item_description: "",
      grn_bill_no: "",
      purchase_request_ref: "",
    };
    setFilters(empty);
    setVendorInput("");
    setApplied({});
    fetchEntries({});
  };

  const hasActiveFilters =
    Object.values(applied).some((v) => v !== "") || vendorInput !== "";

  // Summary stats derived from entries
  const totalQty = entries.reduce((s, e) => s + (e.quantity || 0), 0);
  const totalValue = entries.reduce(
    (s, e) => s + (e.quantity || 0) * (e.quoted_rate || 0),
    0,
  );
  const uniqueVendors = [...new Set(entries.map((e) => e.vendor_name).filter(Boolean))];

  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const fmtDate = (v) =>
    v ? new Date(v).toLocaleDateString("en-GB") : "—";

  return (
    <div className="h-full flex flex-col dark:bg-[#0b0f19] p-4 overflow-hidden font-roboto-flex gap-4">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <Title
            title="Purchase Management"
            sub_title="Goods Receipt"
            page_title={project.project_name || "GRN Entries"}
          />
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
              {project.tender_id}
            </span>
            {project.tender_name && (
              <span className="text-[10px] text-gray-400">
                {project.tender_name}
              </span>
            )}
          </div>
        </div>
        <Button
          button_name="Back"
          button_icon={<ChevronLeft size={16} />}
          onClick={() => navigate("..")}
          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 shadow-sm"
        />
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<PackageCheck size={16} className="text-green-600" />}
            label="Total Entries"
            value={entries.length}
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            icon={<FileText size={16} className="text-blue-600" />}
            label="Total Qty Received"
            value={totalQty.toLocaleString("en-IN")}
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            icon={<Building2 size={16} className="text-purple-600" />}
            label="Total Value (₹)"
            value={fmt(totalValue)}
            color="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            icon={<Truck size={16} className="text-amber-600" />}
            label="Vendors"
            value={uniqueVendors.length}
            color="bg-amber-50 dark:bg-amber-900/20"
          />
        </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-layout-dark rounded-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Search size={13} />
              Filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">
                From
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, from: e.target.value }))
                }
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">
                To
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, to: e.target.value }))
                }
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">
                Vendor
              </label>
              <div className="flex rounded border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-1 focus-within:ring-blue-500/50">
                <button
                  type="button"
                  onClick={() => setVendorMode("name")}
                  className={`px-2 py-1.5 text-[10px] font-bold uppercase border-r dark:border-gray-700 whitespace-nowrap transition-colors ${
                    vendorMode === "name"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Name
                </button>
                <button
                  type="button"
                  onClick={() => setVendorMode("id")}
                  className={`px-2 py-1.5 text-[10px] font-bold uppercase border-r dark:border-gray-700 whitespace-nowrap transition-colors ${
                    vendorMode === "id"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  ID
                </button>
                <input
                  type="text"
                  placeholder={vendorMode === "id" ? "e.g. VEN001" : "e.g. Tata"}
                  value={vendorInput}
                  onChange={(e) => setVendorInput(e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">
                Item Description
              </label>
              <input
                type="text"
                placeholder="e.g. Cement"
                value={filters.item_description}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    item_description: e.target.value,
                  }))
                }
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">
                GRN Bill No
              </label>
              <input
                type="text"
                placeholder="e.g. TND023/26-27"
                value={filters.grn_bill_no}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, grn_bill_no: e.target.value }))
                }
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1 block">
                PO Reference
              </label>
              <input
                type="text"
                placeholder="e.g. POR036"
                value={filters.purchase_request_ref}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    purchase_request_ref: e.target.value,
                  }))
                }
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Search size={12} /> Apply
            </button>
          </div>
        </div>

      {/* ── GRN Entries Table ── */}
      <div className="flex-1 min-h-0 bg-white dark:bg-layout-dark rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          {/* Table header bar */}
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
              <PackageCheck size={15} className="text-green-500" />
              GRN Entries
            </h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                  Filtered
                </span>
              )}
              <span className="text-[10px] text-gray-400 bg-white dark:bg-gray-700 px-2.5 py-1 rounded border border-gray-200 dark:border-gray-600">
                {entries.length} record{entries.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => fetchEntries(applied)}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
              <AlertCircle size={36} className="opacity-20" />
              <p className="text-sm">No GRN entries found</p>
              {hasActiveFilters && (
                <button
                  onClick={handleClear}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold border-b dark:border-gray-700">
                    <th className="px-3 py-3 border-r dark:border-gray-700 w-9 text-center">
                      #
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      GRN Bill No
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      Party Bill No
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700">
                      Item Description
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 text-right whitespace-nowrap">
                      Qty
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 text-right whitespace-nowrap">
                      Rate (₹)
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 text-right whitespace-nowrap">
                      Amount (₹)
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      Vendor
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      Site
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      PO Ref
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      Invoice / Challan
                    </th>
                    <th className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap">
                      Received By
                    </th>
                    <th className="px-3 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {entries.map((entry, idx) => {
                    const amount =
                      (entry.quantity || 0) * (entry.quoted_rate || 0);
                    return (
                      <tr
                        key={entry._id || idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-3 py-3 text-center border-r dark:border-gray-700 text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={11} className="text-gray-400 flex-shrink-0" />
                            {fmtDate(entry.date)}
                          </div>
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700">
                          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {entry.grn_bill_no || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700">
                          <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {entry.party_bill_no || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700">
                          <p className="font-semibold text-gray-700 dark:text-gray-200">
                            {entry.item_description || "—"}
                          </p>
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700 text-right font-mono font-semibold text-gray-700 dark:text-gray-200">
                          {entry.quantity?.toLocaleString("en-IN") ?? "—"}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700 text-right font-mono text-gray-600 dark:text-gray-400">
                          {fmt(entry.quoted_rate)}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700 text-right font-mono font-semibold text-gray-800 dark:text-gray-100">
                          {fmt(amount)}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700">
                          <div className="flex items-center gap-1.5">
                            <Truck size={11} className="text-amber-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {entry.vendor_name || "—"}
                            </span>
                          </div>
                          {entry.vendor_id && (
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                              {entry.vendor_id}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {entry.site_name || "—"}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700">
                          {entry.purchase_request_ref ? (
                            <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded">
                              {entry.purchase_request_ref}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {entry.invoice_challan_no || "—"}
                        </td>
                        <td className="px-3 py-3 border-r dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            <User size={11} className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {entry.received_by || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-500 dark:text-gray-400 max-w-[160px]">
                          <p className="truncate" title={entry.remarks}>
                            {entry.remarks || "—"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Totals footer */}
                {entries.length > 0 && (
                  <tfoot className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-2.5 text-right text-[10px] uppercase font-bold text-gray-500 tracking-wider"
                      >
                        Total
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-800 dark:text-gray-100 border-l dark:border-gray-700">
                        {totalQty.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2.5 border-l dark:border-gray-700" />
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400 border-l dark:border-gray-700">
                        ₹ {fmt(totalValue)}
                      </td>
                      <td colSpan={6} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
    </div>
  );
};

export default ViewGoodReceipt;
