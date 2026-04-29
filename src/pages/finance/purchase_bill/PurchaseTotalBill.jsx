import React, { useState } from "react";
import { ChevronDown, Link2, Truck, FolderOpen } from "lucide-react";
import { 
  TbFileInvoice, TbCurrencyRupee, 
  TbReceipt, TbWallet, TbAlertCircle, TbFolderOpen
} from "react-icons/tb";
import { useBillsByTender } from "../../purchase/purchase bill/hooks/usePurchaseBill";
import ProjectSelectionModal from "../client_billing/ProjectSelectionModal";
import Loader from "../../../components/Loader";
import Button from "../../../components/Button";

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
  draft:    { dot: "bg-slate-400",    ring: "ring-slate-200 dark:ring-slate-700",   border: "border-l-slate-400",    header: "from-slate-50 dark:from-slate-800/60",  badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700", label: "Draft" },
  pending:  { dot: "bg-amber-500",    ring: "ring-amber-200 dark:ring-amber-800",   border: "border-l-amber-500",    header: "from-amber-50 dark:from-amber-900/40",  badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700", label: "Pending" },
  approved: { dot: "bg-blue-500",     ring: "ring-blue-200 dark:ring-blue-800",     border: "border-l-blue-500",     header: "from-blue-50 dark:from-blue-900/40",    badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700", label: "Approved" },
  paid:     { dot: "bg-emerald-600",  ring: "ring-emerald-200 dark:ring-emerald-800",border:"border-l-emerald-600",  header: "from-emerald-50 dark:from-emerald-900/40",badge:"bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700", label: "Paid" },
};

const Badge = ({ value, cls }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${cls || "bg-gray-100 text-gray-500 border-gray-200"}`}>
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

/* ─── Mini Table Helpers ─────────────────────────────────────── */
const MiniTable = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="w-full text-[11px]">
      <thead>
        <tr className="bg-gray-100/50 dark:bg-gray-800/50">
          {headers.map((h) => (
            <th key={h} className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap border-b border-gray-200 dark:border-gray-700">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-transparent divide-y divide-gray-100 dark:divide-gray-800">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="px-2.5 py-3 text-center text-[11px] text-gray-400 italic">
              No data
            </td>
          </tr>
        ) : (
          rows.map((cells, ri) => (
            <tr key={ri} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
              {cells.map((cell, ci) => (
                <td key={ci} className="px-2.5 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const DetailSection = ({ icon, title, count, children }) => (
  <div className="col-span-1">
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</span>
      {count !== undefined && count !== null && (
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 tabular-nums">
          {count}
        </span>
      )}
    </div>
    {count === 0 ? (
      <p className="text-[11px] text-gray-400 italic">None</p>
    ) : (
      children
    )}
  </div>
);

/* ─── Bill Card ──────────────────────────────────────────────── */
const PurchaseBillCard = ({ item, isLast }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[item.status] || STATUS_CFG.pending;

  const addlNet = (item.additional_charges || []).reduce(
    (s, c) => s + (c.is_deduction ? -(c.net || 0) : (c.net || 0)), 0
  );

  return (
    <div className="relative flex gap-3 sm:gap-5">
      <div className="flex flex-col items-center pt-4">
        <div className={`w-3.5 h-3.5 rounded-full ${cfg.dot} border-2 border-white dark:border-gray-950 shadow ring-2 ${cfg.ring} shrink-0 z-10`} />
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 mt-1.5" />}
      </div>

      <div className="flex-1 mb-6">
        <div className={`rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border-l-4 ${cfg.border}`}>
          
          <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${cfg.header} to-transparent border-b border-gray-100 dark:border-gray-700/60`}>
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                {item.doc_id}
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-white tracking-tight">{item.invoice_no || "No Invoice"}</span>
              <span className="hidden sm:inline text-[11px] text-gray-400 font-medium">{fmtDate(item.doc_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge value={cfg.label} cls={cfg.badge} />
            </div>
          </div>

          <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <Truck size={13} className="text-gray-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.vendor_name ?? "—"}</span>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 rounded">{item.vendor_gstin}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className={`px-1.5 py-0.5 rounded ${item.tax_mode === "instate" ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"}`}>
                {item.tax_mode === "instate" ? "IN-STATE" : "INTER-STATE"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700/60">
            {[
              { label: "Base Amount", value: fmtCompact(item.grand_total),  full: fmt(item.grand_total),  cls: "text-gray-800 dark:text-white" },
              { label: "Tax",         value: fmtCompact(item.total_tax),    full: fmt(item.total_tax),    cls: "text-indigo-600 dark:text-indigo-400" },
              { label: "Others",      value: fmtCompact(Math.abs(addlNet)), full: (addlNet < 0 ? "-" : "") + fmt(Math.abs(addlNet)), cls: addlNet === 0 ? "text-gray-400" : addlNet < 0 ? "text-red-500" : "text-emerald-500" },
              { label: "Net Payable", value: fmtCompact(item.net_amount),   full: fmt(item.net_amount),   cls: "text-emerald-600 dark:text-emerald-400" },
            ].map(({ label, value, full, cls }) => (
              <div key={label} className="px-3 py-3 text-center group/cell relative">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-sm font-bold tabular-nums leading-tight ${cls}`} title={full}>{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-t border-gray-100 dark:border-gray-700/60"
          >
            {open ? <ChevronDown size={14} className="rotate-180 transition-transform" /> : <ChevronDown size={14} className="transition-transform" />}
            <span className="font-medium">{open ? "Hide Details" : "Show Details"}</span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[2000px]" : "max-h-0"}`}>
            <div className="px-5 py-4 flex flex-col gap-5 bg-gray-50/60 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700/60">
               
              <DetailSection icon={<Link2 size={13} />} title="Line Items" count={item.line_items?.length}>
                {item.tax_mode === "instate" ? (
                  <MiniTable
                    headers={["Item", "Unit", "Qty", "Rate", "Gross", "CGST%", "CGST Amt", "SGST%", "SGST Amt", "Net Amt"]}
                    rows={(item.line_items || []).map((it) => [
                      <span key="i" className="font-medium text-gray-800 dark:text-gray-100">{it.item_description}</span>,
                      it.unit || "—",
                      <span key="q" className="tabular-nums">{it.accepted_qty}</span>,
                      `₹${fmt(it.unit_price)}`,
                      `₹${fmt(it.gross_amt)}`,
                      `${it.cgst_pct ?? 0}%`,
                      `₹${fmt(it.cgst_amt)}`,
                      `${it.sgst_pct ?? 0}%`,
                      `₹${fmt(it.sgst_amt)}`,
                      <span key="n" className="tabular-nums font-semibold text-gray-900 dark:text-white">₹{fmt(it.net_amt)}</span>,
                    ])}
                  />
                ) : (
                  <MiniTable
                    headers={["Item", "Unit", "Qty", "Rate", "Gross", "IGST%", "IGST Amt", "Net Amt"]}
                    rows={(item.line_items || []).map((it) => [
                      <span key="i" className="font-medium text-gray-800 dark:text-gray-100">{it.item_description}</span>,
                      it.unit || "—",
                      <span key="q" className="tabular-nums">{it.accepted_qty}</span>,
                      `₹${fmt(it.unit_price)}`,
                      `₹${fmt(it.gross_amt)}`,
                      `${it.igst_pct ?? 0}%`,
                      `₹${fmt(it.igst_amt)}`,
                      <span key="n" className="tabular-nums font-semibold text-gray-900 dark:text-white">₹{fmt(it.net_amt)}</span>,
                    ])}
                  />
                )}
              </DetailSection>

              {(item.grn_rows?.length > 0) && (
                <DetailSection icon={<Link2 size={13} />} title="GRN References" count={item.grn_rows?.length}>
                  <MiniTable
                    headers={["GRN No.", "Date", "GRN Qty"]}
                    rows={(item.grn_rows || []).map((g) => [
                      <code key="g" className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">{g.grn_no}</code>,
                      fmtDate(g.ref_date),
                      <span key="q" className="tabular-nums font-semibold text-gray-800 dark:text-gray-100">{g.grn_qty}</span>,
                    ])}
                  />
                </DetailSection>
              )}

              {(item.additional_charges?.length > 0) && (
                <DetailSection icon={<Truck size={13} />} title="Additional Charges" count={item.additional_charges?.length}>
                  <MiniTable
                    headers={["Type", "Amount", "GST%", "Net", "Deduction"]}
                    rows={(item.additional_charges || []).map((c) => [
                      c.type,
                      `₹${fmt(c.amount)}`,
                      `${c.gst_pct}%`,
                      <span key="n" className={`tabular-nums font-semibold ${c.is_deduction ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {c.is_deduction ? "−" : "+"}₹{fmt(c.net)}
                      </span>,
                      c.is_deduction
                        ? <span key="d" className="text-red-500 text-[10px] font-semibold bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Yes</span>
                        : <span key="d" className="text-gray-400 text-[10px]">No</span>,
                    ])}
                  />
                </DetailSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const PurchaseTotalBill = () => {
  const [selectedTender, setSelectedTender] = useState("");
  const [isModalOpen, setIsModalOpen]       = useState(true);

  // Use the exact custom hook for data
  const { data: bills = [], isLoading } = useBillsByTender(selectedTender);

  const handleProjectSelect = (tenderId) => {
    setSelectedTender(tenderId);
    setIsModalOpen(false);
  };

  const totalNet     = bills.reduce((s, b) => s + (b.net_amount  || 0), 0);
  const totalTax     = bills.reduce((s, b) => s + (b.total_tax   || 0), 0);
  const totalGrand   = bills.reduce((s, b) => s + (b.grand_total || 0), 0);
  // Paid bills count towards collected/received in an aggregate sense
  const totalPaid    = bills.reduce((s, b) => s + (b.status === "paid" ? b.net_amount : 0), 0);
  const overallPct   = totalNet > 0 ? Math.round((totalPaid / totalNet) * 100) : 0;

  return (
    <div className="flex flex-col h-full w-full font-roboto-flex overflow-hidden relative">
      <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Finance</p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Purchase Bill</h1>
            {bills.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {bills.length} bill{bills.length !== 1 ? "s" : ""}
              </span>
            )}
            
            {/* Display active tender ref */}
            {selectedTender && (
              <span className="ml-2 px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                {selectedTender}
              </span>
            )}
          </div>
        </div>
        
        {/* Action to change tender manually */}
        <div className="flex items-center">
            <Button
                button_name="Select Project"
                button_icon={<TbFolderOpen size={18} />}
                onClick={() => setIsModalOpen(true)}
            />
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-5 shrink-0">
        <StatCard icon={TbFileInvoice}     label="Total Bills"  value={bills.length}          sub={`${overallPct}% paid overall`}
          color={{ bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-100 dark:border-blue-800",    iconBg: "bg-blue-100 dark:bg-blue-900/40",    icon: "text-blue-600 dark:text-blue-400",    label: "text-blue-500",  value: "text-blue-700 dark:text-blue-200" }} />
        <StatCard icon={TbCurrencyRupee}   label="Base Amount"  value={fmtCompact(totalGrand)} sub={fmt(totalGrand)}
          color={{ bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-100 dark:border-violet-800", iconBg: "bg-violet-100 dark:bg-violet-900/40", icon: "text-violet-600 dark:text-violet-400", label: "text-violet-500",value: "text-violet-700 dark:text-violet-200" }} />
        <StatCard icon={TbReceipt}         label="Total Tax"    value={fmtCompact(totalTax)}  sub={fmt(totalTax)}
          color={{ bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-100 dark:border-amber-800",   iconBg: "bg-amber-100 dark:bg-amber-900/40",   icon: "text-amber-600 dark:text-amber-400",  label: "text-amber-500", value: "text-amber-700 dark:text-amber-200" }} />
        <StatCard icon={TbAlertCircle}     label="Net Payable"  value={fmtCompact(totalNet)}  sub={fmt(totalNet)}
          color={{ bg: "bg-emerald-50 dark:bg-emerald-900/20",border: "border-emerald-100 dark:border-emerald-800",iconBg:"bg-emerald-100 dark:bg-emerald-900/40",icon:"text-emerald-600 dark:text-emerald-400",label:"text-emerald-600",value:"text-emerald-700 dark:text-emerald-200" }} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 pr-1 pb-10">
        {!selectedTender ? (
             <div className="flex flex-col items-center justify-center py-28 gap-3">
                 <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
                     <TbFolderOpen size={36} className="text-gray-400" />
                 </div>
                 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Please select a project to view timeline</p>
                 <Button button_name="Select Project" onClick={() => setIsModalOpen(true)} />
             </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader />
            <span className="text-sm text-gray-400">Loading purchase timeline…</span>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
              <TbFileInvoice size={36} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No purchase history found for this project</p>
          </div>
        ) : (
          <div className="pl-1 max-w-5xl mx-auto">
            {bills.map((bill, idx) => (
              <PurchaseBillCard
                key={bill._id || idx}
                item={bill}
                isLast={idx === bills.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleProjectSelect}
      />
    </div>
  );
};

export default PurchaseTotalBill;
