import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoArrowBackOutline,
  IoMailOutline,
  IoCallOutline,
  IoShieldCheckmarkOutline,
  IoCopyOutline,
  IoGlobeOutline,
  IoFingerPrintOutline,
} from "react-icons/io5";
import EditClients from "./EditClients";

const ViewClients = () => {
  const [editModal, setEditModal] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const client = state?.item || {};

  const getNested = (path) =>
    path.split(".").reduce((o, i) => o?.[i], client) || "Not Provided";

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-3">
      {Icon && <Icon className="text-indigo-500" size={16} />}
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
        {title}
      </h2>
    </div>
  );

  const DataField = ({ label, value, copyable = false }) => (
    <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors group">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
        {label}
      </span>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-900 dark:text-zinc-100 break-all">
          {value || "—"}
        </span>
        {copyable && value && (
          <button 
            onClick={() => navigator.clipboard.writeText(value)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-indigo-500 text-slate-400 transition-all"
          >
            <IoCopyOutline size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className=" bg-white dark:bg-zinc-950 font-inter">
      {/* 1. Global Header */}
      <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <IoArrowBackOutline size={20} />
          </button>
          <div className="h-8 w-1 bg-slate-200 dark:bg-zinc-800 hidden sm:block"></div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                Client ID
              </span>
              <span className="text-[10px] font-bold text-slate-400">/</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Profiles
              </span>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {client.client_id || "REF-0000"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
     
          <button
            onClick={() => setEditModal(true)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-md shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          >
            Edit Profile
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {/* 2. Left Side: Summary Card */}
        <aside className="w-full lg:w-[380px] p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950">
          <div className="lg:sticky lg:top-24">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                {client.client_name?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-zinc-900 rounded-full border-4 border-slate-50 dark:border-zinc-950 flex items-center justify-center text-green-500">
                <IoShieldCheckmarkOutline size={16} />
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
              {client.client_name}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-1 rounded-sm uppercase tracking-tighter">
                Premium Account
              </span>
              <span className="text-[9px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2 py-1 rounded-sm uppercase tracking-tighter">
                B2B Entity
              </span>
            </div>

            <div className="space-y-1 bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-3 p-2">
                <IoMailOutline className="text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                  <span className="text-xs font-semibold truncate max-w-[200px]">{client.contact_email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <IoCallOutline className="text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Line</span>
                  <span className="text-xs font-semibold">{client.contact_phone}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. Right Side: Technical Specs & Grid */}
        <main className="flex-1 p-6 lg:p-12">
          <div className="grid grid-cols-1 gap-12">
            
            {/* Statutory Grid */}
            <section>
              <SectionHeader title="Taxation & Compliance" icon={IoFingerPrintOutline} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataField label="GST Registration" value={client.gstin} copyable />
                <DataField label="PAN Number" value={client.pan_no} copyable />
                <DataField label="Corporate ID (CIN)" value={client.cin_no} />
              </div>
            </section>

            {/* Address Grid */}
            <section>
              <SectionHeader title="Registered Address" icon={IoGlobeOutline} />
              <div className="bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <DataField label="Full Locality / Street" value={getNested("address.city")} />
                  </div>
                  <DataField label="State / Province" value={getNested("address.state")} />
                  <DataField label="Postal Code" value={getNested("address.pincode")} />
                  <DataField label="Region / Country" value={getNested("address.country")} />
                </div>
              </div>
            </section>

      

          </div>
        </main>
      </div>

      {editModal && (
        <EditClients onclose={() => setEditModal(false)} item={client} />
      )}
    </div>
  );
};

export default ViewClients;