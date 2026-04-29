import { ACTION_CHIP } from "./auditShared";

const ActionChip = ({ action }) => {
  const m = ACTION_CHIP[action] || {
    label: action,
    cls: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.cls}`}>
      {m.label}
    </span>
  );
};

export default ActionChip;
