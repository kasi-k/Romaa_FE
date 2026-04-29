import { Layers, TrendingUp, ShieldCheck, Wallet, BarChart2, Receipt } from "lucide-react";
import { TYPE_META } from "./constants";

const ICONS = {
  Asset:     <Wallet size={16} />,
  Liability: <Receipt size={16} />,
  Equity:    <ShieldCheck size={16} />,
  Income:    <TrendingUp size={16} />,
  Expense:   <BarChart2 size={16} />,
};

const Card = ({ label, value, sub, meta, icon }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg} ${meta.border}`}>
      <span className={meta.text}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
      <p className="text-xl font-extrabold text-gray-900 dark:text-white tabular-nums leading-tight mt-0.5">
        {value}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>
    </div>
  </div>
);

const SummaryCards = ({ accounts }) => {
  const byType = Object.fromEntries(
    ["Asset", "Liability", "Equity", "Income", "Expense"].map(t => [
      t,
      accounts.filter(a => a.account_type === t).length,
    ])
  );

  const totalMeta = {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-100 dark:border-indigo-800",
    text: "text-indigo-600 dark:text-indigo-400",
    dot: "bg-indigo-500",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <Card
        label="Total Accounts"
        value={accounts.length}
        sub={`${accounts.filter(a => a.is_active).length} active`}
        meta={totalMeta}
        icon={<Layers size={16} />}
      />
      {["Asset", "Liability", "Equity", "Income", "Expense"].map(t => (
        <Card
          key={t}
          label={t}
          value={byType[t] ?? 0}
          sub={`${accounts.filter(a => a.account_type === t && a.is_group).length} groups`}
          meta={TYPE_META[t]}
          icon={ICONS[t]}
        />
      ))}
    </div>
  );
};

export default SummaryCards;
