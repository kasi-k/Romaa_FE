import { useState, useRef } from "react";
import { Paperclip, Upload, Download, Trash2, RotateCcw, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { toast } from "react-toastify";

const fmt = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const useAttachments = (source_type, source_ref) =>
  useQuery({
    queryKey: ["attachments", source_type, source_ref],
    queryFn: async () => {
      const { data } = await api.get("/finance/attachments/for-source", { params: { source_type, source_ref } });
      return data?.data || [];
    },
    enabled: !!source_type && !!source_ref,
    staleTime: 30_000,
  });

const useUploadAttachment = (source_type, source_ref) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.post("/finance/attachments/upload-one", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("File uploaded");
      qc.invalidateQueries({ queryKey: ["attachments", source_type, source_ref] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Upload failed"),
  });
};

const useSoftDeleteAttachment = (source_type, source_ref) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/finance/attachments/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Attachment removed");
      qc.invalidateQueries({ queryKey: ["attachments", source_type, source_ref] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });
};

const useRestoreAttachment = (source_type, source_ref) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/finance/attachments/${id}/restore`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Attachment restored");
      qc.invalidateQueries({ queryKey: ["attachments", source_type, source_ref] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Restore failed"),
  });
};

const MIME_ICONS = {
  "application/pdf": "📄",
  "image/png": "🖼️",
  "image/jpeg": "🖼️",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "application/vnd.ms-excel": "📊",
};

const getIcon = (mime) => MIME_ICONS[mime] || "📎";

/**
 * AttachmentsPanel — drop into any finance document detail page.
 * Props:
 *   source_type: "PurchaseBill" | "PaymentVoucher" | "JournalEntry" | ...
 *   source_ref:  MongoDB ObjectId string
 *   source_no:   human-readable doc number (for upload metadata)
 *   tender_id:   optional tender_id
 *   compact:     if true, renders in a smaller card style
 */
const AttachmentsPanel = ({ source_type, source_ref, source_no = "", tender_id = "", compact = false }) => {
  const fileRef = useRef(null);
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");

  const { data: attachments = [], isLoading } = useAttachments(source_type, source_ref);
  const { mutate: upload, isPending: uploading } = useUploadAttachment(source_type, source_ref);
  const { mutate: softDelete } = useSoftDeleteAttachment(source_type, source_ref);
  const { mutate: restore } = useRestoreAttachment(source_type, source_ref);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast.error("File too large (max 25 MB)"); return; }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("source_type", source_type);
    fd.append("source_ref", source_ref);
    fd.append("source_no", source_no);
    fd.append("tender_id", tender_id);
    fd.append("category", category);
    fd.append("description", description);
    upload(fd);
    e.target.value = "";
  };

  const handleDownload = async (id, filename) => {
    try {
      const { data } = await api.get(`/finance/attachments/${id}/download`);
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Download failed");
    }
  };

  const active = attachments.filter((a) => !a.deleted_at);
  const deleted = attachments.filter((a) => a.deleted_at);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${compact ? "p-3" : "p-5"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip size={14} className="text-gray-400" />
          <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-700 dark:text-gray-200`}>
            Attachments {active.length > 0 && <span className="text-gray-400 font-normal">({active.length})</span>}
          </p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors">
          <Upload size={12} />{uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {/* Upload meta fields */}
      <div className="flex gap-2 mb-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
          {["general", "invoice", "po", "bank", "tax", "approval", "other"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
      </div>

      <input ref={fileRef} type="file" className="hidden" accept=".pdf,.xls,.xlsx,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileChange} />

      {isLoading && <p className="text-xs text-gray-400 py-2">Loading…</p>}

      {!isLoading && active.length === 0 && (
        <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          No attachments yet — click Upload to add files.
        </p>
      )}

      {active.length > 0 && (
        <div className="space-y-1.5">
          {active.map((a) => (
            <div key={a._id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
              <span className="text-base shrink-0">{getIcon(a.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{a.original_name || a.filename}</p>
                <p className="text-[10px] text-gray-400">{a.category} · {fmt(a.created_at)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDownload(a._id, a.original_name)} title="Download"
                  className="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500"><Download size={12} /></button>
                <button onClick={() => softDelete(a._id)} title="Remove"
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleted.length > 0 && (
        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Removed ({deleted.length})</p>
          {deleted.map((a) => (
            <div key={a._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg opacity-50">
              <span className="text-base shrink-0 grayscale">{getIcon(a.mime_type)}</span>
              <p className="flex-1 text-xs text-gray-500 truncate line-through">{a.original_name}</p>
              <button onClick={() => restore(a._id)} title="Restore" className="p-1 rounded hover:bg-gray-100 text-gray-400"><RotateCcw size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsPanel;
