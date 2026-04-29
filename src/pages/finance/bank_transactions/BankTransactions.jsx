import { useState, useMemo } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import {
  ArrowUpRight, ArrowDownLeft, RefreshCw,
  Search, Building2, CalendarDays, CreditCard,
  FileText, Hash, X, Check, Trash2
} from "lucide-react";
import { TbPlus } from "react-icons/tb";
import { usePVList, useRVList, useApprovePV, useApproveRV, useDeletePV, useDeleteRV, useBankAccounts } from "./hooks/useVouchers";
import { toast } from "react-toastify";
import CreateVoucher from "./CreateVoucher";
import Loader from "../../../components/Loader";
import ConfirmModal from "../../../components/ConfirmModal";
import DeleteModal from "../../../components/DeleteModal";
import AttachmentsBadge from "../shared/components/AttachmentsBadge";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_STYLE = {
  draft:    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  pending:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
};

const MODE_STYLE = {
  NEFT:   "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  RTGS:   "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  UPI:    "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  Cheque: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  Cash:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  DD:     "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

/* ── Summary card ───────────────────────────────────────────────────────── */
const SummaryCard = ({ icon, label, value, sub, color }) => {
  const c = {
    blue:    { wrap: "bg-blue-50 dark:bg-blue-900/20",    icon: "text-blue-600 dark:text-blue-400",    val: "text-blue-700 dark:text-blue-300",    border: "border-blue-100 dark:border-blue-800/50" },
    emerald: { wrap: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", val: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-100 dark:border-emerald-800/50" },
    amber:   { wrap: "bg-amber-50 dark:bg-amber-900/20",  icon: "text-amber-600 dark:text-amber-400",  val: "text-amber-700 dark:text-amber-300",  border: "border-amber-100 dark:border-amber-800/50" },
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
const BankTransactions = () => {
  const [tab, setTab]         = useState("PV"); // "PV" | "RV"
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate]     = useState("");

  /* ── Approve-with-bank modal state ── */
  const [approveModal, setApproveModal] = useState(null); // { voucher, type: "PV"|"RV" }
  const [approveBank, setApproveBank]   = useState("");
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", id: null, displayStr: "", extra: null });

  const isPV = tab === "PV";
  const debouncedSearch = useDebounce(search, 500);
  const limit = 15;

  const pvParams = useMemo(() => ({ page: currentPage, limit, search: debouncedSearch, fromdate, todate }), [currentPage, debouncedSearch, fromdate, todate]);
  const rvParams = useMemo(() => ({ page: currentPage, limit, search: debouncedSearch, fromdate, todate }), [currentPage, debouncedSearch, fromdate, todate]);

  const { data: pvData, isLoading: pvLoading, isFetching: pvFetching, refetch: refetchPV } = usePVList(pvParams);
  const { data: rvData, isLoading: rvLoading, isFetching: rvFetching, refetch: refetchRV } = useRVList(rvParams);
  const pvList = pvData?.data || [];
  const rvList = rvData?.data || [];
  const pvTotalPages = pvData?.pagination?.totalPages || 1;
  const rvTotalPages = rvData?.pagination?.totalPages || 1;

  const { mutate: approvePV, isPending: approvingPV } = useApprovePV();
  const { mutate: approveRV, isPending: approvingRV } = useApproveRV();
  const { mutate: deletePV,  isPending: deletingPV  } = useDeletePV();
  const { mutate: deleteRV,  isPending: deletingRV  } = useDeleteRV();
  const { data: bankAccountsRaw = [], isLoading: loadingBanks } = useBankAccounts();

  const handleApproveClick = (voucher) => {
    if (voucher.bank_account_code) {
      setActionModal({ isOpen: true, type: "approve", id: voucher._id, displayStr: voucher.pv_no || voucher.rv_no, extra: isPV });
    } else {
      setApproveBank("");
      setApproveModal({ voucher, type: isPV ? "PV" : "RV" });
    }
  };

  const handleApproveConfirm = () => {
    if (!approveBank) {
      toast.warning("Please select a bank account");
      return;
    }
    const { voucher, type } = approveModal;
    if (type === "PV") {
      approvePV({ id: voucher._id, bank_account_code: approveBank });
    } else {
      approveRV({ id: voucher._id, bank_account_code: approveBank });
    }
    setApproveModal(null);
  };

  const list       = isPV ? pvList : rvList;
  const isLoading  = isPV ? pvLoading  : rvLoading;
  const isFetching = isPV ? pvFetching : rvFetching;
  const refetch    = isPV ? refetchPV  : refetchRV;
  const totalPages = isPV ? pvTotalPages : rvTotalPages;

  const filtered = useMemo(() => list, [list]);

  const totalApproved = list
    .filter(v => v.status === "approved")
    .reduce((s, v) => s + (v.amount || 0), 0);
  const totalPending = list
    .filter(v => v.status === "pending")
    .reduce((s, v) => s + (v.amount || 0), 0);

  const noKey   = isPV ? "pv_no"   : "rv_no";
  const dateKey = isPV ? "pv_date" : "rv_date";
  const modeKey = isPV ? "payment_mode" : "receipt_mode";

  return (
    <div className="font-roboto-flex h-full overflow-y-auto bg-gray-50 dark:bg-[#0b0f19] pb-24">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <CreditCard size={17} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Bank Transactions
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-none">
                Finance · Payment &amp; Receipt Vouchers
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <TbPlus className="text-lg" />
            New Voucher
          </button>
        </div>

        {/* ── PV / RV tab strip ── */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-gray-100 dark:border-gray-800">
          {[
            { key: "PV", label: "Payment Vouchers", icon: <ArrowUpRight size={14} />, color: "text-blue-600 border-blue-500" },
            { key: "RV", label: "Receipt Vouchers",  icon: <ArrowDownLeft size={14} />, color: "text-emerald-600 border-emerald-500" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                tab === t.key
                  ? `${t.color} dark:text-white dark:border-white`
                  : "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.icon}
              {t.label}
              <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === t.key
                  ? t.key === "PV"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {t.key === "PV" ? pvList.length : rvList.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <SummaryCard
            icon={<CreditCard size={20} />}
            color={isPV ? "blue" : "emerald"}
            label="Total Vouchers"
            value={list.length}
            sub="all time"
          />
          <SummaryCard
            icon={isPV ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
            color="amber"
            label="Approved Amount"
            value={`₹${fmt(totalApproved)}`}
            sub="approved only"
          />
          <SummaryCard
            icon={<FileText size={20} />}
            color={isPV ? "blue" : "emerald"}
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
              placeholder={`Search ${isPV ? "PV" : "RV"} no., supplier, tender…`}
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
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
            <FileText size={44} className="opacity-20" />
            <p className="text-sm font-semibold">
              {list.length === 0 ? `No ${isPV ? "payment" : "receipt"} vouchers yet.` : "No results for current search."}
            </p>
            {list.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className={`mt-1 text-xs underline underline-offset-2 ${isPV ? "text-blue-600 hover:text-blue-700" : "text-emerald-600 hover:text-emerald-700"}`}
              >
                Create your first {isPV ? "payment" : "receipt"} voucher
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["#", isPV ? "PV No." : "RV No.", "Date", "Supplier", "Tender", "Mode", "Amount", "Status", ""].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filtered.map((v, i) => (
                    <tr
                      key={v._id || v[noKey]}
                      className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors ${
                        isPV ? "hover:bg-blue-50/30 dark:hover:bg-blue-900/10" : "hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isPV
                            ? <ArrowUpRight size={13} className="text-blue-500 shrink-0" />
                            : <ArrowDownLeft size={13} className="text-emerald-500 shrink-0" />
                          }
                          <code className={`font-mono text-xs px-2 py-0.5 rounded ${
                            isPV
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          }`}>
                            {v[noKey] || "—"}
                          </code>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <CalendarDays size={11} className="shrink-0" />
                          {fmtDate(v[dateKey])}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-100">
                          <Building2 size={13} className="text-gray-400 shrink-0" />
                          {v.supplier_name || v.supplier_id || "—"}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-5">{v.supplier_type}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                          <Hash size={10} className="shrink-0 text-gray-400" />
                          {v.tender_id || "—"}
                        </div>
                        {v.tender_name && (
                          <p className="text-[10px] text-gray-400 ml-3.5 truncate max-w-[120px]">{v.tender_name}</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${MODE_STYLE[v[modeKey]] || MODE_STYLE.NEFT}`}>
                          {v[modeKey] || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 tabular-nums text-right font-extrabold">
                        <span className={isPV ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}>
                          ₹{fmt(v.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${STATUS_STYLE[v.status] || STATUS_STYLE.pending}`}>
                          {v.status || "pending"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <AttachmentsBadge
                            sourceType={isPV ? "PaymentVoucher" : "ReceiptVoucher"}
                            sourceRef={v._id}
                            sourceNo={v[noKey]}
                            tenderId={v.tender_id}
                            readOnly={v.status === "approved"}
                          />
                          {v.status === "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveClick(v);
                              }}
                              disabled={approvingPV || approvingRV}
                              title="Approve"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800 transition-colors disabled:opacity-50"
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </button>
                          )}
                          {(v.status === "draft" || v.status === "pending") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionModal({ isOpen: true, type: "delete", id: v._id, displayStr: v.pv_no || v.rv_no, extra: isPV });
                              }}
                              disabled={deletingPV || deletingRV}
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
                Showing <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong> vouchers
              </span>
              {filtered.length > 0 && (
                <span className={`font-semibold ${isPV ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  Total: ₹{fmt(filtered.reduce((s, v) => s + (v.amount || 0), 0))}
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

      {/* ── Create Voucher Form ── */}
      {showForm && (
        <CreateVoucher
          onclose={() => setShowForm(false)}
          onSuccess={() => { refetchPV(); refetchRV(); }}
        />
      )}

      {/* ── Approve Bank Selection Modal ── */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Select Bank Account</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Required to approve <strong>{approveModal.voucher.pv_no || approveModal.voucher.rv_no}</strong>
                </p>
              </div>
              <button onClick={() => setApproveModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Bank list */}
            <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-2">
              {loadingBanks ? (
                <div className="flex items-center justify-center py-6 gap-2 text-gray-400 text-xs">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  Loading bank accounts...
                </div>
              ) : bankAccountsRaw.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No bank accounts found.</p>
              ) : (
                bankAccountsRaw.map(b => {
                  const isCash = b.account_category === "cash";
                  return (
                    <button key={b.account_code} type="button"
                      onClick={() => setApproveBank(b.account_code)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        approveBank === b.account_code
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 ring-1 ring-blue-500"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${approveBank === b.account_code ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200"}`}>
                          {b.account_name}
                        </p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isCash
                            ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        }`}>
                          {isCash ? "CASH" : "BANK"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">
                          {isCash
                            ? [b.custodian_name, b.location].filter(Boolean).join(" · ")
                            : [b.bank_name, b.branch_name].filter(Boolean).join(" · ")}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{fmt(b.current_balance || b.available_balance || 0)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setApproveModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={!approveBank || approvingPV || approvingRV}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {approvingPV || approvingRV ? "Approving…" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Modals ── */}
      {actionModal.isOpen && actionModal.type === "delete" && (
        <DeleteModal
          deletetitle={`Voucher ${actionModal.displayStr || ""}`}
          onclose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "", extra: null })}
          onDelete={() => actionModal.extra ? deletePV(actionModal.id) : deleteRV(actionModal.id)}
        />
      )}
      {actionModal.isOpen && actionModal.type === "approve" && (
        <ConfirmModal
          title={`Approve ${actionModal.extra ? "Payment" : "Receipt"}`}
          message={`Are you sure you want to approve Voucher ${actionModal.displayStr || ""}?`}
          onConfirm={() => actionModal.extra 
            ? approvePV({ id: actionModal.id }) 
            : approveRV({ id: actionModal.id })
          }
          onClose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "", extra: null })}
        />
      )}
    </div>
  );
};

export default BankTransactions;
