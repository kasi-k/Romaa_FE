import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Filter, ArrowRight, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { useLedgerSummary } from "./hooks/useLedger";
import { useTenderIds } from "../debit_creditnote/hooks/useDebitCreditNote";
import SearchableSelect from "../../../components/SearchableSelect";
import Title from "../../../components/Title";

const FY_RANGES = [
  { label: "FY 2024-25", from: "2024-04-01", to: "2025-03-31" },
  { label: "FY 2025-26", from: "2025-04-01", to: "2026-03-31" },
  { label: "FY 2026-27", from: "2026-04-01", to: "2027-03-31" },
];

const LedgerEntry = () => {
  const navigate = useNavigate();
  
  /* ── Form States ── */
  const [supplierType, setSupplierType]             = useState("Vendor");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedTenderId, setSelectedTenderId]     = useState("");
  const [fromDate, setFromDate]                     = useState("");
  const [toDate, setToDate]                         = useState("");

  /* ── API Data ── */
  const { data: summaries = [], isLoading: summariesLoading, isFetching: loadingSummary } = useLedgerSummary({ supplier_type: supplierType });
  const { data: tenders = [], isLoading: tendersLoading } = useTenderIds();

  /* ── Dropdown Mapping ── */
  const supplierOptions = useMemo(() => 
    summaries.map(s => ({ value: s.supplier_id, label: `${s.supplier_name} (${s.supplier_id})` })),
  [summaries]);

  const tenderOptions = useMemo(() => 
    tenders.map(t => ({ value: t.tender_id, label: t.tender_name || t.tender_id })),
  [tenders]);

  const handleGenerate = () => {
    if (!selectedSupplierId) return;
    const params = new URLSearchParams();
    if (fromDate) params.append("from", fromDate);
    if (toDate) params.append("to", toDate);
    if (selectedTenderId) params.append("tender_id", selectedTenderId);
    params.append("type", supplierType);
    
    navigate(`/finance/ledgerentry/viewledgerentry/${selectedSupplierId}?${params.toString()}`);
  };

  const applyFY = (range) => {
    setFromDate(range.from);
    setToDate(range.to);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-[#0b0f19] flex flex-col font-sans">
      <div className="p-4 md:p-6 pb-2">
        <Title title="Finance" sub_title="Ledger" page_title="Report Configuration" />
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        
        {/* ── Main Config Panel ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden mt-4">
          
          <div className="px-6 py-4 border-b-2 border-slate-800 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                 <BookOpen size={16} />
               </div>
               <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-tight">Ledger Statement Generation</h2>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Configure Account and Parameters</p>
               </div>
             </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Row 1: Account Type & Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                  1. Select Account Type
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                  {["Vendor", "Contractor", "Client"].map(t => (
                    <button
                      key={t}
                      onClick={() => { setSupplierType(t); setSelectedSupplierId(""); }}
                      className={`py-2.5 px-3 rounded-md text-xs font-bold transition-all ${
                        supplierType === t
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                  2. Choose {supplierType} Account 
                  {loadingSummary && <RefreshCw size={12} className="animate-spin text-blue-500" />}
                </label>
                <SearchableSelect
                  placeholder={`Search ${supplierType} directory...`}
                  options={supplierOptions}
                  value={selectedSupplierId}
                  onChange={setSelectedSupplierId}
                  disabled={summariesLoading}
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Row 2: Tender/Project Filtering */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">
                  3. Project / Tender Filter (Optional)
                </label>
                <SearchableSelect
                  placeholder="Leave blank for all projects..."
                  options={tenderOptions}
                  value={selectedTenderId}
                  onChange={setSelectedTenderId}
                  disabled={tendersLoading}
                />
                <div className="mt-3 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                   <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-500" />
                   <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-snug">
                     If selected, the ledger will only include transactions posted against this specific project.
                   </p>
                </div>
              </div>

              {/* Row 3: Period */}
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">4. Reporting Period</label>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {FY_RANGES.map(fy => (
                      <button
                        key={fy.label}
                        onClick={() => applyFY(fy)}
                        className={`px-2 py-1 rounded text-[9px] font-black transition-all border ${
                          fromDate === fy.from && toDate === fy.to
                            ? "bg-slate-800 border-slate-800 text-white"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                        }`}
                      >
                        {fy.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute -top-2 left-2 bg-white dark:bg-slate-900 px-1 text-[8px] font-black text-slate-400 uppercase tracking-wider z-10">From</span>
                    <input 
                      type="date" 
                      value={fromDate} 
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute -top-2 left-2 bg-white dark:bg-slate-900 px-1 text-[8px] font-black text-slate-400 uppercase tracking-wider z-10">To</span>
                    <input 
                      type="date" 
                      value={toDate} 
                      onChange={e => setToDate(e.target.value)}
                      className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 opacity-80 mt-2 tabular-nums italic">
                  * Transactions prior to the "From" date roll into the Opening Balance.
                </p>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedSupplierId}
              className={`px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                selectedSupplierId
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent"
              }`}
            >
              <Filter size={14} />
              Generate Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerEntry;
