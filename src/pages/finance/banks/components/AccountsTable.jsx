import { Pencil, Trash2, Database, Landmark } from "lucide-react";
import { TypeBadge, BalancePill, FlagChip, EmptyState, fmt } from "./shared";
import Loader from "../../../../components/Loader";

const TH = ({ children }) => (
  <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
    {children}
  </th>
);

const AccountsTable = ({ accounts, filtered, isLoading, onEdit, onDelete, onSeed, isSeedPending }) => {
   if (isLoading) return <Loader />;

  if (filtered.length === 0) {
    if (accounts.length === 0) {
      return (
        <EmptyState
          icon={Landmark}
          title="No accounts yet"
          sub="Seed the default Chart of Accounts to get started"
          action={
            <button
              onClick={onSeed}
              disabled={isSeedPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60"
            >
              <Database size={15} />
              Seed Default COA
            </button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={Landmark}
        title="No accounts match your filters"
        sub="Try adjusting the search or filter criteria"
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <TH>#</TH>
              <TH>Code</TH>
              <TH>Account Name</TH>
              <TH>Type</TH>
              <TH>Subtype</TH>
              <TH>Normal Bal.</TH>
              <TH>Opening Bal.</TH>
              <TH>Flags</TH>
              <TH>Status</TH>
              <TH />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((a, i) => (
              <tr
                key={a._id}
                className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
              >
                {/* # */}
                <td className="px-4 py-3.5 text-xs text-gray-300 dark:text-gray-600 font-mono w-8">
                  {i + 1}
                </td>

                {/* Code */}
                <td className="px-4 py-3.5">
                  <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                    {a.account_code}
                  </code>
                </td>

                {/* Name */}
                <td className="px-4 py-3.5 min-w-[200px]">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                    {a.account_name}
                  </p>
                  {a.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs truncate">{a.description}</p>
                  )}
                </td>

                {/* Type */}
                <td className="px-4 py-3.5">
                  <TypeBadge type={a.account_type} />
                </td>

                {/* Subtype */}
                <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {a.account_subtype || <span className="text-gray-300 dark:text-gray-600">—</span>}
                </td>

                {/* Normal balance */}
                <td className="px-4 py-3.5">
                  {a.normal_balance ? <BalancePill side={a.normal_balance} /> : "—"}
                </td>

                {/* Opening balance */}
                <td className="px-4 py-3.5 tabular-nums text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {a.opening_balance != null && a.opening_balance !== 0
                    ? <span>₹{fmt(a.opening_balance)} <span className="text-gray-400">{a.opening_balance_type}</span></span>
                    : <span className="text-gray-300 dark:text-gray-600">—</span>}
                </td>

                {/* Flags */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    {a.is_group        && <FlagChip label="GROUP"  color="slate" />}
                    {a.is_bank_cash    && <FlagChip label="BANK"   color="blue" />}
                    {a.is_system       && <FlagChip label="SYSTEM" color="gray" />}
                    {a.is_personal     && <FlagChip label="PRSNL"  color="purple" />}
                    {!a.is_group && !a.is_bank_cash && !a.is_system && !a.is_personal && (
                      <span className="text-gray-300 dark:text-gray-600 text-[10px]">—</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  {a.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(a)}
                      className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    {!a.is_system && (
                      <button
                        onClick={() => onDelete(a)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 bg-gray-50/40 dark:bg-gray-800/20">
        <span>
          Showing{" "}
          <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong>{" "}
          of{" "}
          <strong className="text-gray-600 dark:text-gray-300">{accounts.length}</strong>{" "}
          accounts
        </span>
        <span>
          {accounts.filter(a => a.is_bank_cash).length} bank/cash ·{" "}
          {accounts.filter(a => a.is_group).length} groups ·{" "}
          {accounts.filter(a => a.is_system).length} system
        </span>
      </div>
    </div>
  );
};

export default AccountsTable;
