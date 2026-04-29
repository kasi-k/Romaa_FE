import React, { useEffect, useState, useMemo } from "react";
import {  useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "../../../constant";
import SearchableSelect from "../../../components/SearchableSelect";
import { 
  ArrowLeft, 
  CalendarDays, 
  FileText, 
  User, 
  Truck, 
  Box, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  Search,
  Filter,
  X
} from "lucide-react";

const ViewMaterialReceived = () => {
  const location = useLocation();
  const { tenderId, itemId } = location.state || {}; // Handle potential null state
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [searchText, setSearchText] = useState("");
  const [dateFilterType, setDateFilterType] = useState("all"); // all, date, week, month, year
  const [dateValue, setDateValue] = useState("");

  // --- Fetch History ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (!tenderId || !itemId) return;
      try {
        const res = await axios.get(`${API}/material/getMaterialInwardHistory/${tenderId}/${itemId}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [tenderId, itemId]);

  // --- Filtering Logic ---
  const filteredHistory = useMemo(() => {
    if (!data || !data.history) return [];

    return data.history.filter((log) => {
      // 1. Text Search (PO, Invoice, Site)
      const searchLower = searchText.toLowerCase();
      const matchesText = 
        (log.purchase_request_ref || "").toLowerCase().includes(searchLower) ||
        (log.invoice_challan_no || "").toLowerCase().includes(searchLower) ||
        (log.site_name || "").toLowerCase().includes(searchLower);

      if (!matchesText) return false;

      // 2. Date Filtering
      if (dateFilterType === "all" || !dateValue) return true;

      const logDate = new Date(log.date);
      
      if (dateFilterType === "date") {
        // Match specific YYYY-MM-DD
        const logDateStr = logDate.toISOString().split("T")[0];
        return logDateStr === dateValue;
      }

      if (dateFilterType === "month") {
        // Input: YYYY-MM
        const logMonthStr = logDate.toISOString().slice(0, 7); // "2023-05"
        return logMonthStr === dateValue;
      }

      if (dateFilterType === "week") {
        // Input: 2023-W25 (ISO Week)
        // Helper to get ISO week from log date
        const d = new Date(Date.UTC(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        const logWeekStr = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
        return logWeekStr === dateValue;
      }

      if (dateFilterType === "year") {
        // Input: YYYY
        return logDate.getFullYear().toString() === dateValue;
      }

      return true;
    });
  }, [data, searchText, dateFilterType, dateValue]);


  // --- Render Loading / Error ---
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0b0f19]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading Material History...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#0b0f19] text-gray-500">
      <Box size={48} className="mb-2 opacity-20" />
      <p>Material not found.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] font-roboto-flex">
      
      {/* --- Top Navigation Bar --- */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-4 dark:border-gray-800 dark:bg-[#0b0f19]/90">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="group rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {data.item_name}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Inward Material Ledger
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
          
          {/* --- LEFT COLUMN: Material Stats (Sticky) --- */}
          <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-4">
            
            {/* Main Stats Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
              <div className="relative h-24 bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="absolute -bottom-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md text-blue-600 dark:bg-gray-900 dark:text-blue-400">
                  <Box size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className="px-6 pt-8 pb-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data.item_name}</h2>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20 mt-2">
                    Unit: {data.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Received</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {data.total_received?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</p>
                    <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      {data.current_stock?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Helper Info Card */}
            <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200 border border-blue-100 dark:border-blue-800/50">
              <div className="flex gap-3">
                <TrendingUp size={20} className="shrink-0 text-blue-600 dark:text-blue-400" />
                <p>
                  This timeline shows every inward transaction verified by the site engineer. 
                  Check invoices for discrepancies.
                </p>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Timeline Feed --- */}
          <div className="lg:col-span-2">
            
            {/* --- Filter Bar --- */}
            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                
                {/* Search Text */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search PO, Invoice, Site..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm  outline-none transition-all"
                  />
                  {searchText && (
                    <button 
                      onClick={() => setSearchText("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex gap-2">
                  <div className="relative">
                    <SearchableSelect
                      value={dateFilterType}
                      onChange={(val) => { setDateFilterType(val); setDateValue(""); }}
                      options={[
                        { value: "all", label: "All Time" },
                        { value: "date", label: "Date" },
                        { value: "week", label: "Week" },
                        { value: "month", label: "Month" },
                        { value: "year", label: "Year" },
                      ]}
                      placeholder="Filter by"
                    />
                  </div>

                  {dateFilterType !== "all" && (
                    <input
                      type={dateFilterType === "year" ? "number" : dateFilterType}
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      placeholder={dateFilterType === "year" ? "YYYY" : ""}
                      className="w-40 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* --- Timeline Header --- */}
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-2"><Clock size={16} /> History</span>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {filteredHistory.length}
              </span>
            </h3>

            {/* --- Timeline List --- */}
            <div className="relative space-y-8 pl-4 before:absolute before:left-[19px] before:top-2 before:h-full before:w-[2px] before:bg-gray-200 dark:before:bg-gray-800">
              {filteredHistory.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                  <Filter size={32} className="mb-2 opacity-50" />
                  <p>No transactions match your filters.</p>
                  <button 
                    onClick={() => { setSearchText(""); setDateFilterType("all"); }}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredHistory.map((log, index) => (
                  <div key={log._id || index} className="relative pl-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Timeline Dot */}
                    <div className="absolute left-[10px] top-2 h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-sm dark:border-[#0b0f19] dark:bg-blue-500"></div>

                    {/* Content Card */}
                    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700">
                      
                      {/* Card Header: Date & Qty */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            <CalendarDays size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(log.date).toLocaleDateString(undefined, { 
                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                              })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Received by: <span className="font-medium text-gray-700 dark:text-gray-300">{log.received_by || "Admin"}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="block text-2xl font-bold text-green-600 dark:text-green-400">
                            +{log.quantity?.toLocaleString()}
                            <span className="ml-1 text-sm font-medium text-gray-400">{data.unit}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        </div>
                      </div>

                      {/* Card Body: Details Grid */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Site Info */}
                        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                          <Building2 size={18} className="mt-0.5 text-gray-400" />
                          <div>
                            <p className="text-xs font-bold uppercase text-gray-400">Site Name</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1" title={log.site_name}>
                              {log.site_name || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Invoice & PO Info */}
                        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                          <FileText size={18} className="mt-0.5 text-gray-400" />
                          <div>
                            <p className="text-xs font-bold uppercase text-gray-400">Ref Documents</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                PO: {log.purchase_request_ref || "N/A"}
                              </span>
                              <span className="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                Inv: {log.invoice_challan_no || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewMaterialReceived;