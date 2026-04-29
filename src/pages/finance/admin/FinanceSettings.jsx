import { useState, useEffect } from "react";
import { Settings, RefreshCw, Save, AlertCircle } from "lucide-react";
import { useFinanceSettings, useUpdateFinanceSetting } from "../shared/hooks/useFinanceSettings";
import { useFinanceMetrics } from "../shared/hooks/useFinanceMetrics";

/* Known settings keys and input hints, per guide §36. */
const KEY_META = {
  "approval.purchasebill.threshold": {
    label: "Purchase Bill approval threshold",
    hint: "Bills ≥ this ₹ amount require approval",
    type: "number",
  },
  "approval.paymentvoucher.threshold": {
    label: "Payment Voucher approval threshold",
    hint: "PVs ≥ this ₹ amount require approval",
    type: "number",
  },
  "finance.default_fin_year": {
    label: "Default Financial Year",
    hint: "Format: 25-26",
    type: "text",
    placeholder: "25-26",
  },
  "tds.default_section": {
    label: "Default TDS section",
    hint: "Used when a bill has no explicit section",
    type: "text",
    placeholder: "194C",
  },
  "bulk.max_rows_per_import": {
    label: "Bulk import max rows",
    hint: "Hard cap per CSV upload",
    type: "number",
  },
};

/* ── Row ─────────────────────────────────────────────────────────────── */
const SettingRow = ({ setting }) => {
  const meta = KEY_META[setting.key] || { label: setting.key, hint: "", type: "text" };
  const [value, setValue] = useState(setting.value ?? "");
  const [touched, setTouched] = useState(false);
  const update = useUpdateFinanceSetting({ onSuccess: () => setTouched(false) });

  useEffect(() => {
    setValue(setting.value ?? "");
  }, [setting.value]);

  const save = () => {
    const parsed = meta.type === "number" ? Number(value) : value;
    update.mutate({ key: setting.key, value: parsed });
  };

  return (
    <div className="flex items-start gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{meta.label}</p>
        <code className="text-[10px] font-mono text-gray-400">{setting.key}</code>
        {meta.hint && <p className="text-[11px] text-gray-500 mt-0.5">{meta.hint}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type={meta.type}
          value={value}
          onChange={(e) => { setValue(e.target.value); setTouched(true); }}
          placeholder={meta.placeholder}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-40"
        />
        <button
          onClick={save}
          disabled={!touched || update.isPending}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg"
        >
          <Save size={11} />
          {update.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

/* ── Metrics strip ───────────────────────────────────────────────────── */
const MetricsStrip = () => {
  const { data: metrics = {}, refetch } = useFinanceMetrics();
  const entries = Object.entries(metrics);
  if (entries.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Live finance counters</p>
        <button onClick={() => refetch()} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <RefreshCw size={13} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {entries.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 p-3">
            <p className="text-[10px] text-gray-400 font-mono truncate" title={k}>{k}</p>
            <p className="text-xl font-extrabold text-gray-800 dark:text-white tabular-nums mt-0.5">
              {typeof v === "number" ? v.toLocaleString("en-IN") : String(v)}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
        <AlertCircle size={10} />
        Counters are in-memory — they reset when the server restarts.
      </p>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────────────── */
const FinanceSettings = () => {
  const { data: settings = [], isLoading, refetch } = useFinanceSettings();
  const rows = Array.isArray(settings) ? settings : [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={18} className="text-slate-600 dark:text-slate-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Admin</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Finance Settings</h1>
          </div>
        </div>
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Key / Value Settings</p>
          </div>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No settings configured yet.</div>
          ) : (
            rows.map((s) => <SettingRow key={s.key} setting={s} />)
          )}
        </div>

        <MetricsStrip />
      </div>
    </div>
  );
};

export default FinanceSettings;
