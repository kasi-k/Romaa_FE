import React, { useEffect, useState, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../constant"; // Adjust path as needed
import UploadBid from "./UploadBid";

// Icons
import { MdArrowBackIosNew } from "react-icons/md";
import { IoAlertCircleOutline, IoClose, IoSearchOutline } from "react-icons/io5";
import {
  LayoutList,
  CircleDollarSign,
  BarChart3,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { 
  HiOutlineLockClosed, 
  HiOutlineClipboardCheck, 
  HiOutlineInformationCircle 
} from "react-icons/hi";

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
// MAIN COMPONENT: BID SUMMARY
// ============================================================================

const Bid = ({ onBack }) => {
  const { tender_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidfreezed, setbidfreezed] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gstPercent, setGstPercent] = useState(18);

  // Modal States
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  
  // NEW: State for the Item Details Modal
  const [viewingItem, setViewingItem] = useState(null);

  const fetchBoqItems = useCallback(async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bid/get?tender_id=${tender_id}`);
      setItems(res.data.data.items || []);
      setbidfreezed(Boolean(res.data.data.freezed));
      if (res.data.data.gst) setGstPercent(res.data.data.gst);
    } catch (err) {
      toast.info(`${err.response?.data?.message || "Error fetching items"}`);
    } finally {
      setLoading(false);
    }
  }, [tender_id]);

  useEffect(() => {
    fetchBoqItems();
  }, [fetchBoqItems]);

  // Reset text when freeze modal opens
  useEffect(() => {
    if (showFreezeModal) setConfirmationText("");
  }, [showFreezeModal]);

  // Close item details modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setViewingItem(null);
    };
    if (viewingItem) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [viewingItem]);

  const totals = useMemo(() => {
    const base = items.reduce(
      (acc, curr) => {
        acc.basic += Number(curr.base_amount) || 0;
        acc.quoted += Number(curr.q_amount) || 0;
        acc.negotiated += Number(curr.n_amount) || 0;
        return acc;
      },
      { basic: 0, quoted: 0, negotiated: 0 }
    );

    const calc = (val) => {
      const gAmount = val * (gstPercent / 100);
      return { base: val, gst: gAmount, total: val + gAmount };
    };

    return {
      basic: calc(base.basic),
      quoted: calc(base.quoted),
      negotiated: calc(base.negotiated),
      percent: gstPercent,
    };
  }, [items, gstPercent]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (it) =>
        it.item_name?.toLowerCase().includes(q) ||
        it.item_id?.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const handlefreeze = async () => {
    setIsFreezing(true);
    try {
      await axios.put(`${API}/bid/freeze/${tender_id}`);
      toast.success("Bid finalized and locked successfully ✅");
      setbidfreezed(true);
      setShowFreezeModal(false);
    } catch {
      toast.error("Failed to finalize bid. Please try again.");
    } finally {
      setIsFreezing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-1 h-full relative" aria-busy={loading || isFreezing}>
      {/* --- ERP HEADER & ACTIONS --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
        
        {/* Search */}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!loading && !bidfreezed && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <ArrowUpRight size={14} />
              Upload BOQ
            </button>
          )}

          {!loading && (
            <button
              onClick={() => !bidfreezed && setShowFreezeModal(true)}
              disabled={items.length === 0 || bidfreezed}
              className={`px-4 py-2 text-xs font-semibold rounded shadow-sm transition-all flex items-center gap-2 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                bidfreezed
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
              }`}
            >
              {bidfreezed ? <HiOutlineLockClosed size={16} /> : <HiOutlineClipboardCheck size={16} />}
              {bidfreezed ? "Submission Locked" : "Finalize Bid"}
            </button>
          )}
        </div>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Package} label="Total Items" value={items.length} sub="BOQ Line Items" colorClass="text-slate-500" bgColor="bg-slate-100 dark:bg-slate-800" />
        <SummaryCard icon={CircleDollarSign} label="Basic Total" value={fmt(totals.basic.base)} sub="Owner Estimate" colorClass="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-900/20" />
        <SummaryCard 
          icon={LayoutList} 
          label="Quoted Total" 
          value={fmt(totals.quoted.base)} 
          sub={
            <div className="flex items-center gap-1.5">
              <span>{totals.quoted.base > totals.basic.base ? "Above Est." : "Below Est."}</span>
              {totals.basic.base > 0 && (
                <span className={totals.quoted.base > totals.basic.base ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400 truncate"}>
                  ({totals.quoted.base > totals.basic.base ? "+" : ""}{(((totals.quoted.base - totals.basic.base) / totals.basic.base) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          }
          colorClass={totals.quoted.base > totals.basic.base ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"} 
          bgColor={totals.quoted.base > totals.basic.base ? "bg-amber-50 dark:bg-amber-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"} 
        />
        <SummaryCard 
          icon={BarChart3} 
          label="Negotiated Total" 
          value={fmt(totals.negotiated.base)} 
          sub={
            <div className="flex items-center gap-1.5">
              <span>Final Award</span>
              {totals.basic.base > 0 && (
                <span className={totals.negotiated.base > totals.basic.base ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                  ({totals.negotiated.base > totals.basic.base ? "+" : ""}{(((totals.negotiated.base - totals.basic.base) / totals.basic.base) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          }
          colorClass="text-indigo-600 dark:text-indigo-400" 
          bgColor="bg-indigo-50 dark:bg-indigo-900/20" 
        />
      </div>

      {/* --- DATA GRID --- */}
      <div className="bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col grow">
        
        {/* Table Toolbar */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Showing {filteredItems.length} of {items.length} records
          </div>
          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
            GST Applied: {totals.percent}%
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-x-auto max-h-[60vh] custom-scrollbar relative">
          <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-50 shadow-sm">
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <th colSpan={4} className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">Item Baseline Information</th>
                <th colSpan={3} className="px-4 py-2.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/30 border-r border-slate-200 dark:border-slate-700 text-center">Original Basic Details</th>
                <th colSpan={2} className="px-4 py-2.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50/50 dark:bg-amber-900/30 border-r border-slate-200 dark:border-slate-700 text-center">Quoted Analysis</th>
                <th colSpan={2} className="px-4 py-2.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50/50 dark:bg-indigo-900/30 text-center">Negotiated Final</th>
              </tr>
              <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 sticky left-0 z-40 bg-white dark:bg-slate-900 w-12 text-center">Sr.</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 sticky left-12 z-40 bg-white dark:bg-slate-900 w-24 border-l border-slate-100 dark:border-slate-800">ID</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 sticky left-36 z-40 bg-white dark:bg-slate-900 min-w-[200px] border-l border-slate-100 dark:border-slate-800">Item Name</th>
                <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300 min-w-[80px] border-r border-slate-200 dark:border-slate-700 text-center">Unit</th>
                
                {/* Basic */}
                <th className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30 text-right">Qty</th>
                <th className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30 text-right">Rate</th>
                <th className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30 text-right border-r border-slate-200 dark:border-slate-700">Amount</th>
                
                {/* Quoted */}
                <th className="px-4 py-3 font-bold text-amber-700 dark:text-amber-400 bg-amber-50/30 text-right">Rate</th>
                <th className="px-4 py-3 font-bold text-amber-700 dark:text-amber-400 bg-amber-50/30 text-right border-r border-slate-200 dark:border-slate-700">Amount</th>
                
                {/* Negotiated */}
                <th className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/30 text-right">Rate</th>
                <th className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/30 text-right">Amount</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                      <Package size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs">No Line Items Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const isDiff = (item.n_amount || 0) !== (item.base_amount || 0);
                  const variance = item.base_amount ? (((item.n_amount - item.base_amount) / item.base_amount) * 100).toFixed(1) : 0;

                  return (
                    <tr key={item.item_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Frozen Left Columns */}
                      <td className="px-4 py-3 text-slate-500 font-medium sticky left-0 z-10 bg-white dark:bg-slate-950 text-center">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-500 sticky left-12 z-10 bg-white dark:bg-slate-950 border-l border-slate-50 dark:border-slate-800/50">{item.item_id}</td>
                      
                      {/* UPGRADED: Click-to-View Specification Action */}
                      <td className="px-4 py-3 sticky left-36 z-10 bg-white dark:bg-slate-950 border-l border-slate-50 dark:border-slate-800/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[160px]" title={item.item_name}>
                            {item.item_name}
                          </span>
                          
                          {item.description && (
                            <button 
                              onClick={() => setViewingItem(item)}
                              className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                              title="View full specification"
                            >
                              <HiOutlineInformationCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 text-center border-r border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 uppercase font-mono">{item.unit || "NOS"}</span>
                      </td>

                      {/* Basic */}
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300 font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{fmt(item.base_rate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-blue-700 dark:text-blue-400 font-bold border-r border-slate-100 dark:border-slate-800">{fmt(item.base_amount)}</td>

                      {/* Quoted */}
                      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{fmt(item.q_rate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-600 dark:text-amber-500 font-bold border-r border-slate-100 dark:border-slate-800">{fmt(item.q_amount)}</td>

                      {/* Negotiated */}
                      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{fmt(item.n_rate)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-indigo-700 dark:text-indigo-400 font-bold tabular-nums">{fmt(item.n_amount)}</span>
                          {isDiff && Number(variance) !== 0 && (
                            <span className={`text-[9px] font-bold flex items-center gap-0.5 ${Number(variance) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {Number(variance) > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                              {Math.abs(variance)}%
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Financial Summary Footer */}
            {!loading && filteredItems.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky bottom-0 z-20">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td colSpan={4} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Subtotal (Excl. Tax)</td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-blue-700 dark:text-blue-400 font-bold border-r border-slate-200 dark:border-slate-700">{fmt(totals.basic.base)}</td>
                  <td></td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-500 font-bold border-r border-slate-200 dark:border-slate-700">{fmt(totals.quoted.base)}</td>
                  <td></td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-indigo-700 dark:text-indigo-400 font-bold">{fmt(totals.negotiated.base)}</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/30">
                  <td colSpan={4} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 sticky left-0 z-30 bg-slate-100/50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Tax (GST {totals.percent}%)</td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-500 italic font-medium border-r border-slate-200 dark:border-slate-700">{fmt(totals.basic.gst)}</td>
                  <td></td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-500 italic font-medium border-r border-slate-200 dark:border-slate-700">{fmt(totals.quoted.gst)}</td>
                  <td></td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-500 italic font-medium">{fmt(totals.negotiated.gst)}</td>
                </tr>
                <tr className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                  <td colSpan={4} className="px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Grand Total</td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-3 text-right tabular-nums text-sm text-blue-700 dark:text-blue-400 font-black border-r border-slate-300 dark:border-slate-600">{fmt(totals.basic.total)}</td>
                  <td></td>
                  <td className="px-4 py-3 text-right tabular-nums text-sm text-amber-600 dark:text-amber-500 font-black border-r border-slate-300 dark:border-slate-600">{fmt(totals.quoted.total)}</td>
                  <td></td>
                  <td className="px-4 py-3 text-right tabular-nums text-sm text-indigo-700 dark:text-indigo-400 font-black">{fmt(totals.negotiated.total)}</td>
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
          Financial Validity Verified <BarChart3 size={14} className="text-emerald-500" />
        </div>
      </div>

      {/* --- ENTERPRISE MODALS --- */}
      
      {/* 1. Freeze Bid Modal */}
      {showFreezeModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full text-amber-600 dark:text-amber-500">
                  <IoAlertCircleOutline size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Finalize Bid Details</h3>
              </div>
              <button onClick={() => setShowFreezeModal(false)} className="p-1 rounded text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-600 transition-colors focus:outline-none">
                <IoClose size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                You are about to finalize the submitted bid for reference <strong className="text-slate-800 dark:text-white border-b border-dashed border-slate-400">{tender_id}</strong>.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  Workflow Impact
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>The Base, Quoted, and Negotiated columns will be locked.</li>
                  <li>New BOQ uploads will be disabled.</li>
                  <li>The document will be submitted to final compliance.</li>
                </ul>
              </div>

              <div className="mb-2">
                <label htmlFor="confirm-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To confirm, please type <strong className="text-amber-600 dark:text-amber-500">FINALIZE</strong> below:
                </label>
                <input
                  id="confirm-text"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type FINALIZE"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white transition-all disabled:opacity-50"
                  autoComplete="off"
                  disabled={isFreezing}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setShowFreezeModal(false)} disabled={isFreezing} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400">
                Cancel
              </button>
              <button onClick={handlefreeze} disabled={confirmationText !== "FINALIZE" || isFreezing} className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500">
                {isFreezing ? "Finalizing..." : "Confirm Finalize"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Item Specification Detail Modal */}
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

      {showUpload && (
        <UploadBid onclose={() => setShowUpload(false)} onSuccess={fetchBoqItems} />
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
    <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 flex justify-center"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800"><div className="h-3 w-20 bg-blue-100 dark:bg-blue-900/30 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800"><div className="h-3 w-20 bg-amber-100 dark:bg-amber-900/30 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
    <td className="px-4 py-3"><div className="h-3 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded ml-auto"></div></td>
  </tr>
);

export default Bid;