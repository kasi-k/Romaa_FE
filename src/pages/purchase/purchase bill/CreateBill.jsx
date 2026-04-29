 import { useState, useMemo,  useEffect } from "react";
import { useForm }     from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup        from "yup";
import { IoClose }     from "react-icons/io5";
import {
  FiSave, FiFileText, FiSettings,
  FiLink, FiList, FiDollarSign, FiUser, FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useTenderIds, usePermittedVendors, useCreateBill, useGRNForBilling, useNextBillId } from "./hooks/usePurchaseBill";
import SearchableSelect from "../../../components/SearchableSelect";
import { useCurrencyList } from "../../finance/shared/hooks/useCurrency";

/* ── Schema ─────────────────────────────────────────────────────────────── */
const schema = yup.object().shape({
  doc_date:     yup.string().required("Bill Date is required"),
  doc_id:       yup.string().required("Bill No is required"),
  invoice_no:   yup.string().required("Invoice No is required"),
  invoice_date: yup.string().required("Invoice Date is required"),
  credit_days:  yup.number().typeError("Must be a number").min(0).nullable().optional(),
  narration:    yup.string().nullable(),
});

/* ── Row factories ──────────────────────────────────────────────────────── */
const emptyGrnRow  = () => ({ grn_no: "", grn_ref: "", grn_ref_no: "", ref_date: "", grn_qty: "" });
const emptyItemRow = () => ({ item_id: "", item_description: "", unit: "", accepted_qty: "", unit_price: "", gross_amt: "0.00", net_amt: "0.00", cgst_pct: 0, sgst_pct: 0, igst_pct: 0 });

/* ── Amount-in-words ────────────────────────────────────────────────────── */
const ones    = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const tensArr = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
const toWords = (n) => {
  if (n === 0) return "Zero";
  if (n >= 100000) return toWords(Math.floor(n / 100000)) + " Lakh"     + (n % 100000 ? " " + toWords(n % 100000) : "");
  if (n >= 1000)   return toWords(Math.floor(n / 1000))   + " Thousand" + (n % 1000   ? " " + toWords(n % 1000)   : "");
  if (n >= 100)    return ones[Math.floor(n / 100)]        + " Hundred"  + (n % 100    ? " " + toWords(n % 100)    : "");
  if (n >= 20)     return tensArr[Math.floor(n / 10)]      + (n % 10     ? " " + ones[n % 10] : "");
  return ones[n];
};
const toWordsRupees = (n) => "Rupees " + toWords(n) + " Only";
const fmt = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Shared class strings ───────────────────────────────────────────────── */
const inputCls   = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 transition-all placeholder:text-gray-400";
const readonlyCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 dark:text-gray-400 text-gray-500 cursor-default";

/* ── Section card wrapper ───────────────────────────────────────────────── */
const accentBar = {
  slate: "bg-slate-700",
  blue:  "bg-blue-600",
  teal:  "bg-teal-600",
  amber: "bg-amber-600",
};
// `iconEl` is a pre-rendered JSX node, e.g. <FiFileText />
const SectionCard = ({ iconEl, title, accent = "slate", children, noPad = false, overflow = false, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${overflow ? "overflow-hidden" : ""} ${className}`}>
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 rounded-t-xl">
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[13px] text-white ${accentBar[accent] || accentBar.slate}`}>
        {iconEl}
      </span>
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{title}</span>
    </div>
    <div className={noPad ? "" : "p-5"}>{children}</div>
  </div>
);


/* ── Additional charge type definitions ─────────────────────────────────── */
const CHARGE_TYPES = [
  { value: "Transport",         label: "Transport",           isDeduction: false },
  { value: "Supplier",          label: "Supplier",            isDeduction: false },
  { value: "Loading / Unloading", label: "Loading / Unloading", isDeduction: false },
  { value: "Insurance",         label: "Insurance",           isDeduction: false },
  { value: "Freight",           label: "Freight",             isDeduction: false },
  { value: "Packing Charges",   label: "Packing Charges",     isDeduction: false },
  { value: "Discount",          label: "Discount",            isDeduction: true  },
  { value: "TCS Receivable",    label: "TCS Receivable",      isDeduction: true  },
];

