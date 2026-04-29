import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import AttachmentsPanel from "./AttachmentsPanel";
import { useAttachmentsForSource } from "../hooks/useAttachments";

/**
 * Compact "📎 N" badge that opens an attachment drawer for a given source doc.
 * Drop on any list row without taking much space.
 */
const AttachmentsBadge = ({ sourceType, sourceRef, sourceNo, tenderId, readOnly, title }) => {
  const [open, setOpen] = useState(false);
  const { data: files = [] } = useAttachmentsForSource({
    source_type: sourceType,
    source_ref: sourceRef,
    source_no: sourceNo,
  });

  if (!sourceType || (!sourceRef && !sourceNo)) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
          files.length > 0
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
        }`}
        title={title || "Attachments"}
      >
        <Paperclip size={11} />
        {files.length > 0 ? files.length : ""}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md bg-gray-50 dark:bg-gray-950 h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-900 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{sourceType}</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{sourceNo || sourceRef}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AttachmentsPanel
                sourceType={sourceType}
                sourceRef={sourceRef}
                sourceNo={sourceNo}
                tenderId={tenderId}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttachmentsBadge;
