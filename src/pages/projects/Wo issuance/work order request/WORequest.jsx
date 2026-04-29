import { useMemo, useState } from "react";
import { FileCheck, Clock, FileSearch, Inbox, ChevronRight } from "lucide-react";
import Table from "../../../../components/Table";
import Filters from "../../../../components/Filters";
import CreateRequest from "./CreateRequest";
import { useWORequests } from "../../hooks/useProjects";

const STAGES = [
  {
    key:    "Awaiting Quotes",
    label:  "Awaiting Quotes",
    Icon:   Clock,
    match:  (s) => s === "Request Raised" || s === "Quotation Requested",
    active: "bg-amber-100 text-amber-800",
    count:  "bg-amber-200 text-amber-900",
    dot:    "bg-amber-400",
  },
  {
    key:    "Quotes Ready",
    label:  "Quotes Ready",
    Icon:   FileSearch,
    match:  (s) => s === "Quotation Received",
    active: "bg-blue-100 text-blue-800",
    count:  "bg-blue-200 text-blue-900",
    dot:    "bg-blue-500",
  },
];

const WORequest = () => {
  const projectId = localStorage.getItem("tenderId");

  const { data, isLoading, isFetching, refetch } = useWORequests(projectId);
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [statusFilter, setStatusFilter] = useState("All");

  const counts = useMemo(() => {
    const result = { total: safeData.length };
    STAGES.forEach((s) => { result[s.key] = safeData.filter((r) => s.match(r?.status || "")).length; });
    return result;
  }, [safeData]);

  const filteredData = useMemo(() => {
    if (statusFilter === "All") return safeData;
    const stage = STAGES.find((s) => s.key === statusFilter);
    return stage ? safeData.filter((r) => stage.match(r?.status || "")) : safeData;
  }, [safeData, statusFilter]);

  // --- Helpers & Renderers ---
  const formatDate = (dateString) => {
    if (!dateString) return <span className="text-gray-400 text-sm">-</span>;
    
    try {
      let parsedDate;
      const strDate = String(dateString);

      // Check if the date is coming in as DD-MM-YYYY or DD/MM/YYYY
      const ddMmYyyyMatch = strDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
      
      if (ddMmYyyyMatch) {
        // Rearrange to YYYY-MM-DD so JavaScript can safely parse it
        // match[3] = YYYY, match[2] = MM, match[1] = DD
        parsedDate = new Date(`${ddMmYyyyMatch[3]}-${ddMmYyyyMatch[2]}-${ddMmYyyyMatch[1]}T00:00:00`);
      } else {
        // Let JavaScript handle standard formats (ISO, timestamps, etc.)
        parsedDate = new Date(dateString);
      }

      // If it still fails, return the raw string as a last resort
      if (isNaN(parsedDate.getTime())) {
        return <span className="text-gray-700 text-sm">{dateString}</span>;
      }

      // Format to single uniform style: e.g., "18 Apr 2024"
      return new Intl.DateTimeFormat('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).format(parsedDate);
      
    } catch {
      return <span className="text-gray-700 text-sm">{dateString}</span>;
    }
  };

  const getStatusBadge = (status) => {
    const safeStatus = status || "Unknown";
    const styles = {
      "Request Raised": "bg-amber-50 text-amber-700 border-amber-200",
      "Quotation Requested": "bg-amber-50 text-amber-700 border-amber-200",
      "Quotation Received": "bg-blue-50 text-blue-700 border-blue-200",
      "Contractor Approved": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "Purchase Order Issued": "bg-emerald-50 text-emerald-700 border-emerald-200", 
    };
    const activeStyle = styles[safeStatus] || "bg-slate-50 text-slate-600 border-slate-200";
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${activeStyle}`}>
        {safeStatus}
      </span>
    );
  };

  const Columns = useMemo(() => [
    { label: "Request ID", key: "requestId", render: (row) => <span className="font-semibold text-gray-900">{row.requestId || "-"}</span> },
    { label: "Project", key: "tender_project_name", render: (row) => <span className="text-gray-700 truncate max-w-[200px] block" title={row.tender_project_name}>{row.tender_project_name || "-"}</span> },
    { label: "Request Date", key: "requestDate", render: (row) => formatDate(row.requestDate) },
    { label: "Required By", key: "requiredByDate", render: (row) => formatDate(row.requiredByDate) },
    { label: "Incharge", key: "siteIncharge", render: (row) => row.siteIncharge ? <span className="font-medium text-gray-700">{row.siteIncharge}</span> : <span className="text-gray-400 text-sm italic">Unassigned</span> },
    { label: "Status", key: "status", render: (row) => getStatusBadge(row.status) },
  ], []);

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-hidden bg-gray-50/50 p-4 rounded-xl">

      {/* ── WO Request Pipeline Strip ────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-stretch divide-x divide-gray-100 overflow-hidden">

        {/* Total block */}
        <div
          onClick={() => setStatusFilter("All")}
          className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors shrink-0 ${
            statusFilter === "All" ? "bg-gray-900" : "hover:bg-gray-50"
          }`}
        >
          <div className={`p-2 rounded-lg border ${statusFilter === "All" ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
            <Inbox size={18} strokeWidth={2} />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${statusFilter === "All" ? "text-gray-300" : "text-gray-400"}`}>
              All Requests
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
                  onClick={() => setStatusFilter(isActive ? "All" : stage.key)}
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
              <span className="text-[11px] font-bold text-gray-800">{filteredData.length}</span>
              <button
                onClick={() => setStatusFilter("All")}
                className="ml-1 text-gray-400 hover:text-gray-700 text-[13px] font-bold leading-none"
                title="Clear filter"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Data Table ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 w-full relative">
        <Table
          loading={isLoading}
          isRefreshing={isFetching}
          AddModal={CreateRequest}
          addButtonLabel="Create Enquiry"
          addButtonIcon={<FileCheck size={18} className="mr-1" />}
          onSuccess={refetch}
          onUpdated={refetch}
          endpoint={filteredData}
          columns={Columns}
          routepoint="viewworequest"
          FilterModal={Filters}
          id2Key="requestId"
        />
      </div>
    </div>
  );
};

export default WORequest;