/* ── Component ──────────────────────────────────────────────────────────── */
const CreateBill = ({ onclose, onSuccess }) => {
  const [grnRows,  setGrnRows]  = useState([emptyGrnRow()]);
  const [itemRows, setItemRows] = useState([emptyItemRow()]);

  const [selectedTenderId,       setSelectedTenderId]       = useState("");
  const [selectedTenderRef,      setSelectedTenderRef]      = useState("");
  const [selectedTenderName,     setSelectedTenderName]     = useState("");
  const [selectedVendorId,       setSelectedVendorId]       = useState("");
  const [selectedVendorRef,      setSelectedVendorRef]      = useState("");
  const [selectedVendorName,     setSelectedVendorName]     = useState("");
  const [selectedVendorGstin,    setSelectedVendorGstin]    = useState("");
  const [selectedPlaceOfSupply,  setSelectedPlaceOfSupply]  = useState(""); // "InState" | "Others"

  /* Multi-currency (spec §18) — defaults to INR. Exchange rate = INR per 1 foreign unit. */
  const [selectedCurrency,       setSelectedCurrency]       = useState("INR");
  const [exchangeRate,           setExchangeRate]           = useState(1);

  // additional charges: [{ id, type, amt, gst_pct }]
  const [additionalCharges, setAdditionalCharges] = useState([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { credit_days: "" },
  });

  const [showGrnPicker, setShowGrnPicker] = useState(false);

  const [watchDocDate, watchDocId, watchInvoiceNo, watchInvoiceDate, watchCreditDays] =
    watch(["doc_date", "doc_id", "invoice_no", "invoice_date", "credit_days"]);

  /* ── Hooks ──────────────────────────────────────────────────────────── */
  const { data: nextBillId }                                    = useNextBillId();
  const { data: currenciesRaw = [] }                            = useCurrencyList();
  const activeCurrencies = Array.isArray(currenciesRaw) ? currenciesRaw.filter((c) => c.is_active !== false) : [];
  const { data: tendersRaw = [],  isLoading: _loadingTenders  } = useTenderIds();
  const { data: vendorsRaw = [],  isLoading: _loadingVendors  } = usePermittedVendors(selectedTenderId);
  const { data: grnData = [],     isLoading: loadingGrn      } = useGRNForBilling(selectedTenderId, selectedVendorId);
  const createBillMutation = useCreateBill({ onSuccess, onClose: onclose });

  /* ── Auto-fill Bill No from API ─────────────────────────────────────── */
  useEffect(() => {
    if (nextBillId) setValue("doc_id", nextBillId, { shouldDirty: false });
  }, [nextBillId, setValue]);

  /* ── Build dropdown options ─────────────────────────────────────────── */
  const tenderOptions = tendersRaw.map(t => ({
    value:        t.tender_id,
    label:        t.tender_project_name ? `${t.tender_id} – ${t.tender_project_name}` : t.tender_id,
    _id:          t._id || "",
    tender_name:  t.tender_project_name || t.tender_id,
  }));

  const vendorOptions = vendorsRaw.map(v => ({
    value:           v.vendor_id,
    label:           `${v.vendor_id} – ${v.vendor_name}`,
    _id:             v._id || "",
    vendor_name:     v.vendor_name || "",
    vendor_gstin:    v.gstin || v.vendor_gstin || "",
    credit_day:      v.credit_day,
    place_of_supply: v.place_of_supply || "",
  }));

  /* ── Selection handlers ─────────────────────────────────────────────── */
  const handleTenderSelect = (option) => {
    if (option.value === selectedTenderId) return;
    setSelectedTenderId(option.value);
    setSelectedTenderRef(option._id || "");
    setSelectedTenderName(option.tender_name || "");
    setSelectedVendorId("");
    setSelectedVendorRef("");
    setSelectedVendorName("");
    setSelectedVendorGstin("");
    setSelectedPlaceOfSupply("");
    setValue("credit_days", null);
  };

  const handleVendorSelect = (option) => {
    setSelectedVendorId(option.value);
    setSelectedVendorRef(option._id || "");
    setSelectedVendorName(option.vendor_name || "");
    setSelectedVendorGstin(option.vendor_gstin || "");
    setSelectedPlaceOfSupply(option.place_of_supply || "");
    const days = option.credit_day != null ? Number(option.credit_day) : null;
    setValue("credit_days", days, { shouldDirty: true, shouldTouch: true });
  };

  // InState → CGST + SGST  |  Others (inter-state) → IGST
  const isInState  = selectedPlaceOfSupply === "InState";
  // Lock tender/vendor once GRN has been picked
  const grnLocked  = grnRows[0].grn_no !== "";

  /* ── Full reset ─────────────────────────────────────────────────────── */
  const handleFullReset = () => {
    setGrnRows([emptyGrnRow()]);
    setItemRows([emptyItemRow()]);
    setSelectedTenderId("");
    setSelectedTenderRef("");
    setSelectedTenderName("");
    setSelectedVendorId("");
    setSelectedVendorRef("");
    setSelectedVendorName("");
    setSelectedVendorGstin("");
    setSelectedPlaceOfSupply("");
    setAdditionalCharges([]);
    reset({ doc_date: "", doc_id: "", invoice_no: "", invoice_date: "", credit_days: "", narration: "" });
  };

  /* ── Shared GRN picker open — validates and gives feedback ─────────── */
  const openGrnPicker = () => {
    if (!selectedTenderId)  { toast.info("Select a Tender first");          return; }
    if (!selectedVendorId)  { toast.info("Select a Vendor / Supplier");     return; }
    if (!watchDocId)        { toast.info("Enter Bill No to continue");       return; }
    if (!watchDocDate)      { toast.info("Enter Bill Date to continue");     return; }
    if (!watchInvoiceNo)    { toast.info("Enter Invoice No to continue");    return; }
    if (!watchInvoiceDate)  { toast.info("Enter Invoice Date to continue");  return; }
    setShowGrnPicker(true);
  };

  /* ── Enter key → open GRN picker ────────────────────────────────────── */
  const handleSectionKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
    e.preventDefault();
    openGrnPicker();
  };

  /* ── GRN picker confirm ─────────────────────────────────────────────── */
  const handleGrnPickerConfirm = (entries) => {
    setGrnRows(entries.map(e => ({
      grn_no:     e.grn_bill_no   || "",
      grn_ref:    e._id           || "",   // MaterialTransaction ObjectId
      grn_ref_no: e.party_bill_no || e.invoice_challan_no || "", // display only
      ref_date:   e.date ? e.date.split("T")[0] : "",
      grn_qty:    parseFloat(e.quantity) || 0,
    })));

    setItemRows(entries.map(e => {
      const qty   = parseFloat(e.quantity)    || 0;
      const price = parseFloat(e.quoted_rate) || 0;
      const gross = parseFloat((qty * price).toFixed(2));
      const cgst = e.tax_structure?.cgst ?? e.taxStructure?.cgst ?? e.cgst_pct ?? e.cgst ?? 0;
      const sgst = e.tax_structure?.sgst ?? e.taxStructure?.sgst ?? e.sgst_pct ?? e.sgst ?? 0;
      const igst = e.tax_structure?.igst ?? e.taxStructure?.igst ?? e.igst_pct ?? e.igst ?? 0;
      return {
        item_id:          e.item_id || e.material_id || e.material_ref || "",  // Material ObjectId
        item_description: e.item_description || "",
        unit:             e.unit || "",
        accepted_qty:     qty,
        unit_price:       parseFloat(e.quoted_rate) || 0,
        gross_amt:        gross.toFixed(2),
        net_amt:          gross.toFixed(2), // display only; server recomputes
        cgst_pct:         Number(cgst),
        sgst_pct:         Number(sgst),
        igst_pct:         Number(igst),
        // GRN linkage — backend's buildDoc reads these from each line item
        grn_no:           e.grn_bill_no || "",
        grn_ref:          e._id         || "",
        ref_date:         e.date ? e.date.split("T")[0] : "",
      };
    }));

    setShowGrnPicker(false);
  };

  /* ── Auto due date ──────────────────────────────────────────────────── */
  const computedDueDate = useMemo(() => {
    const days = Number(watchCreditDays);
    if (isNaN(days) || days < 0) return "";
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }, [watchCreditDays]);

  /* ── Additional charge handlers ─────────────────────────────────────── */
  const addCharge = (type) => {
    if (!type) return;
    setAdditionalCharges(prev => [...prev, { id: Date.now(), type, amt: "", gst_pct: "" }]);
  };
  const removeCharge = (id) => setAdditionalCharges(prev => prev.filter(c => c.id !== id));
  const updateCharge = (id, field, value) =>
    setAdditionalCharges(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  /* ── Derived totals ─────────────────────────────────────────────────── */
  const grandTotal = itemRows.reduce((acc, r) => acc + (parseFloat(r.gross_amt) || 0), 0);

  // Build per-rate tax groups from line items (mirrors ViewPurchaseOrder pattern)
  const taxGroupMap = {};
  itemRows.forEach(row => {
    const gross = parseFloat(row.gross_amt) || 0;
    if (!gross) return;
    if (isInState) {
      const c = Number(row.cgst_pct) || 0;
      const s = Number(row.sgst_pct) || 0;
      const key = `${c}_${s}`;
      if (!taxGroupMap[key]) taxGroupMap[key] = { cgst_pct: c, sgst_pct: s, taxable: 0, cgstAmt: 0, sgstAmt: 0 };
      taxGroupMap[key].taxable  += gross;
      taxGroupMap[key].cgstAmt  += parseFloat((gross * c / 100).toFixed(2));
      taxGroupMap[key].sgstAmt  += parseFloat((gross * s / 100).toFixed(2));
    } else {
      const ig = Number(row.igst_pct) || 0;
      const key = `igst_${ig}`;
      if (!taxGroupMap[key]) taxGroupMap[key] = { igst_pct: ig, taxable: 0, igstAmt: 0 };
      taxGroupMap[key].taxable += gross;
      taxGroupMap[key].igstAmt += parseFloat((gross * ig / 100).toFixed(2));
    }
  });
  const taxGroups = Object.values(taxGroupMap);

  const totalTax = taxGroups.reduce((s, g) =>
    s + (isInState ? (g.cgstAmt + g.sgstAmt) : g.igstAmt), 0
  );

  // per-charge net (amount + its GST); deductions are negative
  const chargeDetails = additionalCharges.map(c => {
    const typeDef  = CHARGE_TYPES.find(t => t.value === c.type);
    const amt      = parseFloat(c.amt)     || 0;
    const gst      = parseFloat(c.gst_pct) || 0;
    const gstAmt   = parseFloat((amt * gst / 100).toFixed(2));
    const net      = parseFloat((amt + gstAmt).toFixed(2));
    return { ...c, amtNum: amt, gstAmt, net: typeDef?.isDeduction ? -net : net };
  });

  const additionalTotal = chargeDetails.reduce((s, c) => s + c.net, 0);
  const preRound        = grandTotal + totalTax + additionalTotal;
  const roundOff        = parseFloat((Math.round(preRound) - preRound).toFixed(2));
  const netAmount       = Math.round(preRound);

  // Aggregate totals across all tax groups (one combined row per tax type)
  const totalCgst = taxGroups.reduce((s, g) => s + (g.cgstAmt || 0), 0);
  const totalSgst = taxGroups.reduce((s, g) => s + (g.sgstAmt || 0), 0);
  const totalIgst = taxGroups.reduce((s, g) => s + (g.igstAmt || 0), 0);
  const cgstLabel = taxGroups.length ? taxGroups.map(g => `${g.cgst_pct}%`).join(" + ") : null;
  const sgstLabel = taxGroups.length ? taxGroups.map(g => `${g.sgst_pct}%`).join(" + ") : null;
  const igstLabel = taxGroups.length ? taxGroups.map(g => `${g.igst_pct}%`).join(" + ") : null;

  const fixedTaxRows = [
    { desc: "Inward Supply", amt: fmt(grandTotal), account: "INWARD SUPPLY" },
    ...(isInState
      ? [
          { desc: cgstLabel ? `CGST @ ${cgstLabel}` : "CGST", amt: fmt(totalCgst), account: "CGST INPUT TAX" },
          { desc: sgstLabel ? `SGST @ ${sgstLabel}` : "SGST", amt: fmt(totalSgst), account: "SGST INPUT TAX" },
        ]
      : [{ desc: igstLabel ? `IGST @ ${igstLabel}` : "IGST", amt: fmt(totalIgst), account: "IGST INPUT TAX" }]
    ),
  ];

  const addedTypes     = new Set(additionalCharges.map(c => c.type));
  const availableTypes = CHARGE_TYPES.filter(t => !addedTypes.has(t.value));

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const onSubmit = (data) => {
    if (!selectedTenderId) { toast.warning("Please select a tender"); return; }
    if (!selectedVendorId) { toast.warning("Please select a vendor");  return; }
    if (itemRows.length === 0 || !itemRows[0].item_description) {
      toast.warning("Please pick GRN entries before saving"); return;
    }

    createBillMutation.mutate({
      // Bill identity
      doc_id:       data.doc_id,
      doc_date:     data.doc_date,
      invoice_no:   data.invoice_no,
      invoice_date: data.invoice_date,
      credit_days:  data.credit_days != null ? Number(data.credit_days) : undefined,
      narration:    data.narration || undefined,

      // Tender snapshot
      tender_id:   selectedTenderId,
      tender_ref:  selectedTenderRef  || undefined,
      tender_name: selectedTenderName || undefined,

      // Vendor snapshot
      vendor_id:    selectedVendorId,
      vendor_ref:   selectedVendorRef   || undefined,
      vendor_name:  selectedVendorName  || undefined,
      vendor_gstin: selectedVendorGstin || undefined,

      // Tax
      place_of_supply: selectedPlaceOfSupply,
      tax_mode:        isInState ? "instate" : "otherstate",

      // Multi-currency — ledger always posts in INR (base); foreign kept for display
      currency:        selectedCurrency || "INR",
      exchange_rate:   Number(exchangeRate) || 1,

      // GRN rows — only API fields (drop display-only grn_ref_no)
      grn_rows: grnRows.map(r => ({
        grn_no:   r.grn_no,
        grn_ref:  r.grn_ref  || undefined,
        ref_date: r.ref_date || undefined,
        grn_qty:  r.grn_qty,
      })),

      // Line items — drop display-only net_amt; server recomputes it
      line_items: itemRows.map(r => ({
        item_id:          r.item_id          || undefined,
        item_description: r.item_description,
        unit:             r.unit,
        accepted_qty:     Number(r.accepted_qty),
        unit_price:       Number(r.unit_price),
        gross_amt:        parseFloat(r.gross_amt),
        cgst_pct:         r.cgst_pct,
        sgst_pct:         r.sgst_pct,
        igst_pct:         r.igst_pct,
        // GRN linkage — backend's buildDoc reads these per line item
        grn_no:           r.grn_no   || undefined,
        grn_ref:          r.grn_ref  || undefined,
        ref_date:         r.ref_date || undefined,
      })),

      // Additional charges — include is_deduction as required by API
      additional_charges: chargeDetails.map(c => {
        const typeDef = CHARGE_TYPES.find(t => t.value === c.type);
        return {
          type:         c.type,
          amount:       c.amtNum,
          gst_pct:      parseFloat(c.gst_pct) || 0,
          is_deduction: typeDef?.isDeduction ?? false,
        };
      }),

      status: "pending",
    });
  };

  const isSaving = createBillMutation.isPending;

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-gray-950 font-layout-font overflow-hidden">

      {/* ══ Top bar ══════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-slate-800 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-b border-slate-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <FiFileText className="text-white text-base" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">PURCHASE BILL — NEW ENTRY</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Fill Bill Identity &amp; Configuration, then press Enter to pick GRN</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {grnLocked && (
            <button
              type="button"
              onClick={handleFullReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200 transition-all"
              title="Reset all fields and start over"
            >
              ↺ Reset
            </button>
          )}
          <button
            onClick={onclose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <IoClose size={18} />
          </button>
        </div>
      </div>

      {/* ══ Scrollable body ══════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-5 space-y-4">

          {/* ── Row 1: Bill Identity ─────────────────────────────────── */}
          <div onKeyDown={handleSectionKeyDown}>
          <SectionCard iconEl={<FiFileText />} title="Bill Identity" accent="slate">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left — Reference fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiCalendar className="text-slate-500 text-xs" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bill Reference</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bill No" required error={errors.doc_id}>
                    <input type="text" {...register("doc_id")} readOnly className={readonlyCls} placeholder="Auto-generated..." />
                  </Field>
                  <Field label="Bill Date" required error={errors.doc_date}>
                    <input type="date" {...register("doc_date")} className={inputCls} />
                  </Field>
                  <Field label="Invoice No" required error={errors.invoice_no}>
                    <input type="text" {...register("invoice_no")} className={inputCls} placeholder="e.g. RA/Q1/04200" />
                  </Field>
                  <Field label="Invoice Date" required error={errors.invoice_date}>
                    <input type="date" {...register("invoice_date")} className={inputCls} />
                  </Field>
                </div>
              </div>

              
              {/* Right — Party fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiUser className="text-slate-500 text-xs" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Party Details</span>
                </div>
                <Field label="Project / Tender" required>
                  {grnLocked ? (
                    <LockedField value={tenderOptions.find(o => o.value === selectedTenderId)?.label || selectedTenderId} />
                  ) : (
                    <SearchableSelect
                      options={tenderOptions}
                      value={selectedTenderId}
                      onChange={(val) => {
                        const option = tenderOptions.find(o => o.value === val);
                        if (option) handleTenderSelect(option);
                      }}
                      placeholder="Select tender..."
                    />
                  )}
                </Field>
                <Field label="Vendor / Supplier" required>
                  {grnLocked ? (
                    <LockedField value={vendorOptions.find(o => o.value === selectedVendorId)?.label || selectedVendorId} />
                  ) : (
                    <SearchableSelect
                      key={selectedTenderId || "__no_tender__"}
                      options={vendorOptions}
                      value={selectedVendorId}
                      onChange={(val) => {
                        const option = vendorOptions.find(o => o.value === val);
                        if (option) handleVendorSelect(option);
                      }}
                      placeholder={!selectedTenderId ? "Select a tender first" : "Select vendor..."}
                      disabled={!selectedTenderId}
                    />
                  )}
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* ── Row 2: Bill Configuration ────────────────────────────── */}
          <SectionCard iconEl={<FiSettings />} title="Bill Configuration" accent="blue">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Credit Days" error={errors.credit_days}>
                {grnLocked ? (
                  <LockedField value={watchCreditDays != null ? `${watchCreditDays} days` : "—"} />
                ) : (
                  <input type="number" {...register("credit_days")} className={inputCls} placeholder="Auto-filled from vendor" min={0} />
                )}
              </Field>
              <Field label="Due Date">
                <input type="date" value={computedDueDate} readOnly className={readonlyCls} />
              </Field>
              <Field label="Tax Mode">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${
                  !selectedPlaceOfSupply
                    ? "border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800/60"
                    : isInState
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                }`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    !selectedPlaceOfSupply ? "bg-gray-300" : isInState ? "bg-green-500" : "bg-blue-500"
                  }`} />
                  {!selectedPlaceOfSupply
                    ? "Select vendor first"
                    : isInState
                      ? "InState — CGST + SGST"
                      : "Inter-State — IGST"}
                </div>
              </Field>
              <Field label="Currency">
                <select
                  value={selectedCurrency}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedCurrency(code);
                    if (code === "INR") setExchangeRate(1);
                  }}
                  className={inputCls}
                >
                  {activeCurrencies.length === 0 && <option value="INR">INR</option>}
                  {activeCurrencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} {c.symbol ? `(${c.symbol})` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Exchange Rate ${selectedCurrency === "INR" ? "" : `(INR per 1 ${selectedCurrency})`}`}>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  disabled={selectedCurrency === "INR"}
                  className={selectedCurrency === "INR" ? readonlyCls : inputCls}
                />
              </Field>
              <div className="flex flex-col justify-end gap-1.5">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  or press{" "}
                  <kbd className="px-1 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono">Enter</kbd>
                </p>
                <button
                  type="button"
                  onClick={openGrnPicker}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiLink size={14} />
                  Select GRN Entries
                </button>
              </div>
            </div>
          </SectionCard>
          </div>{/* end Enter-key wrapper */}

          {/* ── Row 3: GRN Linkage (full width) ──────────────────────── */}
          <SectionCard iconEl={<FiLink />} title="GRN Linkage" accent="teal" noPad overflow>
            {grnRows[0].grn_no === "" && grnRows.length === 1 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600 gap-2">
                <FiLink className="text-3xl opacity-40" />
                <p className="text-sm">No GRN entries linked yet</p>
                <p className="text-xs opacity-70">Press Enter after filling bill details to pick GRN</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-teal-50/60 dark:bg-teal-900/10 border-b border-teal-100 dark:border-teal-900/30">
                      <th className="px-4 py-2.5 text-center w-10 text-xs font-semibold text-teal-700 dark:text-teal-400">#</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">GRN No</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">GRN Ref No</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">Reference Date</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">GRN Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grnRows.map((row, i) => (
                      <tr key={i} className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/20"}`}>
                        <td className="px-4 py-2.5 text-center text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{row.grn_no || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{row.grn_ref_no || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.ref_date || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-gray-700 dark:text-gray-300">{row.grn_qty || <span className="text-gray-300">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* ── Row 4: Line Items (full width) ───────────────────────── */}
          <SectionCard iconEl={<FiList />} title="Line Items" accent="blue" noPad overflow>
            {itemRows[0].item_id === "" && itemRows.length === 1 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600 gap-2">
                <FiList className="text-3xl opacity-40" />
                <p className="text-sm">No line items yet</p>
                <p className="text-xs opacity-70">Items will be populated after GRN selection</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50/60 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30">
                      <th className="px-4 py-2.5 text-center w-10 text-xs font-semibold text-blue-700 dark:text-blue-400">#</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-700 dark:text-blue-400">Item Description</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-700 dark:text-blue-400">Unit</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">Accepted Qty</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">Unit Price (₹)</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">Gross Amt (₹)</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">Net Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemRows.map((row, i) => (
                      <tr key={i} className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/20"}`}>
                        <td className="px-4 py-2.5 text-center text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{row.item_description || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                          {row.unit ? (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">{row.unit}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{row.accepted_qty || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{row.unit_price || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-800 dark:text-gray-200">{row.gross_amt}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-800 dark:text-gray-200">{row.net_amt}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-gray-800/60 border-t-2 border-gray-200 dark:border-gray-700">
                      <td colSpan={5} className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                        ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                        ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </SectionCard>

          {/* ── Row 5: Tax + Summary ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Tax table — takes 3/5 */}
            <SectionCard iconEl={<FiDollarSign />} title="Tax & Additions / Deductions" accent="amber" noPad overflow className="lg:col-span-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50/60 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30">
                    <th className="px-4 py-2.5 text-center w-8 text-xs font-semibold text-amber-700 dark:text-amber-400">#</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700 dark:text-amber-400">Description</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">Amount (₹)</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700 dark:text-amber-400">Account</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {/* Fixed GST rows — read-only */}
                  {fixedTaxRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-2.5 text-center text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{row.desc}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-700 dark:text-gray-300">{row.amt}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded uppercase tracking-wide">
                          {row.account}
                        </span>
                      </td>
                      <td />
                    </tr>
                  ))}

                  {/* User-added charge rows */}
                  {chargeDetails.map((c, i) => {
                    const typeDef = CHARGE_TYPES.find(t => t.value === c.type);
                    return (
                      <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 bg-amber-50/20 dark:bg-amber-900/5">
                        <td className="px-4 py-2 text-center text-xs text-gray-400">{fixedTaxRows.length + i + 1}</td>
                        <td className="px-4 py-2">
                          <span className={`text-sm font-medium ${typeDef?.isDeduction ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                            {typeDef?.label || c.type}
                            {typeDef?.isDeduction && <span className="ml-1 text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded">Deduction</span>}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={c.amt}
                              onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) updateCharge(c.id, "amt", e.target.value); }}
                              placeholder="0.00"
                              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-sm text-right bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                            <div className="flex items-center gap-0.5 shrink-0">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={c.gst_pct}
                                onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) updateCharge(c.id, "gst_pct", e.target.value); }}
                                placeholder="GST%"
                                className="w-14 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              />
                              <span className="text-gray-400 text-xs">%</span>
                            </div>
                            {c.gst_pct && c.amtNum > 0 && (
                              <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap shrink-0">+₹{c.gstAmt.toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded uppercase tracking-wide">
                            {c.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCharge(c.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <IoClose size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Round-off row — auto */}
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-center text-xs text-gray-400">{fixedTaxRows.length + additionalCharges.length + 1}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 italic text-sm">Round Off</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-600 dark:text-gray-400">
                      {roundOff >= 0 ? "+" : ""}₹{fmt(roundOff)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded uppercase tracking-wide">ROUND OFF</span>
                    </td>
                    <td />
                  </tr>

                  {/* Add charge row — dropdown */}
                  {availableTypes.length > 0 && (
                    <tr className="bg-gray-50/60 dark:bg-gray-800/30">
                      <td colSpan={5} className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 shrink-0">+ Add charge:</span>
                          <div className="w-56">
                            <SearchableSelect
                              value=""
                              onChange={(val) => { if (val) addCharge(val); }}
                              options={availableTypes.map(t => ({
                                value: t.value,
                                label: `${t.isDeduction ? "(-) " : "(+) "}${t.label}`,
                              }))}
                              placeholder="— Select charge type —"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <Field label="Narration" error={errors.narration}>
                  <input type="text" {...register("narration")} className={inputCls} placeholder="e.g. Purchase for: INFRA" />
                </Field>
              </div>
            </SectionCard>

            {/* Summary — takes 2/5 */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-3 bg-slate-700 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Invoice Summary</p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  <SummaryRow label="Taxable Value" value={`₹${fmt(grandTotal)}`} />
                  {isInState ? (
                    <>
                      <SummaryRow label={cgstLabel ? `CGST @ ${cgstLabel}` : "CGST"} value={`₹${fmt(totalCgst)}`} />
                      <SummaryRow label={sgstLabel ? `SGST @ ${sgstLabel}` : "SGST"} value={`₹${fmt(totalSgst)}`} />
                    </>
                  ) : (
                    <SummaryRow label={igstLabel ? `IGST @ ${igstLabel}` : "IGST"} value={`₹${fmt(totalIgst)}`} />
                  )}
                  {chargeDetails.map(c => {
                    const typeDef = CHARGE_TYPES.find(t => t.value === c.type);
                    return (
                      <SummaryRow
                        key={c.id}
                        label={typeDef?.label || c.type}
                        value={`${typeDef?.isDeduction ? "−" : "+"}₹${fmt(Math.abs(c.net))}`}
                        deduction={typeDef?.isDeduction}
                      />
                    );
                  })}
                  <SummaryRow label="Round Off" value={`${roundOff >= 0 ? "+" : ""}₹${fmt(roundOff)}`} />
                </div>
                <div className="px-5 py-4 bg-slate-700 dark:bg-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">Net Payable</span>
                  <span className="text-xl font-black text-white">
                    ₹{netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Amount in Words</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-snug">
                  {toWordsRupees(Math.round(netAmount))}
                </p>
              </div>
            </div>
          </div>

          {/* bottom padding for footer overlap */}
          <div className="h-2" />
        </div>
      </div>

      {/* ══ Footer ═══════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {grnRows[0].grn_no
            ? <span className="text-green-600 font-medium">{grnRows.length} GRN row{grnRows.length > 1 ? "s" : ""} · {itemRows.length} line item{itemRows.length > 1 ? "s" : ""} linked</span>
            : <span className="text-amber-500">No GRN linked yet</span>
          }
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onclose}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="px-7 py-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving
              ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              : <FiSave />}
            {isSaving ? "Saving..." : "Save Bill"}
          </button>
        </div>
      </div>

      {/* ── GRN Picker Modal ─────────────────────────────────────────── */}
      {showGrnPicker && (
        <GRNPickerModal
          data={grnData}
          isLoading={loadingGrn}
          onClose={() => setShowGrnPicker(false)}
          onConfirm={handleGrnPickerConfirm}
        />
      )}
    </div>
  );
};

/* ── Summary row helper ─────────────────────────────────────────────────── */
const SummaryRow = ({ label, value, deduction = false }) => (
  <div className="flex items-center justify-between px-5 py-2.5">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`text-sm font-medium tabular-nums ${deduction ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-white"}`}>{value}</span>
  </div>
);

/* ── GRN Picker Modal ───────────────────────────────────────────────────── */
const GRNPickerModal = ({ data = [], isLoading, onClose, onConfirm }) => {
  const [filter,   setFilter]   = useState("");
  const [selected, setSelected] = useState(new Set());

  const filtered = data.filter(e =>
    !filter || (e.purchase_request_ref || "").toLowerCase().includes(filter.toLowerCase())
  );

  const allChecked  = filtered.length > 0 && filtered.every(e => selected.has(e._id));
  const someChecked = filtered.some(e => selected.has(e._id));

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) filtered.forEach(e => next.delete(e._id));
      else            filtered.forEach(e => next.add(e._id));
      return next;
    });
  };

  const toggleOne = (id) =>
    setSelected(prev => {
      const entry   = data.find(e => e._id === id);
      const sameGrn = data.filter(e => e.grn_bill_no === entry?.grn_bill_no).map(e => e._id);
      const next    = new Set(prev);
      if (next.has(id)) sameGrn.forEach(i => next.delete(i));
      else              sameGrn.forEach(i => next.add(i));
      return next;
    });

  const handleOk = () => {
    if (selected.size === 0) return;
    onConfirm(data.filter(e => selected.has(e._id)));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800" style={{ maxHeight: "84vh" }}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-slate-700 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">Select GRN Entries</h3>
            <p className="text-xs text-slate-400 mt-0.5">Check entries to link · Press Enter or click OK to populate bill</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <IoClose size={18} />
          </button>
        </div>

        {/* Filter */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
          <input
            autoFocus
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && selected.size > 0) handleOk(); }}
            placeholder="Filter by Purchase Request Ref..."
            className={inputCls}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-sm text-gray-400">
              <span className="w-5 h-5 border-2 border-gray-300 border-t-slate-600 rounded-full animate-spin" />
              Loading GRN entries...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <FiLink className="text-3xl opacity-30" />
              <p className="text-sm">No GRN entries found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={toggleAll}
                      className="accent-slate-600 cursor-pointer w-4 h-4"
                    />
                  </th>
                  {["GRN Bill No", "Party Bill No", "Item", "Site", "Qty", "Rate (₹)", "PO Ref", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr
                    key={e._id}
                    onClick={() => toggleOne(e._id)}
                    className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                      selected.has(e._id)
                        ? "bg-slate-50 dark:bg-slate-900/30 ring-1 ring-inset ring-slate-200 dark:ring-slate-700"
                        : i % 2 === 0 ? "hover:bg-gray-50 dark:hover:bg-gray-800/40" : "bg-gray-50/40 dark:bg-gray-800/10 hover:bg-gray-100/60 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    <td className="px-4 py-2.5 text-center" onClick={ev => ev.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(e._id)}
                        onChange={() => toggleOne(e._id)}
                        className="accent-slate-600 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{e.grn_bill_no}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{e.party_bill_no || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 max-w-[180px] truncate">{e.item_description}</td>
                    <td className="px-4 py-2.5 text-gray-500">{e.site_name || "—"}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-700 dark:text-gray-300">{e.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">₹{e.quoted_rate}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {e.purchase_request_ref || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                      {e.date ? new Date(e.date).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-b-2xl bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selected.size > 0
              ? <span className="font-semibold text-slate-700 dark:text-slate-300">{selected.size} entr{selected.size === 1 ? "y" : "ies"} selected</span>
              : "Select one or more GRN entries to link"}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOk}
              disabled={selected.size === 0}
              className="px-6 py-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
            >
              <FiLink size={14} />
              Link {selected.size > 0 ? `${selected.size} ` : ""}GRN{selected.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ── Locked (read-only) select display ──────────────────────────────────── */
const LockedField = ({ value }) => (
  <div className="w-full border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2 text-sm bg-teal-50/60 dark:bg-teal-900/10 text-teal-800 dark:text-teal-300 flex items-center justify-between gap-2">
    <span className="truncate font-medium">{value || "—"}</span>
    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded">Locked</span>
  </div>
);

/* ── Field wrapper ──────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="w-full">
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[10px] mt-1">{error.message}</p>}
  </div>
);

export default CreateBill;
