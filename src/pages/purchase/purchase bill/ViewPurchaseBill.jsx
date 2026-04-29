import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronRight, RefreshCw, FileText, Search, AlertCircle, SlidersHorizontal, X, Link2, Truck, CheckCircle, Trash2 } from "lucide-react";
import { useBillsByTender, useApprovePurchaseBill, useDeletePurchaseBill } from "./hooks/usePurchaseBill";
import SearchableSelect from "../../../components/SearchableSelect";
import Loader from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";

/* ── helpers ── */
const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const isOverdue = (due, status) =>
  status !== "paid" && status !== "draft" && due && new Date(due) < new Date();

const STATUS_CFG = {
  draft:    { label: "Draft",    cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
  approved: { label: "Approved", cls: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  paid:     { label: "Paid",     cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" },
};

const ITEMS_PER_PAGE = 10;

/* ═══════════════════════════════════════════════════════════════════════════ */
const ViewPurchaseBill = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const summary    = location.state?.item || {};
  const tenderId   = summary.tender_id   || "";
  const tenderName = summary.tender_name || tenderId;

  /* filters */
  const [search,     setSearch]     = useState("");
  const [statusTab,  setStatusTab]  = useState("");
  const [fromDate,   setFromDate]   = useState("");
  const [toDate,     setToDate]     = useState("");
  const [vendorQ,    setVendorQ]    = useState("");
  const [docIdQ,     setDocIdQ]     = useState("");
  const [invoiceQ,   setInvoiceQ]   = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [page,       setPage]       = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data: rawData, isLoading, isFetching, refetch } = useBillsByTender(tenderId, {
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    fromdate: fromDate,
    todate: toDate,
  });
  const { mutate: approveBill, isPending: approving } = useApprovePurchaseBill();
  const { mutate: deleteBill,  isPending: deleting  } = useDeletePurchaseBill();

  const bills      = useMemo(() => rawData || [], [rawData]);

  /* derived vendor list for dropdown (from current page data) */
  const vendors = useMemo(
    () => [...new Map(bills.map((b) => [b.vendor_id, b.vendor_name])).entries()]
            .map(([id, name]) => ({ id, name })),
    [bills],
  );

  /* remaining client-side filters (status, vendor, docId, invoice) */
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (statusTab && b.status !== statusTab) return false;
      if (vendorQ  && b.vendor_id   !== vendorQ)                                       return false;
      if (docIdQ   && !b.doc_id?.toLowerCase().includes(docIdQ.toLowerCase()))         return false;
      if (invoiceQ && !b.invoice_no?.toLowerCase().includes(invoiceQ.toLowerCase()))   return false;
      return true;
    });
  }, [bills, statusTab, vendorQ, docIdQ, invoiceQ]);

  /* aggregates from filtered set */
  const totals = useMemo(() => filtered.reduce(
    (a, b) => ({
      net:      a.net      + (b.net_amount  || 0),
      tax:      a.tax      + (b.total_tax   || 0),
      grand:    a.grand    + (b.grand_total || 0),
      pending:  a.pending  + (b.status === "pending"  ? (b.net_amount || 0) : 0),
      approved: a.approved + (b.status === "approved" ? (b.net_amount || 0) : 0),
      paid:     a.paid     + (b.status === "paid"     ? (b.net_amount || 0) : 0),
    }),
    { net: 0, tax: 0, grand: 0, pending: 0, approved: 0, paid: 0 },
  ), [filtered]);

  /* pagination */
  const paginated = filtered;

  const resetPage = () => setPage(1);

  const hasAdvFilter = !!(fromDate || toDate || vendorQ || docIdQ || invoiceQ);

  const clearAll = () => {
    setSearch(""); setStatusTab(""); setFromDate(""); setToDate("");
    setVendorQ(""); setDocIdQ(""); setInvoiceQ(""); setPage(1);
  };

  /* status tab counts */
  const countByStatus = useMemo(() => {
    const map = {};
    bills.forEach((b) => { map[b.status] = (map[b.status] || 0) + 1; });
    return map;
  }, [bills]);

  /* ── render ── */
  return (
    <div className="font-roboto-flex flex flex-col h-full w-full overflow-hidden bg-gray-50 dark:bg-[#0b0f19]">

      {/* ══ Topbar ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Purchase Bills
            </button>
            <span className="text-gray-300 dark:text-gray-600 text-xs">/</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{tenderName}</span>
            <code className="text-[11px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              {tenderId}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(search || statusTab || hasAdvFilter) && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors">
              <X size={12} /> Clear filters
            </button>
          )}
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              hasAdvFilter
                ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters{hasAdvFilter && " ●"}
          </button>
          <button
            onClick={refetch}
            disabled={isFetching}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ══ Advanced filter panel ════════════════════════════════════════════ */}
      {showFilter && (
        <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 grid grid-cols-5 gap-3">
          <FilterField label="Doc ID">
            <input
              type="text"
              value={docIdQ}
              onChange={(e) => { setDocIdQ(e.target.value); resetPage(); }}
              placeholder="e.g. PB/25-26/0001"
              className={inputCls}
            />
          </FilterField>
          <FilterField label="Invoice No.">
            <input
              type="text"
              value={invoiceQ}
              onChange={(e) => { setInvoiceQ(e.target.value); resetPage(); }}
              placeholder="e.g. INV0023"
              className={inputCls}
            />
          </FilterField>
          <FilterField label="Vendor">
            <SearchableSelect
              value={vendorQ}
              onChange={(val) => { setVendorQ(val); resetPage(); }}
              options={[{ value: "", label: "All Vendors" }, ...vendors.map((v) => ({ value: v.id, label: v.name }))]}
              placeholder="All Vendors"
            />
          </FilterField>
          <FilterField label="From Date">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); resetPage(); }}
              className={inputCls}
            />
          </FilterField>
          <FilterField label="To Date">
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => { setToDate(e.target.value); resetPage(); }}
              className={inputCls}
            />
          </FilterField>
        </div>
      )}

      {/* ══ Status tabs + search ═════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-2 flex items-center gap-4">
        <div className="flex items-center gap-0.5">
          {[["", "All"], ["pending", "Pending"], ["approved", "Approved"], ["paid", "Paid"], ["draft", "Draft"]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => { setStatusTab(val); resetPage(); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusTab === val
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {lbl}
              {val && countByStatus[val] > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${statusTab === val ? "bg-white/20 dark:bg-black/20" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                  {countByStatus[val]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-56">
          <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Search bill, invoice, vendor…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ══ Summary strip ════════════════════════════════════════════════════ */}
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 grid grid-cols-6 divide-x divide-gray-100 dark:divide-gray-800">
        <StatCell label="Bills"    value={filtered.length} />
        <StatCell label="Base"     value={`₹${fmt(totals.grand)}`} />
        <StatCell label="Tax"      value={`₹${fmt(totals.tax)}`} />
        <StatCell label="Net"      value={`₹${fmt(totals.net)}`}      bold />
        <StatCell label="Pending"  value={`₹${fmt(totals.pending)}`}  color="text-amber-600 dark:text-amber-400" />
        <StatCell label="Paid"     value={`₹${fmt(totals.paid)}`}     color="text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* ══ Table ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <Loader />
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <FileText size={36} className="opacity-20" />
            <p className="text-sm font-medium">No bills found</p>
            {(search || statusTab || hasAdvFilter) && (
              <button onClick={clearAll} className="text-xs text-blue-500 hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="w-8 border-b border-gray-200 dark:border-gray-700" />
                {[
                  ["#",           "w-10 text-center"],
                  ["Bill No.",    ""],
                  ["Date",        ""],
                  ["Invoice No.", ""],
                  ["Inv. Date",   ""],
                  ["Vendor",      "min-w-[140px]"],
                  ["Mode",        "text-center"],
                  ["Base Amt",    "text-right"],
                  ["Tax",         "text-right"],
                  ["Net Amt",     "text-right"],
                  ["Due Date",    ""],
                  ["Status",      ""],
                  ["Actions",     ""],
                ].map(([h, cls]) => (
                  <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap ${cls}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {paginated.map((bill, i) => {
                const st       = STATUS_CFG[bill.status] || STATUS_CFG.pending;
                const overdue  = isOverdue(bill.due_date, bill.status);
                const rowNo    = (page - 1) * ITEMS_PER_PAGE + i + 1;
                const expanded = expandedId === bill._id;

                return [
                  /* ── Summary row ── */
                  <tr
                    key={bill._id}
                    onClick={() => setExpandedId(expanded ? null : bill._id)}
                    className={`cursor-pointer transition-colors ${expanded ? "bg-slate-50 dark:bg-gray-800/60" : "hover:bg-slate-50 dark:hover:bg-gray-800/40"} border-b ${expanded ? "border-transparent" : "border-gray-100 dark:border-gray-800"}`}
                  >
                    <td className="pl-4 py-3 text-gray-400">
                      {expanded
                        ? <ChevronDown size={14} className="text-blue-500" />
                        : <ChevronRight size={14} />}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 text-center tabular-nums">{rowNo}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{bill.doc_id}</code>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(bill.doc_date)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {bill.invoice_no || <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(bill.invoice_date)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{bill.vendor_name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{bill.vendor_gstin}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${bill.tax_mode === "instate" ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"}`}>
                        {bill.tax_mode === "instate" ? "InState" : "Interstate"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-right text-gray-600 dark:text-gray-400">₹{fmt(bill.grand_total)}</td>
                    <td className="px-4 py-3 text-xs tabular-nums text-right text-indigo-600 dark:text-indigo-400">₹{fmt(bill.total_tax)}</td>
                    <td className="px-4 py-3 text-sm tabular-nums text-right font-bold text-gray-900 dark:text-white">₹{fmt(bill.net_amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
                        {overdue && <AlertCircle size={11} />}
                        {fmtDate(bill.due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {bill.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Approve ${bill.doc_id}?`)) {
                                approveBill(bill._id);
                              }
                            }}
                            disabled={approving || deleting}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            <CheckCircle size={11} />
                            Approve
                          </button>
                        )}
                        {(bill.status === "draft" || bill.status === "pending") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete ${bill.doc_id}? This cannot be undone.`)) {
                                deleteBill(bill._id);
                              }
                            }}
                            disabled={deleting || approving}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>,

                  /* ── Expanded detail row ── */
                  expanded && (
                    <tr key={`${bill._id}-detail`}>
                      <td colSpan={14} className="bg-slate-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-700 px-6 py-5">
                        <div className="flex flex-col gap-5">

                          {/* ── GRN Linkage + Line Items (combined) ── */}
                          <DetailSection icon={<Link2 size={13} />} title="GRN Linkage &amp; Line Items" count={(bill.grn_rows?.length || 0) + (bill.line_items?.length || 0)} fullWidth>
                            <div className="flex flex-col gap-3">
                              {/* GRN rows */}
                              {(bill.grn_rows?.length || 0) > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">GRN References</p>
                                  <MiniTable
                                    headers={["GRN No.", "Date", "Qty"]}
                                    rows={(bill.grn_rows || []).map((g) => [
                                      <code key="g" className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{g.grn_no}</code>,
                                      fmtDate(g.ref_date),
                                      <span key="q" className="tabular-nums font-semibold text-gray-800 dark:text-gray-100">{g.grn_qty}</span>,
                                    ])}
                                  />
                                </div>
                              )}
                              {/* Line items */}
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Line Items</p>
                                {bill.tax_mode === "instate" ? (
                                  <MiniTable
                                    headers={["Item", "Unit", "Qty", "Rate", "Gross", "CGST%", "CGST Amt", "SGST%", "SGST Amt", "Net Amt"]}
                                    rows={(bill.line_items || []).map((it) => [
                                      <span key="i" className="font-medium text-gray-800 dark:text-gray-100">{it.item_description}</span>,
                                      it.unit || "—",
                                      <span key="q" className="tabular-nums">{it.accepted_qty}</span>,
                                      `₹${fmt(it.unit_price)}`,
                                      `₹${fmt(it.gross_amt)}`,
                                      `${it.cgst_pct ?? 0}%`,
                                      `₹${fmt(it.cgst_amt)}`,
                                      `${it.sgst_pct ?? 0}%`,
                                      `₹${fmt(it.sgst_amt)}`,
                                      <span key="n" className="tabular-nums font-semibold text-gray-900 dark:text-white">₹{fmt(it.net_amt)}</span>,
                                    ])}
                                  />
                                ) : (
                                  <MiniTable
                                    headers={["Item", "Unit", "Qty", "Rate", "Gross", "IGST%", "IGST Amt", "Net Amt"]}
                                    rows={(bill.line_items || []).map((it) => [
                                      <span key="i" className="font-medium text-gray-800 dark:text-gray-100">{it.item_description}</span>,
                                      it.unit || "—",
                                      <span key="q" className="tabular-nums">{it.accepted_qty}</span>,
                                      `₹${fmt(it.unit_price)}`,
                                      `₹${fmt(it.gross_amt)}`,
                                      `${it.igst_pct ?? 0}%`,
                                      `₹${fmt(it.igst_amt)}`,
                                      <span key="n" className="tabular-nums font-semibold text-gray-900 dark:text-white">₹{fmt(it.net_amt)}</span>,
                                    ])}
                                  />
                                )}
                              </div>
                            </div>
                          </DetailSection>

                          {/* ── Additional Charges ── */}
                          <DetailSection icon={<Truck size={13} />} title="Additional Charges" count={bill.additional_charges?.length} fullWidth>
                            <MiniTable
                              headers={["Type", "Amount", "GST%", "Net", "Deduction"]}
                              rows={(bill.additional_charges || []).map((c) => [
                                c.type,
                                `₹${fmt(c.amount)}`,
                                `${c.gst_pct}%`,
                                <span key="n" className={`tabular-nums font-semibold ${c.is_deduction ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                  {c.is_deduction ? "−" : "+"}₹{fmt(c.net)}
                                </span>,
                                c.is_deduction
                                  ? <span key="d" className="text-red-500 text-[10px] font-semibold">Yes</span>
                                  : <span key="d" className="text-gray-400 text-[10px]">No</span>,
                              ])}
                            />
                          </DetailSection>

                          {/* ── Bill Totals Breakdown ── */}
                          {(() => {
                            const addlNet = (bill.additional_charges || []).reduce(
                              (s, c) => s + (c.is_deduction ? -(c.net || 0) : (c.net || 0)), 0
                            );
                            return (
                              <div className="flex justify-end">
                                <div className="w-72 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                                  <div className="bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Bill Summary
                                  </div>
                                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    <SummaryRow label="Gross (Line Items)" value={`₹${fmt(bill.grand_total)}`} />
                                    {bill.tax_mode === "instate" ? (
                                      <>
                                        <SummaryRow label={`CGST`} value={`₹${fmt(bill.total_tax / 2)}`} color="text-indigo-600 dark:text-indigo-400" />
                                        <SummaryRow label={`SGST`} value={`₹${fmt(bill.total_tax / 2)}`} color="text-indigo-600 dark:text-indigo-400" />
                                      </>
                                    ) : (
                                      <SummaryRow label="IGST" value={`₹${fmt(bill.total_tax)}`} color="text-indigo-600 dark:text-indigo-400" />
                                    )}
                                    {(bill.additional_charges?.length > 0) && (
                                      <SummaryRow
                                        label="Additional Charges"
                                        value={`${addlNet >= 0 ? "+" : "−"}₹${fmt(Math.abs(addlNet))}`}
                                        color={addlNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
                                      />
                                    )}
                                    <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/60 font-bold">
                                      <span className="text-gray-700 dark:text-gray-200">Net Payable</span>
                                      <span className="tabular-nums text-gray-900 dark:text-white">₹{fmt(bill.net_amount)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500";

const FilterField = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
    {children}
  </div>
);

const StatCell = ({ label, value, bold, color = "text-gray-700 dark:text-gray-200" }) => (
  <div className="px-4 first:pl-0 last:pr-0">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
    <p className={`text-sm tabular-nums ${bold ? "font-bold" : "font-semibold"} ${color}`}>{value}</p>
  </div>
);

const PgBtn = ({ children, onClick, disabled, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[26px] h-6 px-1 rounded text-xs font-medium transition-colors ${
      active   ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
      : disabled ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
  >
    {children}
  </button>
);

const DetailSection = ({ icon, title, count, fullWidth = false, children }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</span>
      {count !== undefined && count !== null && (
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 tabular-nums">
          {count}
        </span>
      )}
    </div>
    {count === 0 ? (
      <p className="text-[11px] text-gray-300 dark:text-gray-600 italic">None</p>
    ) : (
      children
    )}
  </div>
);

const SummaryRow = ({ label, value, color = "text-gray-600 dark:text-gray-300" }) => (
  <div className="flex justify-between px-3 py-1.5">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`tabular-nums font-semibold ${color}`}>{value}</span>
  </div>
);

const MiniTable = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="w-full text-[11px]">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-800">
          {headers.map((h) => (
            <th key={h} className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap border-b border-gray-200 dark:border-gray-700">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="px-2.5 py-3 text-center text-[11px] text-gray-300 dark:text-gray-600 italic">
              No data
            </td>
          </tr>
        ) : (
          rows.map((cells, ri) => (
            <tr key={ri} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {cells.map((cell, ci) => (
                <td key={ci} className="px-2.5 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default ViewPurchaseBill;
