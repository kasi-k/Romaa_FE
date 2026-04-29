import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  ArrowRightLeft,
  Power,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import {
  useTaggedAssetDetail,
  useDeleteTaggedAsset,
  useUpdateTaggedAssetStatus,
  useTransferTaggedAsset,
} from "./hooks/useTaggedAsset";
import { useIssuanceList } from "../issuance/hooks/useIssuance";
import { useCalibrationHistory } from "../calibration/hooks/useCalibration";
import StatusChip from "../_shared/StatusChip";
import Loader from "../../../components/Loader";
import DeleteModal from "../../../components/DeleteModal";
import Modal from "../../../components/Modal";
import TaggedAssetForm from "./TaggedAssetForm";

const TABS = ["Overview", "Documents", "Custody", "Calibration"];
const STATUSES = ["ACTIVE", "IN_STORE", "ISSUED", "UNDER_REPAIR", "LOST", "SCRAPPED"];

const TaggedAssetDetail = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canEdit = canAccess(ASSET_MODULE, ASSET_SUB.TAGGED_ASSET, ASSET_ACTION.EDIT);
  const canDelete = canAccess(ASSET_MODULE, ASSET_SUB.TAGGED_ASSET, ASSET_ACTION.DELETE);
  const canCalibrate = canAccess(ASSET_MODULE, ASSET_SUB.CALIBRATION, ASSET_ACTION.CREATE);

  const [tab, setTab] = useState("Overview");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);

  const { data, isLoading } = useTaggedAssetDetail(assetId);

  if (isLoading) return <div className="p-12"><Loader /></div>;
  if (!data) {
    return (
      <div className="p-12 text-center text-gray-500">
        Asset not found.
        <div className="mt-2">
          <button onClick={() => navigate("/asset/tagged")} className="cursor-pointer text-blue-600 hover:underline">
            ← Back to list
          </button>
        </div>
      </div>
    );
  }

  const overdueCalibration =
    data.compliance?.next_calibration_due &&
    new Date(data.compliance.next_calibration_due) < new Date();

  return (
    <div className="font-roboto-flex p-4">
      <button
        onClick={() => navigate("/asset/tagged")}
        className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-3"
      >
        <ArrowLeft size={14} /> Back to list
      </button>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                {data.asset_id}
              </span>
              <StatusChip value={data.asset_class} />
              <StatusChip value={data.status} />
              <StatusChip value={data.condition} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {data.asset_name}
            </h1>
            {data.is_deleted && (
              <span className="text-[10px] uppercase font-bold text-red-600">Retired</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button onClick={() => setEditing(true)} className={btnSecondary}>
                <Edit3 size={14} /> Edit
              </button>
            )}
            {canEdit && (
              <button onClick={() => setTransferModal(true)} className={btnSecondary}>
                <ArrowRightLeft size={14} /> Transfer
              </button>
            )}
            {canEdit && (
              <button onClick={() => setStatusModal(true)} className={btnSecondary}>
                <Power size={14} /> Status
              </button>
            )}
            {canDelete && !data.is_deleted && (
              <button onClick={() => setDeleting(true)} className={btnDanger}>
                <Trash2 size={14} /> Retire
              </button>
            )}
          </div>
        </div>
      </div>

      {overdueCalibration && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle size={16} />
          Calibration overdue since{" "}
          {new Date(data.compliance.next_calibration_due).toLocaleDateString()}.
        </div>
      )}

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`cursor-pointer px-4 py-2 text-sm border-b-2 ${
                tab === t
                  ? "border-blue-600 text-blue-700 dark:text-blue-300"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === "Overview" && <OverviewTab data={data} />}
          {tab === "Documents" && <DocumentsTab docs={data.documents || []} />}
          {tab === "Custody" && <CustodyTab assetId={data._id} />}
          {tab === "Calibration" && (
            <CalibrationTab
              data={data}
              canCalibrate={canCalibrate}
              onRecord={() => navigate(`/asset/calibration/new?asset_ref=${data._id}`)}
            />
          )}
        </div>
      </div>

      {editing && (
        <Modal
          onclose={() => setEditing(false)}
          title="Edit Asset"
          widthClassName="lg:w-[800px] md:w-[700px] w-[95vw]"
        >
          <TaggedAssetForm
            asset={data}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        </Modal>
      )}

      {deleting && (
        <SoftDelete
          asset={data}
          onClose={() => setDeleting(false)}
          onDone={() => navigate("/asset/tagged")}
        />
      )}

      {statusModal && (
        <StatusUpdateModal
          asset={data}
          onClose={() => setStatusModal(false)}
        />
      )}

      {transferModal && (
        <TransferModal
          asset={data}
          onClose={() => setTransferModal(false)}
        />
      )}
    </div>
  );
};

const btnSecondary =
  "cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800";
const btnDanger =
  "cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-300 text-red-600 dark:text-red-300 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20";

const KV = ({ k, v }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase font-semibold text-gray-500">{k}</span>
    <span className="text-sm text-gray-800 dark:text-gray-200">{v ?? "—"}</span>
  </div>
);

const OverviewTab = ({ data }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <KV k="Ownership" v={data.ownership} />
    <KV k="Vendor" v={data.vendor_name} />
    <KV k="Serial #" v={data.serial_number} />
    <KV k="Model #" v={data.model_number} />
    <KV k="Manufacturer" v={data.manufacturer} />
    <KV k="Mfg. Year" v={data.manufacturing_year} />
    <KV k="Purchase Date" v={data.purchase_date ? new Date(data.purchase_date).toLocaleDateString() : null} />
    <KV k="Purchase Cost" v={data.purchase_cost ? `₹ ${Number(data.purchase_cost).toLocaleString()}` : null} />
    <KV k="Supplier" v={data.supplier_name} />
    <KV k="Invoice #" v={data.invoice_number} />
    <KV k="QR Code" v={data.qr_code} />
    <KV k="RFID Tag" v={data.rfid_tag} />
    <KV k="Location Type" v={data.current_location_type} />
    <KV k="Site" v={data.current_site_name} />
    <KV k="Store" v={data.current_store_name} />
    <KV k="Custodian" v={data.assigned_to_employee_name} />
    {data.specifications && (
      <div className="col-span-full mt-2">
        <span className="text-[10px] uppercase font-semibold text-gray-500">Specifications</span>
        <pre className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono overflow-auto">
          {JSON.stringify(data.specifications, null, 2)}
        </pre>
      </div>
    )}
  </div>
);

const DocumentsTab = ({ docs }) =>
  docs.length === 0 ? (
    <p className="text-sm text-gray-500">No documents uploaded.</p>
  ) : (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-500">
        <tr>
          <th className="text-left px-3 py-2">Type</th>
          <th className="text-left px-3 py-2">Number</th>
          <th className="text-left px-3 py-2">Expiry</th>
          <th className="text-left px-3 py-2">File</th>
        </tr>
      </thead>
      <tbody>
        {docs.map((d, i) => (
          <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
            <td className="px-3 py-2">{d.doc_type}</td>
            <td className="px-3 py-2">{d.doc_number}</td>
            <td className="px-3 py-2">{d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : "—"}</td>
            <td className="px-3 py-2">
              {d.file_url ? (
                <a className="text-blue-600 hover:underline" href={d.file_url} target="_blank" rel="noreferrer">
                  Open
                </a>
              ) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

const CustodyTab = ({ assetId }) => {
  const { data, isLoading } = useIssuanceList({
    asset_kind: "TAGGED",
    limit: 50,
  });
  const all = data?.data?.rows || data?.data || [];
  const rows = all.filter((r) => r.asset_ref === assetId || r.asset_ref?._id === assetId);
  if (isLoading) return <Loader />;
  if (rows.length === 0) return <p className="text-sm text-gray-500">No custody history.</p>;
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-500">
        <tr>
          <th className="text-left px-3 py-2">Issue ID</th>
          <th className="text-left px-3 py-2">Custodian</th>
          <th className="text-left px-3 py-2">Issued</th>
          <th className="text-left px-3 py-2">Expected Return</th>
          <th className="text-left px-3 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.issue_id} className="border-t border-gray-100 dark:border-gray-800">
            <td className="px-3 py-2 font-mono">{r.issue_id}</td>
            <td className="px-3 py-2">{r.assigned_to_name}</td>
            <td className="px-3 py-2">{r.issue_date ? new Date(r.issue_date).toLocaleDateString() : "—"}</td>
            <td className="px-3 py-2">{r.expected_return_date ? new Date(r.expected_return_date).toLocaleDateString() : "—"}</td>
            <td className="px-3 py-2"><StatusChip value={r.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const CalibrationTab = ({ data, canCalibrate, onRecord }) => {
  const { data: hist, isLoading } = useCalibrationHistory(data.asset_id);
  const rows = hist?.data || hist || [];
  return (
    <div className="space-y-3">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-semibold text-gray-500">Latest Certificate</p>
          <p className="text-sm font-mono">{data.compliance?.last_certificate_number || "—"}</p>
          <p className="text-xs text-gray-500">
            Last: {data.compliance?.last_calibration_date ? new Date(data.compliance.last_calibration_date).toLocaleDateString() : "—"}
            {" · "}
            Next due: {data.compliance?.next_calibration_due ? new Date(data.compliance.next_calibration_due).toLocaleDateString() : "—"}
          </p>
        </div>
        {canCalibrate && (
          <button onClick={onRecord} className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            <Plus size={12} /> Record Calibration
          </button>
        )}
      </div>
      {isLoading ? (
        <Loader />
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">No calibration history.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-500">
            <tr>
              <th className="text-left px-3 py-2">Cert #</th>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Next Due</th>
              <th className="text-left px-3 py-2">Result</th>
              <th className="text-left px-3 py-2">Agency</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c._id || c.calibration_id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 font-mono">{c.certificate_number}</td>
                <td className="px-3 py-2">{c.calibration_date ? new Date(c.calibration_date).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">{c.next_due_date ? new Date(c.next_due_date).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2"><StatusChip value={c.result} /></td>
                <td className="px-3 py-2">{c.agency_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const StatusUpdateModal = ({ asset, onClose }) => {
  const [status, setStatus] = useState(asset.status);
  const [notes, setNotes] = useState("");
  const { mutate, isPending } = useUpdateTaggedAssetStatus({ onDone: onClose });
  return (
    <Modal onclose={onClose} title="Update Status" widthClassName="md:w-[420px] w-[95vw]">
      <div className="px-5 pb-4 space-y-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md resize-none" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md cursor-pointer">Cancel</button>
          <button
            onClick={() => mutate({ assetId: asset.asset_id, payload: { status, notes } })}
            disabled={isPending}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Update"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const TransferModal = ({ asset, onClose }) => {
  const [form, setForm] = useState({
    current_location_type: asset.current_location_type || "STORE",
    current_site_id: asset.current_site_id || "",
    current_site_name: asset.current_site_name || "",
    current_store_name: asset.current_store_name || "",
  });
  const { mutate, isPending } = useTransferTaggedAsset({ onDone: onClose });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal onclose={onClose} title="Transfer Asset" widthClassName="md:w-[480px] w-[95vw]">
      <div className="px-5 pb-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Location Type</label>
          <select
            value={form.current_location_type}
            onChange={(e) => set("current_location_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
          >
            {["SITE", "STORE", "TRANSIT", "VENDOR"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <input value={form.current_site_id} onChange={(e) => set("current_site_id", e.target.value)} placeholder="Site ID" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md" />
        <input value={form.current_site_name} onChange={(e) => set("current_site_name", e.target.value)} placeholder="Site Name" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md" />
        <input value={form.current_store_name} onChange={(e) => set("current_store_name", e.target.value)} placeholder="Store Name" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md cursor-pointer">Cancel</button>
          <button onClick={() => mutate({ assetId: asset.asset_id, payload: form })} disabled={isPending} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md cursor-pointer disabled:opacity-50">
            {isPending ? "Transferring…" : "Transfer"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const SoftDelete = ({ asset, onClose, onDone }) => {
  const { mutate, isPending } = useDeleteTaggedAsset({
    onDone: () => {
      onClose();
      onDone();
    },
  });
  return (
    <DeleteModal
      deletetitle="asset"
      onclose={onClose}
      onDelete={async () => mutate(asset.asset_id)}
      idKey="asset_id"
      item={asset}
      disabled={isPending}
    />
  );
};

export default TaggedAssetDetail;
