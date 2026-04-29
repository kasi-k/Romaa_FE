import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, RotateCcw, AlertOctagon } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import {
  useIssuanceDetail,
  useMarkLost,
} from "./hooks/useIssuance";
import StatusChip from "../_shared/StatusChip";
import Loader from "../../../components/Loader";
import QuickReturnModal from "./QuickReturnModal";

const IssuanceDetail = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canEdit = canAccess(ASSET_MODULE, ASSET_SUB.ISSUANCE, ASSET_ACTION.EDIT);

  const [returning, setReturning] = useState(false);
  const [confirmLost, setConfirmLost] = useState(false);

  const { data, isLoading } = useIssuanceDetail(issueId);
  const { mutate: markLost, isPending: marking } = useMarkLost({ onDone: () => setConfirmLost(false) });

  if (isLoading) return <div className="p-12"><Loader /></div>;
  if (!data) return <div className="p-12 text-center text-gray-500">Issuance not found.</div>;

  const printSlip = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>${data.issue_id}</title>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 24px; max-width: 600px; }
        h1 { margin: 0 0 4px; font-size: 20px; }
        .row { display: flex; gap: 12px; margin: 6px 0; font-size: 12px; }
        .row span:first-child { color: #888; min-width: 130px; }
        .sig { margin-top: 40px; border-top: 1px dashed #888; padding-top: 8px; font-size: 10px; color: #888; text-align: center; }
        hr { margin: 12px 0; border: 0; border-top: 1px solid #eee; }
      </style></head><body>
        <h1>Issuance Slip — ${data.issue_id}</h1>
        <p style="font-size:12px;color:#888;margin:0">Romaa Construction ERP</p>
        <hr/>
        <div class="row"><span>Asset</span><span><b>${data.asset_id_label}</b> — ${data.asset_name || ""} (${data.asset_kind})</span></div>
        <div class="row"><span>Custodian</span><span>${data.assigned_to_name} (${data.assigned_to_kind})</span></div>
        <div class="row"><span>Project / Site</span><span>${data.project_id || "—"} · ${data.site_name || "—"}</span></div>
        <div class="row"><span>Quantity</span><span>${data.quantity}</span></div>
        <div class="row"><span>Issue Date</span><span>${data.issue_date ? new Date(data.issue_date).toLocaleDateString() : "—"}</span></div>
        <div class="row"><span>Expected Return</span><span>${data.expected_return_date ? new Date(data.expected_return_date).toLocaleDateString() : "—"}</span></div>
        <div class="row"><span>Condition on Issue</span><span>${data.condition_on_issue || "—"}</span></div>
        <div class="row"><span>Purpose</span><span>${data.purpose || "—"}</span></div>
        <div class="row"><span>Status</span><span>${data.status}</span></div>
        <div class="sig">Custodian signature: ${data.handover_signature_url ? "✔ on file" : "______________________"}</div>
      </body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="font-roboto-flex p-4 max-w-4xl">
      <button onClick={() => navigate("/asset/issuance")} className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{data.issue_id}</span>
              <StatusChip value={data.status} />
              <StatusChip value={data.asset_kind} />
            </div>
            <h1 className="text-xl font-bold">{data.asset_name}</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{data.asset_id_label}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={printSlip} className={btnSecondary}>
              <Printer size={14} /> Print Slip
            </button>
            {canEdit && data.status !== "RETURNED" && data.status !== "LOST" && (
              <>
                <button onClick={() => setReturning(true)} className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
                  <RotateCcw size={14} /> Return
                </button>
                <button onClick={() => setConfirmLost(true)} className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-red-300 text-red-600 dark:text-red-300 dark:border-red-800 rounded-md hover:bg-red-50">
                  <AlertOctagon size={14} /> Mark Lost
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KV k="Custodian" v={data.assigned_to_name} />
          <KV k="Custodian Kind" v={data.assigned_to_kind} />
          <KV k="Project ID" v={data.project_id} />
          <KV k="Site" v={data.site_name} />
          <KV k="Quantity" v={data.quantity} />
          <KV k="Issue Date" v={data.issue_date ? new Date(data.issue_date).toLocaleDateString() : null} />
          <KV k="Expected Return" v={data.expected_return_date ? new Date(data.expected_return_date).toLocaleDateString() : null} />
          <KV k="Actual Return" v={data.actual_return_date ? new Date(data.actual_return_date).toLocaleDateString() : null} />
          <KV k="Quantity Returned" v={data.quantity_returned} />
          <KV k="Condition on Issue" v={data.condition_on_issue} />
          <KV k="Condition on Return" v={data.condition_on_return} />
          <KV k="Damage Charge" v={data.damage_charge ? `₹ ${Number(data.damage_charge).toLocaleString()}` : null} />
        </div>
        {data.purpose && (
          <div className="mt-3">
            <p className="text-[10px] uppercase font-semibold text-gray-500">Purpose</p>
            <p className="text-sm">{data.purpose}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {data.handover_photo_url && (
            <a href={data.handover_photo_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Handover photo</a>
          )}
          {data.handover_signature_url && (
            <a href={data.handover_signature_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Handover signature</a>
          )}
          {data.return_photo_url && (
            <a href={data.return_photo_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Return photo</a>
          )}
          {data.return_signature_url && (
            <a href={data.return_signature_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Return signature</a>
          )}
        </div>
      </div>

      {returning && (
        <QuickReturnModal
          issuance={data}
          onClose={() => setReturning(false)}
        />
      )}

      {confirmLost && (
        <div className="fixed inset-0 z-30 grid place-items-center backdrop-blur-xs">
          <div className="bg-white dark:bg-layout-dark rounded-xl p-6 max-w-md mx-4 shadow-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-2">Mark as Lost?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              This will set the issuance status to LOST. For tagged assets, the asset itself will also be flagged LOST.
            </p>
            <textarea
              id="lost-notes"
              rows={3}
              placeholder="Notes (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md mb-3 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmLost(false)} disabled={marking} className="cursor-pointer px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50">Cancel</button>
              <button
                onClick={() => {
                  const notes = document.getElementById("lost-notes")?.value;
                  markLost({ issueId: data.issue_id, notes });
                }}
                disabled={marking}
                className="cursor-pointer px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
              >
                {marking ? "Saving…" : "Mark Lost"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const btnSecondary = "cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800";

const KV = ({ k, v }) => (
  <div>
    <p className="text-[10px] uppercase font-semibold text-gray-500">{k}</p>
    <p className="text-sm">{v ?? "—"}</p>
  </div>
);

export default IssuanceDetail;
