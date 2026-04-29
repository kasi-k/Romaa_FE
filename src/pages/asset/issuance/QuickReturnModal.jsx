import { useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../components/Modal";
import { useReturnIssuance } from "./hooks/useIssuance";

const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"];

const QuickReturnModal = ({ issuance, onClose }) => {
  const isBulk = issuance.asset_kind === "BULK";
  const openBalance =
    isBulk
      ? Number(issuance.quantity || 0) - Number(issuance.quantity_returned || 0)
      : 1;

  const [form, setForm] = useState({
    quantity: openBalance,
    condition_on_return: "GOOD",
    damage_charge: 0,
    actual_return_date: new Date().toISOString().slice(0, 10),
    return_signature_url: "",
    return_photo_url: "",
    notes: "",
    to_location_type: "STORE",
    to_location_id: "",
    to_location_name: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const { mutate, isPending } = useReturnIssuance({ onDone: onClose });

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      quantity: isBulk ? Number(form.quantity) : 1,
      condition_on_return: form.condition_on_return,
      damage_charge: Number(form.damage_charge) || 0,
      actual_return_date: form.actual_return_date,
      return_signature_url: form.return_signature_url || undefined,
      return_photo_url: form.return_photo_url || undefined,
      notes: form.notes || undefined,
      ...(isBulk && {
        to_location_type: form.to_location_type,
        to_location_id: form.to_location_id || undefined,
        to_location_name: form.to_location_name || undefined,
      }),
    };
    mutate({ issueId: issuance.issue_id, payload });
  };

  return (
    <Modal onclose={onClose} title={`Return ${issuance.issue_id}`} widthClassName="md:w-[560px] w-[95vw]">
      <form onSubmit={submit} className="px-5 pb-4 space-y-3">
        <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 rounded p-2">
          <span className="font-mono">{issuance.asset_id_label}</span> · {issuance.asset_name}
          <br />
          Issued to: <span className="font-semibold">{issuance.assigned_to_name}</span>
          {isBulk && <> · Open balance: <span className="font-mono">{openBalance}</span></>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isBulk && (
            <Field label="Quantity returning">
              <input
                type="number"
                min="1"
                max={openBalance}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className={input}
              />
            </Field>
          )}
          <Field label="Condition on return">
            <select value={form.condition_on_return} onChange={(e) => set("condition_on_return", e.target.value)} className={input}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Damage charge (₹)">
            <input type="number" step="0.01" value={form.damage_charge} onChange={(e) => set("damage_charge", e.target.value)} className={input} />
          </Field>
          <Field label="Return date">
            <input type="date" value={form.actual_return_date} onChange={(e) => set("actual_return_date", e.target.value)} className={input} />
          </Field>
        </div>

        {isBulk && (
          <Field label="Return to location">
            <div className="grid grid-cols-3 gap-2">
              <select value={form.to_location_type} onChange={(e) => set("to_location_type", e.target.value)} className={input}>
                {["STORE", "SITE"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input value={form.to_location_id} onChange={(e) => set("to_location_id", e.target.value)} placeholder="Location ID" className={input} />
              <input value={form.to_location_name} onChange={(e) => set("to_location_name", e.target.value)} placeholder="Location Name" className={input} />
            </div>
          </Field>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Photo URL (S3)">
            <input value={form.return_photo_url} onChange={(e) => set("return_photo_url", e.target.value)} className={input} />
          </Field>
          <Field label="Signature URL (S3)">
            <input value={form.return_signature_url} onChange={(e) => set("return_signature_url", e.target.value)} className={input} />
          </Field>
        </div>

        <Field label="Notes">
          <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={`${input} resize-none`} />
        </Field>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md">
            <X size={14} /> Cancel
          </button>
          <button type="submit" disabled={isPending} className="cursor-pointer px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50">
            {isPending ? "Returning…" : "Confirm Return"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const input = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md";
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold mb-1">{label}</label>
    {children}
  </div>
);

export default QuickReturnModal;
