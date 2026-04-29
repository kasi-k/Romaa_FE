import { useState } from "react";
import { Truck, RefreshCw, XCircle, AlertTriangle } from "lucide-react";
import {
  useEWayBillList, useGenerateEWayBill, useUpdatePartB, useCancelEWayBill,
} from "./hooks/useEWayBill";

const fmt = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const SOURCE_TYPES = ["ClientBilling", "PurchaseBill", "StockTransfer"];
const TRANSPORT_MODES = ["Road", "Rail", "Air", "Ship"];
const DOC_TYPES = ["INV", "CRN", "DBN"];

const STATUS_CLS = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700",
  PENDING_PART_B: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700",
  CANCELLED: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700",
  EXPIRED: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400";

/* ── Generate Modal ───────────────────────────────────────────────── */
const GenerateModal = ({ onClose }) => {
  const [form, setForm] = useState({
    source_type: "ClientBilling", source_ref: "", source_no: "",
    from_gstin: "", from_pin: "", from_state_code: "", from_place: "",
    to_gstin: "", to_pin: "", to_state_code: "", to_place: "",
    distance_km: "", transport_mode: "Road", transporter_id: "", transporter_name: "",
    vehicle_no: "", doc_type: "INV",
  });
  const { mutate: generate, isPending } = useGenerateEWayBill({ onSuccess: onClose });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); generate({ ...form, distance_km: Number(form.distance_km) || 0 }); }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Generate E-Way Bill</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Source Type</label>
              <select className={inp} value={form.source_type} onChange={(e) => set("source_type", e.target.value)}>
                {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Doc No.</label>
              <input className={inp} required value={form.source_no} onChange={(e) => set("source_no", e.target.value)} placeholder="BILL-25-26-0042" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Doc Type</label>
              <select className={inp} value={form.doc_type} onChange={(e) => set("doc_type", e.target.value)}>
                {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Document ID</label>
              <input className={inp} required value={form.source_ref} onChange={(e) => set("source_ref", e.target.value)} placeholder="MongoDB ObjectId" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">From (Supplier)</p>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2"><label className="block text-xs text-gray-400 mb-1">GSTIN</label><input className={inp} value={form.from_gstin} onChange={(e) => set("from_gstin", e.target.value)} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">PIN</label><input className={inp} value={form.from_pin} onChange={(e) => set("from_pin", e.target.value)} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">State Code</label><input className={inp} value={form.from_state_code} onChange={(e) => set("from_state_code", e.target.value)} /></div>
            <div className="col-span-4"><label className="block text-xs text-gray-400 mb-1">Place</label><input className={inp} value={form.from_place} onChange={(e) => set("from_place", e.target.value)} /></div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">To (Recipient)</p>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2"><label className="block text-xs text-gray-400 mb-1">GSTIN</label><input className={inp} value={form.to_gstin} onChange={(e) => set("to_gstin", e.target.value)} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">PIN</label><input className={inp} value={form.to_pin} onChange={(e) => set("to_pin", e.target.value)} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">State Code</label><input className={inp} value={form.to_state_code} onChange={(e) => set("to_state_code", e.target.value)} /></div>
            <div className="col-span-4"><label className="block text-xs text-gray-400 mb-1">Place</label><input className={inp} value={form.to_place} onChange={(e) => set("to_place", e.target.value)} /></div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Transport</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mode</label>
              <select className={inp} value={form.transport_mode} onChange={(e) => set("transport_mode", e.target.value)}>
                {TRANSPORT_MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className="block text-xs text-gray-400 mb-1">Distance (km)</label><input type="number" className={inp} value={form.distance_km} onChange={(e) => set("distance_km", e.target.value)} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Vehicle No.</label><input className={inp} value={form.vehicle_no} onChange={(e) => set("vehicle_no", e.target.value)} placeholder="TN01AB1234" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Transporter ID</label><input className={inp} value={form.transporter_id} onChange={(e) => set("transporter_id", e.target.value)} /></div>
            <div className="col-span-2"><label className="block text-xs text-gray-400 mb-1">Transporter Name</label><input className={inp} value={form.transporter_name} onChange={(e) => set("transporter_name", e.target.value)} /></div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
            {isPending ? "Generating…" : "Generate EWB"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Part B Modal ─────────────────────────────────────────────────── */
/* Spec §22: POST /ewaybill/:id/part-b body = { delivery_state, vehicle_number, transport_mode } */
const PartBModal = ({ ewbId, onClose }) => {
  const [form, setForm] = useState({
    vehicle_number: "",
    transport_mode: "Road",
    delivery_state: "",
    reason: "",
  });
  const { mutate: updatePartB, isPending } = useUpdatePartB({ onSuccess: onClose });
  const submit = (e) => {
    e.preventDefault();
    updatePartB({
      id: ewbId,
      vehicle_number: form.vehicle_number,
      transport_mode: form.transport_mode,
      delivery_state: form.delivery_state || undefined,
      reason: form.reason || undefined,
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={submit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Update Part B (Vehicle &amp; Transport)</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Number</label>
            <input
              className={inp}
              required
              value={form.vehicle_number}
              onChange={(e) => setForm({ ...form, vehicle_number: e.target.value.toUpperCase() })}
              placeholder="TN01AB1234"
              maxLength={15}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Transport Mode</label>
            <select
              className={inp}
              value={form.transport_mode}
              onChange={(e) => setForm({ ...form, transport_mode: e.target.value })}
            >
              {TRANSPORT_MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery State (optional)</label>
            <input
              className={inp}
              value={form.delivery_state}
              onChange={(e) => setForm({ ...form, delivery_state: e.target.value })}
              placeholder="Tamil Nadu"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Reason (optional)</label>
            <input
              className={inp}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Vehicle changed / transporter swap"
            />
          </div>
          <p className="text-[10px] text-gray-400">Part-B is mandatory before the consignment moves when distance &gt; 50km or inter-state.</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending || !form.vehicle_number} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
            {isPending ? "Updating…" : "Save Part B"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Cancel EWB Modal ─────────────────────────────────────────────── */
const CancelEWBModal = ({ ewbId, onClose }) => {
  const [reason, setReason] = useState("");
  const { mutate: cancel, isPending } = useCancelEWayBill({ onSuccess: onClose });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); cancel({ id: ewbId, reason }); }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Cancel E-Way Bill</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Reason</label>
          <input className={inp} required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Wrong supplier" />
          <p className="text-[10px] text-amber-600 mt-2">Cancellation only allowed within 24 hrs of generation.</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Back</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
            {isPending ? "Cancelling…" : "Cancel EWB"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const EWayBill = () => {
  const [params, setParams] = useState({ page: 1, limit: 20, status: "", source_type: "" });
  const [showGenerate, setShowGenerate] = useState(false);
  const [partBId, setPartBId] = useState(null);
  const [cancelId, setCancelId] = useState(null);

  const { data, isLoading, refetch } = useEWayBillList(params);
  const rows = data?.data || [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Truck size={18} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">E-Way Bill</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={params.source_type} onChange={(e) => setParams({ ...params, source_type: e.target.value, page: 1 })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
            <option value="">All Sources</option>
            {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_PART_B">Pending Part B</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          <button onClick={() => setShowGenerate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Generate EWB
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full mr-2" />Loading…
          </div>
        )}
        {!isLoading && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["EWB No.", "Source", "Doc No.", "Vehicle", "Valid Upto", "Distance", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.ewb_no}</td>
                    <td className="px-4 py-2 text-gray-500">{r.source_type}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.source_no}</td>
                    <td className="px-4 py-2 font-mono text-gray-500">{r.vehicle_no || "—"}</td>
                    <td className="px-4 py-2 text-gray-500">{fmt(r.valid_upto)}</td>
                    <td className="px-4 py-2 text-gray-500">{r.distance_km ? `${r.distance_km} km` : "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_CLS[r.status] || ""}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 justify-end">
                        {r.status === "PENDING_PART_B" && (
                          <button onClick={() => setPartBId(r._id)} title="Update Part B" className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
                            <Truck size={13} />
                          </button>
                        )}
                        {r.status === "ACTIVE" && (
                          <button onClick={() => setCancelId(r._id)} title="Cancel EWB" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">
                            <AlertTriangle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">No e-way bills found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
      {partBId && <PartBModal ewbId={partBId} onClose={() => setPartBId(null)} />}
      {cancelId && <CancelEWBModal ewbId={cancelId} onClose={() => setCancelId(null)} />}
    </div>
  );
};

export default EWayBill;
