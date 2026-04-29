import { useState } from "react";
import { FileCheck, RefreshCw, XCircle, QrCode, Ban } from "lucide-react";
import {
  useEInvoiceList, useGenerateEInvoice, useCancelEInvoice, useEInvoiceQR,
} from "./hooks/useEInvoice";

const fmt = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const SOURCE_TYPES = ["ClientBilling", "ClientCreditNote", "DebitNote"];

const STATUS_CLS = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700",
  CANCELLED: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700",
};

/* ── Generate Modal ───────────────────────────────────────────────── */
const GenerateModal = ({ onClose }) => {
  const [form, setForm] = useState({ source_type: "ClientBilling", source_ref: "", source_no: "" });
  const { mutate: generate, isPending } = useGenerateEInvoice({ onSuccess: onClose });
  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); generate(form); }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Generate E-Invoice</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Source Type</label>
            <select className={inp} value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
              {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Document ID</label>
            <input className={inp} required value={form.source_ref} onChange={(e) => setForm({ ...form, source_ref: e.target.value })} placeholder="MongoDB ObjectId" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Document No.</label>
            <input className={inp} required value={form.source_no} onChange={(e) => setForm({ ...form, source_no: e.target.value })} placeholder="BILL-25-26-0042" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
            {isPending ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Cancel Modal ─────────────────────────────────────────────────── */
const CancelModal = ({ id, onClose }) => {
  const [reason, setReason] = useState("");
  const { mutate: cancel, isPending } = useCancelEInvoice({ onSuccess: onClose });
  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-400";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); cancel({ id, reason }); }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Cancel E-Invoice</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Cancellation Reason</label>
          <input className={inp} required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Data error" />
          <p className="text-[10px] text-amber-600 mt-2">Cancellation is only allowed within 24 hrs of generation.</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Back</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
            {isPending ? "Cancelling…" : "Cancel E-Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── QR Drawer ────────────────────────────────────────────────────── */
const QRDrawer = ({ id, onClose }) => {
  const { data, isLoading } = useEInvoiceQR(id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">E-Invoice QR</h2>
          <button onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-6 text-center">
          {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
          {data?.png_base64 && (
            <img src={`data:image/png;base64,${data.png_base64}`} alt="QR Code" className="mx-auto max-w-full rounded-xl border" />
          )}
          {data?.irn && (
            <p className="text-xs font-mono text-gray-500 mt-3 break-all">{data.irn}</p>
          )}
          {!data?.png_base64 && !isLoading && data?.signed_qr_code && (
            <p className="text-xs text-gray-500 break-all">{data.signed_qr_code}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const EInvoice = () => {
  const [params, setParams] = useState({ page: 1, limit: 20, status: "", source_type: "" });
  const [showGenerate, setShowGenerate] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [qrId, setQrId] = useState(null);

  const { data, isLoading, refetch } = useEInvoiceList(params);
  const rows = data?.data || [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <FileCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">E-Invoice (IRN / IRP)</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={params.source_type} onChange={(e) => setParams({ ...params, source_type: e.target.value, page: 1 })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
            <option value="">All Types</option>
            {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          <button onClick={() => setShowGenerate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Generate E-Invoice
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-2" />Loading…
          </div>
        )}

        {!isLoading && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["IRN", "Source", "Doc No.", "Ack No.", "Ack Date", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-2 font-mono text-[10px] text-gray-500 max-w-[180px] truncate" title={r.irn}>{r.irn}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.source_type}</td>
                    <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.source_no}</td>
                    <td className="px-4 py-2 font-mono text-gray-500">{r.ack_no}</td>
                    <td className="px-4 py-2 text-gray-500">{fmt(r.ack_dt)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_CLS[r.status] || ""}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => setQrId(r._id)} title="View QR" className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-700">
                          <QrCode size={13} />
                        </button>
                        {r.status === "ACTIVE" && (
                          <button onClick={() => setCancelId(r._id)} title="Cancel E-Invoice" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">
                            <Ban size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No e-invoices yet. Click "Generate E-Invoice" to start.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(data?.totalPages || 0) > 1 && (
          <div className="flex items-center justify-end gap-2 mt-3">
            <button disabled={params.page <= 1} onClick={() => setParams({ ...params, page: params.page - 1 })}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Prev</button>
            <span className="text-xs text-gray-500">Page {params.page} / {data?.totalPages}</span>
            <button disabled={params.page >= (data?.totalPages || 1)} onClick={() => setParams({ ...params, page: params.page + 1 })}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Next</button>
          </div>
        )}
      </div>

      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
      {cancelId && <CancelModal id={cancelId} onClose={() => setCancelId(null)} />}
      {qrId && <QRDrawer id={qrId} onClose={() => setQrId(null)} />}
    </div>
  );
};

export default EInvoice;
