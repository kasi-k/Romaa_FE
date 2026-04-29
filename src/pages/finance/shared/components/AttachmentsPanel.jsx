import { useRef, useState } from "react";
import { Paperclip, Download, Trash2, Upload, FileText } from "lucide-react";
import {
  useAttachmentsForSource,
  useUploadAttachments,
  useAttachmentDownloadUrl,
  useDeleteAttachment,
} from "../hooks/useAttachments";

const CATEGORIES = [
  "Invoice",
  "Receipt",
  "Bank Statement",
  "Contract",
  "Approval",
  "Tax Document",
  "Delivery Challan",
  "Photo",
  "Other",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtSize = (b) => {
  if (!b && b !== 0) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Drop-in attachments panel for any voucher/bill/JE detail page.
 * Calls GET /finance/attachments/for-source + POST /finance/attachments/upload.
 */
const AttachmentsPanel = ({ sourceType, sourceRef, sourceNo, tenderId, readOnly }) => {
  const inputRef = useRef(null);
  const [category, setCategory] = useState("Invoice");

  const { data: files = [], isLoading } = useAttachmentsForSource({
    source_type: sourceType,
    source_ref: sourceRef,
    source_no: sourceNo,
  });

  const upload = useUploadAttachments();
  const download = useAttachmentDownloadUrl();
  const del = useDeleteAttachment();

  const pickFiles = () => inputRef.current?.click();

  const onFilesChosen = (e) => {
    const chosen = Array.from(e.target.files || []);
    if (!chosen.length) return;
    upload.mutate({
      files: chosen,
      source_type: sourceType,
      source_ref: sourceRef,
      source_no: sourceNo,
      tender_id: tenderId,
      category,
    });
    e.target.value = "";
  };

  const onDownload = async (id) => {
    const res = await download.mutateAsync({ id });
    if (res?.url) window.open(res.url, "_blank", "noopener,noreferrer");
  };

  if (!sourceType || (!sourceRef && !sourceNo)) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Paperclip size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Attachments
          </span>
          <span className="text-xs text-gray-400">({files.length})</span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={pickFiles}
              disabled={upload.isPending}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload size={12} />
              {upload.isPending ? "Uploading…" : "Upload"}
            </button>
            <input ref={inputRef} type="file" multiple hidden onChange={onFilesChosen} />
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {isLoading ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">Loading attachments…</div>
        ) : files.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">No attachments yet</div>
        ) : (
          files.map((f) => (
            <div
              key={f._id}
              className="flex items-center justify-between gap-3 px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText size={14} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-700 dark:text-gray-200 truncate">
                    {f.filename || f.file_name || "file"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {f.category || "—"} · {fmtSize(f.size_bytes ?? f.size)} · {fmtDate(f.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onDownload(f._id)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  title="Download"
                >
                  <Download size={13} />
                </button>
                {!readOnly && (
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this attachment?")) del.mutate({ id: f._id });
                    }}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttachmentsPanel;
