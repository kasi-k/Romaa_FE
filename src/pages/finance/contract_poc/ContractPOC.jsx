import { useState } from "react";
import { Activity, RefreshCw, Play, Camera, ChevronRight, ChevronDown } from "lucide-react";
import {
  useContractPOCList, useContractPOCDetail,
  useContractPOCCompute, useContractPOCComputeAll, useSnapshotContractPOC,
} from "./hooks/useContractPOC";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const pocColour = (pct) => {
  if (pct == null) return "text-gray-400";
  if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-500";
};

/* ── Detail Drawer ──────────────────────────────────────────────── */
const DetailDrawer = ({ tenderId, onClose }) => {
  const { data, isLoading } = useContractPOCDetail(tenderId);
  const d = data || {};
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-800 dark:text-white">POC Detail — {tenderId}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {isLoading && <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Loading…</div>}
        {!isLoading && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ["Contract Value", fmtCompact(d.contract_value)],
                ["POC %", d.poc_pct != null ? `${Number(d.poc_pct).toFixed(1)}%` : "—"],
                ["Revenue Recognised", fmtCompact(d.revenue_recognised)],
                ["Cost Incurred", fmtCompact(d.cost_incurred)],
                ["Est. Cost at Completion", fmtCompact(d.estimated_total_cost)],
                ["Gross Margin", d.gross_margin_pct != null ? `${Number(d.gross_margin_pct).toFixed(1)}%` : "—"],
              ].map(([lbl, val]) => (
                <div key={lbl} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400">{lbl}</p>
                  <p className="font-bold text-gray-700 dark:text-gray-200 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            {Array.isArray(d.snapshots) && d.snapshots.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Snapshot History</p>
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-1.5 text-left text-[10px] text-gray-400 font-bold uppercase">Date</th>
                    <th className="px-3 py-1.5 text-right text-[10px] text-gray-400 font-bold uppercase">POC %</th>
                    <th className="px-3 py-1.5 text-right text-[10px] text-gray-400 font-bold uppercase">Revenue</th>
                  </tr></thead>
                  <tbody>
                    {d.snapshots.map((s, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{s.snapshot_date?.slice(0, 10)}</td>
                        <td className="px-3 py-1.5 text-right font-semibold text-gray-700 dark:text-gray-200">{Number(s.poc_pct || 0).toFixed(1)}%</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-emerald-600">₹{fmt(s.revenue_recognised)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const todayStr = () => new Date().toISOString().split("T")[0];

const ContractPOC = () => {
  const [selected, setSelected] = useState(null);
  const [confirmSnap, setConfirmSnap] = useState(null);
  /* Spec §16 snapshot body: { as_of, contract_asset_code, contract_liability_code, revenue_code } */
  const [snapForm, setSnapForm] = useState({
    as_of: todayStr(),
    contract_asset_code: "1300",
    contract_liability_code: "2100",
    revenue_code: "4001",
    note: "",
  });

  const { data: list = [], isLoading, refetch } = useContractPOCList();
  const safeList = Array.isArray(list) ? list : [];

  const compute = useContractPOCCompute();
  const computeAll = useContractPOCComputeAll();
  const snapshot = useSnapshotContractPOC({ onSuccess: () => setConfirmSnap(null) });

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-teal-600 dark:text-teal-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Contract POC — Revenue Recognition</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => computeAll.mutate()} disabled={computeAll.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg">
            <Play size={13} />{computeAll.isPending ? "Computing…" : "Compute All"}
          </button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading && (
          <div className="py-12 flex items-center justify-center text-sm text-gray-400">
            <span className="animate-spin h-5 w-5 border-2 border-teal-400 border-t-transparent rounded-full mr-2" />Loading…
          </div>
        )}

        {!isLoading && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Tender", "Contract Value", "Cost Incurred", "POC %", "Revenue Recognised", "Gross Margin", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right first:text-left last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeList.map((r) => (
                  <tr key={r.tender_id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-2">
                      <button onClick={() => setSelected(r.tender_id)} className="text-left">
                        <p className="font-semibold text-gray-700 dark:text-gray-200 hover:text-teal-600">{r.tender_name || r.tender_id}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{r.tender_id}</p>
                      </button>
                    </td>
                    <td className="px-4 py-2 tabular-nums text-right text-gray-600 dark:text-gray-300">{fmtCompact(r.contract_value)}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-red-500">{fmtCompact(r.cost_incurred)}</td>
                    <td className={`px-4 py-2 tabular-nums text-right font-extrabold ${pocColour(r.poc_pct)}`}>
                      {r.poc_pct != null ? `${Number(r.poc_pct).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-2 tabular-nums text-right text-emerald-600">{fmtCompact(r.revenue_recognised)}</td>
                    <td className={`px-4 py-2 tabular-nums text-right font-semibold ${(r.gross_margin_pct || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {r.gross_margin_pct != null ? `${Number(r.gross_margin_pct).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => compute.mutate({ tender_id: r.tender_id })} disabled={compute.isPending}
                          className="p-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600" title="Recompute">
                          <Play size={12} />
                        </button>
                        <button onClick={() => { setConfirmSnap(r.tender_id); setSnapForm((f) => ({ ...f, note: "" })); }}
                          className="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600" title="Snapshot + post to ledger">
                          <Camera size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!safeList.length && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No contracts. Click "Compute All" to generate.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <DetailDrawer tenderId={selected} onClose={() => setSelected(null)} />}

      {confirmSnap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-3">
            <p className="text-sm font-bold text-gray-800 dark:text-white">Snapshot POC — {confirmSnap}</p>
            <p className="text-xs text-gray-500">
              Locks the current POC calculation as a historical snapshot and posts the adjustment JE to the ledger using the GL accounts below.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">As of</label>
                <input
                  type="date"
                  value={snapForm.as_of}
                  onChange={(e) => setSnapForm({ ...snapForm, as_of: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Revenue GL</label>
                <input
                  value={snapForm.revenue_code}
                  onChange={(e) => setSnapForm({ ...snapForm, revenue_code: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Contract Asset GL</label>
                <input
                  value={snapForm.contract_asset_code}
                  onChange={(e) => setSnapForm({ ...snapForm, contract_asset_code: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Contract Liability GL</label>
                <input
                  value={snapForm.contract_liability_code}
                  onChange={(e) => setSnapForm({ ...snapForm, contract_liability_code: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Note (optional)</label>
              <input
                value={snapForm.note}
                onChange={(e) => setSnapForm({ ...snapForm, note: e.target.value })}
                placeholder="Monthly revenue recognition"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmSnap(null)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button
                onClick={() => snapshot.mutate({
                  tender_id: confirmSnap,
                  as_of: snapForm.as_of,
                  contract_asset_code: snapForm.contract_asset_code,
                  contract_liability_code: snapForm.contract_liability_code,
                  revenue_code: snapForm.revenue_code,
                  note: snapForm.note || undefined,
                })}
                disabled={snapshot.isPending || !snapForm.as_of || !snapForm.revenue_code}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
              >
                {snapshot.isPending ? "Posting JE…" : "Snapshot &amp; Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractPOC;
