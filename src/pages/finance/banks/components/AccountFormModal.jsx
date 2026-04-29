import { useState } from "react";
import { X, Landmark, Loader2, Lock } from "lucide-react";
import { ACCOUNT_TYPES, ACCOUNT_SUBTYPES, TAX_TYPES, EMPTY_FORM } from "./constants";
import { Field, Toggle, inputCls, selectCls } from "./shared";
import { useCreateAccount, useUpdateAccount } from "../hooks/useAccountTree";

const Section = ({ title, children }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 pb-1.5 border-b border-gray-100 dark:border-gray-800">
      {title}
    </p>
    <div className="space-y-4">{children}</div>
  </div>
);

const AccountFormModal = ({ onClose, editData, allAccounts }) => {
  const isEdit    = !!editData;
  const isSystem  = editData?.is_system;

  const [form, setForm] = useState(() => {
    if (!editData) return EMPTY_FORM;
    return {
      account_code:         editData.account_code        ?? "",
      account_name:         editData.account_name        ?? "",
      account_type:         editData.account_type        ?? "Asset",
      account_subtype:      editData.account_subtype     ?? "",
      description:          editData.description         ?? "",
      parent_code:          editData.parent_code         ?? "",
      level:                editData.level               ?? "",
      is_group:             editData.is_group            ?? false,
      is_posting_account:   editData.is_posting_account  ?? true,
      is_bank_cash:         editData.is_bank_cash        ?? false,
      is_active:            editData.is_active           ?? true,
      tax_type:             editData.tax_type            ?? "None",
      opening_balance:      editData.opening_balance     ?? "",
      opening_balance_type: editData.opening_balance_type ?? "Dr",
      opening_balance_date: editData.opening_balance_date
        ? editData.opening_balance_date.slice(0, 10)
        : "",
    };
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createMutation = useCreateAccount({ onClose });
  const updateMutation = useUpdateAccount({ onClose });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.level !== "") payload.level = Number(payload.level);
    else delete payload.level;
    if (payload.opening_balance !== "") payload.opening_balance = Number(payload.opening_balance);
    else delete payload.opening_balance;
    Object.keys(payload).forEach(k => payload[k] === "" && delete payload[k]);

    if (isEdit) updateMutation.mutate({ id: editData._id, ...payload });
    else        createMutation.mutate(payload);
  };

  const groupAccounts = allAccounts.filter(
    a => a.is_group && a.account_code !== form.account_code,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
              <Landmark size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {isEdit ? "Edit Account" : "New Account"}
              </h2>
              {isSystem && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Lock size={10} className="text-amber-500" />
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    System account — code, type & balance locked
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <form id="account-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Identity */}
          <Section title="Identity">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Account Code" required>
                <input
                  className={inputCls}
                  value={form.account_code}
                  onChange={e => set("account_code", e.target.value)}
                  placeholder="e.g. 5500"
                  disabled={isEdit}
                  required
                />
              </Field>
              <Field label="Account Name" required>
                <input
                  className={inputCls}
                  value={form.account_name}
                  onChange={e => set("account_name", e.target.value)}
                  placeholder="e.g. Site Temporary Works"
                  required
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Optional description…"
              />
            </Field>
          </Section>

          {/* Classification */}
          <Section title="Classification">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Account Type" required>
                <select
                  className={selectCls}
                  value={form.account_type}
                  onChange={e => set("account_type", e.target.value)}
                  disabled={isSystem}
                  required
                >
                  {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Account Subtype">
                <select
                  className={selectCls}
                  value={form.account_subtype}
                  onChange={e => set("account_subtype", e.target.value)}
                >
                  <option value="">— None —</option>
                  {ACCOUNT_SUBTYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Parent Account" hint="Must be a group account">
                <select
                  className={selectCls}
                  value={form.parent_code}
                  onChange={e => set("parent_code", e.target.value)}
                >
                  <option value="">— Root (no parent) —</option>
                  {groupAccounts.map(a => (
                    <option key={a.account_code} value={a.account_code}>
                      {a.account_code} — {a.account_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Level" hint="0=root · 1=group · 2=leaf · 3=personal">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={5}
                  value={form.level}
                  onChange={e => set("level", e.target.value)}
                  placeholder="Auto"
                />
              </Field>
            </div>
            <Field label="Tax Type">
              <select
                className={selectCls}
                value={form.tax_type}
                onChange={e => set("tax_type", e.target.value)}
              >
                {TAX_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </Section>

          {/* Opening Balance */}
          <Section title="Opening Balance">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Amount">
                <input
                  className={inputCls}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.opening_balance}
                  onChange={e => set("opening_balance", e.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Side">
                <select
                  className={selectCls}
                  value={form.opening_balance_type}
                  onChange={e => set("opening_balance_type", e.target.value)}
                >
                  <option value="Dr">Dr — Debit</option>
                  <option value="Cr">Cr — Credit</option>
                </select>
              </Field>
              <Field label="Date">
                <input
                  className={inputCls}
                  type="date"
                  value={form.opening_balance_date}
                  onChange={e => set("opening_balance_date", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* Flags */}
          <Section title="Account Flags">
            <div className="grid grid-cols-2 gap-4">
              <Toggle
                label="Group Account"
                desc="Parent node — cannot receive postings"
                checked={form.is_group}
                onChange={e => set("is_group", e.target.checked)}
              />
              <Toggle
                label="Posting Account"
                desc="Leaf node — transactions posted here"
                checked={form.is_posting_account}
                onChange={e => set("is_posting_account", e.target.checked)}
              />
              <Toggle
                label="Bank / Cash"
                desc="Shown in payment / receipt dropdowns"
                checked={form.is_bank_cash}
                onChange={e => set("is_bank_cash", e.target.checked)}
              />
              <Toggle
                label="Active"
                desc="Inactive accounts are hidden from dropdowns"
                checked={form.is_active}
                onChange={e => set("is_active", e.target.checked)}
              />
            </div>
          </Section>
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="account-form"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 transition-colors shadow-sm"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountFormModal;
