import { useState, useMemo } from "react";
import { Clock, FileSearch, ShieldCheck, PackageCheck, CheckCircle, Inbox, ChevronRight } from "lucide-react";
import Filters from "../../../components/Filters";
import Table from "../../../components/Table";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePurchaseOrders } from "./hooks/usePurchaseOrder";

const formatDate = (dateString) => {
  if (!dateString) return <span className="text-gray-400 text-sm">-</span>;
  try {
    let parsedDate;
    const strDate = String(dateString);
    const ddMmYyyyMatch = strDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (ddMmYyyyMatch) {
      parsedDate = new Date(`${ddMmYyyyMatch[3]}-${ddMmYyyyMatch[2]}-${ddMmYyyyMatch[1]}T00:00:00`);
    } else {
      parsedDate = new Date(dateString);
    }
    if (isNaN(parsedDate.getTime())) return <span className="text-gray-700 text-sm">{dateString}</span>;
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsedDate);
  } catch {
    return <span className="text-gray-700 text-sm">{dateString}</span>;
  }
};

const getStatusBadge = (status) => {
  const safeStatus = status || "Unknown";
  const styles = {
    "Request Raised":        "bg-gray-50 text-gray-700 border-gray-200",
    "Quotation Requested":   "bg-amber-50 text-amber-700 border-amber-200",
    "Quotation Received":    "bg-blue-50 text-blue-700 border-blue-200",
    "Vendor Approved":       "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Purchase Order Issued": "bg-violet-50 text-violet-700 border-violet-200",
    "Completed":             "bg-green-50 text-green-700 border-green-200",
  };
  const activeStyle = styles[safeStatus] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${activeStyle}`}>
      {safeStatus}
    </span>
  );
};

const STAGES = [

  {
    key:         "Vendor Approved",
    label:       "Vendor Approved",
    Icon:        ShieldCheck,
    apiStatuses: ["Vendor Approved"],
    match:       (s) => s === "Vendor Approved",
    active:      "bg-indigo-100 text-indigo-800",
    count:       "bg-indigo-200 text-indigo-900",
    dot:         "bg-indigo-500",
  },
  {
    key:         "Order Issued",
    label:       "Order Issued",
    Icon:        PackageCheck,
    apiStatuses: ["Purchase Order Issued"],
    match:       (s) => s === "Purchase Order Issued",
    active:      "bg-violet-100 text-violet-800",
    count:       "bg-violet-200 text-violet-900",
    dot:         "bg-violet-500",
  },
  {
    key:         "Completed",
    label:       "Completed",
    Icon:        CheckCircle,
    apiStatuses: ["Completed"],
    match:       (s) => s === "Completed",
    active:      "bg-green-100 text-green-800",
    count:       "bg-green-200 text-green-900",
    dot:         "bg-green-500",
  },
];

const PurchaseOrder = () => {
  const [currentPage,  setCurrentPage]  = useState(1);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterParams, setFilterParams] = useState({ fromdate: "", todate: "" });
  const [statusFilter, setStatusFilter] = useState("All");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const baseParams = {
    search: debouncedSearch,
    fromdate: filterParams.fromdate,
    todate:   filterParams.todate,
  };

  const activeApprovalType = useMemo(() => {
    if (statusFilter === "All") return undefined;
    const stage = STAGES.find((s) => s.key === statusFilter);
    return stage ? stage.apiStatuses[0] : undefined;
  }, [statusFilter]);

  const { data, isLoading, isFetching, refetch } = usePurchaseOrders({
    page: currentPage, limit: 10,
    ...baseParams,
    approval_type: activeApprovalType,
  });

  const toRow = (item) => ({
    requestId:           item.requestId,
    requestDate:         item.requestDate,
    projectId:           item.projectId,
    tender_project_name: item.tender_project_name,
    tender_name:         item.tender_name,
    requiredOn:          item.requiredByDate,
    siteIncharge:        item.siteDetails?.siteIncharge || "N/A",
    status:              item.status,
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : (data?.data || []);
    return list.map(toRow);
  }, [data]);

  const counts = useMemo(() => {
    const apiCounts = data?.counts;
    if (apiCounts) {
      const result = { total: apiCounts.total || 0 };
      STAGES.forEach((s) => {
        result[s.key] = s.apiStatuses.reduce((sum, st) => sum + (apiCounts[st] || 0), 0);
      });
      return result;
    }
    const result = { total: rows.length };
    STAGES.forEach((s) => { result[s.key] = rows.filter((r) => s.match(r.status || "")).length; });
    return result;
  }, [data, rows]);

  const filteredRows = rows;

  const handleRefetch = () => { refetch(); };

  const Columns = useMemo(() => [
    { label: "Request ID",        key: "requestId",           render: (row) => <span className="font-semibold text-gray-900">{row.requestId || "-"}</span> },
    { label: "Project",           key: "tender_project_name", render: (row) => <span className="text-gray-700 truncate max-w-[200px] block" title={row.tender_project_name}>{row.tender_project_name || "-"}</span> },
    { label: "Request Date",      key: "requestDate",         render: (row) => formatDate(row.requestDate) },
    { label: "Date of Req.",      key: "requiredOn",          render: (row) => formatDate(row.requiredOn) },
    { label: "Requested By",      key: "siteIncharge",        render: (row) => row.siteIncharge && row.siteIncharge !== "N/A" ? <span className="font-medium text-gray-700">{row.siteIncharge}</span> : <span className="text-gray-400 text-sm italic">Unassigned</span> },
    { label: "Status",            key: "status",              render: (row) => getStatusBadge(row.status) },
  ], []);

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-hidden bg-gray-50/50 p-4 rounded-xl">

      {/* ── Procurement Pipeline Strip ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-stretch divide-x divide-gray-100 overflow-hidden">

        {/* Total block */}
        {/* Total block */}
        <div
          onClick={() => { setStatusFilter("All"); setCurrentPage(1); }}
          className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors shrink-0 ${
            statusFilter === "All" ? "bg-gray-900" : "hover:bg-gray-50"
          }`}
        >
          <div className={`p-2 rounded-lg border ${statusFilter === "All" ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
            <Inbox size={18} strokeWidth={2} />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${statusFilter === "All" ? "text-gray-300" : "text-gray-400"}`}>
              All Orders
            </p>
            <p className={`text-2xl font-black leading-none mt-0.5 ${statusFilter === "All" ? "text-white" : "text-gray-900"}`}>
              {counts.total}
            </p>
          </div>
        </div>

        {/* Stage buttons */}
        <div className="flex-1 flex items-center gap-1.5 px-4 py-3 overflow-x-auto">
          {STAGES.map((stage, i) => {
            const isActive = statusFilter === stage.key;
            return (
              <div key={stage.key} className="flex items-center gap-1.5 shrink-0">
                {i > 0 && <ChevronRight size={13} className="text-gray-300" />}
                <button
                  onClick={() => { setStatusFilter(isActive ? "All" : stage.key); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all duration-150 ${
                    isActive
                      ? `${stage.active} border-transparent shadow-sm`
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? stage.dot : "bg-gray-300"}`} />
                  <stage.Icon size={14} strokeWidth={2.5} />
                  <span className="text-[12px] font-semibold whitespace-nowrap">{stage.label}</span>
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded min-w-[20px] text-center ${
                    isActive ? stage.count : "bg-gray-100 text-gray-600"
                  }`}>
                    {counts[stage.key]}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Active filter label */}
        {statusFilter !== "All" && (
          <div className="flex items-center px-4 shrink-0">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-[11px] text-gray-500 font-medium">Showing</span>
              <span className="text-[11px] font-bold text-gray-800">{counts[statusFilter] ?? filteredRows.length}</span>
              <button
                onClick={() => { setStatusFilter("All"); setCurrentPage(1); }}
                className="ml-1 text-gray-400 hover:text-gray-700 text-[13px] font-bold leading-none"
                title="Clear filter"
              >×</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Data Table ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 w-full relative">
        <Table
          endpoint={filteredRows}
          totalPages={data?.totalPages || 0}
          columns={Columns}
          routepoint="viewpurchaseorder"
          FilterModal={Filters}
          loading={isLoading}
          isRefreshing={isFetching}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          search={searchTerm}
          setSearch={setSearchTerm}
          filterParams={filterParams}
          setFilterParams={setFilterParams}
          onSuccess={handleRefetch}
          onUpdated={handleRefetch}
        />
      </div>
    </div>
  );
};

export default PurchaseOrder;
