import {
  IoTimeOutline,
  IoWarning,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoFingerPrintOutline,

} from "react-icons/io5";

import {
  format
} from "date-fns";

const DetailModal = ({ data, onClose, theme }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Gradient */}
        <div className={`relative h-24 bg-gradient-to-r ${theme.gradient} flex items-center justify-between px-8`}>
            <div className="text-white">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{format(data.date, "yyyy")}</p>
                <h3 className="text-2xl font-bold">{format(data.date, "eeee, MMM do")}</h3>
            </div>
            <button 
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors backdrop-blur-md"
            >
                <IoCloseCircle size={24} />
            </button>
        </div>

        {/* Content Body */}
        <div className="p-8 -mt-6">
            
            {/* Main Status Card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 border border-slate-100 flex justify-between items-center relative">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${theme.bg} ${theme.primary} ring-1 ring-inset ${theme.ring}`}>
                        {theme.icon}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                        <p className={`text-xl font-bold ${theme.primary}`}>{data.status || "No Data"}</p>
                    </div>
                </div>
                
                {/* Net Hours Display */}
                {data.hours > 0 && (
                    <div className="text-right border-l pl-6 border-slate-100">
                        <p className="text-3xl font-bold text-slate-800 tabular-nums">{data.hours}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase">Net Hours</p>
                    </div>
                )}
            </div>

            {/* Timeline Section */}
            {(data.inTime || data.outTime) && (
                <div className="mt-6">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <IoFingerPrintOutline className="text-slate-400"/> Activity Log
                    </h4>
                    <div className="flex items-center gap-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -z-10"></div>
                        
                        <TimePill label="Punch In" time={data.inTime} color="blue" />
                        <div className="flex-1 text-center">
                           <span className="text-[10px] font-bold text-slate-400 bg-white px-2">Duration: {data.hours}h</span>
                        </div>
                        <TimePill label="Punch Out" time={data.outTime} color="slate" />
                    </div>
                </div>
            )}

            {/* Tags / Warnings */}
            <div className="mt-8 space-y-3">
                <h4 className="text-sm font-bold text-slate-800 mb-2">Details</h4>
                
                {data.isLate ? (
                     <WarningRow icon={<IoWarning/>} text="Late Entry Detected" subtext="Grace period exceeded by 15 mins" color="text-orange-600" bg="bg-orange-50" />
                ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="text-emerald-500"><IoCheckmarkCircle/></div>
                        <p className="text-sm font-medium text-slate-600">On Time Arrival</p>
                    </div>
                )}

                {data.permissionUsed && (
                    <WarningRow icon={<IoTimeOutline/>} text={`Permission Used: ${data.permissionUsed}`} subtext="Short leave approval applied" color="text-blue-600" bg="bg-blue-50" />
                )}

                {data.isRegularized && (
                     <WarningRow icon={<IoCheckmarkCircle/>} text="Regularization Approved" subtext="Manager approved correction" color="text-purple-600" bg="bg-purple-50" />
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default DetailModal;

const TimePill = ({ label, time, color }) => (
    <div className="flex flex-col items-center gap-1 bg-white p-2">
        <div className={`px-4 py-1.5 rounded-full border text-xs font-bold shadow-sm ${color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            {time || "--:--"}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
);

const WarningRow = ({ icon, text, subtext, color, bg }) => (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${bg} border border-transparent`}>
        <div className={`mt-0.5 ${color}`}>{icon}</div>
        <div>
            <p className={`text-sm font-bold ${color}`}>{text}</p>
            <p className="text-xs opacity-80 text-slate-600">{subtext}</p>
        </div>
    </div>
);
