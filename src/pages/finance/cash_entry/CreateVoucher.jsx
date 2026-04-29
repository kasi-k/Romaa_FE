import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiSave, FiFileText, FiUser, FiCreditCard,
  FiList, FiChevronDown, FiArrowUpRight, FiArrowDownLeft,
  FiAlertCircle, FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  useNextPVNo, useNextRVNo,
  useCreatePV, useCreateRV,
  useTenderIds, useBankAccounts, usePayableBills, useParties,
} from "./hooks/useVouchers";

/* ── Schema ─────────────────────────────────────────────────────────────── */
const schema = yup.object().shape({
  doc_no:      yup.string().required("Voucher number is required"),
  doc_date:    yup.string().required("Date is required"),
  bank_ref:    yup.string().nullable(),
  cheque_no:   yup.string().nullable(),
  cheque_date: yup.string().nullable(),
  amount:      yup.number().typeError("Must be a number").positive("Must be positive").required("Amount is required"),
  against_no:  yup.string().nullable(),
  narration:   yup.string().nullable(),
  tds_section: yup.string().nullable(),
  tds_pct:     yup.number().typeError("Must be a number").min(0).max(100).nullable().transform((v, o) => (o === "" ? null : v)),
});

/* spec §5: TDS_SECTION = 194C | 194J | 194I | 194Q | 194H */
const TDS_SECTIONS = ["", "194C", "194J", "194I", "194Q", "194H"];

/* spec: PAYMENT_MODE = bank|cash|upi|cheque|neft|rtgs|imps (all lowercase on the wire) */
const PAYMENT_MODES = [
  { label: "Cash", value: "cash" },
  { label: "Cheque", value: "cheque" },
  { label: "NEFT", value: "neft" },
  { label: "RTGS", value: "rtgs" },
  { label: "IMPS", value: "imps" },
  { label: "UPI", value: "upi" },
  { label: "Bank", value: "bank" },
];

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

/* ── Default entries ─────────────────────────────────────────────────────── */
const makeEntries = () => [
  { dr_cr: "Dr", account_name: "", debit_amt: "", credit_amt: "" },
  { dr_cr: "Cr", account_name: "", debit_amt: "", credit_amt: "" },
];

/* ── Shared class strings ────────────────────────────────────────────────── */
const inputCls    = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-all placeholder:text-gray-400";
const readonlyCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 dark:text-gray-400 text-gray-500 cursor-default";

/* ── Field wrapper ───────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 mt-0.5">{error.message}</p>}
  </div>
);

/* ── Section card ────────────────────────────────────────────────────────── */
const accentColors = {
  slate:  "bg-slate-700", blue: "bg-blue-600", emerald: "bg-emerald-600",
  amber:  "bg-amber-500", violet: "bg-violet-600", indigo: "bg-indigo-600",
};
const SectionCard = ({ iconEl, title, accent = "slate", children, overflow = false, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${overflow ? "overflow-hidden" : ""} ${className}`}>
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 rounded-t-xl">
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[13px] text-white ${accentColors[accent]}`}>
        {iconEl}
      </span>
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ── Searchable Select ───────────────────────────────────────────────────── */
const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search...", disabled = false, isLoading = false, renderOption }) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen(o => !o); setSearch(""); } }}
        className={`${inputCls} flex items-center justify-between text-left ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`truncate ${selected ? "text-gray-800 dark:text-white" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        {isLoading
          ? <span className="shrink-0 ml-1 w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          : <FiChevronDown className={`text-gray-400 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {open && !disabled && (
        <div className="absolute z-[200] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search..."
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="overflow-y-auto">
            {isLoading ? (
              <p className="text-xs text-gray-400 px-3 py-2 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin inline-block" />
                Loading...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2">No results</p>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    o.value === value ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  {renderOption ? renderOption(o) : (
                    <span className={`text-sm ${o.value === value ? "text-blue-700 dark:text-blue-300 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                      {o.label}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const CreateVoucher = ({ onclose, onSuccess }) => {

  const [voucherType, setVoucherType] = useState("PV");
  const isPV = voucherType === "PV";

  const [txMode,           setTxMode]           = useState("cash");
  const [supplierType,     setSupplierType]      = useState("Vendor");
  const [selectedTenderId, setSelectedTenderId]  = useState("");
  const [selectedTenderRef,setSelectedTenderRef] = useState("");
  const [selectedTenderName,setSelectedTenderName]=useState("");
  const [selectedSupplierId,setSelectedSupplierId]=useState("");

  /* ── Bank selection ── */
  const [selectedBankId,   setSelectedBankId]    = useState("");
  const [selectedBankName, setSelectedBankName]  = useState("");
  const [selectedBankCode, setSelectedBankCode]  = useState("");

  /* ── PV: single bill selection ── */
  const [selectedBill, setSelectedBill]   = useState(null);
  const [settledAmt,   setSettledAmt]     = useState("");

  /* ── Voucher entries (fixed 2 rows) ── */
  const [entries, setEntries] = useState(makeEntries());

  const saveStatusRef = useRef("pending");

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      doc_no: "", doc_date: "", bank_ref: "",
      cheque_no: "", cheque_date: "", amount: "", against_no: "", narration: "",
      tds_section: "", tds_pct: "",
    },
  });

  /* ── Data hooks ── */
  const { data: nextPVNo } = useNextPVNo();
  const { data: nextRVNo } = useNextRVNo();
  const { data: tendersRaw    = [], isLoading: loadingTenders  } = useTenderIds();
  const { data: bankAccountsRaw=[], isLoading: loadingBanks    } = useBankAccounts();
  const { data: partiesRaw    = [], isLoading: loadingParties  } = useParties(
    selectedTenderId, supplierType.toLowerCase()
  );
  const { data: payableBillsRaw=[], isLoading: loadingBills    } = usePayableBills(
    isPV && selectedSupplierId
      ? { supplier_id: selectedSupplierId, supplier_type: supplierType }
      : {}
  );

  const createPV = useCreatePV({ onSuccess, onClose: onclose });
  const createRV = useCreateRV({ onSuccess, onClose: onclose });

  /* ── Auto-fill voucher number ── */
  useEffect(() => {
    if (isPV  && nextPVNo) setValue("doc_no", nextPVNo, { shouldDirty: false });
  }, [nextPVNo, isPV, setValue]);
  useEffect(() => {
    if (!isPV && nextRVNo) setValue("doc_no", nextRVNo, { shouldDirty: false });
  }, [nextRVNo, isPV, setValue]);

  /* ── Reset supplier + bill when tender or type changes ── */
  useEffect(() => {
    setSelectedSupplierId("");
    setSelectedBill(null);
    setSettledAmt("");
  }, [supplierType, selectedTenderId]);

  /* ── Reset bill when supplier changes ── */
  useEffect(() => {
    setSelectedBill(null);
    setSettledAmt("");
  }, [selectedSupplierId]);

  /* ── Auto-fill entry account names from selected supplier + bank ── */
  useEffect(() => {
    const supplierName = partiesRaw.find(p => p.id === selectedSupplierId)?.name || "";
    const bankName     = selectedBankName;
    // PV: Dr = Supplier, Cr = Bank  |  RV: Dr = Bank, Cr = Supplier
    const drName = isPV ? supplierName : bankName;
    const crName = isPV ? bankName     : supplierName;
    setEntries(prev => [
      { ...prev[0], account_name: drName },
      { ...prev[1], account_name: crName },
    ]);
  }, [selectedSupplierId, selectedBankName, isPV, partiesRaw]);

  /* ── Dropdown options ── */
  const tenderOptions = tendersRaw.map(t => ({
    value:       t.tender_id,
    label:       t.tender_project_name ? `${t.tender_id} – ${t.tender_project_name}` : t.tender_id,
    _id:         t._id || "",
    tender_name: t.tender_project_name || t.tender_id,
  }));

  const supplierOptions = partiesRaw.map(p => ({
    value: p.id,
    label: `${p.id} – ${p.name}`,
    name:  p.name,
  }));

  /* Bank options — rich display: account_name primary, bank + branch secondary */
  const bankOptions = bankAccountsRaw.map(b => ({
    value:            b.account_code,
    label:            b.account_name,
    account_code:     b.account_code,
    account_name:     b.account_name,
    account_category: b.account_category || "bank",
    bank_name:        b.bank_name        || "",
    branch_name:      b.branch_name      || "",
    location:         b.location         || "",
    custodian_name:   b.custodian_name   || "",
    balance:          b.current_balance  || 0,
  }));

  /* Bill option — one bill at a time */
  const billOptions = payableBillsRaw.map(b => ({
    value:       b._id,
    label:       b.bill_no,
    bill_type:   b.bill_type,
    bill_no:     b.bill_no,
    bill_amount: b.bill_amount  || 0,
    amount_paid: b.amount_paid  || 0,
    balance_due: b.balance_due  || 0,
    paid_status: b.paid_status  || "unpaid",
    due_date:    b.due_date     || null,
  }));


  /* ── Handlers ── */
  const handleTenderSelect = (option) => {
    setSelectedTenderId(option.value);
    setSelectedTenderRef(option._id || "");
    setSelectedTenderName(option.tender_name || "");
    setSelectedSupplierId("");
  };

  const handleBankSelect = (option) => {
    setSelectedBankId(option.value);
    setSelectedBankName(option.account_name);
    setSelectedBankCode(option.account_code);
  };

  const handleBillSelect = (option) => {
    setSelectedBill(option);
    setSettledAmt(String(option.balance_due));
  };

  const handleVoucherTypeChange = (type) => {
    if (type === voucherType) return;
    setVoucherType(type);
    setSelectedTenderId(""); setSelectedTenderRef(""); setSelectedTenderName("");
    setSelectedSupplierId("");
    setSelectedBankId(""); setSelectedBankName(""); setSelectedBankCode("");
    setSelectedBill(null); setSettledAmt("");
    setTxMode("cash");
    setEntries(makeEntries());
    reset({ doc_no: "", doc_date: "", bank_ref: "", cheque_no: "", cheque_date: "", amount: "", against_no: "", narration: "", tds_section: "", tds_pct: "" });
  };

  /* ── Entry helpers ── */
  const updateEntry = (idx, field, val) =>
    setEntries(prev => prev.map((e, i) => {
      if (i !== idx) return e;
      const updated = { ...e, [field]: val };
      if (field === "dr_cr") {
        updated.debit_amt  = val === "Dr" ? e.debit_amt  : "";
        updated.credit_amt = val === "Cr" ? e.credit_amt : "";
      }
      return updated;
    }));

  const totalDr  = entries.reduce((s, e) => s + (parseFloat(e.debit_amt)  || 0), 0);
  const totalCr  = entries.reduce((s, e) => s + (parseFloat(e.credit_amt) || 0), 0);
  const balanced = Math.abs(totalDr - totalCr) < 0.005;

  /* ── Auto-fill amount from voucher entries ── */
  useEffect(() => {
    setValue("amount", totalDr > 0 ? parseFloat(totalDr.toFixed(2)) : "", { shouldValidate: false });
  }, [totalDr, setValue]);

  /* ── Submit ── */
  const onSubmit = (data) => {
    if (!selectedTenderId)    { toast.warning("Please select a tender");   return; }
    if (!selectedSupplierId)  { toast.warning("Please select a supplier");  return; }
    const validEntries = entries.filter(e => e.account_name.trim());
    if (validEntries.length === 0) { toast.warning("Add at least one voucher entry"); return; }

    const commonPayload = {
      supplier_type:    supplierType,
      supplier_id:      selectedSupplierId,
      tender_id:        selectedTenderId,
      tender_ref:       selectedTenderRef   || undefined,
      tender_name:      selectedTenderName  || undefined,
      bank_account_code: selectedBankCode   || undefined,
      bank_name:        selectedBankName    || undefined,
      bank_ref:         data.bank_ref       || undefined,
      cheque_no:     txMode === "cheque" ? (data.cheque_no   || undefined) : undefined,
      cheque_date:   txMode === "cheque" ? (data.cheque_date || undefined) : undefined,
      entries: validEntries.map(e => ({
        dr_cr:        e.dr_cr,
        account_name: e.account_name,
        debit_amt:    parseFloat(e.debit_amt)  || 0,
        credit_amt:   parseFloat(e.credit_amt) || 0,
      })),
      narration: data.narration || undefined,
      status:    saveStatusRef.current,
    };

    if (isPV) {
      createPV.mutate({
        pv_no:        data.doc_no,
        pv_date:      data.doc_date,
        payment_mode: txMode,
        gross_amount: Number(data.amount),
        amount:       Number(data.amount),
        tds_section:  data.tds_section || undefined,
        tds_pct:      data.tds_pct != null && data.tds_pct !== "" ? Number(data.tds_pct) : 0,
        bill_refs: selectedBill
          ? [{ bill_type: selectedBill.bill_type, bill_ref: selectedBill.value, bill_no: selectedBill.bill_no, settled_amt: parseFloat(settledAmt) || 0 }]
          : [],
        ...commonPayload,
      });
    } else {
      createRV.mutate({
        rv_no:        data.doc_no,
        rv_date:      data.doc_date,
        receipt_mode: txMode,
        amount:       Number(data.amount),
        against_no:   data.against_no || undefined,
        ...commonPayload,
      });
    }
  };

  const isSaving = createPV.isPending || createRV.isPending;
  const theme = isPV
    ? { accent: "blue",    saveBg: "bg-blue-600 hover:bg-blue-700"       }
    : { accent: "emerald", saveBg: "bg-emerald-600 hover:bg-emerald-700" };

  /* ── Bank option renderer ── */
  const renderBankOption = (o) => (
    <div className="py-0.5">
      <div className="flex items-center gap-1.5">
        <p className={`text-sm font-semibold ${o.value === selectedBankId ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200"}`}>
          {o.account_name}
        </p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
          o.account_category === "cash"
            ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        }`}>
          {o.account_category === "cash" ? "CASH" : "BANK"}
        </span>
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[10px] text-gray-400">
          {o.account_category === "cash"
            ? [o.custodian_name, o.location].filter(Boolean).join(" · ")
            : [o.bank_name, o.branch_name].filter(Boolean).join(" · ")}
        </span>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(o.balance)}</span>
      </div>
    </div>
  );


  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-gray-950 font-layout-font overflow-hidden">

      {/* ══ Top bar ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-slate-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-b border-slate-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPV ? "bg-blue-500/20" : "bg-emerald-500/20"}`}>
            {isPV ? <FiArrowUpRight className="text-blue-400 text-base" /> : <FiArrowDownLeft className="text-emerald-400 text-base" />}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {isPV ? "PAYMENT VOUCHER" : "RECEIPT VOUCHER"} — NEW ENTRY
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isPV
                ? "Outgoing payment to a supplier — settles purchase bill or weekly billing"
                : "Incoming receipt from a supplier — advance refund, deposit return, overpayment"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-700/60 rounded-lg p-1 gap-1">
            {[["PV", "Payment Voucher"], ["RV", "Receipt Voucher"]].map(([type, label]) => (
              <button key={type} type="button" onClick={() => handleVoucherTypeChange(type)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  voucherType === type
                    ? `${type === "PV" ? "bg-blue-500" : "bg-emerald-500"} text-white shadow`
                    : "text-slate-400 hover:text-white"
                }`}
              >{label}</button>
            ))}
          </div>
          <button type="button" onClick={onclose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <IoClose size={18} />
          </button>
        </div>
      </div>

      {/* ══ Scrollable body ══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-4">

          {/* ── Row 1: Voucher Identity | Party Details ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Voucher Identity */}
            <SectionCard iconEl={<FiFileText />} title="Voucher Identity" accent="slate">
              <div className="grid grid-cols-2 gap-3">
                <Field label={isPV ? "PV No." : "RV No."} required error={errors.doc_no}>
                  <input type="text" {...register("doc_no")} readOnly className={readonlyCls} placeholder="Auto-generated..." />
                </Field>

                <Field label="Date" required error={errors.doc_date}>
                  <input type="date" {...register("doc_date")} className={inputCls} />
                </Field>

                <Field label={isPV ? "Payment Mode" : "Receipt Mode"} required>
                  <div className="flex flex-wrap gap-1.5">
                    {PAYMENT_MODES.map(mode => (
                      <button key={mode.value} type="button" onClick={() => setTxMode(mode.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          txMode === mode.value
                            ? isPV ? "bg-blue-600 border-blue-600 text-white" : "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400"
                        }`}
                      >{mode.label}</button>
                    ))}
                  </div>
                </Field>

                {!isPV && (
                  <Field label="Against Document No." error={errors.against_no}>
                    <input type="text" {...register("against_no")} className={inputCls} placeholder="e.g. ADV/25-26/0001" />
                  </Field>
                )}
              </div>
            </SectionCard>

            {/* Party Details */}
            <SectionCard iconEl={<FiUser />} title="Party Details" accent="blue">
              <div className="space-y-3">
                <Field label="Supplier Type" required>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1 w-fit">
                    {["Vendor", "Contractor", "Client"].map(type => (
                      <button key={type} type="button" onClick={() => setSupplierType(type)}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          supplierType === type
                            ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >{type}</button>
                    ))}
                  </div>
                </Field>

                <Field label="Project / Tender" required>
                  <SearchableSelect
                    options={tenderOptions} value={selectedTenderId}
                    onChange={handleTenderSelect} placeholder="Select tender..."
                    isLoading={loadingTenders}
                  />
                </Field>

                <Field label={supplierType} required>
                  <SearchableSelect
                    options={supplierOptions} value={selectedSupplierId}
                    onChange={o => setSelectedSupplierId(o.value)}
                    placeholder={selectedTenderId ? `Select ${supplierType.toLowerCase()}...` : "Select a tender first"}
                    disabled={!selectedTenderId} isLoading={loadingParties}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* ── Row 2: Payment Instrument | Amount & Narration ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Payment Instrument */}
            <SectionCard iconEl={<FiCreditCard />} title="Payment Instrument" accent={theme.accent}>
              <div className="space-y-3">

                {/* Bank Account — rich dropdown showing bank, branch, balance */}
                <Field label="Bank / Cash Account">
                  <SearchableSelect
                    options={bankOptions} value={selectedBankId}
                    onChange={handleBankSelect}
                    placeholder="Select bank account..."
                    isLoading={loadingBanks}
                    renderOption={renderBankOption}
                  />
                  {/* Selected bank/cash detail pill */}
                  {selectedBankId && (() => {
                    const b = bankOptions.find(x => x.value === selectedBankId);
                    const isCash = b?.account_category === "cash";
                    return b ? (
                      <div className={`mt-1.5 flex items-center justify-between px-3 py-2 rounded-lg border ${
                        isCash
                          ? "bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                      }`}>
                        <div>
                          <p className={`text-xs font-bold ${isCash ? "text-teal-700 dark:text-teal-300" : "text-blue-700 dark:text-blue-300"}`}>
                            {b.account_name}
                          </p>
                          {isCash
                            ? [b.custodian_name, b.location].filter(Boolean).length > 0 && (
                                <p className="text-[10px] text-teal-500 dark:text-teal-400">
                                  {[b.custodian_name, b.location].filter(Boolean).join(" · ")}
                                </p>
                              )
                            : (b.bank_name || b.branch_name) && (
                                <p className="text-[10px] text-blue-500 dark:text-blue-400">
                                  {[b.bank_name, b.branch_name].filter(Boolean).join(" · ")}
                                </p>
                              )
                          }
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Balance</p>
                          <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">₹{fmt(b.balance)}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="UTR / Transaction Ref." error={errors.bank_ref}>
                    <input type="text" {...register("bank_ref")} className={inputCls}
                      placeholder={txMode === "cheque" ? "Cheque number" : "UTR reference"} />
                  </Field>

                  {txMode === "cheque" ? (
                    <>
                      <Field label="Cheque No." error={errors.cheque_no}>
                        <input type="text" {...register("cheque_no")} className={inputCls} placeholder="e.g. 000123" />
                      </Field>
                      <div className="col-span-2">
                        <Field label="Cheque Date" error={errors.cheque_date}>
                          <input type="date" {...register("cheque_date")} className={inputCls} />
                        </Field>
                      </div>
                    </>
                  ) : <div />}
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isPV
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800"
                }`}>
                  {isPV ? <FiArrowUpRight size={13} /> : <FiArrowDownLeft size={13} />}
                  {isPV ? "Payment going out via" : "Receipt coming in via"} <strong>{txMode}</strong>
                </div>
              </div>
            </SectionCard>

            {/* Amount & Narration */}
            <SectionCard iconEl={<FiFileText />} title="Amount & Narration" accent="amber">
              <div className="space-y-3">
                <Field label={isPV ? "Gross Amount" : "Amount"} required error={errors.amount}>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-semibold">₹</span>
                    <input type="number" {...register("amount")} readOnly
                      className={`${readonlyCls} pl-7`} placeholder="Auto-filled from entries" />
                  </div>
                </Field>

                {isPV && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="TDS Section" error={errors.tds_section}>
                      <select {...register("tds_section")} className={inputCls}>
                        {TDS_SECTIONS.map(s => <option key={s || "none"} value={s}>{s || "— None —"}</option>)}
                      </select>
                    </Field>
                    <Field label="TDS %" error={errors.tds_pct}>
                      <div className="relative">
                        <input type="number" step="0.01" min="0" max="100" {...register("tds_pct")}
                          className={`${inputCls} pr-8`} placeholder="e.g. 2" />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">%</span>
                      </div>
                    </Field>
                  </div>
                )}

                <Field label="Narration" error={errors.narration}>
                  <textarea {...register("narration")} rows={isPV ? 2 : 4}
                    className={`${inputCls} resize-none`}
                    placeholder={isPV
                      ? "e.g. Net payment after CN and DN deductions — PB/25-26/0001"
                      : "e.g. Advance refund — excess amount returned by vendor"}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* ── PV only: Bill Being Settled (single selection) ───────────── */}
          {isPV && (
            <SectionCard iconEl={<FiList />} title="Bill Being Settled" accent="indigo">
              {!selectedSupplierId ? (
                <p className="text-xs text-gray-400 italic">Select a supplier above to load payable bills.</p>
              ) : (
                <div className="space-y-3">
                  <Field label="Select Bill">
                    <SearchableSelect
                      options={billOptions}
                      value={selectedBill?.value || ""}
                      onChange={handleBillSelect}
                      placeholder={loadingBills ? "Loading bills..." : billOptions.length === 0 ? "No unpaid bills found" : "Search and select a bill..."}
                      isLoading={loadingBills}
                      disabled={billOptions.length === 0 && !loadingBills}
                    />
                  </Field>

                  {/* Selected bill detail card */}
                  {selectedBill && (
                    <div className="rounded-xl border border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/60 dark:bg-indigo-900/10 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {selectedBill.bill_no}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              selectedBill.bill_type === "WeeklyBilling"
                                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400"
                                : "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                            }`}>
                              {selectedBill.bill_type === "WeeklyBilling" ? "Weekly Billing" : "Purchase Bill"}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              selectedBill.paid_status === "partial"
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}>
                              {selectedBill.paid_status}
                            </span>
                          </div>
                          <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
                            <span>Bill Total: <strong className="text-gray-700 dark:text-gray-200">₹{fmt(selectedBill.bill_amount)}</strong></span>
                            <span>Already Paid: <strong className="text-emerald-600 dark:text-emerald-400">₹{fmt(selectedBill.amount_paid)}</strong></span>
                            <span>Balance Due: <strong className="text-red-600 dark:text-red-400">₹{fmt(selectedBill.balance_due)}</strong></span>
                          </div>
                        </div>

                        <button type="button" onClick={() => { setSelectedBill(null); setSettledAmt(""); }}
                          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors text-xs underline">
                          Clear
                        </button>
                      </div>

                      {/* Settled amount input */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-56">
                          <Field label="Settling Amount (₹)">
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-semibold">₹</span>
                              <input
                                type="number" step="0.01" min="0"
                                value={settledAmt}
                                onChange={e => setSettledAmt(e.target.value)}
                                className={`${inputCls} pl-6`}
                                placeholder="0.00"
                              />
                            </div>
                          </Field>
                        </div>
                        {settledAmt && parseFloat(settledAmt) > 0 && (
                          <div className={`flex items-center gap-1.5 text-xs font-semibold mt-4 ${
                            parseFloat(settledAmt) >= selectedBill.balance_due
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}>
                            {parseFloat(settledAmt) >= selectedBill.balance_due
                              ? <><FiCheckCircle size={13} /> Full settlement</>
                              : <><FiAlertCircle size={13} /> Partial — ₹{fmt(selectedBill.balance_due - parseFloat(settledAmt))} remaining</>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!selectedBill && billOptions.length === 0 && !loadingBills && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                      No unpaid / partially-paid bills found for this supplier. You can still create an on-account payment without linking a bill.
                    </p>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Voucher Entries (fixed 2 rows: Dr + Cr, auto-filled accounts) ── */}
          <SectionCard iconEl={<FiList />} title="Voucher Entries" accent="violet" overflow>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Dr / Cr", "Account Name", "Debit (₹)", "Credit (₹)"].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {entries.map((entry, i) => (
                    <tr key={i}>
                      {/* Dr / Cr badge — fixed, not toggleable */}
                      <td className="px-3 py-2.5 w-20">
                        <span className={`inline-flex items-center justify-center w-9 py-1.5 rounded-md text-xs font-bold ${
                          entry.dr_cr === "Dr"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        }`}>
                          {entry.dr_cr}
                        </span>
                      </td>

                      {/* Account Name — auto-filled, read-only */}
                      <td className="px-3 py-2.5">
                        <div className={`${readonlyCls} flex items-center gap-2`}>
                          {entry.account_name
                            ? <span className="text-gray-700 dark:text-gray-200 font-medium">{entry.account_name}</span>
                            : <span className="text-gray-400 italic text-xs">
                                {i === 0
                                  ? isPV ? "Auto-filled from selected supplier" : "Auto-filled from selected bank"
                                  : isPV ? "Auto-filled from selected bank"     : "Auto-filled from selected supplier"
                                }
                              </span>
                          }
                        </div>
                      </td>

                      {/* Debit */}
                      <td className="px-3 py-2.5 w-44">
                        <input type="number" step="0.01" min="0"
                          value={entry.debit_amt}
                          onChange={e => updateEntry(i, "debit_amt", e.target.value)}
                          disabled={entry.dr_cr === "Cr"}
                          className={entry.dr_cr === "Cr" ? readonlyCls : inputCls}
                          placeholder="0.00"
                        />
                      </td>

                      {/* Credit */}
                      <td className="px-3 py-2.5 w-44">
                        <input type="number" step="0.01" min="0"
                          value={entry.credit_amt}
                          onChange={e => updateEntry(i, "credit_amt", e.target.value)}
                          disabled={entry.dr_cr === "Dr"}
                          className={entry.dr_cr === "Dr" ? readonlyCls : inputCls}
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Balance footer */}
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-5">
                <span className="text-xs text-gray-400">
                  Total Dr: <strong className="text-red-600 dark:text-red-400 tabular-nums">{totalDr.toFixed(2)}</strong>
                </span>
                <span className="text-xs text-gray-400">
                  Total Cr: <strong className="text-blue-600 dark:text-blue-400 tabular-nums">{totalCr.toFixed(2)}</strong>
                </span>
                {(totalDr > 0 || totalCr > 0) && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    balanced
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                  }`}>
                    {balanced ? "✓ Balanced" : `Diff: ${Math.abs(totalDr - totalCr).toFixed(2)}`}
                  </span>
                )}
              </div>
            </div>

            {/* Ledger hint */}
            <div className="mt-4 mx-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Expected Ledger Effect</p>
              {isPV ? (
                <div className="text-xs space-y-0.5 font-mono">
                  <div className="flex gap-6"><span className="text-red-500 font-semibold w-5">Dr</span><span className="text-gray-600 dark:text-gray-300">Supplier A/c</span><span className="text-gray-400 ml-auto">← liability cleared</span></div>
                  <div className="flex gap-6"><span className="text-blue-500 font-semibold w-5">Cr</span><span className="text-gray-600 dark:text-gray-300">Bank / Cash A/c</span><span className="text-gray-400 ml-auto">← money leaves</span></div>
                </div>
              ) : (
                <div className="text-xs space-y-0.5 font-mono">
                  <div className="flex gap-6"><span className="text-red-500 font-semibold w-5">Dr</span><span className="text-gray-600 dark:text-gray-300">Bank / Cash A/c</span><span className="text-gray-400 ml-auto">← money arrives</span></div>
                  <div className="flex gap-6"><span className="text-blue-500 font-semibold w-5">Cr</span><span className="text-gray-600 dark:text-gray-300">Supplier A/c</span><span className="text-gray-400 ml-auto">← reduces advance</span></div>
                </div>
              )}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ══ Footer bar ═══════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-400">
          {isPV ? "Payment Voucher — Dr Supplier A/c, Cr Bank A/c" : "Receipt Voucher — Dr Bank A/c, Cr Supplier A/c"}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onclose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>

          <button type="button" disabled={isSaving}
            onClick={() => { saveStatusRef.current = "draft"; handleSubmit(onSubmit)(); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
            Save as Draft
          </button>

          <button type="button" disabled={isSaving}
            onClick={() => { saveStatusRef.current = "pending"; handleSubmit(onSubmit)(); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 ${theme.saveBg}`}>
            {isSaving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><FiSave size={14} /> Save as Pending</>
            }
          </button>
        </div>
      </div>

    </div>
  );
};

export default CreateVoucher;
