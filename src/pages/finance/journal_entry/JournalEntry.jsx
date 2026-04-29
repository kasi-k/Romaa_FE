import { useState, useMemo } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  FileText, RefreshCw, Search, CalendarDays,
  ChevronLeft, ChevronRight, RotateCcw, CheckCircle2,
  Layers, ArrowRightLeft, BookOpen, AlertTriangle,
  Check, Trash2
} from "lucide-react";
import { TbPlus } from "react-icons/tb";
import { FiFilter } from "react-icons/fi";
import {
  useJEList, useApproveJE, useDeleteJE, useReverseJE,
} from "./hooks/useJournalEntry";
import CreateJournalEntry from "./CreateJournalEntry";
import ViewJournalEntry   from "./ViewJournalEntry";
import ConfirmModal from "../../../components/ConfirmModal";
import DeleteModal from "../../../components/DeleteModal";

/* ── Constants ───────────────────────────────────────────────────────────── */
const JE_TYPES = [
  "All",
  "Adjustment", "Opening Balance", "Depreciation", "Bank Reconciliation",
  "Payroll", "Accrual", "Provision", "ITC Reversal",
  "Inter-Account Transfer", "Reversal", "Other",
  "Purchase Invoice", "Contractor Bill", "Payment", "Receipt",
  "Credit Note", "Debit Note",
];

const STATUS_STYLE = {
  draft:    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  pending:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
};

const TYPE_BADGE = {
  "Depreciation":           "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Bank Reconciliation":    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Payroll":                "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Accrual":                "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "Opening Balance":        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "ITC Reversal":           "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "Inter-Account Transfer": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "Reversal":               "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  "Payment":                "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Receipt":                "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Purchase Invoice":       "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  "Contractor Bill":        "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
};

