import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Save, X } from "lucide-react";
import {
  useCreateAssetCategory,
  useUpdateAssetCategory,
} from "./hooks/useAssetCategory";

const ASSET_CLASSES = [
  "Machinery",
  "Vehicle",
  "StationaryPlant",
  "Tool",
  "Formwork",
  "SiteInfra",
  "SafetyEquipment",
  "Survey",
  "IT",
  "Furniture",
  "Other",
];

const TRACKING_MODES = ["HOURS", "KILOMETERS", "UNITS", "QUANTITY", "NONE"];

const DEFAULT_VALUES = {
  assetClass: "",
  category: "",
  subCategory: "",
  description: "",
  trackingMode: "NONE",
  defaultUnit: "",
  requiresCompliance: false,
  requiresFuel: false,
  requiresGps: false,
  requiresOperator: false,
  isConsumable: false,
  isActive: true,
};

const slug = (s = "") => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "");

const CategoryForm = ({ category, onCancel, onSaved }) => {
  const isEdit = !!category?._id;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (category) {
      reset({ ...DEFAULT_VALUES, ...category });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [category, reset]);

  const { mutate: create, isPending: creating } = useCreateAssetCategory({
    onDone: (saved) => onSaved?.(saved),
  });
  const { mutate: update, isPending: updating } = useUpdateAssetCategory({
    onDone: (saved) => onSaved?.(saved),
  });

  const submitting = creating || updating;

  const watched = watch(["assetClass", "category", "subCategory"]);
  const codePreview = useMemo(() => {
    const prefix =
      watched[0] === "Machinery" ? "MAC" :
      watched[0] === "Vehicle" ? "VEH" :
      watched[0] === "Tool" ? "TOO" :
      watched[0] === "Formwork" ? "FRM" :
      watched[0] === "SiteInfra" ? "SIN" :
      watched[0] === "SafetyEquipment" ? "SAF" :
      watched[0] === "Survey" ? "SUR" :
      watched[0] === "IT" ? "IT " :
      watched[0] === "Furniture" ? "FUR" :
      watched[0] === "StationaryPlant" ? "STP" :
      watched[0] === "Other" ? "OTH" : "";
    const parts = [prefix.trim(), slug(watched[1]), slug(watched[2])].filter(Boolean);
    return parts.length ? parts.join("-") : "—";
  }, [watched]);

  const onSubmit = (form) => {
    const payload = { ...form };
    if (isEdit) update({ id: category._id, payload });
    else create(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-full bg-white dark:bg-layout-dark"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Category" : "New Category"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Code preview: <span className="font-mono">{codePreview}</span>
            {isEdit && category?.code ? (
              <span className="ml-2 text-gray-400">
                (saved: <span className="font-mono">{category.code}</span>)
              </span>
            ) : null}
          </p>
        </div>
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
            disabled={submitting || (isEdit && !isDirty)}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            <Save size={14} /> {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Asset Class" required error={errors.assetClass?.message}>
            <select
              {...register("assetClass", { required: "Required" })}
              className={input}
            >
              <option value="">Select…</option>
              {ASSET_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Category" required error={errors.category?.message}>
            <input
              {...register("category", { required: "Required" })}
              placeholder="e.g. Earthmoving"
              className={input}
            />
          </Field>

          <Field label="Sub-category" error={errors.subCategory?.message}>
            <input
              {...register("subCategory")}
              placeholder="e.g. Excavator"
              className={input}
            />
          </Field>

          <Field label="Tracking Mode">
            <select {...register("trackingMode")} className={input}>
              {TRACKING_MODES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Default Unit">
            <input
              {...register("defaultUnit")}
              placeholder="Nos / Pair / Mtr / Sqm / Set"
              className={input}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            {...register("description")}
            rows={3}
            className={`${input} resize-none`}
            placeholder="Optional notes"
          />
        </Field>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Toggle name="requiresCompliance" label="Requires Compliance" control={control} />
          <Toggle name="requiresFuel" label="Requires Fuel" control={control} />
          <Toggle name="requiresGps" label="Requires GPS" control={control} />
          <Toggle name="requiresOperator" label="Requires Operator" control={control} />
          <Toggle name="isConsumable" label="Is Consumable" control={control} />
          <Toggle name="isActive" label="Is Active" control={control} />
        </div>
      </div>
    </form>
  );
};

const input =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

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

const Toggle = ({ name, label, control }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
        {label}
      </label>
    )}
  />
);

export default CategoryForm;
