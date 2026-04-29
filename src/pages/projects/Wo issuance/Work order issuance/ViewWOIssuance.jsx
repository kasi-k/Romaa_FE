import { useEffect, useState } from "react";
import { ChevronLeft, Calendar, User, FileText, AlertCircle, Printer, Truck, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import LOGO from "../../../../assets/images/RomaaInfra.png";
import Icon from "../../../../assets/images/logo icon.png";
import { API } from "../../../../constant";

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtAmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_STYLES = {
  "Contractor Approved":  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  "Work Order Issued":"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  "In Progress":      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  "Completed":        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {status}
  </span>
);

const SectionCard = ({ title, icon, children, accent = "blue" }) => {
  const accents = {
    blue:   "border-blue-500 dark:border-blue-400",
    emerald:"border-emerald-500 dark:border-emerald-400",
    purple: "border-purple-500 dark:border-purple-400",
    amber:  "border-amber-500 dark:border-amber-400",
  };
  return (
    <div className={`bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm h-full flex flex-col border-t-2 ${accents[accent]}`}>
      <div className="px-5 py-3.5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60">
        <span className="opacity-70">{icon}</span>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5 flex-1 space-y-3">{children}</div>
    </div>
  );
};

const Field = ({ label, value, mono = false, highlight = false }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 dark:border-gray-700/40 last:border-0 last:pb-0 first:pt-0">
    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide shrink-0">{label}</span>
    <span className={`text-sm text-right leading-snug wrap-break-words max-w-[60%] ${highlight ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium text-gray-800 dark:text-gray-200"} ${mono ? "font-mono text-xs" : ""}`}>
      {value || "—"}
    </span>
  </div>
);

const MetricCard = ({ label, value, sub, colorClass }) => (
  <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm flex flex-col gap-1">
    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-extrabold ${colorClass}`}>{value}</p>
    {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
  </div>
);

const ViewWOIssuance = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedItem     = location.state?.item || {};
  const requestIdParam = passedItem.requestId;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestIdParam) { setLoading(false); return; }

    let attempts = 0;
    const MAX_RETRIES = 5;
    let timer;

    const fetchData = () => {
      axios
        .get(`${API}/workorderrequest/api/getQuotationApproved/${requestIdParam}`)
        .then((res) => {
          const d = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;
          if (!d && attempts < MAX_RETRIES) {
            attempts++;
            timer = setTimeout(fetchData, 1500);
          } else {
            setData(d || null);
            setLoading(false);
          }
        })
        .catch(() => {
          if (attempts < MAX_RETRIES) {
            attempts++;
            timer = setTimeout(fetchData, 1500);
          } else {
            toast.error("Failed to load Work Order details");
            setLoading(false);
          }
        });
    };

    fetchData();
    return () => clearTimeout(timer);
  }, [requestIdParam]);

  if (loading)
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-400">
        <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        Loading…
      </div>
    );

  if (!data)
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        No Data Found
      </div>
    );

  const contractor     = data.selectedContractor || {};
  const items      = contractor.quoteItems   || [];
  const gross      = contractor.totalQuotedValue || items.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const cgst       = gross * 0.09;
  const sgst       = gross * 0.09;
  const total      = gross + cgst + sgst;
  const woNumber   = data.workOrder?.woNumber  || data.requestId || "—";
  const issueDate  = data.workOrder?.issueDate || data.requestDate;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section {
            position: absolute; left: 0; top: 0;
            width: 100%;
            padding: 12mm 14mm;
            box-sizing: border-box;
            background: white !important;
            color: black !important;
          }
          #print-section table thead {
            display: table-header-group;
          }
          #print-section table tfoot {
            display: table-footer-group;
          }
          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print-force-break {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>

      {/* ── SCREEN VIEW ─────────────────────────────────────────────────────── */}
      <div className="h-full overflow-y-auto no-scrollbar dark:bg-[#0b0f19] p-5 pb-16 font-roboto-flex print:hidden">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* ── Top bar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/projects/woissuance?tab=2", { replace: true })}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Work Order Issuance</h1>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded">
                    #{woNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={data.status} />
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} /> {fmtDate(issueDate)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-darkest-blue hover:bg-darkest-blue/95 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Printer size={15} /> View Invoice
            </button>
          </div>

          {/* ── Metric strip ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="WO Number"   value={woNumber}            sub={fmtDate(issueDate)}            colorClass="text-gray-900 dark:text-white text-base" />
            <MetricCard label="Gross Amount" value={`₹${fmtAmt(gross)}`} sub="Before GST"                  colorClass="text-blue-600 dark:text-blue-400" />
            <MetricCard label="GST (18%)"   value={`₹${fmtAmt(cgst + sgst)}`} sub="CGST 9% + SGST 9%"    colorClass="text-amber-600 dark:text-amber-400" />
            <MetricCard label="Total Payable" value={`₹${fmtAmt(total)}`} sub="Inc. all taxes"             colorClass="text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* ── Info cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SectionCard title="Project Info" icon={<FileText size={15} className="text-blue-500" />} accent="blue">
              <Field label="Project ID"   value={data.projectId} mono />
              <Field label="Title"        value={data.title} />
              <Field label="Delivery By"  value={contractor?.deliveryPeriod ? fmtDate(contractor.deliveryPeriod) : null} />
              {data.description && (
                <div className="pt-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Description</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 italic">"{data.description}"</p>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Site Details" icon={<MapPin size={15} className="text-emerald-500" />} accent="emerald">
              <Field label="Site Name"  value={data.siteDetails?.siteName} />
              <Field label="Location"   value={data.siteDetails?.location} />
              <Field label="Incharge"   value={data.siteDetails?.siteIncharge} />
              <Field label="Progress"   value={data.workOrder?.progressStatus} />
            </SectionCard>

            <SectionCard title="Contractor" icon={<User size={15} className="text-purple-500" />} accent="purple">
              <Field label="Name"       value={contractor?.contractorName} highlight />
              <Field label="Contractor ID"  value={contractor?.contractorId} mono />
              <Field label="Contact"    value={contractor?.contact} />
              <Field label="Quotation"  value={contractor?.quotationId} mono />
              {contractor?.address && (
                <div className="pt-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Address</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{contractor.address}</p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Items table ── */}
          <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-900/30">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-blue-500" />
                <h3 className="font-bold text-gray-800 dark:text-white text-sm">Work Order Items</h3>
                {items.length > 0 && (
                  <span className="ml-1 text-[11px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {contractor?.quotationId && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Ref: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{contractor.quotationId}</span>
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-400">
                <AlertCircle size={36} className="opacity-30" />
                <p className="text-sm">No items found for this work order.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3 text-left">Particulars</th>
                        <th className="px-4 py-3 text-center w-20">Unit</th>
                        <th className="px-4 py-3 text-right w-24">Qty</th>
                        <th className="px-4 py-3 text-right w-32">Basic Rate (₹)</th>
                        <th className="px-4 py-3 text-right w-32">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/20 transition-colors">
                          <td className="px-4 py-3.5 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-gray-200">{item.detailedDescription}</td>
                          <td className="px-4 py-3.5 text-center text-gray-500 dark:text-gray-400 uppercase text-xs font-medium">{item.unit}</td>
                          <td className="px-4 py-3.5 text-right text-gray-700 dark:text-gray-300 font-medium">{item.quantity}</td>
                          <td className="px-4 py-3.5 text-right text-gray-600 dark:text-gray-400">{fmtAmt(item.quotedUnitRate)}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-white">{fmtAmt(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tax summary footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/60 dark:bg-gray-900/20">
                  <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                      {[
                        { label: "Gross Amount",    value: fmtAmt(gross),       cls: "text-gray-700 dark:text-gray-300" },
                        { label: "CGST @ 9%",       value: fmtAmt(cgst),        cls: "text-gray-600 dark:text-gray-400" },
                        { label: "SGST @ 9%",       value: fmtAmt(sgst),        cls: "text-gray-600 dark:text-gray-400" },
                      ].map(({ label, value, cls }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                          <span className={`font-medium ${cls}`}>₹ {value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-gray-300 dark:border-gray-600">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">Total Payable</span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹ {fmtAmt(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── PRINT / INVOICE ─────────────────────────────────────────────────── */}
      {(() => {
        const pGross  = contractor?.totalQuotedValue || items.reduce((s, i) => s + (i.totalAmount || 0), 0) || 0;
        const pCgst   = pGross * 0.09;
        const pSgst   = pGross * 0.09;
        const pTotal  = pGross + pCgst + pSgst;
        const pFmt    = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const pDate   = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
        const woNo    = data.workOrder?.woNumber || data.requestId || "—";
        const issued  = data.workOrder?.issueDate || data.requestDate;

        return (
          <div id="print-section" className="hidden print:block font-roboto-flex text-black bg-white">

            {/* ── Full header (page 1 only, won't repeat) ── */}
            <div className="print-avoid-break">
              {/* Logo + Title */}
              <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: "3px solid #2B3A6B" }}>
                <img src={LOGO} alt="ROMAA" style={{ height: "44px", objectFit: "contain" }} />
                <div className="text-right">
                  <p style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "0.18em", color: "#2B3A6B", textTransform: "uppercase" }}>
                    Work Order
                  </p>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px", lineHeight: 1.5 }}>
                    <span>WO No:&nbsp;&nbsp;<strong style={{ color: "#1f2937", fontFamily: "monospace" }}>{woNo}</strong></span>
                    <span style={{ margin: "0 8px", color: "#d1d5db" }}>|</span>
                    <span>Date:&nbsp;&nbsp;<strong style={{ color: "#1f2937" }}>{pDate(issued)}</strong></span>
                  </div>
                </div>
              </div>

              {/* FROM / TO */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: "10px" }}>
                <div style={{ paddingRight: "16px", borderRight: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#2B3A6B", marginBottom: "5px" }}>From</p>
                  <p style={{ fontWeight: 800, fontSize: "13px", color: "#2B3A6B", lineHeight: 1.3 }}>ROMAA INFRAA PVT. LTD</p>
                  <div style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1.6, marginTop: "3px" }}>
                    <p>1/107, P.R. Road, Nerkundram, Chennai – 600107</p>
                    <p>Ph: 044-23333333</p>
                    <p>GSTIN: 33AAECR6992B1Z9</p>
                  </div>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                  <p style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#2B3A6B", marginBottom: "5px" }}>To</p>
                  <p style={{ fontWeight: 800, fontSize: "13px", color: "#111827", lineHeight: 1.3 }}>{contractor?.contractorName || "—"}</p>
                  <div style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1.6, marginTop: "3px" }}>
                    {contractor?.address && <p style={{ whiteSpace: "pre-line" }}>{contractor.address}</p>}
                    {contractor?.contact && <p>Ph: {contractor.contact}</p>}
                    {contractor?.gstin   && <p>GSTIN: {contractor.gstin}</p>}
                  </div>
                </div>
              </div>

              {/* Ref row */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#6b7280", padding: "6px 0", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", marginBottom: "10px" }}>
                {data.siteDetails?.location && (
                  <span>Site &nbsp;<strong style={{ color: "#1f2937" }}>{data.siteDetails.location}</strong></span>
                )}
                <span>Ref No. &nbsp;<strong style={{ color: "#1f2937" }}>{contractor?.quotationId || "—"}</strong></span>
                <span>Ref Date &nbsp;<strong style={{ color: "#1f2937" }}>{pDate(contractor?.deliveryPeriod)}</strong></span>
              </div>
            </div>

            {/* ── Items table (auto-paginated by browser) ── */}
            <div style={{ position: "relative" }}>
              {/* Watermark */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: `url(${Icon})`, backgroundRepeat: "no-repeat",
                backgroundPosition: "center", backgroundSize: "28%", opacity: 0.04,
              }} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", position: "relative" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #2B3A6B", borderTop: "none" }}>
                    <th style={{ padding: "7px 8px 7px 0", textAlign: "center", fontWeight: 700, color: "#374151", width: "32px" }}>Sl.</th>
                    <th style={{ padding: "7px 8px", textAlign: "left",   fontWeight: 700, color: "#374151" }}>Particulars</th>
                    <th style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: "#374151", width: "52px" }}>Qty</th>
                    <th style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: "#374151", width: "52px" }}>Unit</th>
                    <th style={{ padding: "7px 8px", textAlign: "right",  fontWeight: 700, color: "#374151", width: "88px" }}>Rate (Rs.)</th>
                    <th style={{ padding: "7px 0 7px 8px", textAlign: "right", fontWeight: 700, color: "#374151", width: "88px" }}>Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 8px 7px 0", textAlign: "center", color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ padding: "7px 8px", textAlign: "left",   color: "#1f2937", fontWeight: 500 }}>{item.detailedDescription}</td>
                      <td style={{ padding: "7px 8px", textAlign: "center", color: "#4b5563" }}>{item.quantity}</td>
                      <td style={{ padding: "7px 8px", textAlign: "center", color: "#6b7280", textTransform: "uppercase" }}>{item.unit}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right",  color: "#4b5563" }}>{pFmt(item.quotedUnitRate)}</td>
                      <td style={{ padding: "7px 0 7px 8px", textAlign: "right", color: "#1f2937", fontWeight: 600 }}>{pFmt(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Footer block (keep together, avoid splitting across pages) ── */}
            <div className="print-avoid-break" style={{ marginTop: "14px" }}>

              {/* Tax summary */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                <div style={{ width: "210px", fontSize: "11px" }}>
                  {[
                    { label: "Gross Amount", value: pFmt(pGross) },
                    { label: "CGST @ 9%",    value: pFmt(pCgst)  },
                    { label: "SGST @ 9%",    value: pFmt(pSgst)  },
                    { label: "Rounded Off",  value: "—"          },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#4b5563" }}>
                      <span>{label}</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0 3px", marginTop: "4px", borderTop: "1.5px solid #2B3A6B", fontWeight: 700, fontSize: "12px", color: "#111827" }}>
                    <span>Total</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{pFmt(pTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Despatch To */}
              {(data.siteDetails?.siteName || data.siteDetails?.location) && (
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginBottom: "10px", fontSize: "10px" }}>
                  <p style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: "3px" }}>Despatch To</p>
                  <p style={{ color: "#374151" }}>
                    {[data.siteDetails.siteName, data.siteDetails.location].filter(Boolean).join(", ")}
                    {data.siteDetails.siteIncharge && ` — Attn: ${data.siteDetails.siteIncharge}`}
                  </p>
                </div>
              )}

              {/* Terms & Conditions */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginBottom: "12px", fontSize: "10px", lineHeight: 1.55 }}>
                <p style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: "5px" }}>Terms &amp; Conditions</p>
                <ol style={{ paddingLeft: "16px", color: "#4b5563", margin: 0 }}>
                  <li>Labour Accommodation / ER Water usage – Romaa Scope.</li>
                  <li>Above rates including materials supply and labour charges.</li>
                  <li>Payment Advance will be made during the work in Progress.</li>
                  <li>If the work is delayed due to the contractor's actions, penalties may be applicable to the project.</li>
                  <li>Payment will be made on submission of bills with proper acknowledgement from site Admin.</li>
                  <li>Rs 1,50,000/- advance payment will be released after material Delivery.</li>
                  <li>10% of Payment released during work; balance after Work Completion.</li>
                  <li>TDS Extra.</li>
                </ol>
              </div>

              {/* Signature */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "30px" }}>
                    for ROMAA INFRAA PVT. LTD
                  </p>
                  <div style={{ width: "150px", borderTop: "1px solid #94a3b8", margin: "0 auto" }} />
                  <p style={{ fontSize: "8px", color: "#9ca3af", marginTop: "3px", fontStyle: "italic" }}>Authorised Signatory</p>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </>
  );
};

export default ViewWOIssuance;
