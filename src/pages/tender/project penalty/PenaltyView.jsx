import React from "react";
import { useParams } from "react-router-dom";
import { useTenderPenalties } from "./hooks/usePenalities";
import Loader from "../../../components/Loader";
import { 
  ShieldCheck, 
  TrendingDown,
  Clock
} from "lucide-react";

const PenaltyCardGrid = () => {
  const { tender_id } = useParams();
  const { data: penalties = [], isLoading } = useTenderPenalties(tender_id);

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

  const totalAmount = penalties.reduce((acc, p) => acc + p.penalty_amount, 0);

  return (
    /* h-screen + overflow-hidden prevents the whole page from scrolling */
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
      
      {/* --- FIXED HEADER SECTION --- */}
      <div className="flex-none p-8 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-[0.2em] uppercase">
                Financial Audit
              </span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Clock size={12}/> Live Registry
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Penalty <span className="text-indigo-600">Ledger</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-2">
              Tender Ref: <span className="text-slate-800 font-mono font-bold underline decoration-indigo-200">#{tender_id}</span>
            </p>
          </div>

          {/* SUMMARY RIBBON */}
          {penalties.length > 0 && (
            <div className="flex gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm min-w-[160px]">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Liability</p>
                <p className="text-xl font-black text-slate-900">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                </p>
              </div>
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100 min-w-[100px]">
                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Count</p>
                <p className="text-xl font-black text-white">{penalties.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- SCROLLABLE CARD SECTION --- */}
      <div className="flex-1 overflow-y-auto p-8 ">
        {penalties.length === 0 ? (
          <NoDataFound tenderId={tender_id} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {penalties.map((penalty) => (
              <PenaltyCard key={penalty.penalty_id} penalty={penalty} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* --- ENHANCED DATA CARD --- */
const PenaltyCard = ({ penalty }) => (
  <div className="group bg-white border border-slate-200 rounded-[28px] overflow-hidden hover:border-indigo-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col">
    <div className="p-6 flex-1">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
          <TrendingDown size={22} />
        </div>
        <StatusBadge status={penalty.status} />
      </div>

      <div className="space-y-1 mb-6">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Incident Category</span>
        <h2 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2 h-12">
          {penalty.penalty_type}
        </h2>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Assessment</p>
            <p className="text-xl font-black text-slate-900">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(penalty.penalty_amount)}
            </p>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Date</p>
             <p className="text-xs font-bold text-slate-700">
               {new Date(penalty.penalty_date).toLocaleDateString("en-GB")}
             </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic">
        "{penalty.description || "No specific narrative provided."}"
      </p>
    </div>

    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50/30 transition-colors">
       <span className="text-[9px] font-mono text-slate-400">AUTH: LEDGER_SECURE</span>
       <span className="text-[9px] font-bold text-slate-900 bg-white px-2 py-1 rounded border shadow-sm">
         REF_{penalty.penalty_id?.toString().slice(-6).toUpperCase()}
       </span>
    </div>
  </div>
);

/* --- PERSISTENT NO-DATA SCREEN --- */
const NoDataFound = ({ tenderId }) => (
  <div className="max-w-4xl mx-auto mt-6 animate-in fade-in zoom-in duration-500">
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[350px]">
      <div className="bg-slate-900 md:w-1/3 p-10 flex flex-col justify-center items-center text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
          <ShieldCheck className="text-emerald-400 w-10 h-10" />
        </div>
        <h3 className="text-white font-bold text-lg leading-tight uppercase tracking-tight">Clean Compliance</h3>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">Verified Clear</p>
      </div>
      <div className="p-12 md:w-2/3 flex flex-col justify-center">
        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit">Registry Scan</span>
        <h2 className="text-3xl font-black text-slate-900 mt-4 leading-none uppercase italic tracking-tighter">
          Zero Penalties <span className="text-indigo-600">Found</span>
        </h2>
        <p className="text-slate-500 mt-4 text-sm leading-relaxed">
          The automated audit for tender <span className="font-bold text-slate-800">#{tenderId}</span> is complete. No financial deviations or violations are currently recorded.
        </p>
        
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    waived: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  const current = styles[status?.toLowerCase()] || "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${current}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default PenaltyCardGrid;