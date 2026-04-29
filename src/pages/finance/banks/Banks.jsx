import { useState, useMemo } from "react";
import {
  Landmark, RefreshCw, Plus, Database,
  LayoutList, GitBranch, Loader2, Info,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAccounts, useAccountTree, useSeedCOA } from "./hooks/useAccountTree";
import SummaryCards     from "./components/SummaryCards";
import FilterBar        from "./components/FilterBar";
import AccountsTable    from "./components/AccountsTable";
import AccountTreeView  from "./components/AccountTreeView";
import AccountFormModal from "./components/AccountFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

/* ── View toggle button ──────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
const ViewBtn = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      active
        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    }`}
  >
    <Icon size={13} /> {label}
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const Banks = () => {
  const [view, setView]                 = useState("tree");
  const [search, setSearch]             = useState("");
  const [filterType, setFilterType]     = useState("");
  const [filterBankCash, setFilterBankCash] = useState(false);
  const [showCreate, setShowCreate]     = useState(false);
  const [editAccount, setEditAccount]   = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  /* ── Data ── */
  const listParams = useMemo(() => {
    const p = {
      page: currentPage,
      limit: 10,
      search: debouncedSearch,
    };
    if (filterType)     p.account_type = filterType;
    if (filterBankCash) p.is_bank_cash = true;
    return p;
  }, [currentPage, debouncedSearch, filterType, filterBankCash]);

  const { data: rawAccounts, isLoading, isFetching, refetch } = useAccounts(listParams);
  const accounts = rawAccounts?.data || [];
  const totalPages = rawAccounts?.pagination?.totalPages || 1;
  const { data: treeData = [], isLoading: treeLoading }       = useAccountTree();
  const seedMutation = useSeedCOA();

  /* ── No client-side search needed — server handles it ── */
  const filtered = useMemo(() => accounts, [accounts]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-[#0b0f19]">

      {/* ════════════════════ HEADER ════════════════════ */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
              <Landmark size={17} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                Chart of Accounts
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Finance · Account Tree (COA)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* View switch */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
              <ViewBtn active={view === "list"} onClick={() => setView("list")} icon={LayoutList} label="List" />
              <ViewBtn active={view === "tree"} onClick={() => setView("tree")} icon={GitBranch}  label="Tree" />
            </div>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            </button>

            {/* Seed COA */}
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {seedMutation.isPending
                ? <Loader2 size={13} className="animate-spin" />
                : <Database size={13} />}
              Seed COA
            </button>

            {/* Add account */}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-colors"
            >
              <Plus size={14} /> Add Account
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════ BODY ════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-24">

        {/* Summary cards */}
        <SummaryCards accounts={accounts} />

        {/* Filters (list view only) */}
        {view === "list" && (
          <FilterBar
            search={search}
            onSearch={setSearch}
            filterType={filterType}
            onFilterType={setFilterType}
            filterBankCash={filterBankCash}
            onFilterBankCash={setFilterBankCash}
          />
        )}

        {/* Content */}
        {view === "list" ? (
          <>
            <AccountsTable
              accounts={accounts}
              filtered={filtered}
              isLoading={isLoading}
              onEdit={setEditAccount}
              onDelete={setDeleteAccount}
              onSeed={() => seedMutation.mutate()}
              isSeedPending={seedMutation.isPending}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-gray-500">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 flex items-center gap-1"
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 flex items-center gap-1"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <AccountTreeView
            treeData={treeData}
            isLoading={treeLoading}
            onEdit={setEditAccount}
            onDelete={setDeleteAccount}
          />
        )}

        {/* Accounting note */}
        <div className="mt-5 flex items-start gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>
            <strong className="text-sky-500">Dr</strong> = Debit normal balance (Assets, Expenses).{" "}
            <strong className="text-rose-500">Cr</strong> = Credit normal balance (Liabilities, Equity, Income).{" "}
            <strong className="text-gray-500 dark:text-gray-400">System accounts</strong> cannot be deleted or have their code / type modified.
          </span>
        </div>
      </div>

      {/* ════════════════════ MODALS ════════════════════ */}
      {showCreate && (
        <AccountFormModal
          onClose={() => setShowCreate(false)}
          allAccounts={accounts}
        />
      )}
      {editAccount && (
        <AccountFormModal
          onClose={() => setEditAccount(null)}
          editData={editAccount}
          allAccounts={accounts}
        />
      )}
      {deleteAccount && (
        <DeleteConfirmModal
          account={deleteAccount}
          onClose={() => setDeleteAccount(null)}
        />
      )}
    </div>
  );
};

export default Banks;
