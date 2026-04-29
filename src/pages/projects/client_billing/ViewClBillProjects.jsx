import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { TbPencil, TbCircleCheck, TbTrash } from "react-icons/tb";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import Title from "../../../components/Title";
import Button from "../../../components/Button";
import ComparativeTable from "./components/ComparativeTable";
import BillAbstractTable from "./components/BillAbstractTable";
import BillDetailedTable from "./components/BillDetailedTable";
import SteelDetailedTable from "./components/SteelDetailedTable";
import BillSummaryTab from "./components/BillSummaryTab";
import EditClientBill from "./modals/EditClientBill";

const TABS = ["Bill Summary", "Comparative", "Bill Abstract", "Bill Detailed", "Steel"];

/* ─── Lifecycle rules (from API docs) ───────────────────────────
   Draft → Submitted → Checked → Approved → Paid
   Edit:    Draft only (update-csv)
   Approve: Draft / Submitted / Checked → Approved
─────────────────────────────────────────────────────────────── */
const CAN_EDIT    = ["Draft"];
const CAN_APPROVE = ["Draft", "Submitted", "Checked"];
const CAN_DELETE  = ["Draft", "Submitted", "Checked"];

/* ─── Approve confirm modal ──────────────────────────────────── */
function ConfirmApprove({ billId, loading, onConfirm, onCancel }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <p className="text-base font-bold text-gray-800 dark:text-white">Approve Bill</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Are you sure you want to approve{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{billId}</span>?
            This will post a receivable entry to the client ledger.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 transition shadow-sm"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Approve
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Delete confirm modal ───────────────────────────────────── */
function ConfirmDelete({ billId, loading, onConfirm, onCancel }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <p className="text-base font-bold text-red-600 dark:text-red-400">Delete Bill</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{billId}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition shadow-sm"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Status badge classes ───────────────────────────────────── */
const STATUS_CLS = {
  Draft:     "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  Submitted: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  Checked:   "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700",
  Approved:  "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  Paid:      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
  Rejected:  "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
};

/* ─── Main Component ─────────────────────────────────────────── */
function ViewClBillProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const rowData = location.state?.item;

  const tenderId     = rowData?.tender_id;
  const billId       = rowData?.bill_id;


  const [activeTab,   setActiveTab]   = useState("Bill Summary");
  const [billData,    setBillData]    = useState(null);
  const [loadingBill, setLoadingBill] = useState(true);
  const [showEdit,    setShowEdit]    = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [approving,   setApproving]   = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  /* Fetch full bill details — used for action button gating + EditClientBill pre-fill */
  const fetchBill = useCallback(async () => {
    if (!tenderId || !billId) return;
    setLoadingBill(true);
    try {
      const res = await axios.get(
        `${API}/clientbilling/api/details?tender_id=${tenderId}&bill_id=${billId}`,
        { withCredentials: true }
      );
      if (res.data.status || res.data.success) setBillData(res.data.data);
    } catch {
      /* silent — each tab handles its own fetch error */
    } finally {
      setLoadingBill(false);
    }
  }, [tenderId, billId]);

  useEffect(() => { fetchBill(); }, [fetchBill]);

  const status = billData?.status ?? rowData?.status;

  /* ── Approve: PATCH /api/approve/:_id ── */
  const handleApprove = async () => {
    if (!billData?._id) return;
    setApproving(true);
    try {
      await axios.patch(
        `${API}/clientbilling/api/approve/${billData._id}`,
        {},
        { withCredentials: true }
      );
      toast.success("Bill approved successfully");
      setShowApprove(false);
      fetchBill();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  /* ── Delete: DELETE /api/delete ── */
  const handleDelete = async () => {
    if (!billData?._id) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${API}/clientbilling/api/delete`,
        { data: { _id: billData._id }, withCredentials: true }
      );
      toast.success("Bill deleted successfully");
      setShowDelete(false);
      navigate("..");
    } catch (err) {
      toast.error(err.response?.data?.error ?? err.response?.data?.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Tab content ── */
  const renderTab = () => {
    switch (activeTab) {
      case "Bill Summary":
        return <BillSummaryTab tenderId={tenderId} billId={billId} />;
      case "Bill Abstract":
        return <BillAbstractTable tenderId={tenderId} billId={billId} />;
      case "Comparative":
        return <ComparativeTable tenderId={tenderId} billId={billId} />;
      case "Bill Detailed":
        return <BillDetailedTable tenderId={tenderId} billId={billId} status={status} />;
      case "Steel":
        return <SteelDetailedTable tenderId={tenderId} billId={billId}status={status} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-1">
        <Title
          title="Projects Management"
          sub_title="Client Billing"
          active_title="View Client Billing"
        />

        {!loadingBill && status && (
          <div className="flex items-center gap-2 shrink-0">
            {CAN_EDIT.includes(status) && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
              >
                <TbPencil size={14} /> Edit
              </button>
            )}
            {CAN_APPROVE.includes(status) && (
              <button
                onClick={() => setShowApprove(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
              >
                <TbCircleCheck size={14} /> Approve
              </button>
            )}
            {CAN_DELETE.includes(status) && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
              >
                <TbTrash size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Status pill ── */}
      {status && (
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_CLS[status] ?? STATUS_CLS.Draft}`}>
            {status}
          </span>
          {billData?.bill_id && (
            <span className="text-xs text-gray-400">{billData.bill_id} · {billData.client_name}</span>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-2 py-2 px-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
              activeTab === tab
                ? "bg-slate-800 text-white shadow-md scale-105 dark:bg-blue-600 ring-2 ring-offset-1 ring-slate-300 dark:ring-offset-gray-900 dark:ring-blue-800"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:-translate-y-0.5 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="min-h-[400px] overflow-auto animate-fade-in">
        {renderTab()}
      </div>

      {/* ── Back ── */}
      <div className="flex justify-end py-4">
        <Button onClick={() => navigate("..")} button_name="Back" button_icon={<IoChevronBackSharp />} />
      </div>

      {/* ── Modals ── */}
      {showEdit && (
        <EditClientBill
          billId={billId}
          billData={billData}
          onClose={() => setShowEdit(false)}
          onSuccess={fetchBill}
        />
      )}

      {showApprove && (
        <ConfirmApprove
          billId={billData?.bill_id ?? billId}
          loading={approving}
          onConfirm={handleApprove}
          onCancel={() => setShowApprove(false)}
        />
      )}

      {showDelete && (
        <ConfirmDelete
          billId={billData?.bill_id ?? billId}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

export default ViewClBillProjects;
