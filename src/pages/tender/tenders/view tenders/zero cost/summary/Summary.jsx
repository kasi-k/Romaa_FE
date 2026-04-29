import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { 
  HiOutlineClipboardCheck, // Universally safe React-Icons import
  HiOutlineDocumentText, 
  HiOutlineExclamationCircle 
} from "react-icons/hi";
import Button from "../../../../../../components/Button"; // Adjust path
import { useTenderSummary, useFinalizeEstimate } from "../../../hooks/useTenders"; // Adjust path

// ============================================================================
// FORMATTERS & UTILITIES
// ============================================================================

const formatCurrency = (value) =>
  value !== undefined && value !== null && !isNaN(value)
    ? Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

// ============================================================================
// MAIN COMPONENT: SUMMARY VIEW
// ============================================================================

const Summary = () => {
  const { tender_id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Query: Fetch Summary Data
  const { data, isLoading: isFetchingSummary, isError } = useTenderSummary(tender_id);
  
  // React Query: Finalize Mutation (Safe extraction for both v4 and v5)
  const { 
    mutate: finalizeEstimate, 
    isPending, 
    isLoading: isMutating 
  } = useFinalizeEstimate({
    onSuccess: () => setIsModalOpen(false),
  });

  // Derived loading states
  const isFinalizing = Boolean(isPending || isMutating);
  const isLoading = isFetchingSummary;

  // Safe data extraction with fallbacks
  const summaryData = data?.summary || {};
  const tenderDetails = data?.tenderdetails || {};
  const isFinalized = Boolean(data?.freeze); 
  const tenderName = tenderDetails?.tender_name || "this project";

  const handleConfirmFinalize = () => finalizeEstimate(tender_id);

  // Hard Error State
  if (isError) {
    return (
      <div className="flex justify-center items-center h-48 bg-red-50 text-red-600 rounded border border-red-200 p-4 shadow-sm">
        <p className="font-semibold text-sm">
          Failed to load estimate summary. Please check your connection and try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-1 relative" aria-busy={isLoading || isFinalizing}>
      {/* HEADER SECTION */}
      <header className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Zero Cost Estimate Summary
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${
                isFinalized ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              }`}
            >
              {isFinalized ? "Finalized" : "Draft Mode"}
            </span>
            <Button
              button_icon={isFinalized ? <HiOutlineClipboardCheck size={16} /> : <HiOutlineDocumentText size={16} />}
              button_name={isFinalized ? "Estimate Finalized" : "Finalize Estimate"}
              bgColor={isFinalized ? "bg-slate-200 dark:bg-slate-800" : "bg-emerald-600 hover:bg-emerald-700"}
              textColor={isFinalized ? "text-slate-500" : "text-white"}
              onClick={() => !isFinalized && setIsModalOpen(true)}
              disabled={isFinalized || isLoading}
              className="py-1! px-3! text-xs! shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DetailBlock label="Tender Name" value={tenderDetails.tender_name} isLoading={isLoading} />
          <DetailBlock label="Project" value={tenderDetails.tender_project_name} isLoading={isLoading} />
          <DetailBlock label="Client" value={tenderDetails.client_name} isLoading={isLoading} />
          <DetailBlock
            label="Location"
            value={tenderDetails.tender_location ? `${tenderDetails.tender_location.city}, ${tenderDetails.tender_location.state}` : null}
            isLoading={isLoading}
          />
        </div>
      </header>

      {/* DATA GRID SECTION */}
      <main className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded shadow-sm overflow-hidden relative">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th scope="col" className="px-4 py-2.5 text-left font-bold text-slate-600 dark:text-slate-300 w-16">Sr.</th>
              <th scope="col" className="px-4 py-2.5 text-left font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">Description of Items</th>
              <th scope="col" className="px-4 py-2.5 text-right font-bold text-slate-600 dark:text-slate-300 w-48">Value (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
              <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">1.0</td>
              <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">ESTIMATED COSTS</td>
              <td className="px-4 py-2"></td>
            </tr>
            <DataRow sr="1.a" label="Direct Cost (DC)" value={`₹ ${formatCurrency(summaryData.zero_cost_total_amount)}`} isLoading={isLoading} />
            <DataRow sr="1.b" label="Indirect Cost (Site Overheads)" value={`₹ ${formatCurrency(summaryData.siteoverhead_total_amount)}`} isLoading={isLoading} />
            <DataRow sr="2.0" label="TOTAL PROJECT COST (DC + IDC)" value={`₹ ${formatCurrency(summaryData.total_cost)}`} isTotal isLoading={isLoading} />
            <DataRow sr="3.0" label="CONTRACT VALUE (Sales / BOQ Total Amount)" value={`₹ ${formatCurrency(summaryData.boq_total_amount)}`} className="bg-emerald-50/30 dark:bg-emerald-900/10" isLoading={isLoading} />
            <DataRow sr="4.0" label="GROSS MARGIN (Sales - Cost)" value={`₹ ${formatCurrency(summaryData.margin)}`} isTotal isLoading={isLoading} />
            <DataRow sr="5.0" label={`ESCALATION BENEFITS (@ ${summaryData.escalation_benefits_percentage || 0}%)`} value={`${summaryData.escalation_benefits_percentage || 0}%`} isLoading={isLoading} />
            <DataRow sr="6.0" label="NET TOTAL MARGIN (4 + 5)" value={`₹ ${formatCurrency(summaryData.total_margin)}`} isTotal isLoading={isLoading} />

            <tr className="bg-slate-50 dark:bg-slate-900 font-semibold border-t-2 border-slate-200 dark:border-slate-700">
              <td className="px-4 py-3">7.0</td>
              <td className="px-4 py-3 text-blue-700 dark:text-blue-400">GROSS MARGIN PERCENTAGE (%)</td>
              <td className="px-4 py-3 text-right text-blue-700 dark:text-blue-400">
                {isLoading ? <Skeleton width="w-12" /> : `${Number(summaryData.grossmargin_percentage || 0).toFixed(2)}%`}
              </td>
            </tr>

            <DataRow sr="8.0" label="Risk & Contingency Allowance" value={`${summaryData.risk_contingency || 0}%`} isLoading={isLoading} />
            <DataRow sr="9.0" label="HO Overheads Allocation" value={`${summaryData.ho_overheads || 0}%`} isLoading={isLoading} />

            <tr className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold">
              <td className="px-4 py-3">10.0</td>
              <td className="px-4 py-3">PROFIT BEFORE TAX (PBT)</td>
              <td className="px-4 py-3 text-right">
                {isLoading ? <Skeleton width="w-12" light /> : `${Number(summaryData.PBT || 0).toFixed(2)}%`}
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      {/* MODAL MOUNTING */}
      <FinalizeConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmFinalize}
        isFinalizing={isFinalizing}
        tenderName={tenderName}
      />
    </div>
  );
};

// ============================================================================
// INTERNAL SUB-COMPONENTS (Colocated)
// ============================================================================

const Skeleton = ({ width = "w-24", light = false }) => (
  <div className={`h-3 ${width} rounded animate-pulse inline-block ${light ? "bg-slate-600/50" : "bg-slate-200 dark:bg-slate-700"}`}></div>
);
Skeleton.propTypes = { width: PropTypes.string, light: PropTypes.bool };

const DetailBlock = ({ label, value, isLoading }) => (
  <div className="space-y-1">
    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
      {label}
    </p>
    {isLoading ? (
      <Skeleton width="w-3/4" />
    ) : (
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={value || "N/A"}>
        {value || "N/A"}
      </p>
    )}
  </div>
);
DetailBlock.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string, isLoading: PropTypes.bool };

const DataRow = ({ sr, label, value, isTotal = false, className = "", isLoading = false }) => (
  <tr className={`${isTotal ? "bg-slate-50 dark:bg-slate-900/50 font-bold" : ""} ${className} hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors`}>
    <td className="px-4 py-2 text-slate-500">{sr}</td>
    <td className={`px-4 py-2 ${isTotal ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
      {label}
    </td>
    <td className={`px-4 py-2 text-right tabular-nums tracking-tight ${isTotal ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
      {isLoading ? <Skeleton width="w-20" /> : value}
    </td>
  </tr>
);
DataRow.propTypes = { sr: PropTypes.string.isRequired, label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, isTotal: PropTypes.bool, className: PropTypes.string, isLoading: PropTypes.bool };

/**
 * Hard Confirmation Modal for Finalizing
 */
const FinalizeConfirmModal = ({ isOpen, onClose, onConfirm, isFinalizing, tenderName }) => {
  const [confirmationText, setConfirmationText] = useState("");
  const requiredText = "FINALIZE";

  useEffect(() => {
    if (isOpen) setConfirmationText("");
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isFinalizing) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isFinalizing]);

  if (!isOpen) return null;

  const isConfirmed = confirmationText === requiredText;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full text-emerald-600 dark:text-emerald-500">
            <HiOutlineClipboardCheck size={24} aria-hidden="true" />
          </div>
          <h3 id="modal-title" className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Finalize Zero Cost Estimate
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            You are about to finalize the estimate for <strong className="text-slate-800 dark:text-white">{tenderName}</strong>. This signifies the draft phase is complete.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
              <HiOutlineExclamationCircle size={14} /> Workflow Impact
            </h4>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Cost calculations and margins will be locked.</li>
              <li>The estimate will be marked as the official baseline.</li>
              <li>The document will be submitted for the next stage of approval.</li>
            </ul>
          </div>
          
          <div className="mb-2">
            <label htmlFor="confirm-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              To confirm, please type <strong className="text-emerald-600 dark:text-emerald-500">{requiredText}</strong> below:
            </label>
            <input
              id="confirm-text"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type ${requiredText}`}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white transition-all disabled:opacity-50"
              autoComplete="off"
              disabled={isFinalizing}
            />
          </div>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isFinalizing}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isFinalizing}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {isFinalizing ? "Finalizing..." : "Confirm Finalize"}
          </button>
        </div>
      </div>
    </div>
  );
};
FinalizeConfirmModal.propTypes = { isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, onConfirm: PropTypes.func.isRequired, isFinalizing: PropTypes.bool.isRequired, tenderName: PropTypes.string };

export default Summary;