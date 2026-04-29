import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import {
  FiSave, FiFileText, FiList, FiPlus, FiTrash2,
  FiAlertCircle, FiCheckCircle, FiRefreshCw, FiCalendar,
  FiChevronDown,
} from "react-icons/fi";
import { TbEqual } from "react-icons/tb";
import { toast } from "react-toastify";
import {
  useNextJENo, useCreateJE, usePostingAccounts, useTenderIds,
} from "./hooks/useJournalEntry";

/* ── Constants ───────────────────────────────────────────────────────────── */
const JE_TYPES = [
  "Adjustment", "Opening Balance", "Depreciation", "Bank Reconciliation",
  "Payroll", "Accrual", "Provision", "ITC Reversal",
  "Inter-Account Transfer", "Other",
];

const today = () => new Date().toISOString().slice(0, 10);
const fmt   = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const emptyLine = () => ({
  _id:          Math.random().toString(36).slice(2),
  account_code: "",
  account_name: "",
  dr_cr:        "Dr",
  debit_amt:    "",
  credit_amt:   "",
  narration:    "",
});

/* ── Shared styles (matches CreateVoucher / CreateDebitCreditNote) ─────────── */
const inputCls    = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 transition-all placeholder:text-gray-400";
const readonlyCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 dark:text-gray-400 text-gray-500 cursor-default";
const selectCls   = `${inputCls} appearance-none cursor-pointer`;