const fmt     = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── Summary card ────────────────────────────────────────────────────────── */
const SummaryCard = ({ icon, label, value, sub, color }) => {
  const c = {
    indigo: { wrap: "bg-indigo-50 dark:bg-indigo-900/20", icon: "text-indigo-600 dark:text-indigo-400", val: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-100 dark:border-indigo-800/50" },
    amber:  { wrap: "bg-amber-50 dark:bg-amber-900/20",   icon: "text-amber-600 dark:text-amber-400",   val: "text-amber-700 dark:text-amber-300",   border: "border-amber-100 dark:border-amber-800/50" },
    emerald:{ wrap: "bg-emerald-50 dark:bg-emerald-900/20",icon:"text-emerald-600 dark:text-emerald-400",val:"text-emerald-700 dark:text-emerald-300",border:"border-emerald-100 dark:border-emerald-800/50"},
    rose:   { wrap: "bg-rose-50 dark:bg-rose-900/20",     icon: "text-rose-600 dark:text-rose-400",     val: "text-rose-700 dark:text-rose-300",     border: "border-rose-100 dark:border-rose-800/50" },
  }[color] || { wrap: "bg-gray-50", icon: "text-gray-500", val: "text-gray-700", border: "border-gray-100" };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${c.border} p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${c.wrap} shrink-0`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-xl font-extrabold mt-0.5 tabular-nums ${c.val}`}>{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

/* ── Reversal Modal ──────────────────────────────────────────────────────── */
const ReversalModal = ({ je, onClose, onReverse, isReversing }) => {
  const [revDate, setRevDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-roboto-flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <RotateCcw size={16} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Reverse Journal Entry</h3>
            <p className="text-[11px] text-gray-400">{je.je_no} — Dr↔Cr will be swapped</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reversal Date</label>
            <input
              type="date"
              value={revDate}
              onChange={(e) => setRevDate(e.target.value)}
              className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Narration (optional)</label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={2}
              placeholder={`Reversing ${je.je_no} — ${je.narration}`}
              className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isReversing}
            onClick={() => onReverse({ id: je._id, reversal_date: revDate, narration: narration || undefined })}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60"
          >
            {isReversing ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <RotateCcw size={14} />}
            {isReversing ? "Reversing…" : "Create Reversal"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const JournalEntry = () => {
  const [showCreate,  setShowCreate]  = useState(false);
  const [viewJE,      setViewJE]      = useState(null);
  const [reversingJE, setReversingJE] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", id: null, displayStr: "" });

  /* ── Filters ── */
  const [search,    setSearch]    = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate,  setFromDate]  = useState("");
  const [toDate,    setToDate]    = useState("");
  const [showFilters, setShowFilters] = useState(false);

  /* ── Pagination ── */
  const [page,  setPage]  = useState(1);
  const limit = 20;

  /* ── Build query params ── */
  const debouncedSearch = useDebounce(search, 500);

  const params = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch,
    fromdate: fromDate,
    todate: toDate,
    status: filterStatus !== "all" ? filterStatus : undefined,
    je_type: filterType !== "All" ? filterType : undefined,
  }), [page, limit, debouncedSearch, fromDate, toDate, filterStatus, filterType]);

  const { data, isLoading, isFetching, refetch } = useJEList(params);
  const list       = useMemo(() => data?.data || [],       [data]);
  const pagination = useMemo(() => data?.pagination || {}, [data]);

  const { mutate: approveJE, isPending: approvingId }  = useApproveJE();
  const { mutate: deleteJE,  isPending: deletingId  }  = useDeleteJE({});
  const { mutate: reverseJE, isPending: isReversing }  = useReverseJE({
    onSuccess: () => setReversingJE(null),
  });

  /* ── server does the search, just use list directly ── */
  const filtered = useMemo(() => list, [list]);

  /* ── Summary stats ── */
  const approvedItems  = list.filter((je) => je.status === "approved");
  const pendingItems   = list.filter((je) => je.status === "pending");
  const totalApprDr    = approvedItems.reduce((s, je) => s + (je.total_debit || 0), 0);
  const autoGenItems   = list.filter((je) => je.source_type);

  const resetFilters = () => {
    setFilterType("All");
    setFilterStatus("all");
    setFromDate("");
    setToDate("");
    setSearch("");
    setPage(1);
  };

  const isFiltered = filterType !== "All" || filterStatus !== "all" || fromDate || toDate;

  return (
    <div className="font-roboto-flex h-full overflow-y-auto bg-gray-50 dark:bg-[#0b0f19] pb-24">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <BookOpen size={17} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Journal Entries
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-none">
                Finance · General Ledger · Double-entry records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                showFilters || isFiltered
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <FiFilter size={13} />
              Filters
              {isFiltered && (
                <span className="ml-0.5 text-[9px] font-extrabold bg-indigo-600 text-white rounded-full px-1.5 py-0.5">ON</span>
              )}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <TbPlus className="text-lg" />
              New JE
            </button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        {showFilters && (
          <div className="max-w-7xl mx-auto px-6 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">JE Type</label>
                <div className="relative mt-1">
                  <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                    className="w-full appearance-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    {JE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <div className="relative mt-1">
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="w-full appearance-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                  className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                  className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <SummaryCard
            icon={<Layers size={20} />}
            color="indigo"
            label="Total JEs"
            value={pagination.total ?? list.length}
            sub="this page results"
          />
          <SummaryCard
            icon={<CheckCircle2 size={20} />}
            color="emerald"
            label="Approved"
            value={approvedItems.length}
            sub={`₹${fmt(totalApprDr)} Dr posted`}
          />
          <SummaryCard
            icon={<AlertTriangle size={20} />}
            color="amber"
            label="Pending"
            value={pendingItems.length}
            sub="awaiting approval"
          />
          <SummaryCard
            icon={<ArrowRightLeft size={20} />}
            color="rose"
            label="Auto-Generated"
            value={autoGenItems.length}
            sub="from voucher approvals"
          />
        </div>

        {/* ── Search + Refresh ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3.5 mb-4 flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search JE no., narration, tender, source…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <span className="animate-spin h-9 w-9 border-[3px] border-indigo-500 border-t-transparent rounded-full" />
            <p className="text-sm font-medium">Loading journal entries…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <FileText size={44} className="opacity-20" />
            <p className="text-sm font-semibold">
              {list.length === 0 ? "No journal entries yet." : "No results for current search."}
            </p>
            {list.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
              >
                Create your first journal entry
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["#", "JE No.", "Date", "Type", "Narration", "Lines", "Total Dr", "Total Cr", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filtered.map((je, i) => (
                    <tr
                      key={je._id}
                      onClick={() => setViewJE(je)}
                      className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {(page - 1) * limit + i + 1}
                      </td>

                      {/* JE No */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {je.is_reversal && (
                            <RotateCcw size={11} className="text-rose-400 shrink-0" title="Reversal JE" />
                          )}
                          {je.source_type && !je.is_reversal && (
                            <ArrowRightLeft size={11} className="text-indigo-400 shrink-0" title="Auto-generated" />
                          )}
                          <code className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                            {je.je_no || "—"}
                          </code>
                        </div>
                        {je.reversal_of_no && (
                          <p className="text-[10px] text-rose-500 ml-5 mt-0.5">↩ {je.reversal_of_no}</p>
                        )}
                        {je.source_no && (
                          <p className="text-[10px] text-gray-400 ml-5 mt-0.5">{je.source_type}: {je.source_no}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <CalendarDays size={11} className="shrink-0" />
                          {fmtDate(je.je_date)}
                        </span>
                        {je.auto_reverse_date && (
                          <p className="text-[10px] text-amber-500 mt-0.5">Auto-rev: {fmtDate(je.auto_reverse_date)}</p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_BADGE[je.je_type] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {je.je_type || "—"}
                        </span>
                      </td>

                      {/* Narration */}
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="text-xs text-gray-700 dark:text-gray-200 truncate" title={je.narration}>
                          {je.narration || "—"}
                        </p>
                        {je.tender_id && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">#{je.tender_id}</p>
                        )}
                      </td>

                      {/* Lines count */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                          {(je.lines || []).length}
                        </span>
                      </td>

                      {/* Total Dr */}
                      <td className="px-4 py-3 tabular-nums text-right">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                          ₹{fmt(je.total_debit)}
                        </span>
                      </td>

                      {/* Total Cr */}
                      <td className="px-4 py-3 tabular-nums text-right">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{fmt(je.total_credit)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${STATUS_STYLE[je.status] || STATUS_STYLE.pending}`}>
                            {je.status || "pending"}
                          </span>
                          {je.is_posted && (
                            <span className="text-[9px] text-indigo-500 font-semibold">Posted ✓</span>
                          )}
                          {je.auto_reversed && (
                            <span className="text-[9px] text-rose-400 font-semibold">Auto-reversed</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 justify-end">
                          {je.status === "pending" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, type: "approve", id: je._id, displayStr: je.je_no }); }}
                              disabled={approvingId}
                              title="Approve"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800 transition-colors disabled:opacity-50"
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {je.status === "approved" && !je.is_reversal && (
                            <button
                              onClick={() => setReversingJE(je)}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800 transition-colors whitespace-nowrap"
                            >
                              Reverse
                            </button>
                          )}
                          {(je.status === "draft" || je.status === "pending") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionModal({ isOpen: true, type: "delete", id: je._id, displayStr: je.je_no });
                              }}
                              disabled={deletingId}
                              title="Delete"
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-800 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Footer + Pagination ── */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3 text-xs text-gray-400">
              <span>
                Showing{" "}
                <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong> of{" "}
                <strong className="text-gray-600 dark:text-gray-300">{pagination.total ?? list.length}</strong> entries
              </span>

              {pagination.pages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                    className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, k) => {
                    const pg = k + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`px-2.5 py-1 rounded border text-[11px] font-bold transition-colors ${
                          page === pg
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page >= (pagination.pages || 1) || isFetching}
                    className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={13} />
                  </button>
                  <span className="ml-1 text-gray-400">
                    Page {page} / {pagination.pages}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Create JE (full-screen modal) ── */}
      {showCreate && (
        <CreateJournalEntry
          onclose={() => setShowCreate(false)}
          onSuccess={() => { refetch(); setShowCreate(false); }}
        />
      )}

      {/* ── View Detail Modal ── */}
      {viewJE && (
        <ViewJournalEntry
          je={viewJE}
          onClose={() => setViewJE(null)}
          onApprove={(id) => { approveJE(id); setViewJE(null); }}
          onReverse={(je) => { setViewJE(null); setReversingJE(je); }}
          onDelete={(id) => { deleteJE(id); setViewJE(null); }}
        />
      )}

      {/* ── Reversal Modal ── */}
      {reversingJE && (
        <ReversalModal
          je={reversingJE}
          onClose={() => setReversingJE(null)}
          onReverse={reverseJE}
          isReversing={isReversing}
        />
      )}

      {/* ── Action Modals ── */}
      {actionModal.isOpen && actionModal.type === "delete" && (
        <DeleteModal
          deletetitle={`Journal Entry ${actionModal.displayStr || ""}`}
          onclose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "" })}
          onDelete={() => deleteJE(actionModal.id)}
        />
      )}
      {actionModal.isOpen && actionModal.type === "approve" && (
        <ConfirmModal
          title="Approve Journal Entry"
          message={`Are you sure you want to approve Journal Entry ${actionModal.displayStr || ""}? This action may be irreversible.`}
          onConfirm={() => approveJE(actionModal.id)}
          onClose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "" })}
        />
      )}
    </div>
  );
};

export default JournalEntry;
