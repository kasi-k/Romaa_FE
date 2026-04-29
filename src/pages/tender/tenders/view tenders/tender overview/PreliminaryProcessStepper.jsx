import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "react-router-dom";
import { API } from "../../../../../constant";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Upload, AlertCircle, CheckCircle2, Clock, Download, X, Image, FileSpreadsheet, FileText, File } from "lucide-react";
import { PreliminaryProcessContext, usePreliminaryProcess } from "./PreliminaryProcessContext.js";
import { preliminarySiteWorkTemplate, getPreliminaryStepSchema } from "./StepperConstants.js";

// ── Provider Component ─────────────────────────────────────────────────────────
export const PreliminaryProcessProvider = ({ onUploadSuccess, children }) => {
  const { tender_id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processData, setProcessData] = useState([]);
  const [file, setFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(getPreliminaryStepSchema()),
    mode: "onBlur",
  });

  useEffect(() => {
    const fetchSavedProgress = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/tender/preliminary/${tender_id}`);
        const savedData = res.data?.processData || [];
        const initialData = preliminarySiteWorkTemplate.map((step) => {
          const saved = savedData.find((d) => d.key === step.key);
          return {
            ...step,
            notes: saved?.notes || "",
            completed: saved?.completed === true,
            file_name: saved?.file_name || "",
            file_url: saved?.file_url || "",
          };
        });
        const firstUncompleted = initialData.findIndex((s) => !s.completed);
        const startStep = firstUncompleted === -1 ? initialData.length - 1 : firstUncompleted;
        setProcessData(initialData);
        setCurrentStep(startStep);
        reset({ notes: initialData[startStep]?.notes || "" });
      } catch (err) {
        console.error("Error fetching preliminary progress:", err);
      } finally {
        setLoading(false);
      }
    };
    if (tender_id) fetchSavedProgress();
  }, [tender_id, reset]);

  useEffect(() => {
    if (processData.length > 0) {
      reset({ notes: processData[currentStep]?.notes || "" });
      setFile(null);
    }
  }, [currentStep, processData, reset]);

  const onNext = async (data) => {
    const step = processData[currentStep];
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tender_id", tender_id);
      formData.append("step_key", step.key);
      formData.append("notes", data.notes);
      if (file) formData.append("file", file);
      await axios.post(`${API}/tender/preliminaryaws/step`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const refreshed = await axios.get(`${API}/tender/preliminary/${tender_id}`);
      const savedData = refreshed.data?.processData || [];
      const updatedData = preliminarySiteWorkTemplate.map((tmpl) => {
        const saved = savedData.find((d) => d.key === tmpl.key);
        return {
          ...tmpl,
          notes: saved?.notes || "",
          completed: saved?.completed === true,
          file_name: saved?.file_name || "",
          file_url: saved?.file_url || "",
        };
      });
      setProcessData(updatedData);
      if (onUploadSuccess) onUploadSuccess();
      if (currentStep < updatedData.length - 1) setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error("Error saving preliminary step:", err);
    } finally {
      setLoading(false);
    }
  };

  const allCompleted = processData.every((s) => s.completed);
  const completedSteps = processData.filter((s) => s.completed);
  const step = processData[currentStep];

  return (
    <PreliminaryProcessContext.Provider value={{
      currentStep, loading, processData, file, setFile,
      allCompleted, completedSteps, step,
      register, handleSubmit, errors, isSubmitting, onNext,
    }}>
      {children}
    </PreliminaryProcessContext.Provider>
  );
};

// ── File helpers ───────────────────────────────────────────────────────────────
const getFileIcon = (fileName) => {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return Image;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return FileText;
  return File;
};

const getFileIconColor = (fileName) => {
  if (!fileName) return "text-slate-400 bg-slate-100 dark:bg-slate-800";
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "text-violet-600 bg-violet-50 dark:bg-violet-900/30";
  if (["xls", "xlsx", "csv"].includes(ext)) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30";
  if (["pdf"].includes(ext)) return "text-red-600 bg-red-50 dark:bg-red-900/30";
  if (["doc", "docx"].includes(ext)) return "text-blue-600 bg-blue-50 dark:bg-blue-900/30";
  return "text-slate-500 bg-slate-100 dark:bg-slate-800";
};

const handleFileDownload = async (url, fileName) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName || "attachment";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
};

const FileCard = ({ fileUrl, fileName }) => {
  const FileIcon = getFileIcon(fileName);
  const iconColors = getFileIconColor(fileName);
  const displayName = fileName || "Attachment";

  return (
    <div className="flex items-center gap-3 mt-1 ml-7 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-700 bg-emerald-50/40 dark:bg-slate-800/60">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColors}`}>
        <FileIcon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">{displayName}</p>
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          {displayName.split(".").pop()?.toUpperCase() || "FILE"} · Attachment
        </p>
      </div>
      <button
        type="button"
        title="Download file"
        onClick={() => handleFileDownload(fileUrl, displayName)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shrink-0"
      >
        <Download size={14} />
      </button>
    </div>
  );
};

// ── StepLogList ────────────────────────────────────────────────────────────────
const StepLogList = ({ rows, processData }) => (
  <div className="flex flex-col gap-2">
    {rows.map((s) => (
      <div key={s.key} className="rounded-xl border border-emerald-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 flex flex-col gap-2 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 leading-none">
              {processData.indexOf(s) + 1}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{s.label}</span>
            </div>
          </div>
        </div>
        {s.notes && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-7 border-l-2 border-emerald-200 dark:border-emerald-800 ml-0.5">{s.notes}</p>
        )}
        {s.file_url && (
          <FileCard fileUrl={s.file_url} fileName={s.file_name} />
        )}
      </div>
    ))}
  </div>
);

