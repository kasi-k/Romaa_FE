import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Play,
  Save,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  AlertTriangle,
  Users,
  UserCog,
  GitBranch,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Title from "../../../components/Title";
import Loader from "../../../components/Loader";
import DeleteModal from "../../../components/DeleteModal";
import BandEditorModal from "./BandEditorModal";
import SimulatorModal from "./SimulatorModal";
import {
  useApprovalRulesList,
  useSaveApprovalRule,
  useDeactivateApprovalRule,
} from "./hooks/useApprovalRules";

/* ------------------------------ Constants --------------------------------- */

// Source types — from the §4.1 left-pane list.
const MODULE_CATALOG = [
  { source_type: "LeaveRequest", module_label: "HR › Leave", amount_field: "days" },
  { source_type: "PurchaseRequest", module_label: "Purchase › Request", amount_field: "amount" },
  { source_type: "PurchaseOrder", module_label: "Purchase › Order", amount_field: "amount" },
  { source_type: "WorkOrder", module_label: "Projects › Work Order", amount_field: "amount" },
  { source_type: "PaymentVoucher", module_label: "Finance › Payment Voucher", amount_field: "amount" },
  { source_type: "WeeklyBilling", module_label: "Site › Weekly Billing", amount_field: "amount" },
  { source_type: "BankTransfer", module_label: "Finance › Bank Transfer", amount_field: "amount" },
  { source_type: "ClientBilling", module_label: "Finance › Client Billing", amount_field: "amount" },
  { source_type: "JournalEntry", module_label: "Finance › Journal Entry", amount_field: "amount" },
];

const STRATEGY_META = {
  USERS: {
    label: "Named approvers",
    icon: <Users size={11} />,
    cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  ROLE: {
    label: "Role-based",
    icon: <UserCog size={11} />,
    cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  REPORTS_TO: {
    label: "Reporting chain",
    icon: <GitBranch size={11} />,
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  DEPARTMENT_HEAD: {
    label: "Department head",
    icon: <Building2 size={11} />,
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
};

/* ------------------------------ Helpers ----------------------------------- */

const fmtAmount = (v, field) => {
  if (v == null) return "—";
  if (field === "days") return `${v}d`;
  if (field === "qty") return `${v}u`;
  return `₹${Number(v).toLocaleString("en-IN")}`;
};

const describeApprovers = (band) => {
  switch (band.approver_strategy) {
    case "USERS":
      return `${(band.approvers || []).length} employee(s)`;
    case "ROLE":
      return (band.roles || []).join(", ") || "—";
    case "REPORTS_TO":
      return `${band.levels || 1} level${band.levels > 1 ? "s" : ""}`;
    case "DEPARTMENT_HEAD":
      return "Initiator's department head";
    default:
      return "—";
  }
};

/* ------------------------------ Sub-components ---------------------------- */

const StrategyBadge = ({ strategy }) => {
  const meta = STRATEGY_META[strategy] || STRATEGY_META.ROLE;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.cls}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
};

const BandCard = ({ band, index, amountField, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-layout-dark rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {fmtAmount(band.min_amount, amountField)} – {fmtAmount(band.max_amount, amountField)}
          </p>
          {band.label && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{band.label}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          title="Edit band"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Remove band"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
    <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <StrategyBadge strategy={band.approver_strategy} />
        <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
          {describeApprovers(band)}
        </span>
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
          band.any_of
            ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        {band.any_of ? "Any-of" : "Serial"}
      </span>
    </div>
  </div>
);

/* ------------------------------ Main -------------------------------------- */

const ApprovalRules = () => {
  // Load every rule up-front (cheap — it's a small list).
  const { data: allRules = [], isLoading, isFetching, refetch } = useApprovalRulesList();

  // Left-pane selection (defaults to first catalog item).
  const [activeSourceType, setActiveSourceType] = useState(MODULE_CATALOG[0].source_type);

  // Editable local copy of the selected rule — dirty until saved.
  const [draft, setDraft] = useState(null);

  // Modal state
  const [bandEditor, setBandEditor] = useState({ open: false, band: null, index: -1 });
  const [showSimulator, setShowSimulator] = useState(false);
  const [bandToDelete, setBandToDelete] = useState(null);

  const saveRule = useSaveApprovalRule({
    onSuccess: () => refetch(),
  });
  const deactivateRule = useDeactivateApprovalRule({
    onSuccess: () => refetch(),
  });

  // Find the live rule for the selected module.
  const liveRule = useMemo(
    () => allRules.find((r) => r.source_type === activeSourceType) || null,
    [allRules, activeSourceType],
  );

  // Active module's metadata from catalog (for fallback when no rule exists yet)
  const activeModule = useMemo(
    () => MODULE_CATALOG.find((m) => m.source_type === activeSourceType),
    [activeSourceType],
  );

  // When the active module or live rule changes, reset the draft.
  useEffect(() => {
    if (liveRule) {
      setDraft({
        source_type: liveRule.source_type,
        module_label: liveRule.module_label || activeModule?.module_label || liveRule.source_type,
        amount_field: liveRule.amount_field || activeModule?.amount_field || "amount",
        is_active: liveRule.is_active !== false,
        thresholds: (liveRule.thresholds || []).map((t) => ({ ...t })),
      });
    } else {
      setDraft({
        source_type: activeSourceType,
        module_label: activeModule?.module_label || activeSourceType,
        amount_field: activeModule?.amount_field || "amount",
        is_active: true,
        thresholds: [],
      });
    }
  }, [liveRule, activeSourceType, activeModule]);

  const dirty = useMemo(() => {
    if (!draft) return false;
    if (!liveRule) return (draft.thresholds || []).length > 0;
    return JSON.stringify(liveRule.thresholds || []) !== JSON.stringify(draft.thresholds || [])
      || liveRule.is_active !== draft.is_active;
  }, [draft, liveRule]);

  /* ------------------------ Band operations ------------------------------- */

  const onAddBand = () => setBandEditor({ open: true, band: null, index: -1 });
  const onEditBand = (band, index) => setBandEditor({ open: true, band, index });
  const onRemoveBand = (band) => setBandToDelete(band);

  const saveBand = (band) => {
    setDraft((d) => {
      const next = [...(d.thresholds || [])];
      if (bandEditor.index >= 0) next[bandEditor.index] = band;
      else next.push(band);
      // Sort bands by min_amount so they're always displayed in order.
      next.sort((a, b) => Number(a.min_amount) - Number(b.min_amount));
      return { ...d, thresholds: next };
    });
    setBandEditor({ open: false, band: null, index: -1 });
  };

  const confirmDeleteBand = () => {
    setDraft((d) => ({
      ...d,
      thresholds: (d.thresholds || []).filter((t) => t !== bandToDelete),
    }));
    setBandToDelete(null);
  };

  /* ------------------------ Save / Toggle --------------------------------- */

  // Client-side overlap check — bands can have gaps but must not overlap.
  const overlapWarning = useMemo(() => {
    if (!draft?.thresholds) return "";
    const sorted = [...draft.thresholds].sort(
      (a, b) => Number(a.min_amount) - Number(b.min_amount),
    );
    for (let i = 1; i < sorted.length; i++) {
      if (Number(sorted[i].min_amount) < Number(sorted[i - 1].max_amount)) {
        return "Bands overlap — adjust the ranges before saving.";
      }
    }
    return "";
  }, [draft]);

  const handleSave = () => {
    if (!draft) return;
    if (overlapWarning) return;
    const payload = {
      source_type: draft.source_type,
      module_label: draft.module_label,
      amount_field: draft.amount_field,
      is_active: draft.is_active,
      thresholds: (draft.thresholds || []).map((t) => {
        const clean = {
          min_amount: Number(t.min_amount),
          max_amount: Number(t.max_amount),
          approver_strategy: t.approver_strategy,
          any_of: !!t.any_of,
          label: t.label || "",
        };
        if (t.approver_strategy === "USERS") clean.approvers = t.approvers || [];
        else if (t.approver_strategy === "ROLE") clean.roles = t.roles || [];
        else if (t.approver_strategy === "REPORTS_TO") clean.levels = Number(t.levels) || 1;
        return clean;
      }),
    };
    saveRule.mutate(payload);
  };

  const handleToggleActive = () => {
    if (!draft) return;
    if (draft.is_active) {
      // Deactivating an existing rule — use soft-delete endpoint.
      if (liveRule) deactivateRule.mutate(liveRule.source_type);
      else setDraft((d) => ({ ...d, is_active: false }));
    } else {
      setDraft((d) => ({ ...d, is_active: true }));
    }
  };

  /* ------------------------ Render ---------------------------------------- */

  if (isLoading && !draft) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader fullScreen={false} message="Loading approval rules…" />
      </div>
    );
  }

  const ruleCountBySource = allRules.reduce((acc, r) => {
    acc[r.source_type] = (r.thresholds || []).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-slate-50 dark:bg-overall_bg-dark">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
        <Title
          title="Settings"
          sub_title="Approval Rules"
          page_title="Approval Rules"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          Configure who approves what, per module. Add ordered amount bands and pick an approver strategy for each band.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 px-4 sm:px-6 pb-6 min-h-0">
        {/* Left pane — module picker */}
        <aside className="bg-white dark:bg-layout-dark rounded-xl border border-gray-200 dark:border-gray-800 p-2 h-fit lg:sticky lg:top-4">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Modules
            </p>
            <button
              onClick={() => refetch()}
              title="Refresh"
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
            >
              <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
          <nav className="space-y-0.5 max-h-[70vh] overflow-y-auto">
            {MODULE_CATALOG.map((m) => {
              const active = m.source_type === activeSourceType;
              const bandCount = ruleCountBySource[m.source_type] || 0;
              const rule = allRules.find((r) => r.source_type === m.source_type);
              const isActive = rule ? rule.is_active !== false : false;
              return (
                <button
                  key={m.source_type}
                  onClick={() => setActiveSourceType(m.source_type)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${active ? "" : "text-gray-800 dark:text-gray-100"}`}>
                      {m.source_type}
                    </p>
                    <p className={`text-[10px] truncate ${active ? "text-white/80" : "text-gray-400"}`}>
                      {m.module_label}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {rule && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-400" : "bg-gray-400"
                        }`}
                        title={isActive ? "Active" : "Inactive"}
                      />
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}
                    >
                      {bandCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right pane — rule editor */}
        <section className="bg-white dark:bg-layout-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
          {/* Rule header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                  {draft?.source_type}
                </h2>
                <p className="text-[11px] text-gray-500 truncate">
                  {draft?.module_label}
                  {" · "}
                  Amount field: <span className="font-semibold">{draft?.amount_field}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  draft?.is_active
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {draft?.is_active ? <CheckCircle2 size={11} /> : <Power size={11} />}
                {draft?.is_active ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => setShowSimulator(true)}
                disabled={(draft?.thresholds || []).length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 disabled:opacity-50 text-xs font-semibold text-gray-700 dark:text-gray-200 rounded-lg"
              >
                <Play size={12} /> Simulate
              </button>
              <button
                onClick={handleToggleActive}
                disabled={deactivateRule.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300 disabled:opacity-50 text-xs font-semibold text-gray-700 dark:text-gray-200 rounded-lg"
              >
                <Power size={12} />
                {draft?.is_active ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={handleSave}
                disabled={!dirty || !!overlapWarning || saveRule.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Save size={12} />
                {saveRule.isPending ? "Saving…" : "Save Rule"}
              </button>
            </div>
          </div>

          {/* Overlap warning banner */}
          {overlapWarning && (
            <div className="mx-5 mt-4 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{overlapWarning}</span>
            </div>
          )}

          {/* Bands */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {(draft?.thresholds || []).length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="inline-flex p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  No bands configured yet
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Add at least one amount band to activate this approval rule.
                </p>
                <button
                  onClick={onAddBand}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                >
                  <Plus size={14} /> Add first band
                </button>
              </div>
            ) : (
              <>
                {draft.thresholds.map((band, idx) => (
                  <BandCard
                    key={idx}
                    band={band}
                    index={idx}
                    amountField={draft.amount_field}
                    onEdit={() => onEditBand(band, idx)}
                    onDelete={() => onRemoveBand(band)}
                  />
                ))}
                <button
                  onClick={onAddBand}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 text-xs font-semibold text-gray-500 hover:text-indigo-600 rounded-lg transition-all"
                >
                  <Plus size={14} /> Add Band
                </button>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {bandEditor.open && (
        <BandEditorModal
          band={bandEditor.band}
          amountField={draft?.amount_field}
          onClose={() => setBandEditor({ open: false, band: null, index: -1 })}
          onSave={saveBand}
        />
      )}
      {showSimulator && (
        <SimulatorModal
          sourceType={draft?.source_type}
          amountField={draft?.amount_field}
          onClose={() => setShowSimulator(false)}
        />
      )}
      {bandToDelete && (
        <DeleteModal
          deletetitle="band"
          item={bandToDelete}
          idKey="label"
          onclose={() => setBandToDelete(null)}
          onDelete={confirmDeleteBand}
        />
      )}
    </div>
  );
};

export default ApprovalRules;
