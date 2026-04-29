import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import axios from "axios";
import { API } from "../../../../constant";
import { toast } from "react-toastify";
import { TbX, TbPlus, TbTrash, TbDeviceFloppy, TbUpload } from "react-icons/tb";
import { Loader2 } from "lucide-react";

const DEDUCTION_PRESETS = [
  "TDS @ 2%",
  "Labour Cess @ 1%",
  "Mobilization Advance Recovery",
];

/* ─── Field helpers ──────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-3 py-2 text-sm rounded-xl border ${err ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"} text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition`;

/* ─── Deduction row with preset dropdown ─────────────────────── */
function DeductionRow({ index, control, register, onRemove }) {
  const selected = useWatch({ control, name: `deductions.${index}.description` });
  const isOther = selected === "__other__";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <select
          {...register(`deductions.${index}.description`)}
          className={`${inputCls(false)} flex-1`}
        >
          <option value="">— Select deduction —</option>
          {DEDUCTION_PRESETS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
          <option value="__other__">Other (custom)</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register(`deductions.${index}.amount`)}
          placeholder="Amount"
          className={`${inputCls(false)} w-32`}
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0"
        >
          <TbTrash size={14} />
        </button>
      </div>
      {isOther && (
        <input
          {...register(`deductions.${index}.customDescription`)}
          placeholder="Enter custom description"
          className={`${inputCls(false)} ml-0`}
        />
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function EditClientBill({ billId, billData, onClose, onSuccess }) {
  const [saving,   setSaving]   = useState(false);
  const [csvFile,  setCsvFile]  = useState(null);
  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      bill_date:     "",
      tax_mode:      "instate",
      cgst_pct:      9,
      sgst_pct:      9,
      igst_pct:      0,
      retention_pct: 5,
      deductions:    [],
    },
  });

  const { fields: dedFields, append: addDed, remove: removeDed } = useFieldArray({
    control,
    name: "deductions",
  });

  const taxMode = watch("tax_mode");

  /* Pre-fill from existing bill data */
  useEffect(() => {
    if (!billData) return;
    reset({
      bill_date:     billData.bill_date ? billData.bill_date.split("T")[0] : "",
      tax_mode:      billData.tax_mode      ?? "instate",
      cgst_pct:      billData.cgst_pct      ?? 9,
      sgst_pct:      billData.sgst_pct      ?? 9,
      igst_pct:      billData.igst_pct      ?? 0,
      retention_pct: billData.retention_pct ?? 5,
      deductions: (billData.deductions ?? []).map((d) =>
        DEDUCTION_PRESETS.includes(d.description)
          ? { description: d.description, amount: d.amount }
          : { description: "__other__", customDescription: d.description, amount: d.amount }
      ),
    });
  }, [billData, reset]);

  /* Submit: PATCH /update-csv?bill_id=... with multipart/form-data */
  const onSubmit = async (values) => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", csvFile);
      if (values.bill_date)     fd.append("bill_date",     values.bill_date);
      fd.append("tax_mode",      values.tax_mode);
      fd.append("cgst_pct",      values.cgst_pct);
      fd.append("sgst_pct",      values.sgst_pct);
      fd.append("igst_pct",      values.igst_pct);
      fd.append("retention_pct", values.retention_pct);

      const cleanDed = values.deductions
        .map((d) => ({
          description: d.description === "__other__" ? (d.customDescription ?? "") : d.description,
          amount: Number(d.amount),
        }))
        .filter((d) => d.description && d.amount);
      if (cleanDed.length) fd.append("deductions", JSON.stringify(cleanDed));

      await axios.patch(
        `${API}/clientbilling/update-csv?bill_id=${billId}`,
        fd,
        { withCredentials: true }
      );
      toast.success("Bill updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update bill");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-base font-bold text-gray-800 dark:text-white">Edit Bill</p>
            <p className="text-xs text-gray-400">{billData?.bill_id} · Draft only</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <TbX size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-5">

            {/* File Upload */}
            <div>
              <Label required>CSV / XLSX File</Label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  csvFile
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
                }`}
              >
                <TbUpload size={22} className={csvFile ? "text-emerald-600 shrink-0" : "text-gray-400 shrink-0"} />
                <div className="min-w-0">
                  {csvFile ? (
                    <>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate">{csvFile.name}</p>
                      <p className="text-xs text-emerald-600/70">{(csvFile.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Click to select CSV / XLSX</p>
                      <p className="text-xs text-gray-400">Columns: Code, Description, Unit, Quantity, Mbook</p>
                    </>
                  )}
                </div>
                {csvFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCsvFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="ml-auto p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0"
                  >
                    <TbX size={14} />
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Bill Date + Retention */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Bill Date">
                <input type="date" {...register("bill_date")} className={inputCls(false)} />
              </Field>
              <Field label="Retention (%)">
                <input type="number" step="0.01" min="0" max="100" {...register("retention_pct")} className={inputCls(false)} />
              </Field>
            </div>

            {/* Tax Settings */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tax Settings</p>
              <Field label="Tax Mode">
                <select {...register("tax_mode")} className={inputCls(false)}>
                  <option value="instate">In-State (CGST + SGST)</option>
                  <option value="otherstate">Other State (IGST)</option>
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                {taxMode === "instate" ? (
                  <>
                    <Field label="CGST %">
                      <input type="number" step="0.01" min="0" {...register("cgst_pct")} className={inputCls(false)} />
                    </Field>
                    <Field label="SGST %">
                      <input type="number" step="0.01" min="0" {...register("sgst_pct")} className={inputCls(false)} />
                    </Field>
                    <Field label="IGST %">
                      <input type="number" value="0" readOnly className={`${inputCls(false)} bg-gray-50 dark:bg-gray-700 text-gray-400 cursor-not-allowed`} />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="CGST %">
                      <input type="number" value="0" readOnly className={`${inputCls(false)} bg-gray-50 dark:bg-gray-700 text-gray-400 cursor-not-allowed`} />
                    </Field>
                    <Field label="SGST %">
                      <input type="number" value="0" readOnly className={`${inputCls(false)} bg-gray-50 dark:bg-gray-700 text-gray-400 cursor-not-allowed`} />
                    </Field>
                    <Field label="IGST %">
                      <input type="number" step="0.01" min="0" {...register("igst_pct")} className={inputCls(false)} />
                    </Field>
                  </>
                )}
              </div>
            </div>

            {/* Deductions */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deductions</p>
                <button
                  type="button"
                  onClick={() => addDed({ description: "", amount: "" })}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                >
                  <TbPlus size={13} /> Add
                </button>
              </div>
              {dedFields.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-2">No deductions — click Add to include one</p>
              )}
              {dedFields.map((field, i) => (
                <DeductionRow
                  key={field.id}
                  index={i}
                  control={control}
                  register={register}
                  onRemove={() => removeDed(i)}
                />
              ))}
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !csvFile}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <TbDeviceFloppy size={14} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default EditClientBill;
