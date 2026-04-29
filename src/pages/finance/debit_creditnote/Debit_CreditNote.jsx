import { useState, useMemo } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import {
  ArrowDownLeft, ArrowUpRight, RefreshCw,
  Search, Building2, CalendarDays, FileText,
  Hash, BookOpen, Check, Trash2
} from "lucide-react";
import { TbPlus } from "react-icons/tb";
import {
  useCNList, useDNList,
  useApproveCN, useApproveDN,
  useDeleteCN, useDeleteDN,
} from "./hooks/useDebitCreditNote";
import CreateDebitCreditNote from "./CreateDebitCreditNote";
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

const ADJ_STYLE = {
  "Against Bill":       "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Advance Adjustment": "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "On Account":         "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
};

/* ── Summary card ───────────────────────────────────────────────────────── */
const SummaryCard = ({ icon, label, value, sub, color }) => {
  const c = {
    teal:    { wrap: "bg-teal-50 dark:bg-teal-900/20",    icon: "text-teal-600 dark:text-teal-400",    val: "text-teal-700 dark:text-teal-300",    border: "border-teal-100 dark:border-teal-800/50" },
    violet:  { wrap: "bg-violet-50 dark:bg-violet-900/20", icon: "text-violet-600 dark:text-violet-400", val: "text-violet-700 dark:text-violet-300", border: "border-violet-100 dark:border-violet-800/50" },
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
const Debit_CreditNote = () => {
  const [tab, setTab]           = useState("CN"); // "CN" | "DN"
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate]     = useState("");
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", id: null, displayStr: "", extra: null });

  const isCN = tab === "CN";
  const debouncedSearch = useDebounce(search, 500);
  const limit = 15;

  const cnParams = useMemo(() => ({ page: currentPage, limit, search: debouncedSearch, fromdate, todate }), [currentPage, debouncedSearch, fromdate, todate]);
  const dnParams = useMemo(() => ({ page: currentPage, limit, search: debouncedSearch, fromdate, todate }), [currentPage, debouncedSearch, fromdate, todate]);

  const { data: cnData, isLoading: cnLoading, isFetching: cnFetching, refetch: refetchCN } = useCNList(cnParams);
  const { data: dnData, isLoading: dnLoading, isFetching: dnFetching, refetch: refetchDN } = useDNList(dnParams);

  const cnList = cnData?.data || [];
  const dnList = dnData?.data || [];
  const cnTotalPages = cnData?.pagination?.totalPages || 1;
  const dnTotalPages = dnData?.pagination?.totalPages || 1;

  const { mutate: approveCN, isPending: approvingCN } = useApproveCN();
  const { mutate: approveDN, isPending: approvingDN } = useApproveDN();
  const { mutate: deleteCN,  isPending: deletingCN  } = useDeleteCN({});
  const { mutate: deleteDN,  isPending: deletingDN  } = useDeleteDN({});

  const list       = isCN ? cnList : dnList;
  const isLoading  = isCN ? cnLoading  : dnLoading;
  const isFetching = isCN ? cnFetching : dnFetching;
  const refetch    = isCN ? refetchCN  : refetchDN;
  const totalPages = isCN ? cnTotalPages : dnTotalPages;

  const filtered = useMemo(() => list, [list]);

  const totalApproved = list
    .filter(v => v.status === "approved")
    .reduce((s, v) => s + (v.amount || 0), 0);
  const totalPending = list
    .filter(v => v.status === "pending")
    .reduce((s, v) => s + (v.amount || 0), 0);

  const noKey   = isCN ? "cn_no"   : "dn_no";
  const dateKey = isCN ? "cn_date" : "dn_date";

  return (
    <div className="font-roboto-flex h-full overflow-y-auto bg-gray-50 dark:bg-[#0b0f19] pb-24">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <BookOpen size={17} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Debit &amp; Credit Notes
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-none">
                Finance · Debit Notes &amp; Credit Notes
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <TbPlus className="text-lg" />
            New Note
          </button>
        </div>

        {/* ── CN / DN tab strip ── */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-gray-100 dark:border-gray-800">
          {[
            { key: "CN", label: "Credit Notes",  icon: <ArrowDownLeft size={14} />, color: "text-teal-600 border-teal-500" },
            { key: "DN", label: "Debit Notes",    icon: <ArrowUpRight size={14} />,  color: "text-violet-600 border-violet-500" },
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
                  ? t.key === "CN"
                    ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                    : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {t.key === "CN" ? cnList.length : dnList.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <SummaryCard
            icon={<BookOpen size={20} />}
            color={isCN ? "teal" : "violet"}
            label="Total Notes"
            value={list.length}
            sub="all time"
          />
          <SummaryCard
            icon={isCN ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
            color="amber"
            label="Approved Amount"
            value={`₹${fmt(totalApproved)}`}
            sub="approved only"
          />
          <SummaryCard
            icon={<FileText size={20} />}
            color={isCN ? "teal" : "violet"}
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
              placeholder={`Search ${isCN ? "CN" : "DN"} no., supplier, tender…`}
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
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <span className="animate-spin h-9 w-9 border-[3px] border-slate-500 border-t-transparent rounded-full" />
            <p className="text-sm font-medium">Loading notes…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <FileText size={44} className="opacity-20" />
            <p className="text-sm font-semibold">
              {list.length === 0 ? `No ${isCN ? "credit" : "debit"} notes yet.` : "No results for current search."}
            </p>
            {list.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className={`mt-1 text-xs underline underline-offset-2 ${isCN ? "text-teal-600 hover:text-teal-700" : "text-violet-600 hover:text-violet-700"}`}
              >
                Create your first {isCN ? "credit" : "debit"} note
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["#", isCN ? "CN No." : "DN No.", "Date", "Supplier", "Tender", "Adj Type", "Amount", "Status", ""].map(h => (
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
                        isCN ? "hover:bg-teal-50/30 dark:hover:bg-teal-900/10" : "hover:bg-violet-50/30 dark:hover:bg-violet-900/10"
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isCN
                            ? <ArrowDownLeft size={13} className="text-teal-500 shrink-0" />
                            : <ArrowUpRight size={13} className="text-violet-500 shrink-0" />
                          }
                          <code className={`font-mono text-xs px-2 py-0.5 rounded ${
                            isCN
                              ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                              : "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ADJ_STYLE[v.adj_type] || ADJ_STYLE["Against Bill"]}`}>
                          {v.adj_type || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 tabular-nums text-right font-extrabold">
                        <span className={isCN ? "text-teal-600 dark:text-teal-400" : "text-violet-600 dark:text-violet-400"}>
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
                            sourceType={isCN ? "CreditNote" : "DebitNote"}
                            sourceRef={v._id}
                            sourceNo={v[noKey]}
                            tenderId={v.tender_id}
                            readOnly={v.status === "approved"}
                          />
                          {v.status === "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionModal({ isOpen: true, type: "approve", id: v._id, displayStr: v[noKey], extra: isCN });
                              }}
                              disabled={approvingCN || approvingDN}
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
                                setActionModal({ isOpen: true, type: "delete", id: v._id, displayStr: v[noKey], extra: isCN });
                              }}
                              disabled={deletingCN || deletingDN}
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
                Showing <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong> notes
              </span>
              {filtered.length > 0 && (
                <span className={`font-semibold ${isCN ? "text-teal-600 dark:text-teal-400" : "text-violet-600 dark:text-violet-400"}`}>
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

      {/* ── Create Note Form ── */}
      {showForm && (
        <CreateDebitCreditNote
          onclose={() => setShowForm(false)}
          onSuccess={() => { refetchCN(); refetchDN(); }}
        />
      )}

      {/* ── Action Modals ── */}
      {actionModal.isOpen && actionModal.type === "delete" && (
        <DeleteModal
          deletetitle={`Note ${actionModal.displayStr || ""}`}
          onclose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "", extra: null })}
          onDelete={() => actionModal.extra ? deleteCN(actionModal.id) : deleteDN(actionModal.id)}
        />
      )}
      {actionModal.isOpen && actionModal.type === "approve" && (
        <ConfirmModal
          title={`Approve ${actionModal.extra ? "Credit Note" : "Debit Note"}`}
          message={`Are you sure you want to approve ${actionModal.displayStr || ""}? This action may be irreversible.`}
          onConfirm={() => actionModal.extra ? approveCN(actionModal.id) : approveDN(actionModal.id)}
          onClose={() => setActionModal({ isOpen: false, type: "", id: null, displayStr: "", extra: null })}
        />
      )}
    </div>
  );
};

export default Debit_CreditNote;
