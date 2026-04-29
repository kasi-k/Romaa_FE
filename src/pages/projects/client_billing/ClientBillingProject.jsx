import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../../../context/ProjectContext";
import axios from "axios";
import { API } from "../../../constant";
import UploadClientBill from "./modals/UploadClientBill";
import { toast } from "react-toastify";
import {
  TbFileExport, TbFileInvoice, TbCurrencyRupee,
  TbReceipt, TbWallet, TbAlertCircle,
} from "react-icons/tb";
import {
  LuEye, LuUpload, LuChevronDown, LuChevronUp,
  LuArrowRight, LuBuilding2,
} from "react-icons/lu";
import { BiFilterAlt } from "react-icons/bi";
import Loader from "../../../components/Loader";

/* ─── Formatters ─────────────────────────────────────────────── */

const fmt = (n) =>
  n != null
    ? "₹\u202f" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "₹\u202f0.00";

const fmtCompact = (n) => {
  if (n == null || n === 0) return "₹\u202f0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹\u202f${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹\u202f${(n / 1e5).toFixed(2)} L`;
  return "₹\u202f" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

/* ─── Status config ──────────────────────────────────────────── */

const STATUS_CFG = {
  Draft:     { dot: "bg-slate-400",    ring: "ring-slate-200 dark:ring-slate-700",   border: "border-l-slate-400",    header: "from-slate-50 dark:from-slate-800/60",  badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  Submitted: { dot: "bg-blue-500",     ring: "ring-blue-200 dark:ring-blue-800",     border: "border-l-blue-500",     header: "from-blue-50 dark:from-blue-900/40",    badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700" },
  Checked:   { dot: "bg-teal-500",     ring: "ring-teal-200 dark:ring-teal-800",     border: "border-l-teal-500",     header: "from-teal-50 dark:from-teal-900/40",    badge: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700" },
  Approved:  { dot: "bg-green-500",    ring: "ring-green-200 dark:ring-green-800",   border: "border-l-green-500",    header: "from-green-50 dark:from-green-900/40",  badge: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700" },
  Paid:      { dot: "bg-emerald-600",  ring: "ring-emerald-200 dark:ring-emerald-800",border:"border-l-emerald-600",  header: "from-emerald-50 dark:from-emerald-900/40",badge:"bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700" },
  Rejected:  { dot: "bg-red-500",      ring: "ring-red-200 dark:ring-red-800",       border: "border-l-red-500",      header: "from-red-50 dark:from-red-900/40",      badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700" },
};

const PAID_BADGE = {
  unpaid:  "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  partial: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  paid:    "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
};

const Badge = ({ value, cls }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${cls || "bg-gray-100 text-gray-500 border-gray-200"}`}>
    {value ?? "-"}
  </span>
);

/* ─── Stat Card ──────────────────────────────────────────────── */

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`flex items-center gap-3 flex-1 min-w-[160px] rounded-2xl border ${color.border} ${color.bg} px-4 py-3.5`}>
    <div className={`p-2 rounded-xl ${color.iconBg}`}>
      <Icon size={18} className={color.icon} />
    </div>
    <div className="min-w-0">
      <p className={`text-xs font-medium uppercase tracking-wide truncate ${color.label}`}>{label}</p>
      <p className={`mt-0.5 text-base font-bold leading-tight ${color.value}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── Detail Row ─────────────────────────────────────────────── */

const DetailRow = ({ label, value, valueClass = "text-gray-700 dark:text-gray-200" }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-100 dark:border-gray-700/60 last:border-0">
    <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
    <span className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</span>
  </div>
);

/* ─── Bill Card ──────────────────────────────────────────────── */

const BillCard = ({ item, isLast, navigate }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[item.status] || STATUS_CFG.Draft;

  const payPct = item.net_amount > 0
    ? Math.min(Math.round((item.amount_received / item.net_amount) * 100), 100)
    : 0;

  return (
    <div className="relative flex gap-3 sm:gap-5">
      {/* ── Timeline spine ── */}
      <div className="flex flex-col items-center pt-4">
        <div className={`w-3.5 h-3.5 rounded-full ${cfg.dot} border-2 border-white dark:border-gray-950 shadow ring-2 ${cfg.ring} shrink-0 z-10`} />
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 mt-1.5" />}
      </div>

      {/* ── Card ── */}
      <div className="flex-1 mb-6">
        <div className={`rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border-l-4 ${cfg.border}`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${cfg.header} to-transparent border-b border-gray-100 dark:border-gray-700/60`}>
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                RA-{String(item.bill_sequence).padStart(2, "0")}
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-white tracking-tight">{item.bill_id}</span>
              <span className="hidden sm:inline text-xs text-gray-400">{fmtDate(item.bill_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge value={item.status} cls={cfg.badge} />
              <Badge value={item.paid_status} cls={PAID_BADGE[item.paid_status]} />
              <button
                onClick={() => navigate("viewclbillproject", { state: { item } })}
                className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors"
                title="View full bill"
              >
                <LuEye size={15} />
              </button>
            </div>
          </div>

          {/* Client + Progression */}
          <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <LuBuilding2 size={13} className="text-gray-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.client_name ?? "—"}</span>
              <span className="sm:hidden text-xs text-gray-400">{fmtDate(item.bill_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="text-right">
                <p className="text-gray-400 uppercase tracking-wide">Prev Bill</p>
                <p className="font-semibold text-gray-500 dark:text-gray-400 tabular-nums">{fmtCompact(item.total_prev_bill_amount)}</p>
              </div>
              <LuArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
              <div className="text-right">
                <p className="text-gray-400 uppercase tracking-wide">Upto Date</p>
                <p className="font-bold text-gray-800 dark:text-white tabular-nums">{fmtCompact(item.total_upto_date_amount)}</p>
              </div>
            </div>
          </div>

          {/* Key Financials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700/60">
            {[
              { label: "Grand Total", value: fmtCompact(item.grand_total),  full: fmt(item.grand_total),  cls: "text-gray-800 dark:text-white" },
              { label: "Net Amount",  value: fmtCompact(item.net_amount),   full: fmt(item.net_amount),   cls: "text-violet-700 dark:text-violet-400" },
              { label: "Received",    value: fmtCompact(item.amount_received), full: fmt(item.amount_received), cls: "text-emerald-600 dark:text-emerald-400" },
              { label: "Balance Due", value: fmtCompact(item.balance_due),  full: fmt(item.balance_due),  cls: item.balance_due > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400" },
            ].map(({ label, value, full, cls }) => (
              <div key={label} className="px-3 py-3 text-center group/cell relative">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-sm font-bold tabular-nums leading-tight ${cls}`} title={full}>{value}</p>
              </div>
            ))}
          </div>

          {/* Payment progress bar */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">Payment collected</span>
              <span className={`text-xs font-bold tabular-nums ${payPct === 100 ? "text-emerald-600" : payPct > 0 ? "text-orange-500" : "text-red-500"}`}>
                {payPct}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  payPct === 100 ? "bg-emerald-500" : payPct > 50 ? "bg-orange-400" : "bg-red-400"
                }`}
                style={{ width: `${payPct}%` }}
              />
            </div>
          </div>

          {/* Expandable toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-t border-gray-100 dark:border-gray-700/60"
          >
            {open ? <LuChevronUp size={12} /> : <LuChevronDown size={12} />}
            <span>{open ? "Hide" : "Show"} tax & deductions</span>
          </button>

          {/* Expandable body */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-72" : "max-h-0"}`}>
            <div className="px-4 pt-3 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 bg-gray-50/60 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700/60">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tax Breakdown</p>
                <DetailRow label="CGST"      value={fmt(item.cgst_amt)} />
                <DetailRow label="SGST"      value={fmt(item.sgst_amt)} />
                <DetailRow label="IGST"      value={fmt(item.igst_amt)} />
                <DetailRow label="Total Tax" value={fmt(item.total_tax)} valueClass="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-3 sm:mt-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Deductions</p>
                <DetailRow label="Retention"        value={fmt(item.retention_amount)} valueClass="text-orange-600 dark:text-orange-400" />
                <DetailRow label="Other Deductions" value={fmt(item.total_deductions)} valueClass="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */

const ClientBillingProject = () => {
  const { tenderId } = useProject();
  const navigate = useNavigate();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fetchBilling = useCallback(async () => {
    if (!tenderId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/clientbilling/history/${tenderId}`, { withCredentials: true });
      setItems(res.data.data || []);
    } catch {
      toast.error("Failed to fetch billing records");
    } finally {
      setLoading(false);
    }
  }, [tenderId]);

  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  const totalNet      = items.reduce((s, i) => s + (i.net_amount      || 0), 0);
  const totalReceived = items.reduce((s, i) => s + (i.amount_received || 0), 0);
  const totalBalance  = items.reduce((s, i) => s + (i.balance_due     || 0), 0);
  const totalTax      = items.reduce((s, i) => s + (i.total_tax       || 0), 0);
  const overallPct    = totalNet > 0 ? Math.round((totalReceived / totalNet) * 100) : 0;

  return (
    <div className="flex flex-col h-full w-full font-roboto-flex overflow-hidden">

      {/* ── Page Header ── */}
      <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Projects Management</p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Client Billing</h1>
            {items.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {items.length} bill{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80 transition-colors shadow-sm"
          >
            <LuUpload size={14} /> Upload
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80 transition-colors shadow-sm">
            <TbFileExport size={15} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/80 transition-colors shadow-sm">
            <BiFilterAlt size={14} /> Filter
          </button>
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="flex flex-wrap gap-2.5 mb-5 shrink-0">
        <StatCard icon={TbFileInvoice}     label="Total Bills"  value={items.length}          sub={`${overallPct}% collected overall`}
          color={{ bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-100 dark:border-blue-800",    iconBg: "bg-blue-100 dark:bg-blue-900/40",    icon: "text-blue-600 dark:text-blue-400",    label: "text-blue-500",  value: "text-blue-700 dark:text-blue-200" }} />
        <StatCard icon={TbCurrencyRupee}   label="Net Billed"   value={fmtCompact(totalNet)}  sub={fmt(totalNet)}
          color={{ bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-100 dark:border-violet-800", iconBg: "bg-violet-100 dark:bg-violet-900/40", icon: "text-violet-600 dark:text-violet-400", label: "text-violet-500",value: "text-violet-700 dark:text-violet-200" }} />
        <StatCard icon={TbReceipt}         label="Total Tax"    value={fmtCompact(totalTax)}  sub={fmt(totalTax)}
          color={{ bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-100 dark:border-amber-800",   iconBg: "bg-amber-100 dark:bg-amber-900/40",   icon: "text-amber-600 dark:text-amber-400",  label: "text-amber-500", value: "text-amber-700 dark:text-amber-200" }} />
        <StatCard icon={TbWallet}          label="Received"     value={fmtCompact(totalReceived)} sub={fmt(totalReceived)}
          color={{ bg: "bg-emerald-50 dark:bg-emerald-900/20",border: "border-emerald-100 dark:border-emerald-800",iconBg:"bg-emerald-100 dark:bg-emerald-900/40",icon:"text-emerald-600 dark:text-emerald-400",label:"text-emerald-600",value:"text-emerald-700 dark:text-emerald-200" }} />
        <StatCard icon={TbAlertCircle}     label="Balance Due"  value={fmtCompact(totalBalance)} sub={fmt(totalBalance)}
          color={{ bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-100 dark:border-red-800",       iconBg: "bg-red-100 dark:bg-red-900/40",       icon: "text-red-500 dark:text-red-400",      label: "text-red-500",   value: "text-red-700 dark:text-red-200" }} />
      </div>

      {/* ── Timeline ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader />
            <span className="text-sm text-gray-400">Loading billing records…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
              <TbFileInvoice size={36} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No billing records found</p>
            <p className="text-xs text-gray-400">Upload a bill to get started</p>
          </div>
        ) : (
          <div className="pl-1">
            {items.map((item, idx) => (
              <BillCard
                key={item._id}
                item={item}
                isLast={idx === items.length - 1}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadClientBill onclose={() => setShowUpload(false)} onSuccess={fetchBilling} />
      )}
    </div>
  );
};

export default ClientBillingProject;
