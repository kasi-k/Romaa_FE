import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Power,
  PackagePlus,
  PackageMinus,
  RotateCcw,
  ArrowRightLeft,
  AlertOctagon,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import {
  useBulkInventoryDetail,
  useToggleBulkItem,
  useBulkTransactions,
} from "./hooks/useBulkInventory";
import StatusChip from "../_shared/StatusChip";
import Loader from "../../../components/Loader";
import Modal from "../../../components/Modal";
import BulkItemForm from "./BulkItemForm";
import MovementForm from "./MovementForm";

const ACTIONS = [
  { kind: "receive", label: "Receive", Icon: PackagePlus, color: "emerald" },
  { kind: "issue", label: "Issue", Icon: PackageMinus, color: "blue" },
  { kind: "return", label: "Return", Icon: RotateCcw, color: "teal" },
  { kind: "transfer", label: "Transfer", Icon: ArrowRightLeft, color: "gray" },
  { kind: "damage", label: "Damage", Icon: AlertOctagon, color: "amber" },
  { kind: "scrap", label: "Scrap", Icon: Trash2, color: "red" },
  { kind: "adjustment", label: "Adjust", Icon: SlidersHorizontal, color: "purple" },
];

const TXN_FILTERS = ["All", "RECEIPT", "ISSUE", "RETURN", "TRANSFER", "DAMAGE", "SCRAP", "ADJUSTMENT"];

const BulkInventoryDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canEdit = canAccess(ASSET_MODULE, ASSET_SUB.BULK_INVENTORY, ASSET_ACTION.EDIT);
  const canCreate = canAccess(ASSET_MODULE, ASSET_SUB.BULK_INVENTORY, ASSET_ACTION.CREATE);

  const [movementKind, setMovementKind] = useState(null);
  const [editing, setEditing] = useState(false);
  const [txnFilter, setTxnFilter] = useState("All");
  const [txnPage, setTxnPage] = useState(1);

  const { data, isLoading } = useBulkInventoryDetail(itemId);
  const { mutate: toggle, isPending: toggling } = useToggleBulkItem();

  const { data: txnData, isLoading: txnLoading } = useBulkTransactions({
    page: txnPage,
    limit: 20,
    item_id_label: itemId,
    txn_type: txnFilter === "All" ? undefined : txnFilter,
  });
  const txnRows = txnData?.data?.rows || txnData?.data || [];
  const txnTotalPages = txnData?.meta?.totalPages || 1;

  if (isLoading) return <div className="p-12"><Loader /></div>;
  if (!data) return <div className="p-12 text-center text-gray-500">Item not found.</div>;

  const low = data.total_qty_available < data.min_stock_level;

  return (
    <div className="font-roboto-flex p-4">
      <button onClick={() => navigate("/asset/bulk-inventory")} className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3">
        <ArrowLeft size={14} /> Back to list
      </button>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{data.item_id}</span>
              <span className="text-[10px] uppercase font-semibold text-gray-500">{data.asset_class}</span>
              <span className="text-[10px] uppercase font-semibold text-gray-500">UoM: {data.unit_of_measure}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{data.item_name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {[data.brand, data.model, data.size, data.color].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {ACTIONS.map((a) => {
              if (!canCreate) return null;
              const ActionIcon = a.Icon;
              return (
                <button
                  key={a.kind}
                  onClick={() => setMovementKind(a.kind)}
                  className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ActionIcon size={12} /> {a.label}
                </button>
              );
            })}
            {canEdit && (
              <>
                <button onClick={() => setEditing(true)} className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => toggle(data.item_id)}
                  disabled={toggling}
                  className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <Power size={12} /> {data.is_active ? "Deactivate" : "Activate"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {low && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-700 dark:text-red-300">
          Reorder needed — available {data.total_qty_available} {data.unit_of_measure} is below the minimum of {data.min_stock_level}. Reorder qty: {data.reorder_qty}.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <Tile label="Available" value={data.total_qty_available} />
        <Tile label="In Use" value={data.total_qty_in_use} />
        <Tile label="Damaged" value={data.total_qty_damaged} />
        <Tile label="Standard Cost" value={`₹ ${Number(data.standard_cost || 0).toLocaleString()}`} />
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
        <h3 className="text-sm font-bold mb-3">Stock by Location</h3>
        {(data.stock_locations || []).length === 0 ? (
          <p className="text-sm text-gray-500">No location-specific stock.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.stock_locations.map((loc, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{loc.location_name || loc.location_id}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500">{loc.location_type}</span>
                </div>
                <div className="grid grid-cols-3 text-xs">
                  <div>
                    <div className="text-gray-500">Avail.</div>
                    <div className="font-mono">{loc.qty_available}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">In Use</div>
                    <div className="font-mono">{loc.qty_in_use}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Dmg</div>
                    <div className="font-mono">{loc.qty_damaged}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold">Movement Ledger</h3>
          <div className="flex gap-1 flex-wrap">
            {TXN_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setTxnFilter(f); setTxnPage(1); }}
                className={`cursor-pointer px-2 py-0.5 text-[10px] rounded ${
                  txnFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-500">
              <tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th className="text-right">Qty</Th>
                <Th>From → To</Th>
                <Th>Recipient</Th>
                <Th>Reference</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {txnLoading ? (
                <tr><td colSpan={7} className="p-8"><Loader /></td></tr>
              ) : txnRows.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No movements.</td></tr>
              ) : txnRows.map((t) => (
                <tr key={t.txn_id || t._id} className="border-t border-gray-100 dark:border-gray-800">
                  <Td>{t.txn_date ? new Date(t.txn_date).toLocaleString() : "—"}</Td>
                  <Td><StatusChip value={t.txn_type} /></Td>
                  <Td className="text-right font-mono">{t.quantity}</Td>
                  <Td className="text-xs">
                    {t.from_location_name || "—"}
                    {" → "}
                    {t.to_location_name || "—"}
                  </Td>
                  <Td>{t.recipient_name || "—"}</Td>
                  <Td className="text-xs">
                    {t.reference_number ? (
                      <>
                        <span className="font-mono">{t.reference_number}</span>
                        {t.reference_type ? <span className="ml-1 text-gray-400">({t.reference_type})</span> : null}
                      </>
                    ) : "—"}
                  </Td>
                  <Td className="text-xs text-gray-600">{t.notes || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <span className="text-gray-500">Page {txnPage} of {txnTotalPages}</span>
          <div className="flex gap-2">
            <button disabled={txnPage <= 1} onClick={() => setTxnPage((p) => Math.max(1, p - 1))} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Prev</button>
            <button disabled={txnPage >= txnTotalPages} onClick={() => setTxnPage((p) => p + 1)} className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {movementKind && (
        <MovementForm
          kind={movementKind}
          item={data}
          onClose={() => setMovementKind(null)}
        />
      )}

      {editing && (
        <Modal onclose={() => setEditing(false)} title="Edit Item" widthClassName="lg:w-[800px] md:w-[700px] w-[95vw]">
          <BulkItemForm item={data} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
        </Modal>
      )}
    </div>
  );
};

const Tile = ({ label, value }) => (
  <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-3">
    <div className="text-[10px] uppercase font-bold text-gray-500">{label}</div>
    <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{value}</div>
  </div>
);

const Th = ({ children, className = "" }) => <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-3 py-2 ${className}`}>{children}</td>;

export default BulkInventoryDetail;
