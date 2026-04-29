import { useState } from "react";
import { X, Play, AlertTriangle, CheckCircle2, UserCircle2, Search } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useEmployeesForApproval, useSimulateApproval } from "./hooks/useApprovalRules";

const REASON_COPY = {
  ok: {
    tone: "green",
    title: "Approvers resolved",
    note: "The engine will route to the approvers listed below in sequence.",
  },
  no_rule: {
    tone: "amber",
    title: "No active rule",
    note: "No active approval rule exists for this module — create one first.",
  },
  no_band_match: {
    tone: "amber",
    title: "Amount outside all bands",
    note: "Your amount falls outside every configured band. Add a higher band or widen an existing one.",
  },
  empty_resolution: {
    tone: "red",
    title: "Band matched but resolved to 0 approvers",
    note: "The matched band has no eligible approvers (check role holders or the reportsTo chain).",
  },
};

const fmtAmount = (v, field) => {
  if (v == null) return "—";
  if (field === "days") return `${v} day(s)`;
  if (field === "qty") return `${v} units`;
  return `₹ ${Number(v).toLocaleString("en-IN")}`;
};

const SimulatorModal = ({ sourceType, amountField, onClose }) => {
  const [amount, setAmount] = useState("");
  const [initiator, setInitiator] = useState(null);

  // Employee search for initiator override
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [showPicker, setShowPicker] = useState(false);
  const { data: empData, isLoading: empLoading } = useEmployeesForApproval({
    search: debouncedSearch,
    limit: 10,
  });
  const employees = Array.isArray(empData) ? empData : empData?.data || [];

  const [result, setResult] = useState(null);
  const simulate = useSimulateApproval({
    onSuccess: (data) => setResult(data),
  });

  const handleSimulate = () => {
    setResult(null);
    const payload = { source_type: sourceType };
    if (amount !== "") payload.amount = Number(amount);
    if (initiator?._id) payload.initiator_id = initiator._id;
    simulate.mutate(payload);
  };

  const amountLabel = amountField === "days" ? "Days" : amountField === "qty" ? "Qty" : "Amount (₹)";

  const banner = result?.reason ? REASON_COPY[result.reason] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 gap-3">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
              Simulate Approval
            </h2>
            <p className="text-[11px] text-gray-500 truncate">
              Dry-run who will approve <span className="font-semibold">{sourceType}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {amountLabel}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={amountField === "days" ? "e.g. 3" : "e.g. 350000"}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Initiator */}
          <div className="relative">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Initiator (optional — defaults to current user)
            </label>
            {initiator ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800">
                <div className="flex items-center gap-2">
                  <UserCircle2 size={18} className="text-indigo-600" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                      {initiator.name}
                    </p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300">
                      {initiator.employeeId} {initiator.designation ? `· ${initiator.designation}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInitiator(null)}
                  className="p-1 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowPicker(true);
                  }}
                  onFocus={() => setShowPicker(true)}
                  placeholder="Search employee…"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                {showPicker && search && (
                  <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-lg z-20 divide-y divide-gray-100 dark:divide-gray-800">
                    {empLoading && (
                      <div className="text-center text-xs text-gray-400 py-3">Loading…</div>
                    )}
                    {!empLoading && employees.length === 0 && (
                      <div className="text-center text-xs text-gray-400 py-3">No match</div>
                    )}
                    {!empLoading &&
                      employees.map((emp) => (
                        <button
                          key={emp._id || emp.employeeId}
                          onClick={() => {
                            setInitiator(emp);
                            setSearch("");
                            setShowPicker(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {emp.employeeId} {emp.designation ? `· ${emp.designation}` : ""}
                          </p>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Simulate button */}
          <button
            onClick={handleSimulate}
            disabled={simulate.isPending || amount === ""}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5"
          >
            <Play size={14} />
            {simulate.isPending ? "Simulating…" : "Run Simulation"}
          </button>

          {/* Result */}
          {result && (
            <div className="space-y-3 pt-2">
              {banner && (
                <div
                  className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs ${
                    banner.tone === "green"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : banner.tone === "amber"
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                  }`}
                >
                  {banner.tone === "green" ? (
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{banner.title}</p>
                    <p className="text-[11px] opacity-90">{banner.note}</p>
                  </div>
                </div>
              )}

              {result.band && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Band matched
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                    {fmtAmount(result.band.min_amount, amountField)} –{" "}
                    {fmtAmount(result.band.max_amount, amountField)}
                    {result.band.label ? ` · ${result.band.label}` : ""}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {result.band.approver_strategy}
                    {result.band.any_of ? " · Any-of" : " · Serial"}
                  </p>
                </div>
              )}

              {Array.isArray(result.approvers) && result.approvers.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Resolved approvers ({result.approvers.length})
                  </p>
                  <div className="space-y-1.5">
                    {result.approvers.map((a, idx) => (
                      <div
                        key={a._id || idx}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {a.name}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {a.role?.roleName || "—"}
                            {a.department ? ` · ${a.department}` : ""}
                            {a.email ? ` · ${a.email}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulatorModal;
