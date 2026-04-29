import { useState, useMemo } from "react";
import SearchableSelect from "../../../components/SearchableSelect";
import {
  Receipt,
  Building2,
  CalendarDays,
  TrendingUp,
  FileText,
  Search,
  RefreshCw,
  X,
  Layers,
  Percent,
  ChevronRight,
  Hash,
} from "lucide-react";
import { TbPlus } from "react-icons/tb";
import { useWeeklyBillingList, useWeeklyBillingDetail, useUpdateBillStatus, useApproveBill } from "./hooks/useWeeklyBilling";
import { useProject } from "../../../context/ProjectContext";
import GenerateBillModal from "./GenerateBillModal";
import Loader from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";

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
  Generated: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  Pending:   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  Approved:      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  Cancelled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

// ── Page ───────────────────────────────────────────────────────────────────────
const WeeklyBilling = () => {
  const { tenderId } = useProject();
  const [showModal, setShowModal]       = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [search, setSearch]             = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const [contractorFilter, setContractorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const { data: rawData, isLoading, isFetching, refetch } = useWeeklyBillingList(tenderId, {
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate: filterParams.todate,
  });

  const bills      = rawData?.data || [];
  const totalPages = rawData?.totalPages || 1;

  const contractors = useMemo(
    () => [...new Set(bills.map((b) => b.contractor_name).filter(Boolean))],
    [bills],
  );

  const filtered = useMemo(() => {
    let list = [...bills];
    if (contractorFilter) list = list.filter((b) => b.contractor_name === contractorFilter);
    if (statusFilter) list = list.filter((b) => b.status === statusFilter);
    return list;
  }, [bills, contractorFilter, statusFilter]);

  const totalBilled = useMemo(
    () => bills.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + (b.total_amount || 0), 0),
    [bills],
  );

  return (
    <div className="font-roboto-flex min-h-screen bg-gray-50 dark:bg-[#0b0f19] pb-24">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Receipt size={17} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Weekly Billing
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-none">
                <span className="font-mono font-semibold text-gray-600 dark:text-gray-300">{tenderId}</span>
                <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
                Site Management
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <TbPlus className="text-lg" />
            Generate Bill
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <SummaryCard icon={<Receipt size={20} />}    color="emerald" label="Total Bills"  value={bills.length}          sub="all time" />
          <SummaryCard icon={<TrendingUp size={20} />} color="blue"    label="Total Billed" value={`₹${fmt(totalBilled)}`} sub="excl. cancelled" />
          <SummaryCard icon={<Building2 size={20} />}  color="violet"  label="Contractors"  value={contractors.length}         sub="with billing" />
        </div>

        {/* ── Filters ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3.5 mb-4 flex items-center gap-3 flex-wrap relative z-10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bill no. or contractor…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <input
            type="date"
            value={filterParams.fromdate}
            onChange={(e) => { setFilterParams((p) => ({ ...p, fromdate: e.target.value })); setCurrentPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filterParams.todate}
            onChange={(e) => { setFilterParams((p) => ({ ...p, todate: e.target.value })); setCurrentPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="min-w-[180px]">
            <SearchableSelect
              value={contractorFilter}
              onChange={(val) => setContractorFilter(val)}
              options={[{ value: "", label: "All Contractors" }, ...contractors.map((v) => ({ value: v, label: v }))]}
              placeholder="All Contractors"
            />
          </div>

          <div className="min-w-[140px]">
            <SearchableSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[{ value: "", label: "All Status" }, ...["Generated", "Pending", "Approved", "Cancelled"].map((s) => ({ value: s, label: s }))]}
              placeholder="All Status"
            />
          </div>

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
          <Loader/>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <FileText size={44} className="opacity-20" />
            <p className="text-sm font-semibold">
              {bills.length === 0 ? "No bills generated yet." : "No results for current filters."}
            </p>
            {bills.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
              >
                Generate your first bill
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["#", "Bill No.", "Contractor", "Period", "Work Orders", "Base Amount", "GST", "Total Amount", "Status", ""].map((h) => (
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
                  {filtered.map((bill, i) => (
                    <tr
                      key={bill._id || bill.bill_no}
                      onClick={() => setSelectedBill(bill)}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {bill.bill_no || "—"}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-100">
                          <Building2 size={13} className="text-gray-400 shrink-0" />
                          {bill.contractor_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <CalendarDays size={11} className="shrink-0" />
                          {fmtDate(bill.from_date)} – {fmtDate(bill.to_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                          {(bill.sub_bills || []).length}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-right font-semibold text-gray-700 dark:text-gray-300">
                        ₹{fmt(bill.base_amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                          {bill.gst_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{fmt(bill.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${STATUS_STYLE[bill.status] || STATUS_STYLE.Pending}`}>
                          {bill.status || "Generated"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={15} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong> bills
                <span className="ml-2 text-gray-300">· Click a row to view details</span>
              </span>
              {filtered.length > 0 && (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Page Total: ₹{fmt(filtered.reduce((s, b) => s + (b.total_amount || 0), 0))}
                </span>
              )}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      {/* ── Generate Bill Modal ── */}
      {showModal && (
        <GenerateBillModal
          onClose={() => setShowModal(false)}
          onSuccess={refetch}
          existingBills={rawData?.data || []}
        />
      )}

      {/* ── Bill Detail Modal ── */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          tenderId={tenderId}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
};

// Allowed status transitions per MD spec
const NEXT_STATUSES = {
  Generated: ["Pending", "Cancelled"],
  Pending:   ["Approved", "Cancelled"],
  Approved:      [],
  Cancelled: [],
};

const STATUS_BTN = {
  Pending:   "bg-amber-500 hover:bg-amber-600 text-white",
  Approved:      "bg-blue-600 hover:bg-blue-700 text-white",
  Cancelled: "bg-red-500 hover:bg-red-600 text-white",
};

// ── Bill Detail Modal ───────────────────────────────────────────────────────────
const BillDetailModal = ({ bill, onClose, tenderId }) => {
  const { data: detail, isLoading: detailLoading } = useWeeklyBillingDetail(bill.bill_no);
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateBillStatus(tenderId);
  const { mutate: approveBill,  isPending: approving      } = useApproveBill(tenderId);

  // Use detail data when loaded, fall back to list item for amounts
  const currentStatus = detail?.status ?? bill.status ?? "Generated";
  const transactions  = detail?.transactions || [];
  const subBills      = detail?.sub_bills   ?? bill.sub_bills ?? [];
  const gstRate       = detail?.gst_pct     ?? bill.gst_pct ?? 0;
  const nextStatuses  = NEXT_STATUSES[currentStatus] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-roboto-flex">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* ── Header ── */}
        <div className="px-7 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Receipt size={18} className="text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-800 dark:text-white leading-tight">
                  Bill Details
                </h2>
                <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                  {bill.bill_no}
                </code>
                <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${STATUS_STYLE[currentStatus] || STATUS_STYLE.Pending}`}>
                  {currentStatus}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Building2 size={11} />
                {bill.contractor_name}
                <span className="text-gray-300 dark:text-gray-600 mx-1">·</span>
                <CalendarDays size={11} />
                {fmtDate(bill.from_date)} – {fmtDate(bill.to_date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">

          {/* ── Info strip ── */}
          <div className="px-7 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 grid grid-cols-4 gap-4">
            <InfoChip icon={<Hash size={13} />} label="Bill No." value={bill.bill_no} />
            <InfoChip icon={<Building2 size={13} />} label="Contractor" value={bill.contractor_name} />
            <InfoChip
              icon={<CalendarDays size={13} />}
              label="Period"
              value={`${fmtDate(bill.from_date)} – ${fmtDate(bill.to_date)}`}
            />
            <InfoChip
              icon={<Layers size={13} />}
              label="Work Orders"
              value={`${subBills.length} order${subBills.length !== 1 ? "s" : ""}`}
            />
          </div>

          {/* ── Transactions Table ── */}
          <div className="px-7 py-5">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3">
              Line Items
            </p>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-5">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                  <span className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  <span className="text-sm">Loading line items…</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No line items recorded for this bill.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        {["#", "Sub-Bill", "Work Order", "Item Description", "Detailed Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {transactions.map((item, i) => (
                        <tr key={item._id || i} className={i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/60 dark:bg-gray-800/30"}>
                          <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3">
                            <code className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono">
                              {item.sub_bill_no?.split("/").slice(-1)[0] || "—"}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono text-gray-600 dark:text-gray-300">
                              {item.work_order_id || "—"}
                            </code>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                            {item.item_description || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[180px]">
                            {item.description || <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-blue-600 dark:text-blue-400 font-semibold">
                            {item.quantity ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 uppercase text-xs">
                            {item.unit || "—"}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300">
                            ₹{fmt(item.quoted_rate)}
                          </td>
                          <td className="px-4 py-3 tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                            ₹{fmt(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-200 dark:border-gray-700">
                      <tr>
                        <td colSpan={8} className="px-4 py-2.5 text-xs font-bold text-right text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Base Total
                        </td>
                        <td className="px-4 py-2.5 tabular-nums font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{fmt(detail?.base_amount ?? bill.base_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* ── GST & Totals ── */}
            <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3">
              GST &amp; Total
            </p>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 max-w-sm ml-auto space-y-2.5">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Base Amount</span>
                <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">
                  ₹{fmt(detail?.base_amount ?? bill.base_amount)}
                </span>
              </div>

              {gstRate > 0 ? (
                <>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <span className="flex items-center gap-1">
                      <Percent size={11} className="text-indigo-400" />
                      CGST ({(detail?.cgst_pct ?? bill.cgst_pct ?? gstRate / 2)}%)
                    </span>
                    <span className="font-medium tabular-nums text-indigo-500 dark:text-indigo-400">
                      + ₹{fmt(detail?.cgst_amount ?? bill.cgst_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <span className="flex items-center gap-1">
                      <Percent size={11} className="text-indigo-400" />
                      SGST ({(detail?.sgst_pct ?? bill.sgst_pct ?? gstRate / 2)}%)
                    </span>
                    <span className="font-medium tabular-nums text-indigo-500 dark:text-indigo-400">
                      + ₹{fmt(detail?.sgst_amount ?? bill.sgst_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Total GST ({gstRate}%)</span>
                    <span className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                      + ₹{fmt(detail?.gst_amount ?? bill.gst_amount)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>GST (0%)</span>
                  <span className="font-semibold tabular-nums text-gray-400">₹0.00</span>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-500" />
                  Grand Total
                </span>
                <span className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  ₹{fmt(detail?.total_amount ?? bill.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-3.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">
            {transactions.length} item{transactions.length !== 1 ? "s" : ""} ·{" "}
            {subBills.length} work order{subBills.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {nextStatuses.map((s) =>
              s === "Approved" ? (
                <button
                  key={s}
                  onClick={() => approveBill(bill._id)}
                  disabled={approving || updatingStatus}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${STATUS_BTN[s]}`}
                >
                  {approving ? "Approving…" : "Approve"}
                </button>
              ) : (
                <button
                  key={s}
                  onClick={() => updateStatus({ billId: bill._id, status: s })}
                  disabled={updatingStatus || approving}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${STATUS_BTN[s]}`}
                >
                  {updatingStatus ? "Updating…" : `Mark as ${s}`}
                </button>
              )
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Info Chip ──────────────────────────────────────────────────────────────────
const InfoChip = ({ icon, label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1">
      {icon}{label}
    </span>
    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</span>
  </div>
);

// ── Summary Card ───────────────────────────────────────────────────────────────
const SummaryCard = ({ icon, color, label, value, sub }) => {
  const styles = {
    emerald: { wrap: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", val: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-100 dark:border-emerald-800/50" },
    blue:    { wrap: "bg-blue-50 dark:bg-blue-900/20",    icon: "text-blue-600 dark:text-blue-400",    val: "text-blue-700 dark:text-blue-300",    border: "border-blue-100 dark:border-blue-800/50" },
    violet:  { wrap: "bg-violet-50 dark:bg-violet-900/20", icon: "text-violet-600 dark:text-violet-400", val: "text-violet-700 dark:text-violet-300", border: "border-violet-100 dark:border-violet-800/50" },
  };
  const s = styles[color];
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${s.border} p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${s.wrap} shrink-0`}>
        <span className={s.icon}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-extrabold mt-0.5 tabular-nums ${s.val}`}>{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

export default WeeklyBilling;
