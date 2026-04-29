import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, X } from "lucide-react";
import AssetCategoryPicker from "../_shared/AssetCategoryPicker";
import { useCreateBulkItem, useUpdateBulkItem } from "./hooks/useBulkInventory";

const UOM = ["Nos", "Pair", "Mtr", "Sqm", "Set", "Kg", "Ltr", "Box"];
const DEFAULTS = {
  item_name: "",
  brand: "",
  model: "",
  size: "",
  color: "",
  unit_of_measure: "Nos",
  min_stock_level: 0,
  reorder_qty: 0,
  standard_cost: 0,
  certifications_csv: "",
  is_reusable: false,
  is_consumable: false,
  has_expiry: false,
  shelf_life_months: "",
  is_active: true,
};

const BulkItemForm = ({ item, onCancel, onSaved }) => {
  const isEdit = !!item?.item_id;
  const [category, setCategory] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({ defaultValues: DEFAULTS });

  useEffect(() => {
    if (item) {
      reset({
        ...DEFAULTS,
        ...item,
        certifications_csv: (item.certifications || []).join(", "),
      });
      if (item.asset_category_ref) {
        setCategory({
          _id: item.asset_category_ref,
          assetClass: item.asset_class,
          category: item.category,
          subCategory: item.sub_category,
        });
      }
    } else {
      reset(DEFAULTS);
      setCategory(null);
    }
  }, [item, reset]);

  const { mutate: create, isPending: creating } = useCreateBulkItem({
    onDone: (saved) => onSaved?.(saved),
  });
  const { mutate: update, isPending: updating } = useUpdateBulkItem({
    onDone: (saved) => onSaved?.(saved),
  });
  const submitting = creating || updating;

  const onSubmit = (form) => {
    const payload = {
      item_name: form.item_name,
      asset_category_ref: category?._id,
      brand: form.brand || undefined,
      model: form.model || undefined,
      size: form.size || undefined,
      color: form.color || undefined,
      unit_of_measure: form.unit_of_measure,
      min_stock_level: Number(form.min_stock_level) || 0,
      reorder_qty: Number(form.reorder_qty) || 0,
      standard_cost: Number(form.standard_cost) || 0,
      certifications: form.certifications_csv
        ? form.certifications_csv.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      is_reusable: form.is_reusable,
      is_consumable: form.is_consumable,
      has_expiry: form.has_expiry,
      shelf_life_months: form.shelf_life_months ? Number(form.shelf_life_months) : undefined,
      is_active: form.is_active,
    };
    if (!category && !isEdit) return;
    if (isEdit) update({ itemId: item.item_id, payload });
    else create(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {isEdit ? `Edit ${item.item_id}` : "New Bulk Inventory Item"}
        </h2>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className={btnSecondary}>
              <X size={14} /> Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || (isEdit && !isDirty && !category)}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            <Save size={14} /> {submitting ? "Saving…" : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Item Name" required>
            <input {...register("item_name", { required: true })} className={input} />
          </Field>
          <Field label="Category" required>
            <AssetCategoryPicker
              value={category}
              onChange={setCategory}
              classFilter={["Formwork", "SafetyEquipment", "SiteInfra", "Tool"]}
              disabled={isEdit}
            />
          </Field>
          <Field label="Brand"><input {...register("brand")} className={input} /></Field>
          <Field label="Model"><input {...register("model")} className={input} /></Field>
          <Field label="Size"><input {...register("size")} className={input} /></Field>
          <Field label="Color"><input {...register("color")} className={input} /></Field>
          <Field label="Unit of Measure">
            <select {...register("unit_of_measure")} className={input}>
              {UOM.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="Standard Cost (₹)">
            <input type="number" step="0.01" {...register("standard_cost")} className={input} />
          </Field>
          <Field label="Min Stock Level">
            <input type="number" {...register("min_stock_level")} className={input} />
          </Field>
          <Field label="Reorder Qty">
            <input type="number" {...register("reorder_qty")} className={input} />
          </Field>
          <Field label="Shelf Life (months)">
            <input type="number" {...register("shelf_life_months")} className={input} />
          </Field>
        </div>

        <Field label="Certifications (comma-separated)">
          <input {...register("certifications_csv")} placeholder="IS 2925, EN 397" className={input} />
        </Field>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Toggle label="Is Reusable" {...register("is_reusable")} />
          <Toggle label="Is Consumable" {...register("is_consumable")} />
          <Toggle label="Has Expiry" {...register("has_expiry")} />
          <Toggle label="Is Active" {...register("is_active")} />
        </div>
      </div>
    </form>
  );
};

const input =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
const btnSecondary =
  "cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Toggle = ({ label, ...rest }) => (
  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
    <input type="checkbox" {...rest} className="cursor-pointer accent-blue-600" /> {label}
  </label>
);

export default BulkItemForm;
