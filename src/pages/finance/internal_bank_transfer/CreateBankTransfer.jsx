import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiSave, FiFileText, FiCreditCard, FiList, FiChevronDown, FiAlertCircle,
} from "react-icons/fi";
import { ArrowRightLeft, Building2, Banknote } from "lucide-react";
import { useBankAccounts, useNextBTNo, useCreateBT } from "./hooks/useBankTransfer";

/* ── Yup schema ─────────────────────────────────────────────────────────── */
const schema = yup.object().shape({
  transfer_no:       yup.string().required("Transfer number is required"),
  transfer_date:     yup.string().required("Date is required"),
  from_account_code: yup.string().required("Source account is required"),
  to_account_code:   yup
    .string()
    .required("Destination account is required")
    .test("not-same", "From and To accounts cannot be the same", function (val) {
      return val !== this.parent.from_account_code;
    }),
  amount:            yup
    .number()
    .typeError("Must be a number")
    .positive("Must be greater than 0")
    .required("Amount is required"),
  transfer_mode:     yup.string().required("Transfer mode is required"),
  reference_no:      yup.string().nullable(),
  cheque_no:         yup.string().nullable(),
  cheque_date:       yup.string().nullable(),
  narration:         yup.string().nullable(),
});

const TRANSFER_MODES = ["NEFT", "RTGS", "IMPS", "UPI", "Cheque", "Cash", "Internal"];

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const today = () => new Date().toISOString().split("T")[0];

/* ── Shared styles ───────────────────────────────────────────────────────── */
const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-gray-400";
const readonlyCls =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 dark:text-gray-400 text-gray-500 cursor-default";

