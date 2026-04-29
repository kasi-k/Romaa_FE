import { useEffect, useMemo, useState } from "react";
import { X, Search, Check } from "lucide-react";
import { useEmployeesForApproval, useRolesForApproval } from "./hooks/useApprovalRules";
import { useDebounce } from "../../../hooks/useDebounce";

const STRATEGIES = [
  { key: "REPORTS_TO", label: "Reporting Chain" },
  { key: "ROLE", label: "Named Roles" },
  { key: "USERS", label: "Named Employees" },
  { key: "DEPARTMENT_HEAD", label: "Department Head" },
];

const makeEmpty = () => ({
  min_amount: 0,
  max_amount: 0,
  approver_strategy: "REPORTS_TO",
  levels: 1,
  approvers: [],
  approvers_data: [], // UI only — {_id, name, email, designation}
  roles: [],
  any_of: false,
  label: "",
});

const BandEditorModal = ({ band, onSave, onClose, amountField }) => {
  const isEdit = !!band;
  const [form, setForm] = useState(() => ({ ...makeEmpty(), ...(band || {}) }));
  const [error, setError] = useState("");

  // --- Role strategy picker state ---
  const { data: roles = [] } = useRolesForApproval();

  // --- Employee strategy picker state ---
  const [empSearch, setEmpSearch] = useState("");
  const debouncedSearch = useDebounce(empSearch, 400);
  const { data: empData, isLoading: empLoading } = useEmployeesForApproval({
    search: debouncedSearch,
    limit: 20,
  });
  const employees = Array.isArray(empData) ? empData : empData?.data || [];

  const amountLabel = amountField === "days" ? "Days" : amountField === "qty" ? "Qty" : "₹";

  const update = (patch) => setForm((s) => ({ ...s, ...patch }));

  // Keep strategy-specific fields clean when strategy changes
  useEffect(() => {
    if (form.approver_strategy === "REPORTS_TO") {
      update({ approvers: [], approvers_data: [], roles: [] });
    } else if (form.approver_strategy === "ROLE") {
      update({ approvers: [], approvers_data: [], levels: 1 });
    } else if (form.approver_strategy === "USERS") {
      update({ roles: [], levels: 1 });
    } else if (form.approver_strategy === "DEPARTMENT_HEAD") {
      update({ approvers: [], approvers_data: [], roles: [], levels: 1 });
    }
  }, [form.approver_strategy]);

  const selectedEmpIds = useMemo(() => new Set(form.approvers || []), [form.approvers]);

  const toggleEmployee = (emp) => {
    const id = emp._id || emp.employeeId;
    const isSel = selectedEmpIds.has(id);
    if (isSel) {
      update({
        approvers: (form.approvers || []).filter((x) => x !== id),
        approvers_data: (form.approvers_data || []).filter((x) => (x._id || x.employeeId) !== id),
      });
    } else {
      update({
        approvers: [...(form.approvers || []), id],
        approvers_data: [...(form.approvers_data || []), emp],
      });
    }
  };

  const toggleRole = (roleName) => {
    const set = new Set(form.roles || []);
    if (set.has(roleName)) set.delete(roleName);
    else set.add(roleName);
    update({ roles: [...set] });
  };

  const validate = () => {
    if (form.min_amount === "" || form.min_amount == null) return "Min amount is required";
    if (form.max_amount === "" || form.max_amount == null) return "Max amount is required";
    if (Number(form.max_amount) <= Number(form.min_amount)) return "Max must be greater than Min";
    if (form.approver_strategy === "USERS" && !(form.approvers || []).length)
      return "Select at least one employee";
    if (form.approver_strategy === "ROLE" && !(form.roles || []).length)
      return "Select at least one role";
    if (form.approver_strategy === "REPORTS_TO") {
      const n = Number(form.levels);
      if (!n || n < 1 || n > 3) return "Levels must be 1, 2 or 3";
    }
    return "";
  };

  const handleSave = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    const clean = {
      min_amount: Number(form.min_amount),
      max_amount: Number(form.max_amount),
      approver_strategy: form.approver_strategy,
      any_of: !!form.any_of,
      label: form.label || "",
    };
    if (form.approver_strategy === "USERS") {
      clean.approvers = form.approvers || [];
      clean.approvers_data = form.approvers_data || [];
    } else if (form.approver_strategy === "ROLE") {
      clean.roles = form.roles || [];
    } else if (form.approver_strategy === "REPORTS_TO") {
      clean.levels = Number(form.levels);
    }
    onSave(clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 gap-3">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
              {isEdit ? "Edit Band" : "Add Band"}
            </h2>
            <p className="text-[11px] text-gray-500 truncate">
              Configure who approves for this amount range
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          {/* Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Min ({amountLabel})
              </label>
              <input
                type="number"
                value={form.min_amount}
                onChange={(e) => update({ min_amount: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Max ({amountLabel})
              </label>
              <input
                type="number"
                value={form.max_amount}
                onChange={(e) => update({ max_amount: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Approver Strategy
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {STRATEGIES.map((s) => {
                const active = form.approver_strategy === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => update({ approver_strategy: s.key })}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      active
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strategy-specific inputs */}
          {form.approver_strategy === "REPORTS_TO" && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Levels (reporting chain)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => {
                  const active = Number(form.levels) === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => update({ levels: n })}
                      className={`w-14 h-10 rounded-lg text-sm font-bold border transition-all ${
                        active
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300"
                      }`}
                    >
                      L{n}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                L1 = direct manager, L2 = manager's manager, etc.
              </p>
            </div>
          )}

          {form.approver_strategy === "ROLE" && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Roles ({(form.roles || []).length} selected)
              </label>
              <div className="max-h-56 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 grid grid-cols-2 gap-2">
                {roles.length === 0 && (
                  <div className="col-span-2 text-center text-xs text-gray-400 py-4">
                    No roles available
                  </div>
                )}
                {roles.map((r) => {
                  const rn = r.roleName || r.name;
                  const active = (form.roles || []).includes(rn);
                  return (
                    <button
                      key={r._id || r.role_id || rn}
                      type="button"
                      onClick={() => toggleRole(rn)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-all ${
                        active
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300"
                      }`}
                    >
                      <span className="font-semibold truncate">{rn}</span>
                      {active && <Check size={14} className="ml-2 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {form.approver_strategy === "USERS" && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Employees ({(form.approvers || []).length} selected)
              </label>
              {/* Selected chips */}
              {(form.approvers_data || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.approvers_data.map((emp) => (
                    <span
                      key={emp._id || emp.employeeId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[11px] font-semibold"
                    >
                      {emp.name}
                      <button onClick={() => toggleEmployee(emp)} className="hover:text-indigo-900">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder="Search by name or employee ID…"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* List */}
              <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                {empLoading && <div className="text-center text-xs text-gray-400 py-4">Loading…</div>}
                {!empLoading && employees.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-4">No employees found</div>
                )}
                {!empLoading &&
                  employees.map((emp) => {
                    const id = emp._id || emp.employeeId;
                    const active = selectedEmpIds.has(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleEmployee(emp)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                          active ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{emp.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {emp.employeeId} {emp.designation ? `· ${emp.designation}` : ""}
                          </p>
                        </div>
                        {active && <Check size={14} className="text-indigo-600" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {form.approver_strategy === "DEPARTMENT_HEAD" && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300">
              Resolved from the initiator's department. No extra configuration required —
              the engine looks up the matching <span className="font-semibold">*_HEAD</span> role at run-time.
            </div>
          )}

          {/* Any-of toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Any-of mode
              </p>
              <p className="text-[10px] text-gray-500">
                {form.any_of
                  ? "Any one approver can sign off"
                  : "All approvers must sign in sequence"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ any_of: !form.any_of })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                form.any_of ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  form.any_of ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Label */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Label (display only)
            </label>
            <input
              type="text"
              value={form.label || ""}
              onChange={(e) => update({ label: e.target.value })}
              placeholder="e.g. L1: Reporting Manager"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
          >
            {isEdit ? "Update Band" : "Add Band"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BandEditorModal;
