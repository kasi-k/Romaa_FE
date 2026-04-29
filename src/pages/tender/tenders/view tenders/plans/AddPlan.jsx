import { useState, useRef } from "react";
import {
  IoClose, IoCloudUploadOutline, IoTrashOutline, IoCheckmarkCircle,
} from "react-icons/io5";
import {
  TbFileTypePdf, TbFileTypeDoc, TbPhoto, TbFile,
} from "react-icons/tb";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../../context/AuthContext";
import { useUploadPlans } from "./usePlans";

const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf")               return { Icon: TbFileTypePdf, color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20" };
  if (["doc","docx"].includes(ext))return { Icon: TbFileTypeDoc, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" };
  if (["png","jpg","jpeg","svg","webp"].includes(ext))
                                   return { Icon: TbPhoto,       color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  return                                  { Icon: TbFile,        color: "text-slate-400",   bg: "bg-slate-50 dark:bg-slate-800" };
};

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const AddPlan = ({ onClose, onUploadSuccess }) => {
  const [files, setFiles]                 = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isDragging, setIsDragging]       = useState(false);
  const inputRef = useRef(null);
  const { tender_id } = useParams();
  const { user } = useAuth();
  const uploadMutation = useUploadPlans();

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
    // Only fire when leaving the dropzone itself (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!files.length || uploadMutation.isPending) return;

    uploadMutation.mutate(
      {
        tender_id,
        uploaded_by: user?.id,
        files,
        onUploadProgress: (ev) => {
          if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      },
      {
        onSuccess: () => {
          setUploadComplete(true);
          setTimeout(() => {
            if (onUploadSuccess) onUploadSuccess();
            if (onClose) onClose();
          }, 1400);
        },
      }
    );
  };

  const isBusy = uploadMutation.isPending || uploadComplete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/30 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

        {/* ── Upload animation overlay ───────────────────────────── */}
        {uploadMutation.isPending && (
          <div className="absolute inset-0 z-10 bg-white/97 dark:bg-slate-900/97 backdrop-blur-sm flex flex-col items-center justify-center gap-5 px-8 animate-in fade-in duration-300">

            {/* Wave keyframes */}
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

            {/* ── Wave-fill circle ── */}
            <div className="relative w-36 h-36">

              {/* Ripple rings behind the circle */}
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                  style={{ animation: `ripple 2.4s ease-out ${i * 0.8}s infinite` }}
                />
              ))}

              {/* Circle container */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden bg-sky-50 dark:bg-sky-950 border-4 border-sky-200 dark:border-sky-800 shadow-xl shadow-blue-400/20">

                {/* Water fill — rises from bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${uploadProgress}%`,
                    transition: "height 0.5s cubic-bezier(0.4,0,0.2,1)",
                    background: "linear-gradient(to top, #2563eb, #3b82f6)",
                  }}
                >
                  {/* Primary wave */}
                  <svg
                    className="absolute -top-4 left-0"
                    style={{ width: "200%", animation: "waveFlow 2s linear infinite" }}
                    viewBox="0 0 280 16"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0,8 C35,0 70,16 105,8 C140,0 175,16 210,8 C245,0 280,16 280,8 L280,16 L0,16 Z"
                      fill="#3b82f6"
                    />
                  </svg>
                  {/* Secondary wave (offset, lighter) */}
                  <svg
                    className="absolute -top-3 left-0 opacity-50"
                    style={{ width: "200%", animation: "waveFlow2 3s linear infinite" }}
                    viewBox="0 0 280 12"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0,6 C40,0 80,12 120,6 C160,0 200,12 240,6 C260,0 280,8 280,6 L280,12 L0,12 Z"
                      fill="#60a5fa"
                    />
                  </svg>
                </div>

                {/* Bubbles */}
                {uploadProgress > 10 && [
                  { left: "25%", size: 6, delay: "0s",    dur: "3s" },
                  { left: "55%", size: 4, delay: "0.8s",  dur: "2.4s" },
                  { left: "75%", size: 5, delay: "1.6s",  dur: "3.2s" },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="absolute bottom-1 rounded-full bg-white/30"
                    style={{
                      left: b.left,
                      width: b.size,
                      height: b.size,
                      animation: `waveFlow2 ${b.dur} ease-in ${b.delay} infinite`,
                    }}
                  />
                ))}

                {/* Percentage text */}
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

            {/* Status message */}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 transition-all duration-500">
                {uploadProgress < 20 && "Preparing your files…"}
                {uploadProgress >= 20 && uploadProgress < 50 && "Sending to server…"}
                {uploadProgress >= 50 && uploadProgress < 80 && "Almost there…"}
                {uploadProgress >= 80 && uploadProgress < 100 && "Finishing up…"}
                {uploadProgress >= 100 && "Done! ✓"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {files.length} {files.length === 1 ? "file" : "files"} uploading
              </p>
            </div>

            {/* File chips */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
              {files.map((f, i) => {
                const isDoneFile = uploadProgress >= ((i + 1) / files.length) * 100;
                const { Icon, color } = getFileIcon(f.name);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-500 ${
                      isDoneFile
                        ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                    }`}
                  >
                    <div className={`${isDoneFile ? "text-green-500" : color}`}>
                      {isDoneFile
                        ? <IoCheckmarkCircle size={12} />
                        : <Icon size={12} />
                      }
                    </div>
                    <span className="max-w-[72px] truncate">
                      {f.name.length > 11 ? f.name.slice(0, 9) + "…" : f.name}
                    </span>
                  </div>
                );
              })}
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
            <p className="text-sm text-slate-500 mt-2">Your files have been processed and added to the tender.</p>
          </div>
        )}

        {/* ── Header ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 transition-opacity duration-300 ${isBusy ? "opacity-0" : "opacity-100"}`}>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add Technical Plans</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag & drop or select files for tender ID:{" "}
              <span className="font-mono text-blue-600">{tender_id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-30"
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
            className={`group relative border-2 border-dashed rounded-xl py-10 px-4 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 scale-[1.01]"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
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
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${
                isDragging
                  ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 scale-110"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-500 group-hover:scale-110"
              }`}>
                <IoCloudUploadOutline size={30} className={isDragging ? "animate-bounce" : ""} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, DOC, PNG or JPG (max. 10 MB)</p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-5 space-y-2 max-h-44 overflow-y-auto pr-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Selected ({files.length})
              </p>
              {files.map((file, idx) => {
                const { Icon, color, bg } = getFileIcon(file.name);
                return (
                  <div
                    key={idx}
                    className="group/row flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 animate-in slide-in-from-left-2 hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-8 h-8 ${bg} ${color} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400">{formatSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover/row:opacity-100 active:scale-90 shrink-0"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-7">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={files.length === 0}
              className="flex-2 px-4 py-2.5 bg-darkest-blue text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Confirm & Upload {files.length > 0 && `(${files.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlan;
