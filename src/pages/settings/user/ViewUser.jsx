import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiMapPin, FiShield, FiActivity, FiPhone, FiMail,
  FiCalendar, FiCheckCircle, FiLayers, FiCornerDownRight,
  FiUser, FiGlobe, FiBriefcase, FiHash, FiClock, FiExternalLink,
  FiEye, FiPlus, FiEdit2, FiTrash2 
} from "react-icons/fi";
import AssignSitesModal from "./AssignSiteModal";
import { useAssignSitesToUser, useUserData } from "./hooks/useUsers";
import Loader from "../../../components/Loader";

const ViewUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const targetId = location.state?.item?.employeeId;
  const [showSiteModal, setShowSiteModal] = useState(false);

  // --- Data Layer ---
  const { data: user, isLoading, isError } = useUserData(targetId);
  const { mutateAsync: assignSites } = useAssignSitesToUser(targetId);

  // --- Formatting Helpers ---
  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }) : "—";

  const hasActivePermissions = (data) => {
    if (!data) return false;
    if (data.read || data.create || data.edit || data.delete) return true;
    return Object.values(data).some(val => typeof val === "object" && hasActivePermissions(val));
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader /></div>;
  if (isError || !user || !targetId) return <ErrorState message={!targetId ? "Null Reference" : "Data Sync Error"} />;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F1F5F9] dark:bg-[#0b0f19] font-sans">
      
      {/* ── FIXED ERP CONTROL HEADER ── */}
      <header className="flex-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800 z-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 transition-all text-slate-400 hover:text-indigo-600 shadow-sm shrink-0"
            >
              <FiArrowLeft size={20} />
            </button>

            <div className="h-10 sm:h-12 w-0.5 bg-slate-200 dark:bg-gray-700 mx-1 sm:mx-2 shrink-0 hidden sm:block" />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                  Employee <span className="text-indigo-600">Dossier</span>
                </h1>
                <StatusBadge status={user.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  <FiHash className="text-indigo-500" /> {user.employeeId}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  <FiShield className="text-indigo-500" /> {user.role?.roleName || "UNASSIGNED"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setShowSiteModal(true)}
              className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <FiMapPin size={14} className="sm:hidden" />
              <FiMapPin size={16} className="hidden sm:inline" />
              <span className="hidden sm:inline">Update Site Assignments</span>
              <span className="sm:hidden">Sites</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── SCROLLABLE DOSSIER BODY ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-8 pb-10 sm:pb-20">
          
          {/* TOP SECTION: PROFILE & ASSIGNMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">

            {/* 1. Core Identity Panel */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-10 items-start">
                <div className="relative group mx-auto md:mx-0">
                    <div className="h-24 w-24 sm:h-36 sm:w-36 rounded-3xl sm:rounded-[40px] bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-3xl sm:text-5xl font-black text-white shadow-2xl border-4 sm:border-8 border-slate-50 dark:border-gray-800">
                    {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-emerald-500 border-2 sm:border-4 border-white dark:border-gray-900 w-5 h-5 sm:w-8 sm:h-8 rounded-full shadow-lg" />
                </div>

                <div className="flex-1 space-y-4 sm:space-y-8 w-full min-w-0">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter break-words">
                      {user.name}
                    </h2>
                    <p className="text-indigo-500 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 italic">
                      {user.designation || "General Staff"} • {user.userType}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-6 sm:gap-x-12">
                    <DetailItem icon={<FiMail />} label="Corporate Email" value={user.email} isLink prefix="mailto:" />
                    <DetailItem icon={<FiPhone />} label="Primary Phone" value={user.phone} isLink prefix="tel:" />
                    <DetailItem icon={<FiCalendar />} label="Joining Date" value={formatDate(user.dateOfJoining)} />
                    <DetailItem icon={<FiClock />} label="System Access" value={user.accessMode || "Standard"} />
                  </div>
                </div>
              </div>

              {/* Residential Ribbon */}
              <div className="mt-auto bg-slate-50 dark:bg-gray-800/50 px-4 sm:px-10 py-3 sm:py-5 border-t border-slate-100 dark:border-gray-700 flex items-center gap-3 sm:gap-4">
                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm shrink-0">
                    <FiMapPin className="text-rose-500" size={16} />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-tight leading-relaxed break-words">
                  Registry Address: {user.address?.street}, {user.address?.city}, {user.address?.state} — {user.address?.pincode}
                </p>
              </div>
            </div>

            {/* 2. Site Assignments Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiGlobe className="text-indigo-500" /> Active Tenders
                </h3>
                <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-tighter">
                  {user.assignedProject?.length || 0} DEPLOYED
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto max-h-[460px] pr-2 custom-scrollbar">
                {Array.isArray(user.assignedProject) && user.assignedProject.length > 0 ? (
                  user.assignedProject.map((p, i) => (
                    <TenderCard key={p._id || i} project={p} />
                  ))
                ) : (
                  <EmptyAssignmentState />
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: COMPLIANCE & EMERGENCY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[28px] p-4 sm:p-8 border border-slate-200 dark:border-gray-800 flex items-center gap-4 sm:gap-6 shadow-sm">
              <div className="p-3 sm:p-5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl sm:rounded-3xl border border-amber-100 dark:border-amber-800 shrink-0">
                <FiShield className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Identity Document ({user.idProof?.type})</p>
                <p className="text-base sm:text-2xl font-mono font-black text-slate-900 dark:text-gray-100 tracking-wider break-all">
                  {user.idProof?.number || "NOT_LOGGED"}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[28px] p-4 sm:p-8 border-l-8 border-rose-500 border border-slate-200 dark:border-gray-800 flex items-center justify-between gap-3 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                <div className="p-3 sm:p-5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl sm:rounded-3xl shrink-0">
                  <FiActivity className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency POC</p>
                  <p className="text-base sm:text-xl font-black text-slate-900 dark:text-gray-100 uppercase italic tracking-tighter truncate">{user.emergencyContact?.name || "N/A"}</p>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1 truncate">{user.emergencyContact?.relationship || "Relation Unknown"}</p>
                </div>
              </div>
              {user.emergencyContact?.phone && (
                <a href={`tel:${user.emergencyContact.phone}`} className="p-3 sm:p-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-90 shrink-0">
                  <FiPhone size={18} />
                </a>
              )}
            </div>
          </div>

          {/* BOTTOM SECTION: PERMISSION INFRASTRUCTURE */}
          {user.role?.permissions && hasActivePermissions(user.role.permissions) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[40px] border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-4 sm:px-10 py-4 sm:py-8 border-b border-slate-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="h-3 w-3 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)] shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em]">Authorized Access Matrix</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 italic font-mono hidden sm:inline">ENCRYPTED_AUTH_DATA</span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-gray-800">
                {Object.entries(user.role.permissions)
                  .filter(([, data]) => hasActivePermissions(data))
                  .map(([moduleName, data]) => (
                    <PermissionModuleRow
                      key={moduleName}
                      name={moduleName}
                      data={data}
                      hasActivePermissions={hasActivePermissions}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SITE ASSIGNMENT MODAL */}
      {showSiteModal && (
        <AssignSitesModal
          initialSelected={getInitialSiteIds(user)}
          onClose={() => setShowSiteModal(false)}
          onSave={async (selectedIds) => {
            await assignSites(selectedIds);
            setShowSiteModal(false);
          }}
        />
      )}
    </div>
  );
};

/* ── REFINED SUB-COMPONENTS ── */

const TenderCard = ({ project }) => (
  <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-5 rounded-[22px] shadow-sm hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
    <div className="flex justify-between items-start">
      <div className="space-y-3">
        <div>
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Registry Name</span>
            <h4 className="text-[13px] font-black text-slate-800 dark:text-gray-100 leading-tight line-clamp-2" title={project.tender_project_name}>
            {project.tender_project_name || "Undefined Project"}
            </h4>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-slate-100 dark:border-gray-700">
                {project.tender_id}
            </span>
            <FiExternalLink className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={12} />
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-gray-800 p-3 rounded-2xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
        <FiGlobe size={18} />
      </div>
    </div>
  </div>
);

const DetailItem = ({ icon, label, value, isLink, prefix }) => (
  <div className="flex flex-col gap-1.5">
    <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <span className="text-indigo-500/60">{icon}</span> {label}
    </dt>
    <dd className="text-[14px] font-bold text-slate-800 dark:text-gray-200 truncate">
      {isLink && value ? (
        <a href={`${prefix}${value}`} className="hover:text-indigo-600 underline decoration-indigo-200/50 decoration-2 underline-offset-4">{value}</a>
      ) : (
        value || "NOT_SET"
      )}
    </dd>
  </div>
);

const PermissionModuleRow = ({ name, data, hasActivePermissions }) => {
  const isDirect = Object.hasOwn(data, "read") || Object.hasOwn(data, "create");
  
  return (
    <div className="px-4 sm:px-10 py-4 sm:py-8 group hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 shrink-0">
            <FiBriefcase size={16} />
        </div>
        <span className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-wider sm:tracking-widest break-words">
          {name.replace(/_/g, " ")} Module
        </span>
      </div>

      {isDirect ? (
        <div className="flex flex-wrap gap-3 pl-0 sm:pl-12">
          <ActionTags actions={data} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pl-0 sm:pl-12">
          {Object.entries(data)
            .filter(([, actions]) => hasActivePermissions(actions))
            .map(([subName, actions]) => (
              <div key={subName} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <FiCornerDownRight className="text-indigo-500" /> {subName.replace(/_/g, " ")}
                </p>
                <ActionTags actions={actions} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const ActionTags = ({ actions }) => (
  <div className="flex flex-wrap gap-2">
    {actions.read && <PermissionPill label="Read" color="blue" icon={<FiEye />} />}
    {actions.create && <PermissionPill label="Write" color="emerald" icon={<FiPlus />} />}
    {actions.edit && <PermissionPill label="Modify" color="amber" icon={<FiEdit2 />} />}
    {actions.delete && <PermissionPill label="Purge" color="rose" icon={<FiTrash2 />} />}
  </div>
);

const PermissionPill = ({ label, color, icon }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border shadow-sm ${themes[color]}`}>
      {icon} {label}
    </span>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
    status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
  }`}>
    {status || "Archived"}
  </span>
);

const EmptyAssignmentState = () => (
  <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-[32px] bg-slate-50/50">
    <FiGlobe size={32} className="mx-auto text-slate-200 mb-3" />
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Site Logs</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center p-12 bg-white rounded-[40px] shadow-2xl border border-red-50 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiShield size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Sync Denied</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8">{message}</p>
      <button onClick={() => window.history.back()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Back to Terminal</button>
    </div>
  </div>
);

const getInitialSiteIds = (user) => {
  if (!user?.assignedProject) return [];
  return user.assignedProject.map(p => typeof p === "object" ? p._id : p);
};

export default ViewUser;