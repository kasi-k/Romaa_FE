import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, X } from "lucide-react";
import AssetCategoryPicker from "../_shared/AssetCategoryPicker";
import {
  useCreateTaggedAsset,
  useUpdateTaggedAsset,
} from "./hooks/useTaggedAsset";

const OWNERSHIPS = ["OWNED", "RENTED", "LEASED"];
const LOCATION_TYPES = ["SITE", "STORE", "ASSIGNED", "TRANSIT", "VENDOR"];
const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"];

const DEFAULTS = {
  asset_name: "",
  ownership: "OWNED",
  vendor_name: "",
  serial_number: "",
  model_number: "",
  manufacturer: "",
  manufacturing_year: "",
  purchase_date: "",
  purchase_cost: "",
  supplier_name: "",
  invoice_number: "",
  current_location_type: "STORE",
  current_site_id: "",
  current_site_name: "",
  current_store_name: "",
  condition: "NEW",
  qr_code: "",
  rfid_tag: "",
  specifications_json: "",
};

const TaggedAssetForm = ({ asset, onCancel, onSaved }) => {
  const isEdit = !!asset?.asset_id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: DEFAULTS });
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (asset) {
      reset({
        ...DEFAULTS,
        ...asset,
        manufacturing_year: asset.manufacturing_year || "",
        purchase_date: asset.purchase_date ? asset.purchase_date.slice(0, 10) : "",
        purchase_cost: asset.purchase_cost ?? "",
        specifications_json: asset.specifications
          ? JSON.stringify(asset.specifications, null, 2)
          : "",
      });
      if (asset.asset_category_ref) {
        setCategory({
          _id: asset.asset_category_ref,
          assetClass: asset.asset_class,
          category: asset.category,
          subCategory: asset.sub_category,
        });
      }
    } else {
      reset(DEFAULTS);
      setCategory(null);
    }
  }, [asset, reset]);

  const { mutate: create, isPending: creating } = useCreateTaggedAsset({
    onDone: (saved) => onSaved?.(saved),
  });
  const { mutate: update, isPending: updating } = useUpdateTaggedAsset({
    onDone: (saved) => onSaved?.(saved),
  });
  const submitting = creating || updating;

  const onSubmit = (form) => {
    let specifications = undefined;
    if (form.specifications_json?.trim()) {
      try {
        specifications = JSON.parse(form.specifications_json);
      } catch {
        // fall through with raw text saved as { raw: "..." }
        specifications = { raw: form.specifications_json };
      }
    }
    const payload = {
      asset_name: form.asset_name,
      asset_category_ref: category?._id,
      ownership: form.ownership,
      vendor_name: form.vendor_name || undefined,
      serial_number: form.serial_number || undefined,
      model_number: form.model_number || undefined,
      manufacturer: form.manufacturer || undefined,
      manufacturing_year: form.manufacturing_year ? Number(form.manufacturing_year) : undefined,
      purchase_date: form.purchase_date || undefined,
      purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : undefined,
      supplier_name: form.supplier_name || undefined,
      invoice_number: form.invoice_number || undefined,
      current_location_type: form.current_location_type,
      current_site_id: form.current_site_id || undefined,
      current_site_name: form.current_site_name || undefined,
      current_store_name: form.current_store_name || undefined,
      condition: form.condition,
      qr_code: form.qr_code || undefined,
      rfid_tag: form.rfid_tag || undefined,
      specifications,
    };

    if (!category && !isEdit) {
      // basic guard — server requires category ref
      return;
    }

    if (isEdit) update({ assetId: asset.asset_id, payload });
    else create(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {isEdit ? `Edit ${asset.asset_id}` : "Register New Tagged Asset"}
        </h2>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <X size={14} /> Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || (isEdit && !isDirty && !category)}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            <Save size={14} /> {submitting ? "Saving…" : isEdit ? "Update" : "Register"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        <Section title="Identity">
          <Grid cols={2}>
            <Field label="Asset Name" required error={errors.asset_name?.message}>
              <input
                {...register("asset_name", { required: "Required" })}
                className={input}
                placeholder="e.g. Bosch GBH 200 Drill"
              />
            </Field>
            <Field label="Category" required>
              <AssetCategoryPicker
                value={category}
                onChange={setCategory}
                classFilter={[
                  "Tool",
                  "IT",
                  "Survey",
                  "Furniture",
                  "SiteInfra",
                  "SafetyEquipment",
                ]}
                disabled={isEdit}
              />
              {!category && (
                <p className="text-xs text-amber-600 mt-1">
                  Required — drives compliance &amp; calibration behaviour.
                </p>
              )}
            </Field>
            <Field label="Ownership">
              <select {...register("ownership")} className={input}>
                {OWNERSHIPS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Vendor Name">
              <input {...register("vendor_name")} className={input} />
            </Field>
          </Grid>
        </Section>

        <Section title="Identification">
          <Grid cols={3}>
            <Field label="Serial #">
              <input {...register("serial_number")} className={input} />
            </Field>
            <Field label="Model #">
              <input {...register("model_number")} className={input} />
            </Field>
            <Field label="Manufacturer">
              <input {...register("manufacturer")} className={input} />
            </Field>
            <Field label="Mfg. Year">
              <input
                type="number"
                {...register("manufacturing_year")}
                className={input}
              />
            </Field>
            <Field label="QR Code">
              <input {...register("qr_code")} className={input} />
            </Field>
            <Field label="RFID Tag">
              <input {...register("rfid_tag")} className={input} />
            </Field>
          </Grid>
        </Section>

        <Section title="Purchase">
          <Grid cols={3}>
            <Field label="Purchase Date">
              <input type="date" {...register("purchase_date")} className={input} />
            </Field>
            <Field label="Purchase Cost (₹)">
              <input
                type="number"
                step="0.01"
                {...register("purchase_cost")}
                className={input}
              />
            </Field>
            <Field label="Supplier">
              <input {...register("supplier_name")} className={input} />
            </Field>
            <Field label="Invoice #">
              <input {...register("invoice_number")} className={input} />
            </Field>
          </Grid>
        </Section>

        <Section title="Current State">
          <Grid cols={3}>
            <Field label="Location Type">
              <select {...register("current_location_type")} className={input}>
                {LOCATION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Site ID">
              <input {...register("current_site_id")} className={input} />
            </Field>
            <Field label="Site Name">
              <input {...register("current_site_name")} className={input} />
            </Field>
            <Field label="Store Name">
              <input {...register("current_store_name")} className={input} />
            </Field>
            <Field label="Condition">
              <select {...register("condition")} className={input}>
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </Section>

        <Section title="Specifications (free-form JSON)">
          <textarea
            {...register("specifications_json")}
            rows={4}
            className={`${input} font-mono text-xs`}
            placeholder='{"voltage":"220V","power":"800W"}'
          />
        </Section>
      </div>
    </form>
  );
};

const input =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
      {title}
    </h3>
    {children}
  </div>
);

const GRID_COLS = {
  2: "grid grid-cols-1 md:grid-cols-2 gap-3",
  3: "grid grid-cols-1 md:grid-cols-3 gap-3",
};
const Grid = ({ cols = 2, children }) => (
  <div className={GRID_COLS[cols] || GRID_COLS[2]}>{children}</div>
);

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default TaggedAssetForm;
