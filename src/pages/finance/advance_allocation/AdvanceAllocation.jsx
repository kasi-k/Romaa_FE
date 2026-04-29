import { useState } from "react";
import { Banknote, RefreshCw, XCircle, CheckCircle } from "lucide-react";
import {
  useAdvanceOutstandingPaid, useAdvanceOutstandingReceived, useAdvanceSummary,
  useAllocateAdvance,
} from "./hooks/useAdvanceAllocation";

const fmt = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtN = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

/* ── Allocate Modal ───────────────────────────────────────────────── */
const AllocateModal = ({ voucher, onClose }) => {
  const [form, setForm] = useState({
    voucher_type: voucher.voucher_type || "PaymentVoucher",
    voucher_ref: voucher._id || "",
    bill_type: "PurchaseBill",
    bill_ref: "",
    amount: "",
    narration: "",
  });
  const { mutate: allocate, isPending } = useAllocateAdvance({ onSuccess: onClose });
  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); allocate({ ...form, amount: parseFloat(form.amount) || 0 }); }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Allocate Advance</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs">
            <p className="font-semibold text-gray-700 dark:text-gray-200">{voucher.voucher_no} · {voucher.supplier_name}</p>
            <p className="text-gray-500">Balance available: <strong className="text-green-600">{fmtN(voucher.balance_amount)}</strong></p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bill Type</label>
            <select className={inp} value={form.bill_type} onChange={(e) => setForm({ ...form, bill_type: e.target.value })}>
              <option>PurchaseBill</option>
              <option>WeeklyBilling</option>
              <option>ClientBilling</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bill ID (ObjectId)</label>
            <input className={inp} required value={form.bill_ref} onChange={(e) => setForm({ ...form, bill_ref: e.target.value })} placeholder="MongoDB ObjectId of the bill" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (₹)</label>
            <input type="number" step="0.01" className={inp} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              max={voucher.balance_amount} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Narration</label>
            <input className={inp} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50">
            {isPending ? "Allocating…" : "Allocate"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Outstanding Table ────────────────────────────────────────────── */
const OutstandingTable = ({ rows, onAllocate, voucherType }) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          {["Voucher No.", "Date", "Party", "Total", "Allocated", "Balance", ""].map((h) => (
            <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {safeRows.map((r, i) => (
          <tr key={r.voucher_id || r._id || i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
            <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.voucher_no}</td>
            <td className="px-4 py-2 text-gray-500">{fmt(r.voucher_date)}</td>
            <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.supplier_name || r.party_name}</td>
            <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">{fmtN(r.total_amount)}</td>
            <td className="px-4 py-2 tabular-nums text-right text-amber-600">{fmtN(r.allocated_amount)}</td>
            <td className="px-4 py-2 tabular-nums text-right font-semibold text-green-600 dark:text-green-400">{fmtN(r.balance_amount)}</td>
            <td className="px-4 py-2 text-right">
              {r.balance_amount > 0 && (
                <button onClick={() => onAllocate({ ...r, voucher_type: voucherType })} title="Allocate"
                  className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
                  <CheckCircle size={13} />
                </button>
              )}
            </td>
          </tr>
        ))}
        {!safeRows.length && <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">No outstanding advances.</td></tr>}
      </tbody>
    </table>
  </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const AdvanceAllocation = () => {
  const [tab, setTab] = useState("paid");
  const [paidFilter, setPaidFilter] = useState({ supplier_type: "", supplier_id: "", tender_id: "" });
  const [receivedFilter, setReceivedFilter] = useState({ client_id: "", tender_id: "" });
  const [allocateVoucher, setAllocateVoucher] = useState(null);

  const { data: paidData, isLoading: paidLoading, refetch: refetchPaid } = useAdvanceOutstandingPaid(paidFilter);
  const { data: receivedData, isLoading: receivedLoading, refetch: refetchReceived } = useAdvanceOutstandingReceived(receivedFilter);
  const { data: summary, refetch: refetchSummary } = useAdvanceSummary({ tender_id: paidFilter.tender_id || receivedFilter.tender_id });

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Banknote size={18} className="text-green-600 dark:text-green-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Advances</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Advance Allocation</h1>
          </div>
        </div>
        <button onClick={() => { refetchPaid(); refetchReceived(); refetchSummary(); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Advances Paid (Outstanding)", value: fmtN(summary.total_paid_outstanding), cls: "text-amber-600 dark:text-amber-400" },
              { label: "Advances Received (Outstanding)", value: fmtN(summary.total_received_outstanding), cls: "text-blue-600 dark:text-blue-400" },
              { label: "Paid — Total Allocated", value: fmtN(summary.total_paid_allocated), cls: "text-gray-600 dark:text-gray-300" },
              { label: "Received — Total Allocated", value: fmtN(summary.total_received_allocated), cls: "text-gray-600 dark:text-gray-300" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-extrabold mt-0.5 tabular-nums ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 w-fit">
          {[["paid", "Paid to Vendors"], ["received", "Received from Clients"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === k ? "bg-green-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "paid" && (
          <>
            <div className="flex gap-2">
              <input value={paidFilter.supplier_type} onChange={(e) => setPaidFilter({ ...paidFilter, supplier_type: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-32" placeholder="Supplier Type" />
              <input value={paidFilter.tender_id} onChange={(e) => setPaidFilter({ ...paidFilter, tender_id: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-32" placeholder="Tender ID" />
            </div>
            {paidLoading ? <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
              : <OutstandingTable rows={Array.isArray(paidData) ? paidData : []} onAllocate={setAllocateVoucher} voucherType="PaymentVoucher" />}
          </>
        )}

        {tab === "received" && (
          <>
            <div className="flex gap-2">
              <input value={receivedFilter.client_id} onChange={(e) => setReceivedFilter({ ...receivedFilter, client_id: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-36" placeholder="Client ID" />
              <input value={receivedFilter.tender_id} onChange={(e) => setReceivedFilter({ ...receivedFilter, tender_id: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-32" placeholder="Tender ID" />
            </div>
            {receivedLoading ? <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
              : <OutstandingTable rows={Array.isArray(receivedData) ? receivedData : []} onAllocate={setAllocateVoucher} voucherType="ReceiptVoucher" />}
          </>
        )}
      </div>

      {allocateVoucher && <AllocateModal voucher={allocateVoucher} onClose={() => setAllocateVoucher(null)} />}
    </div>
  );
};

export default AdvanceAllocation;
