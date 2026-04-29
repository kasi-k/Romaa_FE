import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../../../constant";
import { Loader2 } from "lucide-react";
import {
  TbFileInvoice, TbReceipt, TbBuildingBank,
  TbCalendar, TbUser, TbHash, TbAlertCircle,
} from "react-icons/tb";

/* ─── Formatters ─────────────────────────────────────────────── */
const fmt = (n, decimals = 2) =>
  n != null
    ? Number(n).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : "0.00";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

/* ─── Table helpers ──────────────────────────────────────────── */
const Th = ({ children, right, center, colSpan, rowSpan, className = "" }) => (
  <th
    colSpan={colSpan}
    rowSpan={rowSpan}
    className={`px-2 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ${right ? "text-right" : center ? "text-center" : "text-left"} ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, right, center, bold, colSpan, className = "" }) => (
  <td
    colSpan={colSpan}
    className={`px-2 py-2 text-xs border border-gray-200 dark:border-gray-700 tabular-nums ${right ? "text-right" : center ? "text-center" : "text-left"} ${bold ? "font-semibold text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-300"} ${className}`}
  >
    {children}
  </td>
);

/* ─── Info chip ──────────────────────────────────────────────── */
function InfoChip({ icon, label, value }) {
  const Tag = icon;
  return (
    <div className="flex items-center gap-2">
      <Tag size={13} className="text-gray-400 shrink-0" />
      <span className="text-xs text-gray-400">{label}:</span>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</span>
    </div>
  );
}

/* ─── Summary row ────────────────────────────────────────────── */
function SummaryRow({ label, value, sub, positive, negative, total, indent }) {
  return (
    <div className={`flex justify-between items-baseline py-1.5 ${total ? "border-t-2 border-gray-300 dark:border-gray-500 mt-1 pt-2" : "border-b border-dashed border-gray-100 dark:border-gray-700"}`}>
      <span className={`text-xs ${indent ? "pl-4" : ""} ${total ? "font-bold text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </span>
      <span className={`text-sm tabular-nums ${total ? "font-bold text-gray-900 dark:text-white" : positive ? "text-emerald-600" : negative ? "text-red-500" : "font-medium text-gray-700 dark:text-gray-200"}`}>
        {sub && <span className="text-xs mr-1 font-normal text-gray-400">{sub}</span>}
        ₹ {value}
      </span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function BillSummaryTab({ tenderId, billId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!tenderId || !billId) return;
    setLoading(true);
    axios
      .get(`${API}/clientbilling/api/details?tender_id=${tenderId}&bill_id=${billId}`, { withCredentials: true })
      .then((res) => { if (res.data.status || res.data.success) setData(res.data.data); })
      .catch(() => setError("Failed to load bill summary."))
      .finally(() => setLoading(false));
  }, [tenderId, billId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-blue-500" />
        <span className="text-sm text-gray-400">Loading bill summary…</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-red-500 p-6 text-sm">
        <TbAlertCircle size={16} /> {error}
      </div>
    );

  if (!data) return null;

  const grossAmount  = data.grand_total       ?? 0;
  const retentionAmt = data.retention_amount  ?? 0;
  const totalDed     = data.total_deductions  ?? 0;
  const cgst         = data.cgst_amt          ?? 0;
  const sgst         = data.sgst_amt          ?? 0;
  const igst         = data.igst_amt          ?? 0;
  const netAmount    = data.net_amount        ?? 0;
  const items        = (data.items ?? []).filter((it) => Number(it.current_qty) > 0);

  return (
    <div className="space-y-5">

      {/* ── Bill Header ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-transparent border-b border-gray-100 dark:border-gray-700">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
            <TbFileInvoice size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Client Running Account Bill</p>
            <p className="text-base font-bold text-gray-800 dark:text-white">{data.bill_id}</p>
          </div>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-2">
          <InfoChip icon={TbHash}        label="Sequence"  value={`#${data.bill_sequence}`} />
          <InfoChip icon={TbCalendar}    label="Date"      value={fmtDate(data.bill_date)} />
          <InfoChip icon={TbUser}        label="Client"    value={data.client_name ?? "-"} />
          <InfoChip icon={TbBuildingBank} label="Project"  value={data.tender_name ?? "-"} />
          {data.narration && (
            <InfoChip icon={TbReceipt}   label="Narration" value={data.narration} />
          )}
        </div>
      </div>

      {/* ── Three cards row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Bill Summary */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-violet-50 dark:from-violet-900/20 to-transparent">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Bill Summary</p>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <SummaryRow label="Gross Amount (Upto Date)" value={fmt(grossAmount)} />
            <SummaryRow label={`Retention (${data.retention_pct ?? 0}%)`} sub="(-)" value={fmt(retentionAmt)} negative indent />
            {(data.deductions ?? []).map((d, i) => (
              <SummaryRow key={i} label={d.description} sub="(-)" value={fmt(d.amount)} negative indent />
            ))}
            <SummaryRow label="Sub-total after Deductions" value={fmt(grossAmount - retentionAmt - totalDed)} />
            {cgst > 0 && <SummaryRow label={`CGST (${data.cgst_pct ?? 0}%)`} sub="(+)" value={fmt(cgst)} positive indent />}
            {sgst > 0 && <SummaryRow label={`SGST (${data.sgst_pct ?? 0}%)`} sub="(+)" value={fmt(sgst)} positive indent />}
            {igst > 0 && <SummaryRow label={`IGST (${data.igst_pct ?? 0}%)`} sub="(+)" value={fmt(igst)} positive indent />}
            <SummaryRow label="Net Payable Amount" value={fmt(netAmount)} total />
          </div>
        </div>

        {/* Payment Status */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Payment Status</p>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <SummaryRow label="Net Amount"      value={fmt(netAmount)} />
            <SummaryRow label="Amount Received" sub="(-)" value={fmt(data.amount_received ?? 0)} positive />
            <SummaryRow label="Balance Due"      value={fmt(data.balance_due ?? 0)} total negative={data.balance_due > 0} />
          </div>
          {netAmount > 0 && (
            <div className="px-4 pb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">Payment collected</span>
                <span className="font-bold text-gray-600 dark:text-gray-300">
                  {Math.round(((data.amount_received ?? 0) / netAmount) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round(((data.amount_received ?? 0) / netAmount) * 100), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tax Details */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Tax Details</p>
            <p className="text-xs text-gray-400">{data.tax_mode === "instate" ? "In-State (CGST + SGST)" : "Inter-State (IGST)"}</p>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <SummaryRow label={`CGST @ ${data.cgst_pct ?? 0}%`} value={fmt(cgst)} />
            <SummaryRow label={`SGST @ ${data.sgst_pct ?? 0}%`} value={fmt(sgst)} />
            <SummaryRow label={`IGST @ ${data.igst_pct ?? 0}%`} value={fmt(igst)} />
            <SummaryRow label="Total Tax" value={fmt(data.total_tax ?? 0)} total />
          </div>
        </div>

      </div>

      {/* ── Work Items — full width ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Work Items</p>
          <p className="text-xs text-gray-400">This bill · {items.length} items</p>
        </div>
        <div className="overflow-auto max-h-[520px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <table className="min-w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr>
                <Th>#</Th>
                <Th>Code</Th>
                <Th className="min-w-[200px]">Description</Th>
                <Th center>Unit</Th>
                <Th right>Rate</Th>
                <Th right>Qty</Th>
                <Th right>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.item_code} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                  <Td center>{idx + 1}</Td>
                  <Td bold>{it.item_code}</Td>
                  <Td className="max-w-[220px] whitespace-normal leading-snug">{it.item_name}</Td>
                  <Td center>{it.unit}</Td>
                  <Td right>{fmt(it.rate)}</Td>
                  <Td right className="text-blue-700 dark:text-blue-400 font-semibold">{fmt(it.current_qty, 3)}</Td>
                  <Td right className="text-blue-700 dark:text-blue-400 font-semibold">{fmt(it.current_amount)}</Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <Td colSpan={5} bold>Total</Td>
                <Td right bold className="text-blue-700 dark:text-blue-400">{fmt(items.reduce((s, i) => s + i.current_qty, 0), 3)}</Td>
                <Td right bold className="text-blue-700 dark:text-blue-400">{fmt(items.reduce((s, i) => s + i.current_amount, 0))}</Td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BillSummaryTab;
