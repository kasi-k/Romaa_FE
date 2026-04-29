import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Boxes,
  ClipboardList,
  AlertTriangle,
  TimerReset,
  Plus,
  PackagePlus,
  ArrowRightLeft,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ASSET_MODULE, ASSET_SUB, ASSET_ACTION } from "../permissions";
import { useTaggedAssetSummary } from "../tagged/hooks/useTaggedAsset";
import { useBulkInventoryList, useBulkLowStock } from "../bulk/hooks/useBulkInventory";
import { useIssuanceList, useIssuanceOverdue } from "../issuance/hooks/useIssuance";
import { useCalibrationDueReport } from "../calibration/hooks/useCalibration";
import StatusChip from "../_shared/StatusChip";

const AssetDashboard = () => {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canIssue = canAccess(ASSET_MODULE, ASSET_SUB.ISSUANCE, ASSET_ACTION.CREATE);
  const canCreateBulk = canAccess(ASSET_MODULE, ASSET_SUB.BULK_INVENTORY, ASSET_ACTION.CREATE);
  const canCreateTagged = canAccess(ASSET_MODULE, ASSET_SUB.TAGGED_ASSET, ASSET_ACTION.CREATE);

  const tagged = useTaggedAssetSummary();
  const bulk = useBulkInventoryList({ limit: 1, page: 1 });
  const open = useIssuanceList({ status: "ISSUED", limit: 1 });
  const overdue = useIssuanceOverdue();
  const due = useCalibrationDueReport(30);
  const lowStock = useBulkLowStock();
  const recent = useIssuanceList({ limit: 10, page: 1 });

  const taggedTotal = tagged.data?.total || tagged.data?.count || 0;
  const bulkTotal = bulk.data?.meta?.totalRows || bulk.data?.total || 0;
  const openCount = open.data?.meta?.totalRows || open.data?.total || (open.data?.data?.rows || []).length;
  const overdueCount = (overdue.data || []).length;
  const dueCount = (due.data || []).filter((r) => new Date(r.next_due_date) >= new Date()).length;
  const calibrationOverdueCount = (due.data || []).filter((r) => new Date(r.next_due_date) < new Date()).length;

  return (
    <div className="font-roboto-flex p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">Asset Dashboard</h1>
          <p className="text-xs text-gray-500">Registry, custody &amp; compliance at a glance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canCreateTagged && (
            <button onClick={() => navigate("/asset/tagged/new")} className={btnPrimary}>
              <Plus size={14} /> Register Tagged
            </button>
          )}
          {canCreateBulk && (
            <button onClick={() => navigate("/asset/bulk-inventory")} className={btnSecondary}>
              <PackagePlus size={14} /> New Bulk Item
            </button>
          )}
          {canIssue && (
            <button onClick={() => navigate("/asset/issuance/new")} className={btnSecondary}>
              <ArrowRightLeft size={14} /> Issue Asset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiTile to="/asset/machinery" Icon={Truck} label="Machinery" value="—" hint="see list" />
        <KpiTile to="/asset/tagged" Icon={Package} label="Tagged Assets" value={taggedTotal} />
        <KpiTile to="/asset/bulk-inventory" Icon={Boxes} label="Bulk Items" value={bulkTotal} />
        <KpiTile to="/asset/issuance" Icon={ClipboardList} label="Open Issuances" value={openCount} />
        <KpiTile to="/asset/issuance?status=OVERDUE" Icon={TimerReset} label="Overdue" value={overdueCount} tone="red" />
        <KpiTile to="/asset/calibration?due=30" Icon={AlertTriangle} label="Calibration Due" value={dueCount + calibrationOverdueCount} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <AlertCard
          tone="red"
          title="Calibration Overdue / Upcoming"
          action="View"
          onAction={() => navigate("/asset/calibration?due=30")}
        >
          {(due.data || []).slice(0, 5).map((r) => {
            const days = Math.floor((new Date(r.next_due_date) - Date.now()) / 86400000);
            return (
              <div key={r._id || r.asset_id_label} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
                <span>
                  <span className="font-mono mr-1">{r.asset_id_label}</span>
                  {r.asset_name}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${days < 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                </span>
              </div>
            );
          })}
          {(due.data || []).length === 0 && <Empty>None.</Empty>}
        </AlertCard>

        <AlertCard
          tone="amber"
          title="Low Stock"
          action="View"
          onAction={() => navigate("/asset/bulk-inventory")}
        >
          {(lowStock.data || []).slice(0, 5).map((r) => (
            <div key={r.item_id} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
              <span>
                <span className="font-mono mr-1">{r.item_id}</span>
                {r.item_name}
              </span>
              <span className="text-[10px]">
                {r.total_qty_available} / {r.min_stock_level} {r.unit_of_measure}
              </span>
            </div>
          ))}
          {(lowStock.data || []).length === 0 && <Empty>All good.</Empty>}
        </AlertCard>

        <AlertCard
          tone="red"
          title="Overdue Issuances"
          action="View"
          onAction={() => navigate("/asset/issuance?status=OVERDUE")}
        >
          {(overdue.data || []).slice(0, 5).map((r) => (
            <div key={r.issue_id} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
              <span>
                <span className="font-mono mr-1">{r.issue_id}</span>
                {r.asset_name}
              </span>
              <span className="text-[10px] text-gray-500">{r.assigned_to_name}</span>
            </div>
          ))}
          {(overdue.data || []).length === 0 && <Empty>None.</Empty>}
        </AlertCard>
      </div>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-bold mb-3">Recent Activity</h3>
        {(recent.data?.data?.rows || recent.data?.data || []).length === 0 ? (
          <Empty>No recent issuances.</Empty>
        ) : (
          <div className="space-y-1">
            {(recent.data?.data?.rows || recent.data?.data || []).map((r) => (
              <Link
                key={r.issue_id}
                to={`/asset/issuance/${r.issue_id}`}
                className="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <span className="font-mono">{r.issue_id}</span>
                <StatusChip value={r.asset_kind} />
                <span className="font-semibold">{r.asset_name}</span>
                <span className="text-gray-400">→</span>
                <span>{r.assigned_to_name}</span>
                <StatusChip value={r.status} className="ml-auto" />
                <span className="text-gray-400">
                  {r.issue_date ? new Date(r.issue_date).toLocaleDateString() : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TONE = {
  default: "border-gray-200 dark:border-gray-800",
  red: "border-red-200 dark:border-red-900",
  amber: "border-amber-200 dark:border-amber-900",
  blue: "border-blue-200 dark:border-blue-900",
};

const KpiTile = (props) => {
  const TileIcon = props.Icon;
  return (
    <Link
      to={props.to}
      className={`block bg-white dark:bg-layout-dark border ${TONE[props.tone] || TONE.default} rounded-xl p-3 hover:shadow-md transition`}
    >
      <div className="flex items-center gap-2 mb-1">
        <TileIcon size={14} className="text-gray-500" />
        <span className="text-[10px] uppercase font-bold text-gray-500">{props.label}</span>
      </div>
      <div className="text-2xl font-bold">{props.value}</div>
    </Link>
  );
};

const AlertCard = ({ tone, title, action, onAction, children }) => (
  <div className={`bg-white dark:bg-layout-dark border ${TONE[tone] || TONE.default} rounded-xl p-3`}>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-bold">{title}</h4>
      <button onClick={onAction} className="cursor-pointer text-xs text-blue-600 hover:underline">
        {action}
      </button>
    </div>
    <div>{children}</div>
  </div>
);

const Empty = ({ children }) => <p className="text-xs text-gray-400 text-center py-4">{children}</p>;

const btnPrimary = "cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md";
const btnSecondary = "cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800";

export default AssetDashboard;