/* ── Field wrapper ───────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
        <FiAlertCircle size={10} />
        {error.message}
      </p>
    )}
  </div>
);

/* ── Section card ────────────────────────────────────────────────────────── */
const accentColors = {
  slate:   "bg-slate-700",
  blue:    "bg-blue-600",
  emerald: "bg-emerald-600",
  amber:   "bg-amber-500",
  violet:  "bg-violet-600",
};
const SectionCard = ({ iconEl, title, accent = "slate", children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${className}`}>
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 rounded-t-xl">
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[13px] text-white ${accentColors[accent]}`}>
        {iconEl}
      </span>
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
        {title}
      </span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ── Searchable account select ───────────────────────────────────────────── */
const AccountSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Search accounts…",
  disabled = false,
  isLoading = false,
  excludeCode = null,
}) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter(
    (o) =>
      o.account_code !== excludeCode &&
      (
        o.account_name.toLowerCase().includes(search.toLowerCase()) ||
        (o.bank_name || "").toLowerCase().includes(search.toLowerCase()) ||
        o.account_code.toLowerCase().includes(search.toLowerCase())
      ),
  );

  const selected = options.find((o) => o.account_code === value);

  const displayLabel = (a) => {
    if (!a) return null;
    const isCash = a.account_category === "cash";
    const sub = isCash
      ? [a.custodian_name, a.location].filter(Boolean).join(" · ")
      : [a.bank_name, a.branch_name].filter(Boolean).join(" · ");
    return (
      <div>
        <span className="font-semibold text-gray-800 dark:text-gray-100">{a.account_name}</span>
        {sub && <span className="text-gray-400 text-[11px] ml-1.5">{sub}</span>}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen((o) => !o); setSearch(""); } }}
        className={`${inputCls} flex items-center justify-between text-left min-h-[38px] ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={`truncate ${selected ? "" : "text-gray-400"}`}>
          {selected ? displayLabel(selected) : placeholder}
        </span>
        {isLoading ? (
          <span className="shrink-0 ml-1 w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <FiChevronDown
            size={14}
            className={`shrink-0 ml-1 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, bank, code…"
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">No accounts found</li>
            ) : (
              filtered.map((a) => {
                const isCash = a.account_category === "cash";
                const sub = isCash
                  ? [a.custodian_name, a.location].filter(Boolean).join(" · ")
                  : [a.bank_name, a.branch_name].filter(Boolean).join(" · ");
                return (
                  <li key={a.account_code}>
                    <button
                      type="button"
                      onClick={() => { onChange(a.account_code); setOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                        value === a.account_code ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {a.account_name}
                          </span>
                          <span
                            className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isCash
                                ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {isCash ? "CASH" : "BANK"}
                          </span>
                          {sub && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹{fmt(a.current_balance || 0)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ── Account balance badge ───────────────────────────────────────────────── */
const BalanceBadge = ({ account, label }) => {
  if (!account) return null;
  const isCash = account.account_category === "cash";
  return (
    <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
      {isCash ? (
        <Banknote size={14} className="text-teal-500 shrink-0" />
      ) : (
        <Building2 size={14} className="text-blue-500 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
          {account.account_name}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-gray-400">Available</p>
        <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
          ₹{fmt(account.current_balance || 0)}
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const CreateBankTransfer = ({ onClose, onSuccess }) => {
  const { data: accounts = [], isLoading: loadingAccounts } = useBankAccounts();
  const { data: nextNo, isLoading: loadingNextNo }          = useNextBTNo();
  const { mutate: createBT, isPending: saving }             = useCreateBT({
    onSuccess: () => { onSuccess?.(); onClose(); },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      transfer_no:       "",
      transfer_date:     today(),
      from_account_code: "",
      to_account_code:   "",
      amount:            "",
      transfer_mode:     "NEFT",
      reference_no:      "",
      cheque_no:         "",
      cheque_date:       "",
      narration:         "",
    },
  });

  /* prefill transfer_no once loaded */
  useEffect(() => {
    if (nextNo) setValue("transfer_no", nextNo);
  }, [nextNo, setValue]);

  const watchMode    = watch("transfer_mode");
  const watchFrom    = watch("from_account_code");
  const watchTo      = watch("to_account_code");
  const isChequeMod  = watchMode === "Cheque";

  const fromAccount  = accounts.find((a) => a.account_code === watchFrom);
  const toAccount    = accounts.find((a) => a.account_code === watchTo);

  const onSubmit = (data) => {
    const payload = {
      transfer_no:       data.transfer_no,
      transfer_date:     data.transfer_date,
      from_account_code: data.from_account_code,
      from_account_name: fromAccount?.account_name || "",
      to_account_code:   data.to_account_code,
      to_account_name:   toAccount?.account_name || "",
      amount:            Number(data.amount),
      transfer_mode:     data.transfer_mode,
    };
    if (data.reference_no) payload.reference_no = data.reference_no;
    if (isChequeMod && data.cheque_no)   payload.cheque_no = data.cheque_no;
    if (isChequeMod && data.cheque_date) payload.cheque_date = data.cheque_date;
    if (data.narration) payload.narration = data.narration;
    createBT(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm">
      {/* click-away */}
      <div className="flex-1" onClick={onClose} />

      {/* panel */}
      <div className="relative w-full max-w-2xl h-full bg-gray-50 dark:bg-[#0b0f19] flex flex-col shadow-2xl overflow-hidden">
        {/* ── Panel header ── */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <ArrowRightLeft size={17} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                New Internal Bank Transfer
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-none">
                {loadingNextNo ? "Loading…" : nextNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form
          id="bt-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >

          {/* ── Transfer Details ── */}
          <SectionCard iconEl={<FiFileText />} title="Transfer Details" accent="slate">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Transfer No." required>
                <input
                  {...register("transfer_no")}
                  readOnly
                  className={readonlyCls}
                />
              </Field>
              <Field label="Transfer Date" required error={errors.transfer_date}>
                <input
                  type="date"
                  {...register("transfer_date")}
                  className={inputCls}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── Account Selection ── */}
          <SectionCard iconEl={<FiCreditCard />} title="Account Selection" accent="blue">
            <div className="space-y-4">
              <Field label="From Account (Source)" required error={errors.from_account_code}>
                <Controller
                  name="from_account_code"
                  control={control}
                  render={({ field }) => (
                    <AccountSelect
                      options={accounts}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select source bank / cash account…"
                      isLoading={loadingAccounts}
                      excludeCode={watchTo}
                    />
                  )}
                />
                <BalanceBadge account={fromAccount} label="Source balance" />
              </Field>

              {/* direction indicator */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                  <ArrowRightLeft size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Transfer</span>
                </div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <Field label="To Account (Destination)" required error={errors.to_account_code}>
                <Controller
                  name="to_account_code"
                  control={control}
                  render={({ field }) => (
                    <AccountSelect
                      options={accounts}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select destination bank / cash account…"
                      isLoading={loadingAccounts}
                      excludeCode={watchFrom}
                    />
                  )}
                />
                <BalanceBadge account={toAccount} label="Destination balance" />
              </Field>
            </div>
          </SectionCard>

          {/* ── Payment Details ── */}
          <SectionCard iconEl={<FiList />} title="Payment Details" accent="emerald">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Transfer Mode" required error={errors.transfer_mode}>
                <select {...register("transfer_mode")} className={inputCls}>
                  {TRANSFER_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>

              <Field label="Amount (₹)" required error={errors.amount}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("amount")}
                  placeholder="0.00"
                  className={inputCls}
                />
              </Field>

              {!isChequeMod && (
                <Field label="Reference No." error={errors.reference_no} >
                  <input
                    {...register("reference_no")}
                    placeholder="UTR / NEFT / RTGS reference…"
                    className={inputCls}
                  />
                </Field>
              )}
            </div>

            {/* Cheque fields */}
            {isChequeMod && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                <Field label="Cheque No." error={errors.cheque_no}>
                  <input
                    {...register("cheque_no")}
                    placeholder="Cheque number"
                    className={inputCls}
                  />
                </Field>
                <Field label="Cheque Date" error={errors.cheque_date}>
                  <input
                    type="date"
                    {...register("cheque_date")}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </SectionCard>

          {/* ── Narration ── */}
          <SectionCard iconEl={<FiFileText />} title="Narration" accent="amber">
            <Field label="Narration / Remarks" error={errors.narration}>
              <textarea
                {...register("narration")}
                rows={3}
                placeholder="Auto-generated if left blank…"
                className={`${inputCls} resize-none`}
              />
            </Field>
          </SectionCard>

          {/* Amount preview */}
          {watch("amount") > 0 && fromAccount && toAccount && (
            <div className="rounded-xl border border-blue-100 dark:border-blue-800/50 bg-blue-50/60 dark:bg-blue-900/10 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-3">
                Transfer Preview
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-right">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">{fromAccount.account_name}</p>
                  <p className="text-[11px] text-red-500 font-bold mt-0.5">
                    −₹{fmt(watch("amount"))}
                  </p>
                </div>
                <div className="px-3">
                  <ArrowRightLeft size={16} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">{toAccount.account_name}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    +₹{fmt(watch("amount"))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* ── Footer ── */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="bt-form"
            disabled={saving || loadingAccounts}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <FiSave size={14} />
                Create Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBankTransfer;
