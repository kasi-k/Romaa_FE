import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Modal from "../../../components/Modal";
import { useBulkMovement } from "./hooks/useBulkInventory";

// Single conditional movement form per §5.7. `kind` is one of:
// receive | issue | return | transfer | damage | scrap | adjustment
const MovementForm = ({ kind, item, onClose }) => {
  const [form, setForm] = useState({
    quantity: "",
    from_location_type: "STORE",
    from_location_id: "",
    from_location_name: "",
    to_location_type: "STORE",
    to_location_id: "",
    to_location_name: "",
    recipient_kind: "EMPLOYEE",
    recipient_id: "",
    recipient_name: "",
    reference_type: "",
    reference_number: "",
    reference_url: "",
    unit_cost: "",
    notes: "",
  });

  const { mutate, isPending } = useBulkMovement(kind, { onDone: onClose });

  useEffect(() => {
    setForm((f) => ({ ...f, quantity: "" }));
  }, [kind, item?.item_id]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const showFrom = ["issue", "transfer", "damage", "scrap", "return", "adjustment"].includes(kind);
  const showTo = ["receive", "transfer", "return"].includes(kind);
  const showRecipient = ["issue", "return"].includes(kind);
  const showUnitCost = kind === "receive";

  const submit = (e) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) return;

    const payload = {
      item_ref: item._id,
      quantity: qty,
      ...(showFrom && {
        from_location_type: form.from_location_type,
        from_location_id: form.from_location_id || undefined,
        from_location_name: form.from_location_name || undefined,
      }),
      ...(showTo && {
        to_location_type: form.to_location_type,
        to_location_id: form.to_location_id || undefined,
        to_location_name: form.to_location_name || undefined,
      }),
      ...(showRecipient && {
        recipient_kind: form.recipient_kind,
        recipient_id: form.recipient_id || undefined,
        recipient_name: form.recipient_name || undefined,
      }),
      ...(showUnitCost && form.unit_cost && { unit_cost: Number(form.unit_cost) }),
      reference_type: form.reference_type || undefined,
      reference_number: form.reference_number || undefined,
      reference_url: form.reference_url || undefined,
      notes: form.notes || undefined,
    };
    mutate(payload);
  };

  const title =
    {
      receive: "Receive Stock",
      issue: "Issue Stock",
      return: "Return Stock",
      transfer: "Transfer Stock",
      damage: "Mark as Damaged",
      scrap: "Scrap Stock",
      adjustment: "Adjustment",
    }[kind] || "Movement";

  const maxQty =
    kind === "receive" || kind === "adjustment"
      ? undefined
      : item?.total_qty_available;

  return (
    <Modal onclose={onClose} title={`${title} — ${item.item_name}`} widthClassName="md:w-[640px] w-[95vw]">
      <form onSubmit={submit} className="px-5 pb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label={`Quantity (${item.unit_of_measure})`} required>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={maxQty}
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              className={input}
              required
            />
            {maxQty !== undefined && (
              <p className="text-[10px] text-gray-500 mt-1">Max available: {maxQty}</p>
            )}
          </Field>
          {showUnitCost && (
            <Field label="Unit Cost (₹)">
              <input type="number" step="0.01" value={form.unit_cost} onChange={(e) => set("unit_cost", e.target.value)} className={input} />
            </Field>
          )}
        </div>

        {showFrom && (
          <Group title="From">
            <LocationFields
              type={form.from_location_type}
              id={form.from_location_id}
              name={form.from_location_name}
              onChange={(k, v) => set(`from_location_${k}`, v)}
            />
          </Group>
        )}
        {showTo && (
          <Group title="To">
            <LocationFields
              type={form.to_location_type}
              id={form.to_location_id}
              name={form.to_location_name}
              onChange={(k, v) => set(`to_location_${k}`, v)}
            />
          </Group>
        )}
        {showRecipient && (
          <Group title="Recipient">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select value={form.recipient_kind} onChange={(e) => set("recipient_kind", e.target.value)} className={input}>
                {["EMPLOYEE", "CONTRACTOR", "SITE"].map((r) => <option key={r}>{r}</option>)}
              </select>
              <input value={form.recipient_id} onChange={(e) => set("recipient_id", e.target.value)} placeholder="Recipient ID" className={input} />
              <input value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} placeholder="Recipient Name" className={input} />
            </div>
          </Group>
        )}

        <Group title="Reference">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={form.reference_type} onChange={(e) => set("reference_type", e.target.value)} placeholder="Type (GRN / PO / …)" className={input} />
            <input value={form.reference_number} onChange={(e) => set("reference_number", e.target.value)} placeholder="Number" className={input} />
            <input value={form.reference_url} onChange={(e) => set("reference_url", e.target.value)} placeholder="URL (optional)" className={input} />
          </div>
        </Group>

        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Notes"
          className={`${input} resize-none`}
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md">
            <X size={14} /> Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            {isPending ? "Posting…" : `Post ${title}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const input =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Group = ({ title, children }) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-md p-3">
    <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">{title}</p>
    {children}
  </div>
);

const LocationFields = ({ type, id, name, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
    <select value={type} onChange={(e) => onChange("type", e.target.value)} className={input}>
      {["STORE", "SITE"].map((t) => <option key={t}>{t}</option>)}
    </select>
    <input value={id} onChange={(e) => onChange("id", e.target.value)} placeholder="Location ID" className={input} />
    <input value={name} onChange={(e) => onChange("name", e.target.value)} placeholder="Location Name" className={input} />
  </div>
);

export default MovementForm;
