import { useState } from "react";
import {
  Archive,
  ShieldAlert,
  PlayCircle,
  Info,
  Clock,
  Database,
  CheckCircle2,
} from "lucide-react";
import Title from "../../../components/Title";
import ConfirmModal from "../../../components/ConfirmModal";
import { useAuth } from "../../../context/AuthContext";
import { useRunRetention } from "../audit_trail/hooks/useAuditTrail";

const AuditRetention = () => {
  const { canAccess } = useAuth();
  const canEdit = canAccess?.("audit", "trail", "edit");

  const [confirm, setConfirm] = useState(false);
  const [retentionDays, setRetentionDays] = useState("");
  const [lastRun, setLastRun] = useState(null);

  const runRetention = useRunRetention({
    onSuccess: (data) => setLastRun({ at: new Date(), data }),
  });

  if (canEdit === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <ShieldAlert size={36} className="text-amber-500 mb-3" />
        <p className="text-sm font-semibold">You don't have permission to manage audit retention.</p>
        <p className="text-xs mt-1">Requires <code className="font-mono">audit.trail.edit</code>.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-slate-50 dark:bg-overall_bg-dark">
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
        <Title title="Settings" sub_title="Audit Retention" page_title="Audit Retention" />
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          Rows older than the retention window are moved to archive collections automatically every night.
        </p>
      </div>

      <div className="px-4 sm:px-6 pb-6 space-y-4 max-w-3xl">
        {/* Info card */}
        <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Info size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Automatic archival
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Rows older than <span className="font-semibold">AUDIT_RETENTION_DAYS</span> (default 90) are auto-archived every night at 03:30 server time. Archived rows remain queryable via the MongoDB <code className="font-mono">_archive</code> collections but don't appear in the audit trail API.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Schedule</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Daily · 03:30</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Database size={14} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">App store</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">app_audit_logs</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Database size={14} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Finance store</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">finance_audit_logs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual trigger */}
        <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
              <Archive size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Run archive now</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Trigger an immediate archive pass. Optionally override the retention window for this run only; leave blank to use the server default.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Retention days (optional)
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 90"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 w-32"
              />
            </div>
            <button
              onClick={() => setConfirm(true)}
              disabled={runRetention.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <PlayCircle size={13} />
              {runRetention.isPending ? "Archiving…" : "Run Archive Now"}
            </button>
          </div>

          {lastRun && (
            <div className="mt-4 flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-emerald-800 dark:text-emerald-200">
                <p className="font-semibold">
                  Last run at {lastRun.at.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-[11px] mt-0.5 opacity-80">
                  App: {lastRun.data?.app?.archived ?? lastRun.data?.app?.count ?? 0} rows ·
                  {" "}Finance: {lastRun.data?.finance?.archived ?? lastRun.data?.finance?.count ?? 0} rows
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          title="Run archive now?"
          message={
            retentionDays
              ? `Rows older than ${retentionDays} days will be moved to the archive collections. This can take a few minutes on large datasets.`
              : `Rows older than the default retention window will be moved to the archive collections. This can take a few minutes on large datasets.`
          }
          confirmText="Run"
          onClose={() => setConfirm(false)}
          onConfirm={() => runRetention.mutateAsync(retentionDays || undefined)}
        />
      )}
    </div>
  );
};

export default AuditRetention;
