/* Shared constants + formatters used by admin trail, entity timeline, and my-activity.
   JSX components live alongside in ActionChip.jsx to keep Vite fast-refresh happy. */

export const ACTION_OPTIONS = ["create", "update", "delete", "approve", "reject"];

// §7 — action chip colours, consistent everywhere.
export const ACTION_CHIP = {
  create:  { label: "Created",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
  update:  { label: "Updated",  cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" },
  delete:  { label: "Deleted",  cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },
  approve: { label: "Approved", cls: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  reject:  { label: "Rejected", cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },
};

export const fmtRelative = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return d.toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtAbsolute = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", timeZone: "UTC",
      }) + " UTC"
    : "—";

export const displayActor = (row) => {
  if (!row) return "—";
  if (row.actor_name) return row.actor_name;
  if (!row.actor_id) return "(system)";
  return `Employee ${String(row.actor_id).slice(-6)}`;
};
