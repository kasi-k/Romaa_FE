import React, { useEffect, useState, useMemo } from "react";
import {  useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "../../../constant";
import SearchableSelect from "../../../components/SearchableSelect";
import { 
  ArrowLeft, 
  CalendarDays, 
  User, 
  Box, 
  TrendingUp,
  Clock,
  ArrowUpRight, // Icon for Outward/Issue
  MapPin,
  Briefcase,
  Search,
  Filter,
  X,
  AlertCircle
} from "lucide-react";

const ViewMaterialIssue = () => {
  const location = useLocation();
  // Handle case where state might be null (direct link access)
  const { tenderId, itemId } = location.state || {}; 
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [searchText, setSearchText] = useState("");
  const [dateFilterType, setDateFilterType] = useState("all"); 
  const [dateValue, setDateValue] = useState("");

  // --- Fetch History ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (!tenderId || !itemId) return;
      try {
        const res = await axios.get(`${API}/material/getMaterialOutwardHistory/${tenderId}/${itemId}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching outward history:", err);
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
      // 1. Text Search (Issued To, Location, Work Description)
      const searchLower = searchText.toLowerCase();
      const matchesText = 
        (log.issued_to || "").toLowerCase().includes(searchLower) ||
        (log.site_location || "").toLowerCase().includes(searchLower) ||
        (log.work_description || "").toLowerCase().includes(searchLower);

      if (!matchesText) return false;

      // 2. Date Filtering
      if (dateFilterType === "all" || !dateValue) return true;

      const logDate = new Date(log.date);
      
      if (dateFilterType === "date") {
        return logDate.toISOString().split("T")[0] === dateValue;
      }
      if (dateFilterType === "month") {
        return logDate.toISOString().slice(0, 7) === dateValue;
      }
      if (dateFilterType === "week") {
        const d = new Date(Date.UTC(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}` === dateValue;
      }
      if (dateFilterType === "year") {
        return logDate.getFullYear().toString() === dateValue;
      }

      return true;
    });
  }, [data, searchText, dateFilterType, dateValue]);

  // --- Helper for Priority Badge ---
  const PriorityBadge = ({ level }) => {
    const isUrgent = level === "Urgent";
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
        isUrgent 
          ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900" 
          : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900"
      }`}>
        {isUrgent && <AlertCircle size={10} />}
        {level || "Normal"}
      </span>
    );
  };

  // --- Render Loading / Error ---
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0b0f19]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading Issue History...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#0b0f19] text-gray-500">
      <Box size={48} className="mb-2 opacity-20" />
      <p>Material not found.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-orange-600 hover:underline">Go Back</button>
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
              Outward Material Ledger (Issue Log)
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
              {/*  */}
              <div className="relative h-24 bg-gradient-to-br from-orange-500 to-amber-600">
                <div className="absolute -bottom-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md text-orange-600 dark:bg-gray-900 dark:text-orange-400">
                  <ArrowUpRight size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className="px-6 pt-8 pb-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data.item_name}</h2>
                  <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20 mt-2">
                    Unit: {data.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Issued</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {data.total_issued?.toLocaleString()}
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
            <div className="rounded-xl bg-orange-50 p-4 text-sm text-orange-900 dark:bg-orange-900/20 dark:text-orange-200 border border-orange-100 dark:border-orange-800/50">
              <div className="flex gap-3">
                <TrendingUp size={20} className="shrink-0 text-orange-600 dark:text-orange-400" />
                <p>
                  This timeline tracks usage. High issuance frequency might indicate theft or high consumption. Monitor carefully.
                </p>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Timeline Feed --- */}
          <div className="lg:col-span-2">
            
            {/* --- Filter Bar --- */}
            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search Site, Location, Purpose..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                  {searchText && (
                    <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
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
                      className="w-40 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* --- Timeline Header --- */}
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-2"><Clock size={16} /> Issued History</span>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {filteredHistory.length}
              </span>
            </h3>

            {/* --- Timeline List --- */}
            <div className="relative space-y-8 pl-4 before:absolute before:left-[19px] before:top-2 before:h-full before:w-[2px] before:bg-gray-200 dark:before:bg-gray-800">
              {filteredHistory.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                  <Filter size={32} className="mb-2 opacity-50" />
                  <p>No issued items match your filters.</p>
                  <button 
                    onClick={() => { setSearchText(""); setDateFilterType("all"); }}
                    className="mt-2 text-sm text-orange-600 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredHistory.map((log, index) => (
                  <div key={log._id || index} className="relative pl-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Timeline Dot (Orange for Outward) */}
                    <div className="absolute left-[10px] top-2 h-5 w-5 rounded-full border-4 border-white bg-orange-500 shadow-sm dark:border-[#0b0f19] dark:bg-orange-600"></div>

                    {/* Content Card */}
                    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-700">
                      
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
                              Issued by: <span className="font-medium text-gray-700 dark:text-gray-300">{log.issued_by || "Admin"}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="block text-2xl font-bold text-orange-600 dark:text-orange-400">
                            -{log.quantity?.toLocaleString()}
                            <span className="ml-1 text-sm font-medium text-gray-400">{data.unit}</span>
                          </span>
                          <PriorityBadge level={log.priority_level} />
                        </div>
                      </div>

                      {/* Card Body: Details Grid */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Issued To Info */}
                        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                          <User size={18} className="mt-0.5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase text-gray-400">Issued To</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1" title={log.issued_to}>
                              {log.issued_to || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Location Info */}
                        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                          <MapPin size={18} className="mt-0.5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase text-gray-400">Location</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                              {log.site_location || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Purpose Info (Full Width) */}
                        <div className="sm:col-span-2 flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                          <Briefcase size={18} className="mt-0.5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase text-gray-400">Purpose / Work Desc</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {log.work_description || "N/A"}
                            </p>
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

export default ViewMaterialIssue;