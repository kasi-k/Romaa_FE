import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiSave, FiFileText, FiUser, FiSettings,
  FiList, FiChevronDown, FiPlus, FiTrash2, FiDollarSign,
  FiCheckCircle, FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  useTenderIds, useVendors, useContractors,
  useNextCNNo, useNextDNNo,
  useCreateCN, useCreateDN,
  usePayableBills, useMaterials,
} from "./hooks/useDebitCreditNote";

/* ── Schema ─────────────────────────────────────────────────────────────── */
// yup v1 no longer coerces "" → undefined for number fields, so we do it manually.
const numField = () =>
  yup.number().transform((val, orig) => (orig === "" ? undefined : val));

const schema = yup.object().shape({
  doc_no:         yup.string().required("Note number is required"),
  doc_date:       yup.string().required("Date is required"),
  bill_no:        yup.string().nullable(),
  reference_no:   yup.string().nullable(),
  reference_date: yup.string().nullable(),
  location:       yup.string().nullable(),
  amount:         numField().typeError("Must be a number").positive("Must be positive").required("Amount is required"),
  service_amt:    numField().typeError("Must be a number").min(0).nullable().optional(),
  narration:      yup.string().nullable(),
});

/* ── Constants ───────────────────────────────────────────────────────────── */
/* spec §5: adj_type = "Against Bill" | "Standalone"; tax_type = "GST" | "Non-GST"; sales_type = "Local" | "Interstate" */
const ADJ_TYPES   = ["Against Bill", "Standalone"];
const TAX_TYPES   = ["GST", "Non-GST"];
const SALES_TYPES = ["Local", "Interstate"];
const RAISED_BY   = ["Company", "Vendor"]; /* Debit Note only */

const emptyEntry     = () => ({ dr_cr: "Dr", account_name: "", debit_amt: "", credit_amt: "", entry_type: "material" });
const supplierEntry  = (isCN) => ({ dr_cr: isCN ? "Cr" : "Dr", account_name: "", debit_amt: "", credit_amt: "", entry_type: "supplier" });

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

