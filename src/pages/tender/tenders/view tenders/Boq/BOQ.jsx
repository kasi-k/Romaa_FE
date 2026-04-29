import React, { useEffect, useState, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import {
  LayoutList,
  CircleDollarSign,
  BarChart3,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import axios from "axios";
import { API } from "../../../../../constant"; // Adjust path as needed

// ============================================================================
// FORMATTERS
// ============================================================================

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(val || 0);

// ============================================================================
// MAIN COMPONENT: BOQ SUMMARY
// ============================================================================

const BOQ = ({ onBack }) => {
  const { tender_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gstPercent, setGstPercent] = useState(18);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // State for the Item Details Modal
  const [viewingItem, setViewingItem] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bid/get?tender_id=${tender_id}`);
      setItems(res.data.data.items || []);
      if (res.data.data.gst) setGstPercent(res.data.data.gst);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [tender_id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Close item details modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setViewingItem(null);
    };
    if (viewingItem) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [viewingItem]);

  const sortedItems = useMemo(() => {
    let baseItems = [...items];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      baseItems = baseItems.filter(
        (it) =>
          it.item_name?.toLowerCase().includes(q) ||
          it.item_id?.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q)
      );
    }
    if (sortConfig.key) {
      baseItems.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return baseItems;
  }, [items, searchTerm, sortConfig]);

  const totals = useMemo(() => {
    const base = sortedItems.reduce((acc, it) => acc + (it.n_amount || 0), 0);
    const gstAmt = (base * gstPercent) / 100;
    return {
      base,
      gst: gstAmt,
      total: base + gstAmt,
    };
  }, [sortedItems, gstPercent]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper for rendering sort icons
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ChevronDown size={12} className="opacity-20 ml-1 inline" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={12} className="text-blue-500 ml-1 inline" /> 
      : <ChevronDown size={12} className="text-blue-500 ml-1 inline" />;
  };

  return (
    <div className="flex flex-col gap-4 p-1 h-full relative" aria-busy={loading}>
      {/* --- ERP HEADER & SEARCH --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
        <div className="relative max-w-md w-full">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by Name, ID or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:text-white"
          />
        </div>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Package} label="Total Items" value={items.length} sub="BOQ Line Items" colorClass="text-slate-500" bgColor="bg-slate-100 dark:bg-slate-800" />
        <SummaryCard icon={CircleDollarSign} label="Base Total" value={fmt(totals.base)} sub="Owner Estimate" colorClass="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-900/20" />
        <SummaryCard icon={BarChart3} label="GST Amount" value={fmt(totals.gst)} sub={`${gstPercent}% Tax Rate`} colorClass="text-indigo-600 dark:text-indigo-400" bgColor="bg-indigo-50 dark:bg-indigo-900/20" />
        <SummaryCard icon={LayoutList} label="Grand Total" value={fmt(totals.total)} sub="Final Baseline Value" colorClass="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
      </div>

      {/* --- DATA GRID --- */}
      <div className="bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col grow">
        
        {/* Table Toolbar */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Showing {sortedItems.length} of {items.length} records
          </div>
          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
            {tender_id}
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-x-auto max-h-[60vh] custom-scrollbar relative">
          {/* UPGRADED: Added table-fixed and min-w-[1000px] to enforce strict, even column widths */}
          <table className="w-full border-collapse text-left text-xs whitespace-nowrap table-fixed min-w-[1000px]">
            <thead className="sticky top-0 z-50 shadow-sm">
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                
                <th className="px-4 py-3 font-bold text-slate-500 sticky left-0 z-40 bg-slate-100 dark:bg-slate-800 w-12 text-center border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest text-[10px]">
                  Sr.
                </th>
                
                <th 
                  onClick={() => requestSort('item_id')}
                  className="px-4 py-3 font-bold text-slate-500 sticky left-12 z-40 bg-slate-100 dark:bg-slate-800 w-24 border-r border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Item ID {getSortIcon('item_id')}
                </th>
                
                {/* w-auto absorbs the remaining space so it's beautifully wide */}
                <th 
                  onClick={() => requestSort('item_name')}
                  className="px-4 py-3 font-bold text-slate-500 sticky left-36 z-40 bg-slate-100 dark:bg-slate-800 w-auto border-r border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]"
                >
                  Item Name {getSortIcon('item_name')}
                </th>
                
                {/* Fixed widths for even spacing across the data columns */}
                <th className="px-4 py-3 font-bold text-slate-500 text-center uppercase tracking-widest text-[10px] w-24">
                  Unit
                </th>
                
                <th 
                  onClick={() => requestSort('quantity')}
                  className="px-4 py-3 font-bold text-slate-500 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px] w-32"
                >
                  Qty {getSortIcon('quantity')}
                </th>
                
                <th 
                  onClick={() => requestSort('n_rate')}
                  className="px-4 py-3 font-bold text-slate-500 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-[10px] w-36"
                >
                  Rate (₹) {getSortIcon('n_rate')}
                </th>
                
                <th 
                  onClick={() => requestSort('n_amount')}
                  className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30 text-right cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors uppercase tracking-widest text-[10px] w-40"
                >
                  Amount {getSortIcon('n_amount')}
                </th>

              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                      <Package size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs">No Line Items Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, idx) => (
                  <tr key={item.item_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    
                    <td className="px-4 py-3 text-slate-500 font-medium sticky left-0 z-10 bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 text-center border-r border-slate-50 dark:border-slate-800/50">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 sticky left-12 z-10 bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 border-r border-slate-50 dark:border-slate-800/50">
                      {item.item_id || "-"}
                    </td>
                    
                    <td className="px-4 py-3 sticky left-36 z-10 bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 border-r border-slate-50 dark:border-slate-800/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate flex-1" title={item.item_name}>
                          {item.item_name}
                        </span>
                        {item.description && (
                          <button 
                            onClick={() => setViewingItem(item)}
                            className="shrink-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="View full specification"
                          >
                            <HiOutlineInformationCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 uppercase font-mono">{item.unit || "NOS"}</span>
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300 font-bold">{item.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500 font-medium">{fmt(item.n_rate)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-blue-700 dark:text-blue-400 font-black bg-blue-50/10 dark:bg-blue-400/5">{fmt(item.n_amount)}</td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Financial Summary Footer */}
            {!loading && sortedItems.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky bottom-0 z-20">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td colSpan={3} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-right">
                    Subtotal (Excl. Tax)
                  </td>
                  <td colSpan={3}></td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-blue-700 dark:text-blue-400 font-bold">{fmt(totals.base)}</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/30">
                  <td colSpan={3} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 sticky left-0 z-30 bg-slate-100/50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-right">
                    Tax (GST {gstPercent}%)
                  </td>
                  <td colSpan={3}></td>
                  <td className="px-4 py-2 text-right tabular-nums text-indigo-500 dark:text-indigo-400 italic font-medium">{fmt(totals.gst)}</td>
                </tr>
                <tr className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                  <td colSpan={3} className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-right">
                    Baseline Grand Total
                  </td>
                  <td colSpan={3}></td>
                  <td className="px-4 py-3 text-right tabular-nums text-sm text-emerald-600 dark:text-emerald-400 font-black">{fmt(totals.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* --- BOTTOM ACTIONS --- */}
      <div className="flex items-center justify-between mt-2 px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all group focus:outline-none">
          <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <MdArrowBackIosNew size={12} />
          </div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Baseline Validity Secured <LayoutList size={14} className="text-blue-500" />
        </div>
      </div>

      {/* --- ENTERPRISE MODALS --- */}
      {viewingItem && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <HiOutlineInformationCircle className="text-blue-500" size={20} />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Item Specification</h3>
              </div>
              <button onClick={() => setViewingItem(null)} className="p-1 rounded text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none">
                <IoClose size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Item Code</p>
                  <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingItem.item_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unit</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">{viewingItem.unit || "NOS"}</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Item Name</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{viewingItem.item_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Description</p>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                  {viewingItem.description || "No detailed specification provided for this item."}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button onClick={() => setViewingItem(null)} className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SummaryCard({ icon: Icon, label, value, sub, colorClass, bgColor }) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
      <div className={`p-3 rounded-lg ${bgColor} shrink-0 group-hover:scale-105 transition-transform`}>
        {Icon && <Icon size={20} className={colorClass} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1.5 truncate">
          {label}
        </p>
        <h3 className="text-lg font-black text-slate-900 dark:text-white tabular-nums leading-tight tracking-tight">
          {value}
        </h3>
        {sub && (
          <div className="text-[10px] font-bold text-slate-500 mt-1 truncate">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
    <td className="px-4 py-3 border-r border-slate-50 dark:border-slate-800/50"><div className="h-3 w-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div></td>
    <td className="px-4 py-3 border-r border-slate-50 dark:border-slate-800/50"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3 border-r border-slate-50 dark:border-slate-800/50"><div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3 flex justify-center"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3 bg-blue-50/50 dark:bg-blue-900/30"><div className="h-3 w-20 bg-blue-200 dark:bg-blue-800/50 rounded ml-auto"></div></td>
  </tr>
);

export default BOQ;