// ── Entry Form Sub-Component ───────────────────────────────────────────────────
export const PreliminaryProcessEntry = () => {
  const { allCompleted, loading, processData, currentStep, step, file, setFile, register, handleSubmit, errors, isSubmitting, onNext } = usePreliminaryProcess();

  if (loading && processData.length === 0)
    return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />;

  return (
    <AnimatePresence>
      {!allCompleted && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16, transition: { duration: 0.25 } }}
          transition={{ duration: 0.3 }}
          className="  bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step Entry</span>
            <span className="text-[10px] font-black text-emerald-600 tabular-nums">{currentStep + 1} / {processData.length}</span>
          </div>
          <div className="p-5 flex flex-col gap-5">
            {/* Step bubbles */}
            <div className="flex gap-3 overflow-hidden relative">
              {processData.slice(currentStep, currentStep + 4).map((s, idx) => {
                const absoluteIndex = currentStep + idx;
                const isCurrent = absoluteIndex === currentStep;
                return (
                  <div key={s.key} className="flex flex-col items-center flex-1">
                    <div className="relative flex items-center justify-center w-full my-2">
                      {idx !== 0 && <div className="absolute left-0 right-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full -z-10 bg-slate-200 dark:bg-slate-700" />}
                      {idx !== 3 && absoluteIndex < processData.length - 1 && <div className="absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-0.5 w-full -z-10 bg-slate-200 dark:bg-slate-700" />}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm text-sm font-bold ${isCurrent ? "bg-emerald-600 text-white ring-4 ring-emerald-500/20 scale-110" : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"}`}>
                        {absoluteIndex + 1}
                      </div>
                    </div>
                    <p className={`text-[9px] font-bold text-center uppercase tracking-tight ${isCurrent ? "text-emerald-600" : "text-slate-400"}`}>{s.label}</p>
                  </div>
                );
              })}
            </div>
            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form key={step?.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} onSubmit={handleSubmit(onNext)} className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <span className="text-base font-black text-emerald-600">{currentStep + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{step?.label}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Step {currentStep + 1} of {processData.length}</p>
                  </div>
                </div>

                <FormTextArea label="Observations & Notes" name="notes" register={register} error={errors.notes} placeholder="Enter site observations..." />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Site Documents / Photos</label>
                  {file ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-900/10">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getFileIconColor(file.name)}`}>
                        {React.createElement(getFileIcon(file.name), { size: 16 })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB · {file.name.split(".").pop()?.toUpperCase()}</p>
                      </div>
                      <button type="button" onClick={() => setFile(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="group relative">
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="p-3.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 flex items-center gap-3 transition-all cursor-pointer">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                          <Upload size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">Click to attach file</p>
                          <p className="text-[10px] text-slate-400">PDF, DOC, XLS, JPG · max 10 MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <motion.button whileHover={!(loading || isSubmitting) ? { scale: 1.02 } : {}} whileTap={!(loading || isSubmitting) ? { scale: 0.98 } : {}}
                    type="submit" disabled={loading || isSubmitting}
                    className="group min-w-[140px] px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all shadow shadow-emerald-500/30 flex items-center justify-center gap-2">
                    {loading || isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                        <span>{file ? "Uploading..." : "Submitting..."}</span>
                      </>
                    ) : (
                      <>
                        {currentStep < processData.length - 1 ? "Next Step" : "Complete Work"}
                        <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Log Sub-Component ──────────────────────────────────────────────────────────
export const PreliminaryProcessLog = () => {
  const { allCompleted, completedSteps, processData, loading } = usePreliminaryProcess();

  if (loading && processData.length === 0)
    return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Site Work Log</span>
        {allCompleted ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow shadow-emerald-500/30">
            <Check size={9} strokeWidth={3} /> Completed
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow shadow-emerald-500/20">
            {completedSteps.length} / {processData.length}
          </span>
        )}
      </div>
      <div className="p-5">
        {completedSteps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-300 dark:text-slate-600">
            <Clock size={36} strokeWidth={1.5} />
            <p className="text-[11px] font-black uppercase tracking-widest">Awaiting first step</p>
          </div>
        ) : (
          <StepLogList rows={allCompleted ? processData : completedSteps} processData={processData} />
        )}
      </div>
    </div>
  );
};

// ── Form Helpers ───────────────────────────────────────────────────────────────
const FormTextArea = ({ label, name, register, error, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <textarea {...register(name)} rows={4} placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm resize-none ${error ? "border-red-500 bg-red-50/50" : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"}`} />
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold flex items-center gap-1">
        <AlertCircle size={10} />{error.message}
      </motion.p>
    )}
  </div>
);

// ── Default Export (backward compat) ───────────────────────────────────────────
const PreliminaryProcessStepper = ({ onUploadSuccess }) => (
  <PreliminaryProcessProvider onUploadSuccess={onUploadSuccess}>
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <PreliminaryProcessEntry />
      <PreliminaryProcessLog />
    </div>
  </PreliminaryProcessProvider>
);

export default PreliminaryProcessStepper;
