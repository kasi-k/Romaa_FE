import { useState } from "react";
import { ChevronRight, ChevronDown, Pencil, Trash2, GitBranch } from "lucide-react";
import { EmptyState } from "./shared";
import Loader from "../../../../components/Loader";

/* ── Type → colour map (matches the legend) ──────────────────────────────── */
const TYPE_META = {
  Asset:     { dot: "bg-sky-500" },
  Liability: { dot: "bg-rose-500" },
  Equity:    { dot: "bg-violet-500" },
  Income:    { dot: "bg-emerald-500" },
  Expense:   { dot: "bg-amber-500" },
};

/* ── Single tree node ────────────────────────────────────────────────────── */
const TreeNode = ({ node, depth, onEdit, onDelete }) => {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const meta = TYPE_META[node.account_type] || {};

  return (
    <div className="relative">
      {/* Vertical connector line */}
      {depth > 0 && (
        <span
          className="absolute left-0 top-0 bottom-0 border-l border-dashed border-gray-200 dark:border-gray-700"
          style={{ left: `${(depth - 1) * 24 + 12}px` }}
        />
      )}

      <div
        className="group flex items-center gap-2 py-2 pr-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-default"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Horizontal connector */}
        {depth > 0 && (
          <span
            className="absolute border-t border-dashed border-gray-200 dark:border-gray-700 w-4"
            style={{ left: `${(depth - 1) * 24 + 12}px` }}
          />
        )}

        {/* Expand / leaf indicator */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-5 h-5 flex items-center justify-center shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
        >
          {hasChildren ? (
            open ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          )}
        </button>

        {/* Type color strip */}
        {node.account_type && (
          <span className={`w-1 h-5 rounded-full shrink-0 ${meta.dot || "bg-gray-300"}`} />
        )}

        {/* Code */}
        <code className="text-[11px] font-mono text-gray-400 dark:text-gray-500 w-28 shrink-0 truncate z-10">
          {node.account_code}
        </code>

        {/* Name */}
        <span className={`flex-1 text-sm leading-snug z-10 truncate ${
          node.is_group
            ? "font-bold text-gray-700 dark:text-gray-200"
            : "font-medium text-gray-600 dark:text-gray-400"
        }`}>
          {node.account_name}
        </span>

        {/* Inline chips */}
        <div className="flex items-center gap-1 z-10">
          {node.is_group && (
            <span className="hidden sm:block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              GROUP
            </span>
          )}
          {node.is_bank_cash && (
            <span className="hidden sm:block text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
              BANK
            </span>
          )}
          {node.normal_balance && (
            <span className={`hidden sm:block text-[9px] font-bold px-1.5 py-0.5 rounded ${
              node.normal_balance === "Dr"
                ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400"
                : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
            }`}>
              {node.normal_balance}
            </span>
          )}
        </div>

        {/* Actions */}
        {!node.is_system && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shrink-0">
            <button
              onClick={() => onEdit(node)}
              className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => onDelete(node)}
              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {open && hasChildren && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.account_code}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              isLast={idx === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Tree View Container ─────────────────────────────────────────────────── */
const AccountTreeView = ({ treeData, isLoading, onEdit, onDelete }) => {
  if (isLoading) return <Loader />;

  if (!treeData || treeData.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No account hierarchy found"
        sub="Create accounts or seed the COA to see the tree"
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Table header row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
        <span className="w-5 shrink-0" />
        <span className="w-1 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 w-28 shrink-0">Code</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-1">Account Name</span>
        <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Flags / Balance</span>
      </div>

      <div className="p-3 space-y-0.5">
        {treeData.map((root, idx) => (
          <TreeNode
            key={root.account_code}
            node={root}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
            isLast={idx === treeData.length - 1}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-800 flex flex-wrap items-center gap-4 text-[10px] text-gray-400 bg-gray-50/40 dark:bg-gray-800/20">
        <span className="font-bold text-gray-500 dark:text-gray-400">Legend:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Asset</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Liability</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Equity</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Expense</span>
        <span className="ml-auto">Hover a row to edit / delete</span>
      </div>
    </div>
  );
};

export default AccountTreeView;