/* ── Field wrapper ───────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1">
        <FiAlertCircle size={10} />{error}
      </p>
    )}
  </div>
);

/* ── Section card (identical to CreateDebitCreditNote pattern) ───────────── */
const accentColors = {
  slate:  "bg-slate-700",
  indigo: "bg-indigo-600",
  violet: "bg-violet-600",
  amber:  "bg-amber-600",
  teal:   "bg-teal-600",
};
const SectionCard = ({ iconEl, title, accent = "slate", children, overflow = false, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${overflow ? "overflow-hidden" : ""} ${className}`}>
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 rounded-t-xl">
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[13px] text-white ${accentColors[accent] || accentColors.slate}`}>
        {iconEl}
      </span>
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ── Account searchable dropdown (portal-based — avoids overflow clip) ──── */
const AccountSelect = ({ accounts = [], value, onChange, disabled = false }) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const [rect,   setRect]   = useState(null);
  const btnRef     = useRef(null);
  const dropRef    = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  /* Recompute position on scroll / resize while open */
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const handleOpen = () => {
    if (disabled) return;
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen((o) => !o);
    setSearch("");
  };

  const filtered = accounts
    .filter((a) => {
      const q = search.toLowerCase();
      return a.account_code?.toLowerCase().includes(q) || a.account_name?.toLowerCase().includes(q);
    })
    .slice(0, 60);

  const selected = accounts.find((a) => a.account_code === value);

  /* Decide whether to open upward or downward */
  const spaceBelow = rect ? window.innerHeight - rect.bottom : 999;
  const dropHeight = 272; // max-h-64 = 256 + search bar ~16
  const openUp     = spaceBelow < dropHeight && rect?.top > dropHeight;

  const dropStyle = rect
    ? {
        position: "fixed",
        left:     rect.left,
        width:    rect.width,
        zIndex:   9999,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      }
    : { display: "none" };

  return (
    <div className="w-full">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`${inputCls} flex items-center justify-between text-left ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`truncate ${selected ? "text-gray-800 dark:text-white" : "text-gray-400"}`}>
          {selected
            ? <><code className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] mr-1.5">{selected.account_code}</code>{selected.account_name}</>
            : "Select account…"}
        </span>
        <FiChevronDown className={`text-gray-400 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && rect && createPortal(
        <div
          ref={dropRef}
          style={dropStyle}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl max-h-64 overflow-hidden flex flex-col"
        >
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 shrink-0">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or name…"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2">No accounts found</p>
            ) : (
              filtered.map((a) => (
                <div
                  key={a.account_code}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(a.account_code, a.account_name); setOpen(false); setSearch(""); }}
                  className={`px-3 py-2.5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 ${value === a.account_code ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                >
                  <code className={`font-mono text-[11px] w-14 shrink-0 ${value === a.account_code ? "text-indigo-700 dark:text-indigo-300" : "text-indigo-500 dark:text-indigo-400"}`}>
                    {a.account_code}
                  </code>
                  <span className={`text-sm truncate ${value === a.account_code ? "text-indigo-700 dark:text-indigo-300 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                    {a.account_name}
                  </span>
                  {a.account_type && (
                    <span className="ml-auto text-[9px] font-bold text-gray-400 uppercase bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 shrink-0">
                      {a.account_type}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

/* ── JE type hint ────────────────────────────────────────────────────────── */
const TYPE_HINTS = {
  "Depreciation":           "Dr Depreciation Expense  /  Cr Accumulated Depreciation",
  "Bank Reconciliation":    "Dr Bank Charges  /  Cr Bank Account",
  "Payroll":                "Dr Salary Expense  /  Cr Bank + PF Payable + TDS Payable",
  "Accrual":                "Dr Expense Account  /  Cr Accrued Liabilities  (set auto-reverse date)",
  "Opening Balance":        "Dr Asset / Bank Accounts  /  Cr Opening Balance Equity",
  "ITC Reversal":           "Dr ITC Reversal Liability  /  Cr CGST Input + SGST Input",
  "Inter-Account Transfer": "Dr Destination Bank  /  Cr Source Bank",
  "Provision":              "Dr Bad Debt Expense  /  Cr Provision for Bad Debts",
};

const TYPE_COLOR = {
  "Depreciation":           "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Bank Reconciliation":    "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Payroll":                "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Accrual":                "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "Opening Balance":        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "ITC Reversal":           "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "Inter-Account Transfer": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "Provision":              "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const CreateJournalEntry = ({ onclose, onSuccess }) => {

  /* ── Remote data ── */
  const { data: nextNoData, isLoading: nextNoLoading } = useNextJENo();
  const { data: accounts = [], isLoading: accsLoading } = usePostingAccounts();
  const { data: tenders  = [] }                         = useTenderIds();

  const { mutate: createJE, isPending: isSaving } = useCreateJE({
    onSuccess: () => { onSuccess?.(); onclose?.(); },
  });

  /* ── Form state ── */
  const [jeNo,        setJeNo]        = useState("");
  const [jeDate,      setJeDate]      = useState(today());
  const [jeType,      setJeType]      = useState("Adjustment");
  const [narration,   setNarration]   = useState("");
  const [tenderId,    setTenderId]    = useState("");
  const [tenderName,  setTenderName]  = useState("");
  const [autoRevDate, setAutoRevDate] = useState("");
  const [status,      setStatus]      = useState("pending");
  const [lines,       setLines]       = useState([emptyLine(), emptyLine()]);
  const [errors,      setErrors]      = useState({});

  const saveStatusRef = useRef("pending");

  /* ── Prefill JE No ── */
  useEffect(() => {
    if (nextNoData?.je_no) setJeNo(nextNoData.je_no);
  }, [nextNoData]);

  /* ── Tender helper ── */
  const handleTenderChange = (e) => {
    const tid = e.target.value;
    setTenderId(tid);
    const t = tenders.find((t) => (t.tender_id || t._id) === tid);
    setTenderName(t?.tender_project_name || t?.tender_name || t?.name || "");
  };

  /* ── Line helpers ── */
  const updateLine = useCallback((idx, field, val) => {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === "dr_cr") {
        if (val === "Dr") next[idx].credit_amt = "";
        else              next[idx].debit_amt  = "";
      }
      return next;
    });
  }, []);

  const addLine    = ()    => setLines((p) => [...p, emptyLine()]);
  const removeLine = (idx) => setLines((p) => p.filter((_, i) => i !== idx));

  /* ── Totals ── */
  const totalDr  = lines.reduce((s, l) => s + (parseFloat(l.debit_amt)  || 0), 0);
  const totalCr  = lines.reduce((s, l) => s + (parseFloat(l.credit_amt) || 0), 0);
  const balanced = Math.abs(totalDr - totalCr) < 0.01;
  const diff     = Math.abs(totalDr - totalCr);

  /* ── Validate ── */
  const validate = () => {
    const errs = {};
    if (!jeNo.trim())      errs.jeNo      = "JE number is required";
    if (!narration.trim()) errs.narration = "Narration is required for audit trail";
    if (lines.length < 2)  errs.lines     = "At least 2 lines required";
    lines.forEach((l, i) => {
      if (!l.account_code)  errs[`line_${i}_acct`] = "Select an account";
      const dr = parseFloat(l.debit_amt)  || 0;
      const cr = parseFloat(l.credit_amt) || 0;
      if (dr === 0 && cr === 0) errs[`line_${i}_amt`] = "Enter an amount";
      if (dr > 0 && cr > 0)    errs[`line_${i}_amt`] = "Cannot have both Dr and Cr";
    });
    if (!errs.lines && !balanced)
      errs.balance = `Entry does not balance — Dr ₹${fmt(totalDr)} ≠ Cr ₹${fmt(totalCr)} (diff ₹${fmt(diff)})`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ── */
  const handleSave = () => {
    if (!validate()) { toast.error("Please fix the errors before saving"); return; }
    createJE({
      je_no:      jeNo,
      je_date:    jeDate,
      je_type:    jeType,
      narration,
      status:     saveStatusRef.current,
      lines: lines.map((l) => ({
        account_code: l.account_code,
        dr_cr:        l.dr_cr,
        debit_amt:    parseFloat(l.debit_amt)  || 0,
        credit_amt:   parseFloat(l.credit_amt) || 0,
        narration:    l.narration || "",
      })),
      ...(tenderId    ? { tender_id: tenderId, tender_name: tenderName } : {}),
      ...(autoRevDate ? { auto_reverse_date: autoRevDate }               : {}),
    });
  };

  /* ── Render ── */
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-gray-950 font-roboto-flex overflow-hidden">

      {/* ══ Top bar (dark — same as CreateDebitCreditNote) ═══════════════════ */}
      <div className="shrink-0 bg-slate-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-b border-slate-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <FiFileText className="text-white text-base" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              JOURNAL ENTRY — NEW ENTRY
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Double-entry record · every debit must have an equal credit · Σ Dr = Σ Cr
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* JE number preview */}
          {nextNoData?.je_no && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Next No.</span>
              <code className="font-mono text-xs text-indigo-300 font-bold">{nextNoData.je_no}</code>
              {nextNoData.is_first && (
                <span className="text-[9px] font-bold bg-teal-500 text-white rounded px-1.5 py-0.5 ml-1">First JE</span>
              )}
            </div>
          )}

          {/* Balance pill */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${
            balanced
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-red-500/20 border-red-500/40 text-red-300"
          }`}>
            {balanced ? <FiCheckCircle size={12} /> : <FiAlertCircle size={12} />}
            {balanced ? "Balanced" : `Diff ₹${fmt(diff)}`}
          </div>

          <button
            type="button"
            onClick={onclose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <IoClose size={18} />
          </button>
        </div>
      </div>

      {/* ══ Scrollable body ══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-4">

          {/* ── Row 1: Entry Identity + Optional Settings ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Entry Identity */}
            <SectionCard iconEl={<FiFileText />} title="Entry Identity" accent="slate">
              <div className="grid grid-cols-2 gap-3">

                <Field label="JE Number" required error={errors.jeNo}>
                  <input
                    type="text"
                    value={nextNoLoading ? "Loading…" : jeNo}
                    readOnly
                    className={readonlyCls}
                    placeholder="Auto-generated…"
                  />
                </Field>

                <Field label="Date" required>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-2.5 text-gray-400" size={13} />
                    <input
                      type="date"
                      value={jeDate}
                      onChange={(e) => setJeDate(e.target.value)}
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </Field>

                <Field label="JE Type">
                  <div className="relative">
                    <select value={jeType} onChange={(e) => setJeType(e.target.value)} className={selectCls}>
                      {JE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" />
                  </div>
                  {TYPE_COLOR[jeType] && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${TYPE_COLOR[jeType]}`}>
                      {jeType}
                    </span>
                  )}
                </Field>

                <Field label="Save As">
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => { setStatus(e.target.value); saveStatusRef.current = e.target.value; }}
                      className={selectCls}
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending (send for approval)</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" />
                  </div>
                </Field>

                <div className="col-span-2">
                  <Field label="Narration" required error={errors.narration}>
                    <textarea
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      rows={3}
                      placeholder="Explain the purpose of this journal entry — required for audit trail"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* Optional: Tender + Auto-reversal + Quick reference */}
            <SectionCard iconEl={<FiRefreshCw />} title="Optional Settings" accent="indigo">
              <div className="space-y-3">

                <Field label="Link to Tender">
                  <div className="relative">
                    <select value={tenderId} onChange={handleTenderChange} className={selectCls}>
                      <option value="">— None —</option>
                      {tenders.map((t) => (
                        <option key={t._id || t.tender_id} value={t.tender_id || t._id}>
                          {t.tender_id} — {t.tender_project_name || t.tender_name || t.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" />
                  </div>
                  {tenderName && (
                    <p className="text-[11px] text-gray-400 truncate">{tenderName}</p>
                  )}
                </Field>

                <Field label="Auto-Reverse Date">
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-2.5 text-gray-400" size={13} />
                    <input
                      type="date"
                      value={autoRevDate}
                      onChange={(e) => setAutoRevDate(e.target.value)}
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                  {autoRevDate ? (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      Reversal JE will be auto-created on {autoRevDate}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-400">For accrual entries only</p>
                  )}
                </Field>

                {/* Quick reference card */}
                <div className="rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 p-4 mt-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2.5">
                    Double-Entry Rules
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-extrabold text-red-500 w-4 shrink-0">Dr</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Assets ↑ &nbsp;·&nbsp; Expenses ↑ &nbsp;·&nbsp; Liabilities ↓</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-extrabold text-emerald-600 w-4 shrink-0">Cr</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Assets ↓ &nbsp;·&nbsp; Income ↑ &nbsp;·&nbsp; Liabilities ↑</span>
                    </div>
                  </div>
                  {TYPE_HINTS[jeType] && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-700">
                      <p className="text-[10px] font-bold text-indigo-500 mb-0.5 uppercase tracking-wide">{jeType} — typical entry</p>
                      <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 leading-relaxed">{TYPE_HINTS[jeType]}</p>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Row 2: Journal Lines ── */}
          <SectionCard iconEl={<FiList />} title="Journal Lines" accent="violet" overflow>
            <div>
              {accsLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full" />
                  Loading chart of accounts…
                </div>
              )}

              {errors.lines && (
                <p className="text-[11px] text-red-500 mb-3 flex items-center gap-1">
                  <FiAlertCircle size={11} />{errors.lines}
                </p>
              )}

              {/* Lines table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm min-w-[820px]">
                  <thead className="bg-gray-50 dark:bg-gray-800/60">
                    <tr>
                      {[
                        { h: "#",              w: "w-10"  },
                        { h: "Account",        w: "min-w-[260px]" },
                        { h: "Dr / Cr",        w: "w-28"  },
                        { h: "Debit (₹)",      w: "w-36"  },
                        { h: "Credit (₹)",     w: "w-36"  },
                        { h: "Line Narration", w: "min-w-[160px]" },
                        { h: "",               w: "w-10"  },
                      ].map(({ h, w }) => (
                        <th
                          key={h}
                          className={`${w} px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap border-b border-gray-200 dark:border-gray-700`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {lines.map((line, idx) => (
                      <tr
                        key={line._id}
                        className={`transition-colors ${
                          line.dr_cr === "Dr"
                            ? "bg-red-50/20 dark:bg-red-900/5 hover:bg-red-50/40"
                            : "bg-emerald-50/20 dark:bg-emerald-900/5 hover:bg-emerald-50/40"
                        }`}
                      >
                        {/* # */}
                        <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{idx + 1}</td>

                        {/* Account */}
                        <td className="px-4 py-2.5">
                          <AccountSelect
                            accounts={accounts}
                            value={line.account_code}
                            onChange={(code, name) => {
                              updateLine(idx, "account_code", code);
                              updateLine(idx, "account_name", name);
                            }}
                          />
                          {errors[`line_${idx}_acct`] && (
                            <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1">
                              <FiAlertCircle size={10} />{errors[`line_${idx}_acct`]}
                            </p>
                          )}
                        </td>

                        {/* Dr / Cr toggle */}
                        <td className="px-4 py-2.5">
                          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <button
                              type="button"
                              onClick={() => updateLine(idx, "dr_cr", "Dr")}
                              className={`flex-1 py-2 text-xs font-extrabold tracking-wide transition-colors ${
                                line.dr_cr === "Dr"
                                  ? "bg-red-500 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600"
                              }`}
                            >
                              Dr
                            </button>
                            <button
                              type="button"
                              onClick={() => updateLine(idx, "dr_cr", "Cr")}
                              className={`flex-1 py-2 text-xs font-extrabold tracking-wide transition-colors ${
                                line.dr_cr === "Cr"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600"
                              }`}
                            >
                              Cr
                            </button>
                          </div>
                        </td>

                        {/* Debit Amt */}
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.dr_cr === "Dr" ? line.debit_amt : ""}
                            disabled={line.dr_cr !== "Dr"}
                            onChange={(e) => updateLine(idx, "debit_amt", e.target.value)}
                            placeholder="0.00"
                            className={`${line.dr_cr === "Dr" ? inputCls : readonlyCls} text-right tabular-nums`}
                          />
                          {errors[`line_${idx}_amt`] && (
                            <p className="text-[11px] text-red-500 mt-0.5">{errors[`line_${idx}_amt`]}</p>
                          )}
                        </td>

                        {/* Credit Amt */}
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.dr_cr === "Cr" ? line.credit_amt : ""}
                            disabled={line.dr_cr !== "Cr"}
                            onChange={(e) => updateLine(idx, "credit_amt", e.target.value)}
                            placeholder="0.00"
                            className={`${line.dr_cr === "Cr" ? inputCls : readonlyCls} text-right tabular-nums`}
                          />
                        </td>

                        {/* Line Narration */}
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={line.narration}
                            onChange={(e) => updateLine(idx, "narration", e.target.value)}
                            placeholder="Optional…"
                            className={inputCls}
                          />
                        </td>

                        {/* Remove */}
                        <td className="px-4 py-2.5">
                          {lines.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Add line row */}
                    <tr className="bg-gray-50/50 dark:bg-gray-800/20">
                      <td colSpan={7} className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={addLine}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                        >
                          <FiPlus size={13} /> Add Line
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Balance summary */}
              <div className={`mt-4 rounded-xl border px-5 py-4 flex flex-wrap items-center gap-6 ${
                balanced
                  ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
              }`}>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Total Debit</span>
                  <p className="text-xl font-extrabold tabular-nums text-red-600 dark:text-red-400 mt-0.5">₹{fmt(totalDr)}</p>
                  <p className="text-[10px] text-gray-400">{lines.filter((l) => l.dr_cr === "Dr").length} Dr lines</p>
                </div>

                <TbEqual size={24} className="text-gray-400 shrink-0" />

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Total Credit</span>
                  <p className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">₹{fmt(totalCr)}</p>
                  <p className="text-[10px] text-gray-400">{lines.filter((l) => l.dr_cr === "Cr").length} Cr lines</p>
                </div>

                <div className="ml-auto flex flex-col items-end gap-1">
                  {balanced ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <FiCheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Entry Balanced</span>
                      </div>
                      <span className="text-[11px] text-emerald-500">Ready to save</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <FiAlertCircle size={16} className="text-red-500" />
                        <span className="text-sm font-extrabold text-red-600 dark:text-red-400">Not Balanced</span>
                      </div>
                      <span className="text-[11px] text-red-500">Diff: ₹{fmt(diff)}</span>
                    </>
                  )}
                </div>
              </div>

              {errors.balance && (
                <p className="mt-2 text-[11px] text-red-500 flex items-center gap-1">
                  <FiAlertCircle size={11} />{errors.balance}
                </p>
              )}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ══ Sticky footer (same pattern as CreateVoucher) ════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-4">
        <p className="text-[11px] text-gray-400">
          <span className="font-semibold text-gray-500">{lines.length}</span> line{lines.length !== 1 ? "s" : ""}
          &nbsp;·&nbsp;
          {balanced
            ? <span className="text-emerald-600 font-semibold">Balanced ✓</span>
            : <span className="text-red-500 font-semibold">Diff ₹{fmt(diff)}</span>}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onclose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => { saveStatusRef.current = "draft"; handleSave(); }}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => { saveStatusRef.current = "pending"; handleSave(); }}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving
              ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              : <FiSave size={14} />}
            {isSaving ? "Saving…" : "Create Journal Entry"}
          </button>
        </div>
      </div>

    </div>
  );
};

export default CreateJournalEntry;
