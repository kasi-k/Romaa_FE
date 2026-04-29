import React from "react";
import { Fuel, MapPin, RefreshCw, History, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { useManualSync } from "./hooks/useFuelTelemetry";

const formatIST = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " IST";
  } catch {
    return iso;
  }
};

const relativeTime = (iso) => {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return null;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  return `${day} day${day > 1 ? "s" : ""} ago`;
};

const STALE_MS = 12 * 60 * 60 * 1000;

const FuelWidget = ({ asset, onRefreshed, onViewHistory }) => {
  const { canAccess } = useAuth();
  const canEdit = canAccess("asset", "fuel_telemetry", "edit");
  const { mutate: sync, isPending } = useManualSync({
    onDone: () => onRefreshed && onRefreshed(),
  });

  const summary = asset?.fuelTelemetry || {};
  const {
    lastSyncAt,
    lastFuelReading,
    lastTankCapacity,
    lastFuelPercent,
    lastStatus,
    lastIgnition,
    lastLocation,
    lastReadingAt,
    lastError,
  } = summary;

  const isStale =
    lastSyncAt && Date.now() - new Date(lastSyncAt).getTime() > STALE_MS;

  const hasData = !!lastSyncAt;

  const pct = Math.max(0, Math.min(100, Number(lastFuelPercent) || 0));

  const handleRefresh = () => {
    if (!asset?._id) return;
    sync(asset._id);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Fuel size={18} className="text-blue-500" />
          Fuel
          {lastError && (
            <span
              title={lastError}
              className="inline-flex w-2 h-2 rounded-full bg-red-500 animate-pulse"
            />
          )}
          {isStale && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Stale
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onViewHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          >
            <History size={14} />
            View history
          </button>
          {canEdit && (
            <button
              onClick={handleRefresh}
              disabled={isPending || !asset?._id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition"
            >
              <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
              {isPending ? "Refreshing..." : "Refresh now"}
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <Fuel className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Telemetry not yet synced. Try again in a few minutes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex items-end justify-between gap-3 mb-1.5">
              <div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pct.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {lastFuelReading ?? "-"} / {lastTankCapacity ?? "-"} ltr
                </span>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  pct < 20
                    ? "bg-red-500"
                    : pct < 40
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                {lastStatus || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Ignition</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                {lastIgnition || "--"}
              </p>
            </div>
          </div>

          {lastLocation && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <span className="truncate">{lastLocation}</span>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> Reading: {formatIST(lastReadingAt)}
            </span>
            <span>Last synced: {relativeTime(lastSyncAt) || "-"}</span>
          </div>

          {lastError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                  Sync warning
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                  {lastError}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FuelWidget;
