import React, { useState } from "react";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import { 
  FiMail, FiPhone, FiMapPin, FiBriefcase, FiShield, 
  FiCalendar, FiUser, FiSmartphone, FiMonitor, FiEdit2, FiLock, FiCheckCircle, FiCopy
} from "react-icons/fi";
import { toast } from "react-toastify";

const Profile_Tab = ({ user }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Helper
  const formatDate = (date) => {
      if(!date) return "-";
      return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const copyToClipboard = (text) => {
    if(text) {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up pb-10 transition-colors duration-300">
      
      {/* --- 1. HERO SECTION --- */}

      <div className="relative  group">
        
        {/* A. Banner Area */}
        <div className="h-42 w-full rounded-t-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            
            {/* Status Badge (Top Right on Banner) */}
            <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
                    {user.status} Account
                </span>
            </div>
        </div>

        {/* B. Profile Info Bar (White/Dark Container) */}
        <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-sm border-x border-b border-gray-200 dark:border-slate-700 px-6 pb-6 pt-16 md:pt-4 relative">
            
            {/* 1. Avatar (Overlapping Banner & Bar) */}
            <div className="absolute -top-12 left-6 md:left-8">
                <div className="relative p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                        {user.photoUrl ? (
                            <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300 dark:text-slate-500 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {/* Badge Icon (e.g. Verified) */}
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-[3px] border-white dark:border-slate-800 shadow-sm" title="Verified User">
                         <FiCheckCircle size={14} />
                    </div>
                </div>
            </div>

            {/* 2. Main Content Layout */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:pl-40">
                
                {/* Left: Identity Details */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                        {user.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-slate-400 mb-3">
                        <span className="flex items-center gap-1.5">
                            <FiBriefcase className="text-blue-500" /> 
                            <span className="font-medium text-gray-700 dark:text-slate-200">{user.designation || "No Designation"}</span>
                        </span>
                        <span className="hidden md:inline text-gray-300 dark:text-slate-600">|</span>
                        <span className="flex items-center gap-1.5">
                            <FiMapPin className="text-gray-400" /> {user.address?.city || "Unknown City"}
                        </span>
                        <span className="hidden md:inline text-gray-300 dark:text-slate-600">|</span>
                         <span className="flex items-center gap-1.5">
                            <FiShield className="text-purple-400" /> {user.role?.roleName || "User"}
                        </span>
                    </div>

                    {/* Access Badges */}
                    <div className="flex gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                            {user.accessMode === 'MOBILE' ? <FiSmartphone size={10}/> : <FiMonitor size={10}/>}
                            {user.accessMode} Access
                        </span>
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-row md:flex-col lg:flex-row gap-3 mt-2 md:mt-0">
                    <button 
                        onClick={() => setIsPasswordOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-all shadow-sm"
                    >
                        <FiLock size={14} /> Change Password
                    </button>
                    <button 
                        onClick={() => setIsEditOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-darkest-blue hover:bg-blue-900 rounded-lg shadow-md shadow-blue-200 dark:shadow-none transition-all"
                    >
                        <FiEdit2 size={14} /> Edit Profile
                    </button>
                </div>
            </div>

        </div>
      </div>

      {/* --- 2. MAIN GRID CONTENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Col: Contact & Personal Info */}
        <div className="lg:col-span-2 space-y-4">
            
            {/* Section: Contact Details */}
            <Card title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <InfoRow 
                        icon={<FiMail/>} 
                        label="Email Address" 
                        value={user.email} 
                        copyable 
                        onCopy={() => copyToClipboard(user.email)} 
                    />
                    <InfoRow icon={<FiPhone/>} label="Phone Number" value={user.phone} />
                    <InfoRow icon={<FiMapPin/>} label="Current Address" value={`${user.address?.street}, ${user.address?.city}`} sub={`${user.address?.state} - ${user.address?.pincode}`} />
                    <InfoRow icon={<FiMapPin/>} label="Permanent Address" value="Same as current" sub="(Verified)" />
                </div>
            </Card>

            {/* Section: Professional Details */}
            <Card title="Work Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <InfoRow icon={<FiBriefcase/>} label="Employee ID" value={user.employeeId} copyable onCopy={() => copyToClipboard(user.employeeId)}/>
                    <InfoRow icon={<FiCalendar/>} label="Date of Joining" value={formatDate(user.dateOfJoining)} />
                    <InfoRow icon={<FiUser/>} label="Department" value={user.department || "Engineering"} />
                    <InfoRow icon={<FiShield/>} label="Reporting Manager" value={user.reportingManager?.name || "N/A"} />
                </div>
            </Card>

        </div>

        {/* Right Col: Stats & Metadata */}
        <div className="space-y-4">
            
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Account Status</h3>
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50 dark:border-slate-700/50">
                    <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">Current Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ring-1 ring-inset ${user.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800' : 'bg-red-50 text-red-700'}`}>
                        {user.status}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">User Type</span>
                    <span className="text-slate-800 dark:text-white text-sm font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{user.userType}</span>
                </div>
                
                 <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                         <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                             <FiCheckCircle />
                         </div>
                         <div>
                             <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Identity Verified</p>
                             <p className="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono">
                                 {user.idProof?.type || "ID"} ••• {user.idProof?.number ? user.idProof.number.slice(-4) : "****"}
                             </p>
                         </div>
                    </div>
                 </div>
            </div>

            {/* Leave Balance Summary (Mini) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-2xl p-6 text-white shadow-xl dark:border dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider">Leave Balance</h3>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded border border-white/5">2026 CYCLE</span>
                </div>
                
                <div className="space-y-5">
                    <LeaveBar label="Casual Leave" used={5} total={12} color="bg-blue-500" />
                    <LeaveBar label="Sick Leave" used={2} total={10} color="bg-orange-500" />
                    <LeaveBar label="Privilege Leave" used={0} total={15} color="bg-purple-500" />
                </div>
            </div>

        </div>
      </div>

      {/* Modals */}
      {isEditOpen && <EditProfile data={user} onclose={() => setIsEditOpen(false)} />}
      {isPasswordOpen && <ChangePassword onclose={() => setIsPasswordOpen(false)} />}
    </div>
  );
};

// --- Sub-Components (Optimized for Dark Mode) ---

const Card = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 hover:shadow-md dark:hover:shadow-none dark:hover:bg-slate-750">
        <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-6 pb-3 border-b border-gray-50 dark:border-slate-700/50">{title}</h3>
        {children}
    </div>
);

const InfoRow = ({ icon, label, value, sub, copyable, onCopy }) => (
    <div className="flex items-start gap-4 group">
        {/* Icon Box */}
        <div className="mt-1 text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            {icon}
        </div>
        
        {/* Text Content */}
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
            <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-words truncate">
                    {value || "Not Provided"}
                </p>
                {copyable && value && (
                    <button 
                        onClick={onCopy} 
                        className="text-gray-300 hover:text-blue-500 dark:text-slate-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy"
                    >
                        <FiCopy size={12} />
                    </button>
                )}
            </div>
            {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const Badge = ({ icon, label, color }) => {
    // Map colors to specific Tailwind classes for both modes
    const colors = {
        indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800",
        purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800",
        emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800"
    };
    
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-colors ${colors[color] || colors.indigo}`}>
            {icon} {label}
        </span>
    );
};

const LeaveBar = ({ label, used, total, color }) => (
    <div>
        <div className="flex justify-between text-xs mb-1.5 text-gray-300">
            <span className="font-medium">{label}</span>
            <span className="font-bold text-white">{total - used} <span className="text-[10px] opacity-60 font-normal">/ {total}</span></span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`} style={{ width: `${((total - used) / total) * 100}%` }}></div>
        </div>
    </div>
);

export default Profile_Tab;