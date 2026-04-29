import { useState, useMemo, useCallback } from "react";
import {
  TbCloudUpload, TbExternalLink, TbCircleCheck,
  TbSearch, TbLayoutGrid, TbLayoutList, TbSortAscending,
  TbFileTypePdf, TbFileTypeDoc, TbPhoto, TbFile,
  TbTrash, TbCheck, TbX, TbSelectAll,
} from "react-icons/tb";
import UploadPlan from "./UploadPlan";
import { usePlanDocuments, useDeletePlan } from "./UseSitePlan";
import Title from "../../../components/Title";
import { useProject } from "../../../context/ProjectContext";

// ── helpers ───────────────────────────────────────────────────

const getFileType = (filename = "") => {
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) return "img";
  return "other";
};

const FILE_META = {
  pdf:   { Icon: TbFileTypePdf, color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20",       grad: "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20",       label: "PDF" },
  doc:   { Icon: TbFileTypeDoc, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20",     grad: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20",   label: "DOC" },
  img:   { Icon: TbPhoto,       color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", grad: "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20", label: "IMG" },
  other: { Icon: TbFile,        color: "text-slate-400",   bg: "bg-slate-50 dark:bg-slate-800",      grad: "from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-700/40", label: "FILE" },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const isRecent = (d) => Date.now() - new Date(d).getTime() < 86_400_000;

const SORT_OPTIONS = [
  { label: "Newest first", fn: (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at) },
  { label: "Oldest first", fn: (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at) },
  { label: "Name A–Z",     fn: (a, b) => a.filename.localeCompare(b.filename) },
  { label: "Name Z–A",     fn: (a, b) => b.filename.localeCompare(a.filename) },
];

// ── SkeletonCard ──────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
    <div className="h-32 bg-gray-100 dark:bg-gray-800" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5" />
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full w-2/5" />
      <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl mt-3" />
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-800 animate-pulse">
    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-2/5" />
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full w-1/4" />
    </div>
    <div className="w-16 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg" />
  </div>
);

// ── DeleteConfirm (inline) ────────────────────────────────────

const DeleteConfirm = ({ onConfirm, onCancel, isPending }) => (
  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-150">
    <span className="text-[11px] text-red-500 font-semibold flex-1">Delete this file?</span>
    <button
      onClick={onCancel}
      className="px-2.5 py-1 text-[11px] font-bold text-slate-500 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      No
    </button>
    <button
      onClick={onConfirm}
      disabled={isPending}
      className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
    >
      {isPending ? "…" : "Yes"}
    </button>
  </div>
);

// ── DocCard (grid view) ───────────────────────────────────────

const DocCard = ({ doc, isSelected, onSelect, onRequestDelete, onConfirmDelete, onCancelDelete, isConfirming, isDeleting }) => {
  const type = getFileType(doc.filename);
  const { Icon, color, bg, grad, label } = FILE_META[type];
  const [imgError, setImgError] = useState(false);
  const recent = isRecent(doc.uploaded_at);

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden flex flex-col transition-all duration-300
      ${isSelected
        ? "border-blue-500 shadow-xl shadow-blue-500/15 ring-2 ring-blue-400/20"
        : "border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/20"
      }`}
    >
      {/* ── Preview ── */}
      <div className={`relative h-32 overflow-hidden bg-linear-to-br ${grad} shrink-0`}>
        {type === "img" && doc.file_url && !imgError ? (
          <img
            src={doc.file_url}
            alt={doc.filename}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={46} className={`${color} opacity-25`} />
            <span className={`absolute bottom-2 right-3 text-[10px] font-black tracking-widest uppercase ${color} opacity-40`}>
              {label}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* NEW badge */}
        {recent && (
          <span className="absolute top-2 left-2 text-[9px] font-black tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full shadow animate-in fade-in zoom-in duration-300">
            NEW
          </span>
        )}

        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(doc.code); }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm
            ${isSelected
              ? "bg-blue-500 border-blue-500 scale-100 opacity-100"
              : "bg-white/90 dark:bg-slate-800/90 border-gray-300 dark:border-gray-600 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
            }`}
        >
          {isSelected && <TbCheck size={13} className="text-white" strokeWidth={3} />}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-2 mb-1">
          <div className={`w-7 h-7 ${bg} ${color} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
            <Icon size={16} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug truncate" title={doc.filename}>
            {doc.filename}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 ml-9 mb-3">{formatDate(doc.uploaded_at)}</p>

        <div className="mt-auto">
          {isConfirming ? (
            <DeleteConfirm onConfirm={() => onConfirmDelete(doc.code)} onCancel={onCancelDelete} isPending={isDeleting} />
          ) : (
            <div className="flex items-center gap-2">
              {doc.file_url ? (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all group/btn"
                >
                  View Document
                  <TbExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              ) : (
                <div className="flex-1 py-2 text-center text-[11px] text-gray-400 italic bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  Processing…
                </div>
              )}
              <button
                onClick={() => onRequestDelete(doc.code)}
                className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
              >
                <TbTrash size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── DocRow (list view) ────────────────────────────────────────

const DocRow = ({ doc, isSelected, onSelect, onRequestDelete, onConfirmDelete, onCancelDelete, isConfirming, isDeleting }) => {
  const type = getFileType(doc.filename);
  const { Icon, color, bg } = FILE_META[type];
  const recent = isRecent(doc.uploaded_at);

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors group
      ${isSelected ? "bg-blue-50/60 dark:bg-blue-900/10" : "hover:bg-gray-50/60 dark:hover:bg-gray-800/20"}`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onSelect(doc.code)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200
          ${isSelected
            ? "bg-blue-500 border-blue-500"
            : "border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100"
          }`}
      >
        {isSelected && <TbCheck size={11} className="text-white" strokeWidth={3} />}
      </button>

      {/* Icon */}
      <div className={`w-9 h-9 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate" title={doc.filename}>
            {doc.filename}
          </p>
          {recent && (
            <span className="text-[9px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded-full shrink-0">NEW</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(doc.uploaded_at)}</p>
      </div>

      {/* Actions */}
      {isConfirming ? (
        <DeleteConfirm onConfirm={() => onConfirmDelete(doc.code)} onCancel={onCancelDelete} isPending={isDeleting} />
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          {doc.file_url ? (
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all"
            >
              View <TbExternalLink size={12} />
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic px-3">Processing…</span>
          )}
          <button
            onClick={() => onRequestDelete(doc.code)}
            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <TbTrash size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Plan ──────────────────────────────────────────────────────

const SitePlan = () => {
  const [showModal, setShowModal]       = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const [search, setSearch]             = useState("");
  const [sortIdx, setSortIdx]           = useState(0);
  const [viewMode, setViewMode]         = useState("grid");
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [confirmingId, setConfirmingId] = useState(null);
  const [bulkConfirm, setBulkConfirm]   = useState(false);
  const { tenderId } = useProject();
  const tender_id = tenderId;

  const { data: documents = [], isLoading } = usePlanDocuments(tender_id);
  const deleteMutation = useDeletePlan();

  const handleUploadSuccess = () => {
    setShowModal(false);
    setJustUploaded(true);
    setTimeout(() => setJustUploaded(false), 3000);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents
      .filter((d) => !q || d.filename.toLowerCase().includes(q))
      .sort(SORT_OPTIONS[sortIdx].fn);
  }, [documents, search, sortIdx]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedIds(new Set());
  const selectAll      = () => setSelectedIds(new Set(filtered.map((d) => d.code)));

  const handleRequestDelete  = (id) => { setConfirmingId(id); };
  const handleCancelDelete   = () => setConfirmingId(null);
  const handleConfirmDelete  = (id) => {
    deleteMutation.mutate({ document_id: id }, {
      onSuccess: () => {
        setConfirmingId(null);
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      },
      onError: () => setConfirmingId(null),
    });
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    Promise.allSettled(ids.map((id) => deleteMutation.mutateAsync({ document_id: id })))
      .finally(() => { clearSelection(); setBulkConfirm(false); });
  };

  // ── Loading — skeleton ──
  if (isLoading) {
    return (
      <div className="p-2 md:p-6 min-h-[60vh]">
        <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl mb-6 border border-gray-100 dark:border-gray-800 animate-pulse" />
        <div className="flex gap-3 mb-6">
          <div className="flex-1 h-10 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
          <div className="w-36 h-10 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
          <div className="w-20 h-10 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <>
    <Title title="Site Management" sub_title="Manage and access your architectural and engineering documents." page_title=" Drawing Plans"/>
    <div className="p-2 md:p-6 min-h-[60vh]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 flex-wrap">
             Site Drawing Plans
            {documents.length > 0 && (
              <span className="text-sm font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                {documents.length} {documents.length === 1 ? "file" : "files"}
              </span>
            )}
            {justUploaded && (
              <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full animate-bounce">
                <TbCircleCheck size={14} /> Updated
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage and access your architectural and engineering documents.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="group mt-4 sm:mt-0 relative flex items-center gap-2 bg-darkest-blue text-white px-6 py-3 rounded-xl overflow-hidden transition-all active:scale-95 shadow-lg shadow-blue-900/20 shrink-0"
        >
          <span className="relative z-10 font-semibold flex items-center gap-2">
            <TbCloudUpload size={20} className="group-hover:animate-bounce" />
            Upload New Plan
          </span>
          <div className="absolute inset-0 bg-blue-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>

      {/* ── Toolbar ── */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <TbSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <TbX size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3">
            <TbSortAscending size={16} className="text-slate-400 shrink-0" />
            <select
              value={sortIdx}
              onChange={(e) => setSortIdx(Number(e.target.value))}
              className="text-sm bg-transparent py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shrink-0">
            {[{ mode: "grid", icon: TbLayoutGrid }, { mode: "list", icon: TbLayoutList }].map((item) => {
              const { mode, icon: ModeIcon } = item;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2.5 transition-colors ${
                    viewMode === mode
                      ? "bg-darkest-blue text-white"
                      : "text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <ModeIcon size={18} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-300 rounded-3xl flex items-center justify-center mb-5">
            <TbCloudUpload size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No documents yet</h3>
          <p className="text-slate-400 text-sm max-w-xs text-center mt-2">
            Upload your first technical plan to get started. Supports PDF, DOC, and image files.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 flex items-center gap-2 bg-darkest-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-900/20"
          >
            <TbCloudUpload size={18} /> Upload your first plan
          </button>
        </div>

      ) : filtered.length === 0 ? (
        /* No search results */
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <TbSearch size={44} className="text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-600 dark:text-slate-400">No results for "{search}"</h3>
          <button onClick={() => setSearch("")} className="mt-3 text-sm text-blue-500 hover:underline">Clear search</button>
        </div>

      ) : viewMode === "grid" ? (
        /* ── Grid view ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((doc, index) => (
            <div
              key={doc.code}
              style={{ animationDelay: `${index * 40}ms` }}
              className="animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              <DocCard
                doc={doc}
                isSelected={selectedIds.has(doc.code)}
                onSelect={toggleSelect}
                onRequestDelete={handleRequestDelete}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
                isConfirming={confirmingId === doc.code}
                isDeleting={deleteMutation.isPending && confirmingId === doc.code}
              />
            </div>
          ))}
        </div>

      ) : (
        /* ── List view ── */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* List header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <button
              onClick={selectedIds.size === filtered.length ? clearSelection : selectAll}
              className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0 hover:border-blue-400 transition-colors"
            >
              {selectedIds.size === filtered.length && filtered.length > 0 && (
                <TbCheck size={11} className="text-blue-500" strokeWidth={3} />
              )}
            </button>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Document</span>
            <span className="ml-auto text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2">Actions</span>
          </div>

          {filtered.map((doc, index) => (
            <div
              key={doc.code}
              style={{ animationDelay: `${index * 30}ms` }}
              className="animate-in fade-in duration-300"
            >
              <DocRow
                doc={doc}
                isSelected={selectedIds.has(doc.code)}
                onSelect={toggleSelect}
                onRequestDelete={handleRequestDelete}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
                isConfirming={confirmingId === doc.code}
                isDeleting={deleteMutation.isPending && confirmingId === doc.code}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Bulk action bar ── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/30 border border-slate-700 dark:border-slate-200">
            <span className="text-sm font-bold">{selectedIds.size} selected</span>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300" />
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-slate-900 transition-colors"
            >
              <TbSelectAll size={15} /> Select all
            </button>
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-slate-900 transition-colors"
            >
              <TbX size={14} /> Clear
            </button>
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300" />

            {bulkConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 dark:text-red-500 font-semibold">Delete {selectedIds.size} files?</span>
                <button
                  onClick={() => setBulkConfirm(false)}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-700 dark:bg-slate-200 rounded-lg hover:bg-slate-600 dark:hover:bg-slate-300 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleteMutation.isPending}
                  className="px-2.5 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setBulkConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 dark:text-red-500 dark:hover:text-red-600 transition-colors"
              >
                <TbTrash size={15} /> Delete {selectedIds.size} {selectedIds.size === 1 ? "file" : "files"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <UploadPlan onClose={() => setShowModal(false)} onUploadSuccess={handleUploadSuccess} />
      )}
    </div>
    </>
  );
};

export default SitePlan;
