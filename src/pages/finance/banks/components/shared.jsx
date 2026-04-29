import { TYPE_META } from "./constants";

export const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition";

export const selectCls = inputCls;

/* ── Type badge ──────────────────────────────────────────────────────────── */
export const TypeBadge = ({ type }) => {
  const m = TYPE_META[type];
  if (!m) return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {type}
    </span>
  );
};

/* ── Normal balance pill ─────────────────────────────────────────────────── */
export const BalancePill = ({ side }) =>
  side === "Dr" ? (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800">
      Dr
    </span>
  ) : (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800">
      Cr
    </span>
  );

/* ── Flag chip ───────────────────────────────────────────────────────────── */
export const FlagChip = ({ label, color = "gray" }) => {
  const colors = {
    gray:   "bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400",
    blue:   "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400",
    purple: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    slate:  "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
  };
  return (
    <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${colors[color]}`}>
      {label}
    </span>
  );
};

/* ── Field wrapper ───────────────────────────────────────────────────────── */
export const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500">{hint}</p>}
  </div>
);

/* ── Toggle switch ───────────────────────────────────────────────────────── */
export const Toggle = ({ label, desc, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <div className="relative mt-0.5 shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-indigo-500 transition-colors" />
      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">{label}</p>
      {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
    </div>
  </label>
);

/* ── Empty state ─────────────────────────────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, sub, action }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <Icon size={28} className="text-gray-300 dark:text-gray-600" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    {action}
  </div>
);

/* ── Spinner ─────────────────────────────────────────────────────────────── */
export const Spinner = ({ size = 32, label = "Loading…" }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
    <span
      style={{ width: size, height: size }}
      className="block border-[3px] border-gray-200 dark:border-gray-700 border-t-indigo-500 rounded-full animate-spin"
    />
    <p className="text-xs font-medium">{label}</p>
  </div>
);
