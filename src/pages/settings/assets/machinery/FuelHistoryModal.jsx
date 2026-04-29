import React, { useState, useMemo } from "react";
import {
  X, Fuel, TrendingUp, TrendingDown, MapPin, Filter,
  ChevronDown, ChevronRight, Clock, Hash, Truck,
  Radio, Database, Building2, Calendar
} from "lucide-react";
import Loader from "../../../../components/Loader";
import { useFuelHistory } from "./hooks/useFuelTelemetry";

const formatIST = (iso, withSeconds = false) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" } : {}),
      hour12: true,
    });
  } catch {
    return iso;
  }
};

const formatNumber = (n, digits = 2) =>
  n == null || Number.isNaN(Number(n)) ? "-" : Number(n).toFixed(digits);

const EVENT_OPTIONS = [
  { value: "", label: "All events" },
  { value: "NORMAL", label: "Normal" },
  { value: "REFUEL", label: "Refuels" },
  { value: "DRAIN", label: "Drains" },
];

const eventBadge = (eventType) => {
  if (eventType === "REFUEL") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <TrendingUp size={11} /> Refuel
      </span>
    );
  }
  if (eventType === "DRAIN") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
        <TrendingDown size={11} /> Drain
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      Normal
    </span>
  );
};

const sourceBadge = (source) => {
  const tone =
    source === "CRON"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      : source === "MANUAL"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
      : source === "WEBHOOK"
      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${tone}`}>
      {source || "-"}
    </span>
  );
};

const MetaPill = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded text-xs">
      <Icon size={12} className="text-slate-400" />
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="font-semibold text-slate-700 dark:text-slate-200">{value || "-"}</span>
    </div>
  );
};

const DetailRow = ({ label, value, mono }) => (
  <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
    <span className={`text-xs text-slate-700 dark:text-slate-200 break-words ${mono ? "font-mono" : ""}`}>
      {value ?? "-"}
    </span>
  </div>
);

const FuelHistoryModal = ({ asset, onClose }) => {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    eventType: "",
    limit: 200,
  });
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading, isFetching } = useFuelHistory(asset?._id, filters);

  const rows = useMemo(() => data?.data || [], [data]);
  const count = data?.count ?? rows.length;

  // Pull meta from the most recent row, fallback to asset
  const meta = rows[0] || {};
  const plateNumber = meta.plateNumber || asset?.serialNumber || "-";
  const imei = meta.imei || asset?.gps?.deviceId || "-";
  const projectId = meta.projectId || asset?.projectId || "-";
  const externalProjectId = meta.externalProjectId || "-";
  const tankCapacity = meta.tankCapacity ?? asset?.fuelTankCapacity ?? "-";
  const unit = meta.unit || "ltr";

  const handleChange = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const toggleExpand = (id) =>
    setExpandedId((curr) => (curr === id ? null : id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[95vh] sm:max-h-[92vh] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Fuel className="text-blue-500 w-5 h-5" />
                Fuel Telemetry History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {asset?.assetName} · {asset?.assetId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Meta strip */}
          <div className="mt-3 flex flex-wrap gap-2">
            <MetaPill icon={Truck} label="Plate" value={plateNumber} />
            <MetaPill icon={Radio} label="IMEI" value={imei} />
            <MetaPill icon={Hash} label="Project" value={projectId} />
            <MetaPill icon={Database} label="Ext. Project" value={externalProjectId} />
            <MetaPill icon={Fuel} label="Tank" value={`${tankCapacity} ${unit}`} />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleChange("from", e.target.value)}
              className="block mt-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleChange("to", e.target.value)}
              className="block mt-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Event</label>
            <select
              value={filters.eventType}
              onChange={(e) => handleChange("eventType", e.target.value)}
              className="block mt-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            >
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Limit</label>
            <input
              type="number"
              min={1}
              max={500}
              value={filters.limit}
              onChange={(e) => handleChange("limit", Number(e.target.value) || 200)}
              className="block mt-1 w-20 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={12} /> {count} record{count === 1 ? "" : "s"}
            {isFetching && !isLoading && <span className="ml-2 animate-pulse">refreshing…</span>}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <Loader />
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400 italic">
              No telemetry rows for the selected filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wide sticky top-0 z-10">
                <tr>
                  <th className="p-3 w-8 border-b dark:border-slate-800"></th>
                  <th className="p-3 border-b dark:border-slate-800">Reading (IST)</th>
                  <th className="p-3 border-b dark:border-slate-800">Fuel %</th>
                  <th className="p-3 border-b dark:border-slate-800">Fuel (ltr)</th>
                  <th className="p-3 border-b dark:border-slate-800">Δ</th>
                  <th className="p-3 border-b dark:border-slate-800">Event</th>
                  <th className="p-3 border-b dark:border-slate-800">Source</th>
                  <th className="p-3 border-b dark:border-slate-800">Status</th>
                  <th className="p-3 border-b dark:border-slate-800">Ignition</th>
                  <th className="p-3 border-b dark:border-slate-800">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row) => {
                  const expanded = expandedId === row._id;
                  const rowBg =
                    row.eventType === "REFUEL"
                      ? "bg-emerald-50/40 dark:bg-emerald-900/10"
                      : row.eventType === "DRAIN"
                      ? "bg-red-50/40 dark:bg-red-900/10"
                      : "";
                  const delta = row.deltaFromPrev;
                  const fuelPct = row.fuelPercent;

                  return (
                    <React.Fragment key={row._id}>
                      <tr
                        onClick={() => toggleExpand(row._id)}
                        className={`${rowBg} cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors`}
                      >
                        <td className="p-3 text-slate-400">
                          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatIST(row.readingAt)}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                          {fuelPct != null ? `${formatNumber(fuelPct, 1)}%` : "-"}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-200">
                          {row.fuelReading ?? "-"}
                          <span className="text-[10px] text-slate-400 ml-1">{row.unit}</span>
                        </td>
                        <td
                          className={`p-3 font-medium whitespace-nowrap ${
                            delta == null
                              ? "text-slate-400"
                              : delta > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : delta < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-500"
                          }`}
                        >
                          {delta == null ? "-" : `${delta > 0 ? "+" : ""}${formatNumber(delta, 2)}`}
                        </td>
                        <td className="p-3">{eventBadge(row.eventType)}</td>
                        <td className="p-3">{sourceBadge(row.source)}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{row.status || "-"}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{row.ignition || "--"}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {row.location ? (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-blue-500 shrink-0" />
                              <span className="truncate">{row.location}</span>
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>

                      {expanded && (
                        <tr className={rowBg}>
                          <td colSpan={10} className="p-0">
                            <div className="px-6 py-4 bg-slate-50/60 dark:bg-slate-950/40 border-l-4 border-blue-500">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Clock size={12} /> Timing
                                  </h4>
                                  <DetailRow label="Reading at" value={formatIST(row.readingAt, true)} />
                                  <DetailRow label="Fetched at" value={formatIST(row.fetchedAt, true)} />
                                  <DetailRow label="Created at" value={formatIST(row.createdAt, true)} />

                                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mt-4 mb-2 flex items-center gap-1.5">
                                    <Truck size={12} /> Asset / Device
                                  </h4>
                                  <DetailRow label="Asset code" value={row.assetCode} />
                                  <DetailRow label="Plate number" value={row.plateNumber} mono />
                                  <DetailRow label="IMEI" value={row.imei} mono />
                                  <DetailRow label="Project ID" value={row.projectId} />
                                  <DetailRow label="External project ID" value={row.externalProjectId} mono />
                                </div>

                                <div>
                                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Fuel size={12} /> Reading
                                  </h4>
                                  <DetailRow label="Fuel reading" value={`${row.fuelReading ?? "-"} ${row.unit || ""}`} />
                                  <DetailRow label="Tank capacity" value={`${row.tankCapacity ?? "-"} ${row.unit || ""}`} />
                                  <DetailRow label="Fuel percent" value={row.fuelPercent != null ? `${formatNumber(row.fuelPercent, 2)} %` : "-"} />
                                  <DetailRow
                                    label="Δ from prev"
                                    value={row.deltaFromPrev == null ? "-" : `${row.deltaFromPrev > 0 ? "+" : ""}${formatNumber(row.deltaFromPrev, 2)} ${row.unit || ""}`}
                                  />
                                  <DetailRow label="Status" value={row.status} />
                                  <DetailRow label="Ignition" value={row.ignition} />

                                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mt-4 mb-2 flex items-center gap-1.5">
                                    <MapPin size={12} /> Location
                                  </h4>
                                  <DetailRow label="Address" value={row.location} />
                                  {(row.lat != null || row.lng != null) && (
                                    <DetailRow
                                      label="Lat / Lng"
                                      value={`${row.lat ?? "-"}, ${row.lng ?? "-"}`}
                                      mono
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Raw provider payload */}
                              {row.raw && Object.keys(row.raw).length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Building2 size={12} /> Raw provider payload
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-3">
                                    {Object.entries(row.raw).map(([k, v]) => (
                                      <DetailRow
                                        key={k}
                                        label={k}
                                        value={typeof v === "object" ? JSON.stringify(v) : String(v)}
                                        mono
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* IDs */}
                              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1">
                                  <Calendar size={10} /> _id: {row._id}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Hash size={10} /> assetId: {row.assetId}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400 hidden sm:block">Click any row to view full details and raw provider payload.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuelHistoryModal;
