import axios from "axios";
import React, { useState, useRef } from "react";
import {
  IoClose, IoCloudUploadOutline, IoTrashOutline, IoCheckmarkCircle,
} from "react-icons/io5";
import {
  TbFileTypePdf, TbFileTypeDoc, TbPhoto, TbFile, TbFileSpreadsheet,
} from "react-icons/tb";
import { useParams } from "react-router-dom";
import { API } from "../../../../../../constant";
import { toast } from "react-toastify";
import SampleRAExcel from "./RANEW.xlsx";

const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf")               return { Icon: TbFileTypePdf, color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20" };
  if (["doc","docx"].includes(ext))return { Icon: TbFileTypeDoc, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" };
  if (["xlsx","xls","csv"].includes(ext))
                                   return { Icon: TbFileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  if (["png","jpg","jpeg","svg","webp"].includes(ext))
                                   return { Icon: TbPhoto,       color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  return                                  { Icon: TbFile,        color: "text-slate-400",   bg: "bg-slate-50 dark:bg-slate-800" };
};

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const UploadRateAnalysis = ({ onclose, onSuccess }) => {
  const [files, setFiles]                 = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [isDragging, setIsDragging]       = useState(false);
  const inputRef = useRef(null);
  const { tender_id } = useParams();

  const handleFiles = (selectedFiles) => {
    const incoming = Array.from(selectedFiles);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !existingNames.has(f.name))];
    });
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.info("Please select at least one file to upload.");
      return;
    }

    try {
      setSaving(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("tender_id", tender_id);
      formData.append("created_by_user", "user_id_here");

      if (files.length === 1) {
        formData.append("file", files[0]);
        const res = await axios.post(`${API}/rateanalysis/uploadcsv`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        if (res.data.status) {
          setUploadComplete(true);
          if (onSuccess) onSuccess();
          setTimeout(() => {
            if (onclose) onclose();
            toast.success("Rate Analysis uploaded successfully");
          }, 1500);
        } else {
          toast.error(res.data.message || "Failed to upload files");
        }
      } else {
        toast.info("Please upload only one file at a time.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload files");
    } finally {
      setSaving(false);
    }
  };

  const downloadSampleFile = () => {
    const link = document.createElement("a");
    link.href = SampleRAExcel;
    link.setAttribute("download", "RANEW.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isBusy = saving || uploadComplete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/30 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-gray-100 dark:border-slate-800">
        
        {/* ── Upload animation overlay ───────────────────────────── */}
        {saving && (
          <div className="absolute inset-0 z-10 bg-white/97 dark:bg-slate-900/97 backdrop-blur-sm flex flex-col items-center justify-center gap-5 px-8 animate-in fade-in duration-300">

            <style>{`
              @keyframes waveFlow {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes waveFlow2 {
                0%   { transform: translateX(-50%); }
                100% { transform: translateX(0); }
              }
              @keyframes ripple {
                0%   { transform: scale(1);   opacity: 0.6; }
                100% { transform: scale(1.9); opacity: 0; }
              }
            `}</style>

            <div className="relative w-36 h-36">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                  style={{ animation: `ripple 2.4s ease-out ${i * 0.8}s infinite` }}
                />
              ))}
              <div className="relative w-36 h-36 rounded-full overflow-hidden bg-sky-50 dark:bg-sky-950 border-4 border-sky-200 dark:border-sky-800 shadow-xl shadow-blue-400/20">
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${uploadProgress}%`,
                    transition: "height 0.5s cubic-bezier(0.4,0,0.2,1)",
                    background: "linear-gradient(to top, #2563eb, #3b82f6)",
                  }}
                >
                  <svg
                    className="absolute -top-4 left-0"
                    style={{ width: "200%", animation: "waveFlow 2s linear infinite" }}
                    viewBox="0 0 280 16"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0,8 C35,0 70,16 105,8 C140,0 175,16 210,8 C245,0 280,16 280,8 L280,16 L0,16 Z" fill="#3b82f6" />
                  </svg>
                  <svg
                    className="absolute -top-3 left-0 opacity-50"
                    style={{ width: "200%", animation: "waveFlow2 3s linear infinite" }}
                    viewBox="0 0 280 12"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0,6 C40,0 80,12 120,6 C160,0 200,12 240,6 C260,0 280,8 280,6 L280,12 L0,12 Z" fill="#60a5fa" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-3xl font-black tabular-nums transition-colors duration-500 drop-shadow"
                    style={{ color: uploadProgress > 55 ? "#fff" : "#1e40af" }}
                  >
                    {uploadProgress}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {uploadProgress < 20 && "Preparing your files…"}
                {uploadProgress >= 20 && uploadProgress < 50 && "Uploading Rate Analysis…"}
                {uploadProgress >= 50 && uploadProgress < 80 && "Almost there…"}
                {uploadProgress >= 80 && uploadProgress < 100 && "Finishing up…"}
                {uploadProgress >= 100 && "Done! ✓"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {files.length} {files.length === 1 ? "file" : "files"} uploading
              </p>
            </div>
          </div>
        )}

        {/* ── Success overlay ────────────────────────────────────── */}
        {uploadComplete && (
          <div className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 text-green-500 mb-6 animate-in zoom-in duration-500">
              <IoCheckmarkCircle size="100%" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Upload Successful!</h3>
            <p className="text-sm text-slate-500 mt-2">Rate Analysis data has been uploaded to the tender.</p>
          </div>
        )}

        {/* ── Header ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-50 dark:border-slate-800 transition-opacity duration-300 ${isBusy ? "opacity-0" : "opacity-100"}`}>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Upload Rate Analysis</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
              For Tender: {tender_id}
            </p>
          </div>
          <button
            onClick={onclose}
            disabled={isBusy}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors disabled:opacity-30"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* ── Form ──────────────────────────────────────────────── */}
        <form
          onSubmit={onSubmit}
          className={`p-6 transition-all duration-300 ${isBusy ? "opacity-10 dark:opacity-20 pointer-events-none blur-[2px]" : "opacity-100"}`}
        >
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current.click()}
            className={`group relative border-2 border-dashed rounded-2xl py-12 px-4 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 scale-[1.01]"
                : "border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
            }`}
          >
            <input
              type="file"
              multiple
              ref={inputRef}
              onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 ${
                isDragging
                  ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 scale-110"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110"
              }`}>
                <IoCloudUploadOutline size={32} className={isDragging ? "animate-bounce" : ""} />
              </div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                {isDragging ? "Drop files here" : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Excel (.xlsx) files are supported</p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Selected Files ({files.length})
              </p>
              {files.map((file, idx) => {
                const { Icon, color, bg } = getFileIcon(file.name);
                return (
                  <div
                    key={idx}
                    className="group/row flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700 animate-in slide-in-from-left-2 shadow-sm hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-2 ${bg} ${color} rounded-lg`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover/row:opacity-100 active:scale-90"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <button
              type="button"
              onClick={downloadSampleFile}
              className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Sample File
            </button>
            <button
              type="submit"
              disabled={files.length === 0}
              className="px-4 py-3 bg-darkest-blue text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Upload {files.length > 0 && `(${files.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadRateAnalysis;
