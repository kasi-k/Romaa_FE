import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import AddFollowUp from "./AddFollowUp";
import { MdCancel, MdArrowBackIosNew } from "react-icons/md";
import { IoMdSave } from "react-icons/io";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../../../../../constant";
import { TenderProcessProvider, TenderProcessEntry, TenderProcessLog } from "./TenderProcessStepper";
import { useTenderProcess } from "./TenderProcessContext";
import { PreliminaryProcessProvider, PreliminaryProcessEntry, PreliminaryProcessLog } from "./PreliminaryProcessStepper";
import { usePreliminaryProcess } from "./PreliminaryProcessContext";
import { preliminarySiteWorkTemplate, tenderProcessDataTemplate } from "./StepperConstants";
import Loader from "../../../../../components/Loader";
import { 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  Activity,
} from "lucide-react";

// Templates moved to StepperConstants.js

const TenderOverView = () => {
  const { tender_id } = useParams();
  const [addFollowup, setAddFollowup] = useState(false);

  const [customerDetails, setCustomerDetails] = useState([]);
  const [tenderDetailsState, setTenderDetailsState] = useState([]);
  const [tenderProcessState, setTenderProcessState] = useState([]);
  const [tenderPreliminary, setTenderPreliminary] = useState([]);

  const [isEditingTender, setIsEditingTender] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTenderOverview = async () => {
    try {
      const res = await axios.get(`${API}/tender/getoverview/${tender_id}`);
      const data = res.data.data;


      setCustomerDetails([
        { label: "Customer ID", value: data.customerDetails?.client_id },
        { label: "Customer Name", value: data.customerDetails?.client_name },
        { label: "PAN no", value: data.customerDetails?.pan_no },
        { label: "CIN no", value: data.customerDetails?.cin_no },
        { label: "GSTIN", value: data.customerDetails?.gstin },
        {label: "Contact Person", value: data.customerDetails?.contact_person},
        { label: "Phone Number", value: data.customerDetails?.contact_phone },
        { label: "Email ID", value: data.customerDetails?.contact_email },
        {
          label: "Address",
          value: `${data.customerDetails?.address?.city || ""}, ${data.customerDetails?.address?.state || ""
            }`,
        },
        {label: "Contact Person", value: data.customerDetails?.contact_persons?.map((person) => person.name + " - " + person.phone).join(", ")},
      ]);

      setTenderDetailsState([

        { label: "Project Name", value: data.tenderDetails?.tender_project_name },
        { label: "Tender Name", value: data.tenderDetails?.tender_name },
        { label: "Tender ID", value: data.tenderDetails?.tender_id },
        {
          label: "Tender Published Date",
          value: data.tenderDetails?.tender_published_date
            ? new Date(
              data.tenderDetails.tender_published_date
            ).toLocaleDateString("en-GB")
            : "",
        },
        {
          label: "Tender Process Type",
          value: data.tenderDetails?.tender_type,
        },
        {
          label: "Project Location",
          value: `${data.tenderDetails?.project_location?.city || ""}, ${data.tenderDetails?.project_location?.state || ""
            }`,
        },
        { label: "Contact Person", value: data.tenderDetails?.contact_person },
        { label: "Contact Number", value: data.tenderDetails?.contact_phone },
        { label: "Email ID", value: data.tenderDetails?.contact_email },
        {
          label: "Tender Value",
          value: data.tenderDetails?.tender_value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(data.tenderDetails?.tender_value) : "-",
        },
        {label:"Agreement Value",value:data.tenderDetails?.agreement_value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(data.tenderDetails?.agreement_value) : "-"}
      ]);

      setTenderProcessState(
        tenderProcessDataTemplate.map((item) => ({
          ...item,
          checked: !!data.tenderProcess?.[item.key],
          value: !!data.tenderProcess?.[item.key],
        }))
      );
    } catch (err) {
      console.error("Error fetching overview:", err);
    }
  };

  const fetchProcessData = async () => {
    try {
      const res = await axios.get(`${API}/tender/process/${tender_id}`);
      const savedData = Array.isArray(res.data?.processData) ? res.data.processData : [];

      const initialData = tenderProcessDataTemplate.map((step) => {
        const savedStep = savedData.find((d) => d.key === step.key) || {};
        return {
          ...step,
          notes: savedStep.notes || "",
          date: savedStep.date || "",
          time: savedStep.time || "",
          completed: savedStep.completed === true,
          file_name: savedStep.file_name || "",
          file_url: savedStep.file_url || "",
        };
      });

      setTenderProcessState(initialData);
    } catch (error) {
      console.error("Error fetching process data:", error);
    }
  };


  const fetchPreliminaryData = async () => {
    try {
      const res = await axios.get(`${API}/tender/preliminary/${tender_id}`);
      const savedData = Array.isArray(res.data?.processData) ? res.data.processData : [];

      const initialData = preliminarySiteWorkTemplate.map((step) => {
        const savedStep = savedData.find((d) => d.key === step.key);
        return {
          ...step,
          notes: savedStep?.notes || "",
          date: savedStep?.date || "",
          time: savedStep?.time || "",
          completed: savedStep?.completed === true,
          file_name: savedStep?.file_name || "",
          file_url: savedStep?.file_url || "",
        };
      });
      setTenderPreliminary(initialData);
    } catch (error) {
      console.error("Error fetching process data:", error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      if (tender_id) await fetchTenderOverview();
      await fetchProcessData();
      await fetchPreliminaryData();
      setLoading(false);
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tender_id]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Construct update object from tenderDetailsState array
      const updateData = {};
      tenderDetailsState.forEach(item => {
        if (item.label === "Tender Name") updateData.tender_name = item.value;
        if (item.label === "Tender ID") updateData.tender_id = item.value;
        if (item.label === "Tender Published Date") updateData.tender_published_date = item.value;
        if (item.label === "Tender Process Type") updateData.tender_type = item.value;
        if (item.label === "Contact Person") updateData.contact_person = item.value;
        if (item.label === "Contact Number") updateData.contact_phone = item.value;
        if (item.label === "Email ID") updateData.contact_email = item.value;
        if (item.label === "Tender Value") updateData.tender_value = item.value.replace(/[^0-9.-]+/g,"");
        if (item.label === "Agreement Value") updateData.agreement_value = item.value.replace(/[^0-9.-]+/g,"");
      });
      
      await axios.put(`${API}/tender/updateoverview/${tender_id}`, updateData);
      setIsEditingTender(false);
      fetchTenderOverview();
    } catch (err) {
      console.error("Error saving tender overview:", err);
      setIsEditingTender(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTenderChange = (idx, value) => {
    setTenderDetailsState((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, value } : item))
    );
  };

  const handleUploadSuccess = () => {
    fetchProcessData();
  };

  const handleUploadSuccessPreliminary = () => {
    fetchPreliminaryData();
  };

  const calculateProgress = () => {
    const totalSteps = tenderProcessDataTemplate.length + preliminarySiteWorkTemplate.length;
    const completedSteps = 
      tenderProcessState.filter(s => s.completed).length + 
      tenderPreliminary.filter(s => s.completed).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // ── Dynamic Combined Layout ─────────────────────────────────────────────────
  const CombinedStepperLayout = () => {
    const { allCompleted: p1Done } = useTenderProcess();
    const { allCompleted: p2Done } = usePreliminaryProcess();

    const label = (color, text) => (
      <p className={`text-[10px] font-black ${color} uppercase tracking-widest pl-1`}>{text}</p>
    );

    const p1Entry = (
      <div className="flex flex-col gap-2">
        {label("text-blue-500", "P1 · Tender Lifecycle")}
        <TenderProcessEntry />
      </div>
    );
    const p1Log = (
      <div className="flex flex-col gap-2">
        {label("text-blue-500", "P1 · Tender Lifecycle · Log")}
        <TenderProcessLog />
      </div>
    );
    const p2Entry = (
      <div className="flex flex-col gap-2">
        {label("text-emerald-500", "P2 · Preliminary Site Work")}
        <PreliminaryProcessEntry />
      </div>
    );
    const p2Log = (
      <div className="flex flex-col gap-2">
        {label("text-emerald-500", "P2 · Preliminary Site Work · Log")}
        <PreliminaryProcessLog />
      </div>
    );

    // Both active: [P1 Entry | P2 Entry] / [P1 Log | P2 Log]
    if (!p1Done && !p2Done) return (
      <div className="flex flex-col gap-5">
        <div className="grid lg:grid-cols-2 gap-5 items-start">{p1Entry}{p2Entry}</div>
        <div className="grid lg:grid-cols-2 gap-5 items-start">{p1Log}{p2Log}</div>
      </div>
    );

    // P1 done — P2 active: [P2 Entry | P2 Log] / [P1 Log full-width]
    if (p1Done && !p2Done) return (
      <div className="flex flex-col gap-5">
        <div className="grid lg:grid-cols-2 gap-5 items-start">{p2Entry}{p2Log}</div>
        {p1Log}
      </div>
    );

    // P2 done — P1 active: [P1 Entry | P1 Log] / [P2 Log full-width]
    if (!p1Done && p2Done) return (
      <div className="flex flex-col gap-5">
        <div className="grid lg:grid-cols-2 gap-5 items-start">{p1Entry}{p1Log}</div>
        {p2Log}
      </div>
    );

    // Both done: [P1 Log | P2 Log]
    return (
      <div className="grid lg:grid-cols-2 gap-5 items-start">{p1Log}{p2Log}</div>
    );
  };

  if (loading) return <Loader />;

  const progress = calculateProgress();
  const projectName = tenderDetailsState.find(i => i.label === "Project Name")?.value || "Project Overview";
  const tenderId = tenderDetailsState.find(i => i.label === "Tender ID")?.value || "-";

  return (
    <div className="flex flex-col gap-5 max-w-[1550px] mx-auto pb-10">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none">
          <Activity size={180} />
        </div>
        
        <div className="relative  flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                Active Project
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                ID: {tenderId}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight italic decoration-blue-500/30">
              {projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 text-sm italic">
              <span className="flex items-center gap-1.5 font-bold tracking-tight uppercase text-[11px]">
                <MapPin size={16} className="text-blue-500" />
                {tenderDetailsState.find(i => i.label === "Project Location")?.value || "Location TBD"}
              </span>
              <span className="flex items-center gap-1.5 font-bold tracking-tight uppercase text-[11px]">
                <Calendar size={16} className="text-blue-500" />
                Published: {tenderDetailsState.find(i => i.label === "Tender Published Date")?.value || "N/A"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 min-w-[280px] bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Progress Overview</span>
              <span className="text-2xl font-black text-blue-600 italic leading-none">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-white dark:bg-slate-900 rounded-full overflow-hidden shadow-inner flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20"
              />
            </div>
          </div>
        </div>
      </div>

    <div className="grid grid-cols-12 gap-5 items-start">
        {/* Row 1: High Level Metadata (Parallel Columns) */}
        <div className="col-span-12 lg:col-span-6 h-full">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative group h-full">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
                  <FileText size={18} />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 italic tracking-tight leading-none">Financial Meta</h3>
              </div>
              <div className="flex items-center gap-2">
                {isEditingTender ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <IoMdSave size={14} /> Save
                    </button>
                    <button
                      onClick={() => { setIsEditingTender(false); fetchTenderOverview(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider transition-colors"
                    >
                      <MdCancel size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingTender(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
              {tenderDetailsState.map((item, idx) => (
                  <div key={idx} className="flex items-baseline justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded transition-colors group">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-8">{item.label}</p>
                     
                     {isEditingTender ? (
                       <input 
                         type="text"
                         value={item.value || ""}
                         onChange={(e) => handleTenderChange(idx, e.target.value)}
                         className="text-[12px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border-b border-blue-500/30 outline-none px-2 py-0.5 rounded-md w-full max-w-[240px] text-end italic transition-all focus:bg-white dark:focus:bg-slate-900 focus:shadow-sm"
                       />
                     ) : (
                       <p className={`text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-end ${item.label === "Email ID" ? "break-all" : ""}`}>
                          {item.value || "-"}
                       </p>
                     )}
                  </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 h-full">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
                <User size={18} />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 italic tracking-tight leading-none">Client Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
              {customerDetails.map((item, idx) => (
                  <div key={idx} className="flex items-baseline justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 px-2 rounded transition-colors">
                      <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest shrink-0 mr-8">{item.label}</p>
                      <p className={`text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-end ${item.label === "Email ID" ? "break-all" : ""}`}>
                         {item.value || "-"}
                      </p>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* P1 & P2 — Dynamic auto-aligning cards */}
        <div className="col-span-12">
          <TenderProcessProvider onUploadSuccess={handleUploadSuccess}>
            <PreliminaryProcessProvider onUploadSuccess={handleUploadSuccessPreliminary}>
              <CombinedStepperLayout />
            </PreliminaryProcessProvider>
          </TenderProcessProvider>
        </div>

      </div>

      {addFollowup && (
        <AddFollowUp
          onclose={() => setAddFollowup(false)}
          onSuccess={() => {
            fetchTenderOverview();
          }}
        />
      )}
    </div>
  );
};

export default TenderOverView;
