import { useState, useMemo } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import {
  ArrowRightLeft, RefreshCw, Search, Building2, CalendarDays,
  Banknote, FileText, CheckCircle, Check, Trash2
} from "lucide-react";
import { TbPlus } from "react-icons/tb";
import { useBTList, useApproveBT, useDeleteBT } from "./hooks/useBankTransfer";
import CreateBankTransfer from "./CreateBankTransfer";
import AttachmentsBadge from "../shared/components/AttachmentsBadge";
import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";
import DeleteModal from "../../../components/DeleteModal";
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_STYLE = {
  draft:    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  pending:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
};

const MODE_STYLE = {
  NEFT:     "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  RTGS:     "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  IMPS:     "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  UPI:      "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  Cheque:   "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  Cash:     "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Internal: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

/* ── Summary card ───────────────────────────────────────────────────────── */
const SummaryCard = ({ icon, label, value, sub, color }) => {
  const c = {
    blue: {
      wrap:   "bg-blue-50 dark:bg-blue-900/20",
      icon:   "text-blue-600 dark:text-blue-400",
      val:    "text-blue-700 dark:text-blue-300",
      border: "border-blue-100 dark:border-blue-800/50",
    },
    emerald: {
      wrap:   "bg-emerald-50 dark:bg-emerald-900/20",
      icon:   "text-emerald-600 dark:text-emerald-400",
      val:    "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-100 dark:border-emerald-800/50",
    },
    amber: {
      wrap:   "bg-amber-50 dark:bg-amber-900/20",
      icon:   "text-amber-600 dark:text-amber-400",
      val:    "text-amber-700 dark:text-amber-300",
      border: "border-amber-100 dark:border-amber-800/50",
    },
  }[color];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${c.border} p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${c.wrap} shrink-0`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-extrabold mt-0.5 tabular-nums ${c.val}`}>{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const InternalBankTransfer = () => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate]     = useState("");
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", id: null, displayStr: "" });

  const debouncedSearch = useDebounce(search, 500);
  const limit = 15;

  const queryParams = useMemo(() => ({ page: currentPage, limit, search: debouncedSearch, fromdate, todate }), [currentPage, debouncedSearch, fromdate, todate]);

  const { data: rawData, isLoading, isFetching, refetch } = useBTList(queryParams);
  const list = rawData?.data || [];
  const totalPages = rawData?.pagination?.totalPages || 1;

  const { mutate: approveBT, isPending: approving } = useApproveBT();
  const { mutate: deleteBT,  isPending: deleting  } = useDeleteBT();

  const filtered = useMemo(() => list, [list]);

  const totalApproved = list
    .filter((t) => t.status === "approved")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const totalPending = list
    .filter((t) => t.status === "pending")
    .reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="font-roboto-flex h-full overflow-y-auto bg-gray-50 dark:bg-[#0b0f19] pb-24">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <ArrowRightLeft size={17} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Internal Bank Transfer
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-none">
                Finance · Inter-Account Fund Movements
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <TbPlus className="text-lg" />
            New Transfer
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <SummaryCard
            icon={<ArrowRightLeft size={20} />}
            color="blue"
            label="Total Transfers"
            value={list.length}
            sub="all time"
          />
          <SummaryCard
            icon={<CheckCircle size={20} />}
            color="emerald"
            label="Approved Amount"
            value={`₹${fmt(totalApproved)}`}
            sub="approved only"
          />
          <SummaryCard
            icon={<FileText size={20} />}
            color="amber"
            label="Pending Amount"
            value={`₹${fmt(totalPending)}`}
            sub="awaiting approval"
          />
        </div>

        {/* ── Search + Date bar ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3.5 mb-4 flex flex-wrap items-center gap-3 relative z-10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transfer no., account name, tender…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <input type="date" value={fromdate} onChange={e => { setFromdate(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <input type="date" value={todate} onChange={e => { setTodate(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <button
            onClick={refetch}
            disabled={isFetching}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
         <Loader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <ArrowRightLeft size={44} className="opacity-20" />
            <p className="text-sm font-semibold">
              {list.length === 0
                ? "No bank transfers yet."
                : "No results for current search."}
            </p>
            {list.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-1 text-xs underline underline-offset-2 text-blue-600 hover:text-blue-700"
              >
                Create your first transfer
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["#", "Transfer No.", "Date", "From Account", "To Account", "Mode", "Amount", "Status", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filtered.map((t, i) => (
                    <tr
                      key={t._id || t.transfer_no}
                      className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ArrowRightLeft size={13} className="text-blue-500 shrink-0" />
                          <code className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                            {t.transfer_no || "—"}
                          </code>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <CalendarDays size={11} className="shrink-0" />
                          {fmtDate(t.transfer_date)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-100 text-xs">
                          <Building2 size={13} className="text-gray-400 shrink-0" />
                          {t.from_account_name || t.from_account_code || "—"}
                        </span>
                        {t.from_account_code && (
                          <span className="text-[10px] text-gray-400 ml-5 font-mono">
                            {t.from_account_code}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-100 text-xs">
                          <Banknote size={13} className="text-gray-400 shrink-0" />
                          {t.to_account_name || t.to_account_code || "—"}
                        </span>
                        {t.to_account_code && (
                          <span className="text-[10px] text-gray-400 ml-5 font-mono">
                            {t.to_account_code}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            MODE_STYLE[t.transfer_mode] || MODE_STYLE.NEFT
                          }`}
                        >
                          {t.transfer_mode || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 tabular-nums text-right font-extrabold">
                        <span className="text-blue-600 dark:text-blue-400">
                          ₹{fmt(t.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${
                            STATUS_STYLE[t.status] || STATUS_STYLE.pending
                          }`}
                        >
                          {t.status || "pending"}
                        </span>
                        {t.je_no && (
                          <p className="text-[9px] text-gray-400 mt-0.5 font-mono">{t.je_no}</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <AttachmentsBadge
                            sourceType="BankTransfer"
                            sourceRef={t._id}
                            sourceNo={t.transfer_no}
                            tenderId={t.tender_id}
                            readOnly={t.status === "approved"}
                          />
                          {t.status === "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionModal({ isOpen: true, type: "approve", id: t._id, displayStr: t.transfer_no });
                              }}
                              disabled={approving}
                              title="Approve"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800 transition-colors disabled:opacity-50"
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {(t.status === "draft" || t.status === "pending") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionModal({ isOpen: true, type: "delete", id: t._id, displayStr: t.transfer_no });
                              }}
                              disabled={deleting}
                              title="Delete"
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-800 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing{" "}
                <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong>{" "}
                transfers
              </span>
              {filtered.length > 0 && (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Total: ₹{fmt(filtered.reduce((s, t) => s + (t.amount || 0), 0))}
                </span>
              )}
            </div>
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        )}
      </div>

      {/* ── Create Transfer Form ── */}
      {showForm && (
        <CreateBankTransfer
          onClose={() => setShowForm(false)}
          onSuccess={refetch}
        />
      )}

      {/* ── Action Modals ── */}
      {actionModal.isOpen && actionModal.type === "delete" && (
        <DeleteModal
          deletetitle={`Transfer ${actionModal.displayStr || ""}`}
          onclose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "" })}
          onDelete={() => deleteBT(actionModal.id)}
        />
      )}
      {actionModal.isOpen && actionModal.type === "approve" && (
        <ConfirmModal
          title="Approve Bank Transfer"
          message={`Are you sure you want to approve Transfer ${actionModal.displayStr || ""}? This action may be irreversible.`}
          onConfirm={() => approveBT(actionModal.id)}
          onClose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "" })}
        />
      )}
    </div>
  );
};

export default InternalBankTransfer;