/* ── Shared class strings ───────────────────────────────────────────────── */
const inputCls    = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400";
const readonlyCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 dark:text-gray-400 text-gray-500 cursor-default";
const selectCls   = `${inputCls} appearance-none cursor-pointer`;

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
const accentBar = {
  slate:  "bg-slate-700",
  blue:   "bg-blue-600",
  teal:   "bg-teal-600",
  amber:  "bg-amber-600",
  violet: "bg-violet-600",
};
const SectionCard = ({ iconEl, title, accent = "slate", children, overflow = false, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${overflow ? "overflow-hidden" : ""} ${className}`}>
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 rounded-t-xl">
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[13px] text-white ${accentBar[accent] || accentBar.slate}`}>
        {iconEl}
      </span>
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ── Searchable Select ───────────────────────────────────────────────────── */
const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search...", disabled = false, isLoading = false }) => {
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
          ? <span className="shrink-0 ml-1 w-3.5 h-3.5 border-2 border-gray-300 border-t-slate-500 rounded-full animate-spin" />
          : <FiChevronDown className={`text-gray-400 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {open && !disabled && (
        <div className="absolute z-[200] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-56 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search..."
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="overflow-y-auto">
            {isLoading ? (
              <p className="text-xs text-gray-400 px-3 py-2 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-slate-500 rounded-full animate-spin inline-block" />
                Loading...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2">No results</p>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/20 ${
                    o.value === value
                      ? "bg-slate-50 dark:bg-slate-900/20 text-slate-700 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {o.label}
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
const CreateDebitCreditNote = ({ onclose, onSuccess }) => {

  /* ── Note type toggle ── */
  const [noteType, setNoteType] = useState("CN"); // "CN" | "DN"
  const isCN = noteType === "CN";

  /* ── Supplier type ── */
  const [supplierType, setSupplierType] = useState("Vendor");

  /* ── Tender / Supplier selections ── */
  const [selectedTenderId,   setSelectedTenderId]   = useState("");
  const [selectedTenderRef,  setSelectedTenderRef]  = useState("");
  const [selectedTenderName, setSelectedTenderName] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  /* ── Voucher config ── */
  const [adjType,   setAdjType]   = useState("Against Bill");
  const [taxType,    setTaxType]    = useState("GST");
  const [gstPercent, setGstPercent] = useState("");
  const [salesType, setSalesType] = useState("Local");
  const [revCharge, setRevCharge] = useState(false);
  const [raisedBy,  setRaisedBy]  = useState("Company"); /* DN only: "Company" | "Vendor" */

  /* ── Bill selection ── */
  const [selectedBill, setSelectedBill] = useState(null);

  /* ── Dr/Cr entries ── */
  const [entries, setEntries] = useState([supplierEntry(true), emptyEntry()]);

  /* ── Supplier display label (for auto-fill) ── */
  const [selectedSupplierLabel, setSelectedSupplierLabel] = useState("");

  /* ── Save status ref (draft vs pending) ── */
  const saveStatusRef = useRef("pending");

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      doc_no: "", doc_date: "", bill_no: "",
      reference_no: "", reference_date: "",
      location: "", amount: "", service_amt: "", narration: "",
    },
  });

  /* ── Data hooks ── */
  const { data: nextCNNo } = useNextCNNo();
  const { data: nextDNNo } = useNextDNNo();
  const { data: tendersRaw = [],     isLoading: loadingTenders     } = useTenderIds();
  const { data: vendorsRaw = [],     isLoading: loadingVendors     } = useVendors(supplierType === "Vendor" ? selectedTenderId : null);
  const { data: contractorsRaw = [], isLoading: loadingContractors } = useContractors(supplierType === "Contractor" ? selectedTenderId : null);

  const { data: materialsRaw = [], isLoading: loadingMaterials } = useMaterials(selectedTenderId);
  const materialOptions = materialsRaw.map(m => ({ value: m.description, label: m.description }));

  const { data: payableBillsRaw = [], isLoading: loadingBills } = usePayableBills(
    selectedSupplierId
      ? { supplier_id: selectedSupplierId, supplier_type: supplierType, tender_id: selectedTenderId }
      : {}
  );

  const createCN = useCreateCN({ onSuccess, onClose: onclose });
  const createDN = useCreateDN({ onSuccess, onClose: onclose });

  /* ── Auto-fill doc number ── */
  useEffect(() => {
    if (isCN && nextCNNo) setValue("doc_no", nextCNNo, { shouldDirty: false });
  }, [nextCNNo, isCN, setValue]);

  useEffect(() => {
    if (!isCN && nextDNNo) setValue("doc_no", nextDNNo, { shouldDirty: false });
  }, [nextDNNo, isCN, setValue]);

  /* ── Reset supplier + bill when tender or supplier type changes ── */
  useEffect(() => {
    setSelectedSupplierId("");
    setSelectedSupplierLabel("");
    setSelectedBill(null);
    setValue("bill_no", "");
  }, [supplierType, selectedTenderId, setValue]);

  /* ── Auto-fill supplier entry when supplier label changes ── */
  useEffect(() => {
    setEntries(prev => prev.map(e =>
      e.entry_type === "supplier" ? { ...e, account_name: selectedSupplierLabel } : e
    ));
  }, [selectedSupplierLabel]);

  /* ── Reset bill when supplier changes ── */
  useEffect(() => {
    setSelectedBill(null);
    setValue("bill_no", "");
  }, [selectedSupplierId, setValue]);

  /* ── Dropdown options ── */
  const tenderOptions = tendersRaw.map(t => ({
    value:       t.tender_id,
    label:       t.tender_project_name ? `${t.tender_id} – ${t.tender_project_name}` : t.tender_id,
    _id:         t._id || "",
    tender_name: t.tender_project_name || t.tender_id,
    location:    [t.tender_location?.city, t.tender_location?.state].filter(Boolean).join(", "),
  }));

  const supplierOptions = (supplierType === "Vendor" ? vendorsRaw : contractorsRaw).map(s => ({
    value: s.vendor_id || s.contractor_id || s.id || "",
    label: `${s.vendor_id || s.contractor_id || s.id || ""} – ${s.vendor_name || s.contractor_name || s.name || ""}`,
  }));

  const isLoadingSuppliers = supplierType === "Vendor" ? loadingVendors : loadingContractors;

  const billOptions = payableBillsRaw.map(b => ({
    value:       b._id,
    bill_no:     b.bill_no,
    bill_type:   b.bill_type,
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
    setValue("location", option.location || "", { shouldDirty: true });
  };

  const handleNoteTypeChange = (type) => {
    if (type === noteType) return;
    setNoteType(type);
    setSelectedTenderId("");
    setSelectedTenderRef("");
    setSelectedTenderName("");
    setSelectedSupplierId("");
    setSelectedBill(null);
    setSelectedSupplierLabel("");
    setEntries([supplierEntry(type === "CN"), emptyEntry()]);
    setAdjType("Against Bill");
    setTaxType("GST");
    setGstPercent("");
    setSalesType("Local");
    setRevCharge(false);
    reset({
      doc_no: "", doc_date: "", bill_no: "",
      reference_no: "", reference_date: "",
      location: "", amount: "", service_amt: "", narration: "",
    });
  };

  /* ── Entry row helpers ── */
  const addEntry    = () => setEntries(prev => [...prev, emptyEntry()]);
  const removeEntry = (idx) => setEntries(prev => prev.filter((_, i) => i !== idx || prev[i].entry_type === "supplier"));
  const updateEntry = (idx, field, val) =>
    setEntries(prev => prev.map((e, i) => {
      if (i !== idx) return e;
      // lock supplier entry dr_cr — it's determined by note type
      if (field === "dr_cr" && e.entry_type === "supplier") return e;
      const updated = { ...e, [field]: val };
      // auto-clear opposite amount when switching Dr/Cr
      if (field === "dr_cr") {
        updated.debit_amt  = val === "Dr" ? e.debit_amt  : "";
        updated.credit_amt = val === "Cr" ? e.credit_amt : "";
      }
      return updated;
    }));

  /* ── Entry totals ── */
  const totalDr   = entries.reduce((s, e) => s + (parseFloat(e.debit_amt)  || 0), 0);
  const totalCr   = entries.reduce((s, e) => s + (parseFloat(e.credit_amt) || 0), 0);
  const diff      = parseFloat(Math.abs(totalDr - totalCr).toFixed(2));
  const balanced  = diff < 0.005;
  const roundOff  = !balanced && diff <= 1;

  /* ── Auto-fill amount from voucher entries (+ GST if applicable) ── */
  useEffect(() => {
    if (totalDr <= 0) { setValue("amount", "", { shouldValidate: false }); return; }
    const gst = taxType === "GST" && Number(gstPercent) > 0
      ? parseFloat((totalDr * Number(gstPercent) / 100).toFixed(2))
      : 0;
    setValue("amount", parseFloat((totalDr + gst).toFixed(2)), { shouldValidate: false });
  }, [totalDr, taxType, gstPercent, setValue]);

  /* ── Submit ── */
  const onSubmit = (data) => {
    if (!selectedTenderId)   { toast.warning("Please select a tender");   return; }
    if (!selectedSupplierId) { toast.warning("Please select a supplier");  return; }
    const validEntries = entries.filter(e => e.account_name.trim());
    if (validEntries.length === 0) { toast.warning("Add at least one voucher entry"); return; }
    if (!balanced && !roundOff)   { toast.warning("Voucher entries are not balanced (difference exceeds ₹1)"); return; }

    const payload = {
      reference_no:   data.reference_no   || undefined,
      reference_date: data.reference_date || undefined,
      location:       data.location       || undefined,
      sales_type:     salesType,
      adj_type:       adjType,
      tax_type:       taxType,
      gst_percent:    taxType === "GST" && gstPercent !== "" ? Number(gstPercent) : undefined,
      rev_charge:     revCharge,
      supplier_type:  supplierType,
      supplier_id:    selectedSupplierId,
      tender_id:      selectedTenderId,
      tender_ref:     selectedTenderRef  || undefined,
      tender_name:    selectedTenderName || undefined,
      bill_no:        data.bill_no       || undefined,
      round_off:      roundOff ? (totalDr > totalCr ? diff : -diff) : 0,
      amount:         Number(data.amount),
      entries:        validEntries.map(e => ({
        dr_cr:        e.dr_cr,
        account_name: e.account_name,
        debit_amt:    parseFloat(e.debit_amt)  || 0,
        credit_amt:   parseFloat(e.credit_amt) || 0,
      })),
      narration: data.narration || undefined,
      status:    saveStatusRef.current,
    };

    if (isCN) {
      createCN.mutate({ cn_no: data.doc_no, cn_date: data.doc_date, ...payload });
    } else {
      createDN.mutate({
        dn_no:       data.doc_no,
        dn_date:     data.doc_date,
        service_amt: data.service_amt != null && data.service_amt !== "" ? Number(data.service_amt) : undefined,
        raised_by:   raisedBy,
        ...payload,
      });
    }
  };

  const isSaving = createCN.isPending || createDN.isPending;

  /* ── Active colour theme per note type ── */
  const theme = isCN
    ? { accent: "teal",   ring: "focus:ring-teal-400",   saveBg: "bg-teal-600 hover:bg-teal-700",   badge: "bg-teal-500" }
    : { accent: "violet", ring: "focus:ring-violet-400", saveBg: "bg-violet-600 hover:bg-violet-700", badge: "bg-violet-500" };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-gray-950 font-layout-font overflow-hidden">

      {/* ══ Top bar ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-slate-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-b border-slate-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <FiFileText className="text-white text-base" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {isCN ? "CREDIT NOTE" : "DEBIT NOTE"} — NEW ENTRY
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isCN
                ? "Reduces payable — material return, overbilling, post-invoice discount"
                : "Reduces payable — penalty, price difference, short supply, quality rejection"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ── Note type toggle ── */}
          <div className="flex bg-slate-700/60 rounded-lg p-1 gap-1">
            {[["CN", "Credit Note"], ["DN", "Debit Note"]].map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => handleNoteTypeChange(type)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  noteType === type
                    ? `${type === "CN" ? "bg-teal-500" : "bg-violet-500"} text-white shadow`
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
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

          {/* ── Row 1: Note Identity + Party Details ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Note Identity */}
            <SectionCard iconEl={<FiFileText />} title="Note Identity" accent="slate">
              <div className="grid grid-cols-2 gap-3">
                <Field label={isCN ? "CN No." : "DN No."} required error={errors.doc_no}>
                  <input
                    type="text"
                    {...register("doc_no")}
                    readOnly
                    className={readonlyCls}
                    placeholder="Auto-generated..."
                  />
                </Field>

                <Field label="Date" required error={errors.doc_date}>
                  <input type="date" {...register("doc_date")} className={inputCls} />
                </Field>

                <Field label="Reference No." error={errors.reference_no}>
                  <input
                    type="text"
                    {...register("reference_no")}
                    className={inputCls}
                    placeholder="Supplier's own ref no."
                  />
                </Field>

                <Field label="Reference Date" error={errors.reference_date}>
                  <input type="date" {...register("reference_date")} className={inputCls} />
                </Field>

                <Field label="Linked Bill No." error={errors.bill_no}>
                  <input
                    type="text"
                    {...register("bill_no")}
                    className={inputCls}
                    placeholder={supplierType === "Vendor" ? "e.g. PB/25-26/0001" : "e.g. WB/25-26/0001"}
                  />
                </Field>

                <Field label="Location" error={errors.location}>
                  <input
                    type="text"
                    {...register("location")}
                    className={inputCls}
                    placeholder="Branch / site"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* Party Details */}
            <SectionCard iconEl={<FiUser />} title="Party Details" accent="blue">
              <div className="space-y-3">

                {/* Supplier type pill toggle */}
                <Field label="Supplier Type" required>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1 w-fit">
                    {["Vendor", "Contractor"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSupplierType(type)}
                        className={`px-5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          supplierType === type
                            ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Project / Tender" required>
                  <SearchableSelect
                    options={tenderOptions}
                    value={selectedTenderId}
                    onChange={handleTenderSelect}
                    placeholder="Select tender..."
                    isLoading={loadingTenders}
                  />
                </Field>

                <Field label={supplierType} required>
                  <SearchableSelect
                    options={supplierOptions}
                    value={selectedSupplierId}
                    onChange={(o) => { setSelectedSupplierId(o.value); setSelectedSupplierLabel(o.label); }}
                    placeholder={selectedTenderId ? `Select ${supplierType.toLowerCase()}...` : "Select a tender first"}
                    disabled={!selectedTenderId}
                    isLoading={isLoadingSuppliers}
                  />
                </Field>

              </div>
            </SectionCard>
          </div>

          {/* ── Linked Bill (visible once supplier is selected) ─────────────── */}
          {selectedSupplierId && (
            <SectionCard iconEl={<FiList />} title="Linked Bill" accent="blue">
              <div className="space-y-3">
                <Field label="Select Bill">
                  <SearchableSelect
                    options={billOptions.map(b => ({
                      value: b.value,
                      label: b.bill_no,
                      ...b,
                    }))}
                    value={selectedBill?.value || ""}
                    onChange={(o) => {
                      setSelectedBill(o);
                      setValue("bill_no", o.bill_no, { shouldValidate: false });
                    }}
                    placeholder={
                      loadingBills
                        ? "Loading bills…"
                        : billOptions.length === 0
                        ? "No unpaid bills found for this supplier"
                        : "Search and select a bill…"
                    }
                    isLoading={loadingBills}
                    disabled={billOptions.length === 0 && !loadingBills}
                  />
                </Field>

                {/* Selected bill detail card */}
                {selectedBill && (
                  <div className="rounded-xl border border-blue-100 dark:border-blue-800/50 bg-blue-50/60 dark:bg-blue-900/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                            {selectedBill.bill_no}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            selectedBill.paid_status === "partial"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          }`}>
                            {selectedBill.paid_status === "partial" ? "PARTIAL" : "UNPAID"}
                          </span>
                        </div>
                        <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
                          <span>Bill Total: <strong className="text-gray-700 dark:text-gray-200">₹{fmt(selectedBill.bill_amount)}</strong></span>
                          <span>Paid: <strong className="text-emerald-600 dark:text-emerald-400">₹{fmt(selectedBill.amount_paid)}</strong></span>
                          <span>Balance Due: <strong className="text-red-600 dark:text-red-400">₹{fmt(selectedBill.balance_due)}</strong></span>
                        </div>
                        <p className="text-[11px] text-blue-500 dark:text-blue-400 flex items-center gap-1">
                          <FiCheckCircle size={11} />
                          This {isCN ? "credit note" : "debit note"} will be linked against this bill for reconciliation.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedBill(null); setValue("bill_no", ""); }}
                        className="shrink-0 text-gray-400 hover:text-red-500 transition-colors text-xs underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {!selectedBill && !loadingBills && billOptions.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 italic">
                    <FiAlertCircle size={12} />
                    No unpaid or partially-paid bills found for this supplier under the selected tender.
                  </p>
                )}
              </div>
            </SectionCard>
          )}

          {/* ── Row 2: Voucher Config + Amount & Narration ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Voucher Configuration */}
            <SectionCard iconEl={<FiSettings />} title="Voucher Configuration" accent="teal">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Adjustment Type">
                  <select value={adjType} onChange={e => setAdjType(e.target.value)} className={selectCls}>
                    {ADJ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="Tax Type">
                  <select value={taxType} onChange={e => { setTaxType(e.target.value); setGstPercent(""); }} className={selectCls}>
                    {TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                {taxType === "GST" && (
                  <Field label="GST %">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={gstPercent}
                        onChange={e => setGstPercent(e.target.value)}
                        className={`${inputCls} pr-8`}
                        placeholder="e.g. 18"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">%</span>
                    </div>
                  </Field>
                )}

                <Field label="Sales Type">
                  <select value={salesType} onChange={e => setSalesType(e.target.value)} className={selectCls}>
                    {SALES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="Reverse Charge">
                  <div className="flex items-center gap-3 h-9">
                    <button
                      type="button"
                      onClick={() => setRevCharge(v => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${revCharge ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${revCharge ? "left-6" : "left-1"}`} />
                    </button>
                    <span className={`text-xs font-medium ${revCharge ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}`}>
                      {revCharge ? "Applicable" : "Not applicable"}
                    </span>
                  </div>
                </Field>

                {!isCN && (
                  <Field label="Raised By">
                    <select value={raisedBy} onChange={e => setRaisedBy(e.target.value)} className={selectCls}>
                      {RAISED_BY.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                )}
              </div>
            </SectionCard>

            {/* Amount & Narration */}
            <SectionCard iconEl={<FiDollarSign />} title="Amount & Narration" accent="amber">
              <div className="space-y-3">
                <div className={`grid gap-3 ${!isCN ? "grid-cols-2" : "grid-cols-1"}`}>
                  <Field label="Total Amount" required error={errors.amount}>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-semibold">₹</span>
                      <input
                        type="number"
                        {...register("amount")}
                        readOnly
                        className={`${readonlyCls} pl-7`}
                        placeholder="Auto-filled from entries"
                      />
                    </div>
                  </Field>
                  {!isCN && (
                    <Field label="Service Amount" error={errors.service_amt}>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-semibold">₹</span>
                        <input
                          type="number" step="0.01" min="0"
                          {...register("service_amt")}
                          className={`${inputCls} pl-7`}
                          placeholder="Service portion (if any)"
                        />
                      </div>
                    </Field>
                  )}
                </div>

                <Field label="Narration" error={errors.narration}>
                  <textarea
                    {...register("narration")}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder={
                      isCN
                        ? "e.g. 3 bags cement returned — damaged on delivery"
                        : "e.g. Penalty for 5-day delay in supply @ ₹500/day"
                    }
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* ── Section: Voucher Entries ─────────────────────────────────────── */}
          <SectionCard iconEl={<FiList />} title="Voucher Entries" accent="violet" overflow>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Dr / Cr", "Account / Material", "Debit Amount", "Credit Amount", ""].map(h => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {entries.map((entry, i) => (
                    <tr key={i} className="group">

                      {/* Dr / Cr toggle */}
                      <td className="px-3 py-2.5 w-28">
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                          {["Dr", "Cr"].map(side => (
                            entry.entry_type === "supplier" ? (
                              <div
                                key={side}
                                className={`flex-1 py-1.5 rounded-md text-xs font-bold text-center ${
                                  entry.dr_cr === side
                                    ? side === "Dr" ? "bg-red-500 text-white shadow-sm" : "bg-blue-500 text-white shadow-sm"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              >
                                {side}
                              </div>
                            ) : (
                              <button
                                key={side}
                                type="button"
                                onClick={() => updateEntry(i, "dr_cr", side)}
                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                  entry.dr_cr === side
                                    ? side === "Dr" ? "bg-red-500 text-white shadow-sm" : "bg-blue-500 text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                }`}
                              >
                                {side}
                              </button>
                            )
                          ))}
                        </div>
                      </td>

                      {/* Account Name / Material dropdown */}
                      <td className="px-3 py-2.5">
                        {entry.entry_type === "supplier" ? (
                          <input
                            type="text"
                            value={entry.account_name}
                            readOnly
                            className={readonlyCls}
                            placeholder="Auto-filled from supplier selection…"
                          />
                        ) : (
                          <select
                            value={entry.account_name}
                            onChange={(e) => updateEntry(i, "account_name", e.target.value)}
                            disabled={!selectedTenderId || loadingMaterials}
                            className={selectCls}
                          >
                            <option value="">
                              {loadingMaterials ? "Loading materials…" : selectedTenderId ? "Select material…" : "Select tender first"}
                            </option>
                            {materialOptions.map(m => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Debit Amount */}
                      <td className="px-3 py-2.5 w-40">
                        <input
                          type="number" step="0.01" min="0"
                          value={entry.debit_amt}
                          onChange={e => updateEntry(i, "debit_amt", e.target.value)}
                          disabled={entry.dr_cr === "Cr"}
                          className={entry.dr_cr === "Cr" ? readonlyCls : inputCls}
                          placeholder="0.00"
                        />
                      </td>

                      {/* Credit Amount */}
                      <td className="px-3 py-2.5 w-40">
                        <input
                          type="number" step="0.01" min="0"
                          value={entry.credit_amt}
                          onChange={e => updateEntry(i, "credit_amt", e.target.value)}
                          disabled={entry.dr_cr === "Dr"}
                          className={entry.dr_cr === "Dr" ? readonlyCls : inputCls}
                          placeholder="0.00"
                        />
                      </td>

                      {/* Remove row */}
                      <td className="px-3 py-2.5 w-10">
                        {entry.entry_type !== "supplier" && (
                          <button
                            type="button"
                            onClick={() => removeEntry(i)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer: add row + Dr/Cr balance indicator */}
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addEntry}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <FiPlus size={13} /> Add Entry Row
                </button>

                <div className="flex items-center gap-5 text-xs">
                  <span className="text-gray-400">
                    Total Dr:{" "}
                    <strong className="text-red-600 dark:text-red-400 tabular-nums">
                      {totalDr.toFixed(2)}
                    </strong>
                  </span>
                  <span className="text-gray-400">
                    Total Cr:{" "}
                    <strong className="text-blue-600 dark:text-blue-400 tabular-nums">
                      {totalCr.toFixed(2)}
                    </strong>
                  </span>
                  {(totalDr > 0 || totalCr > 0) && (
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      balanced
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : roundOff
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                    }`}>
                      {balanced ? "✓ Balanced" : roundOff ? `↻ Round Off ₹${diff.toFixed(2)}` : `Diff: ${diff.toFixed(2)}`}
                    </span>
                  )}
                </div>
              </div>

              {/* GST calculation panel — shown when GST is active and entries have amounts */}
              {taxType === "GST" && gstPercent !== "" && Number(gstPercent) > 0 && totalDr > 0 && (() => {
                const base        = parseFloat(totalDr.toFixed(2));
                const gstAmt      = parseFloat((base * Number(gstPercent) / 100).toFixed(2));
                const subTotal    = parseFloat((base + gstAmt).toFixed(2));
                const rounded     = Math.round(subTotal);
                const roundOffAmt = parseFloat((rounded - subTotal).toFixed(2));
                const hasRoundOff = Math.abs(roundOffAmt) >= 0.01;
                return (
                  <div className="mx-3 mb-3 rounded-lg border border-amber-200 dark:border-amber-700/40 bg-amber-50/70 dark:bg-amber-900/10 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                      GST Calculation
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Base (Dr entries)</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 tabular-nums">₹{fmt(base)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>GST @ {gstPercent}%</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">+ ₹{fmt(gstAmt)}</span>
                      </div>
                      {hasRoundOff && (
                        <>
                          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                            <span>Sub Total</span>
                            <span className="tabular-nums">₹{fmt(subTotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-blue-500 dark:text-blue-400">
                            <span>Round Off</span>
                            <span className="tabular-nums">{roundOffAmt > 0 ? "+" : ""}₹{fmt(roundOffAmt)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-xs font-bold border-t border-amber-200 dark:border-amber-600/40 pt-1.5">
                        <span className="text-gray-700 dark:text-gray-200">Grand Total (incl. GST)</span>
                        <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">₹{fmt(rounded)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ══ Footer bar ═══════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onclose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => {
            saveStatusRef.current = "draft";
            handleSubmit(onSubmit)();
          }}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          Save as Draft
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => {
            saveStatusRef.current = "pending";
            handleSubmit(onSubmit)();
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 ${theme.saveBg}`}
        >
          {isSaving
            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : <><FiSave size={14} /> Save as Pending</>
          }
        </button>
      </div>

    </div>
  );
};

export default CreateDebitCreditNote;
