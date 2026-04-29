import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, Search } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useTaggedAssetList } from "../tagged/hooks/useTaggedAsset";
import { useCreateCalibration } from "./hooks/useCalibration";

const RESULTS = ["PASS", "FAIL", "ADJUSTED", "OUT_OF_TOLERANCE"];

const CalibrationForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetAssetRef = params.get("asset_ref");

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [selected, setSelected] = useState(null);

  const { data: taggedData } = useTaggedAssetList({
    search: debounced || undefined,
    asset_class: undefined,
    limit: 15,
  });
  const taggedRows = taggedData?.data?.rows || taggedData?.data || [];

  // resolve preset asset
  useEffect(() => {
    if (presetAssetRef && taggedRows.length && !selected) {
      const found = taggedRows.find((r) => r._id === presetAssetRef);
      if (found) setSelected(found);
    }
  }, [presetAssetRef, taggedRows, selected]);

  const today = new Date().toISOString().slice(0, 10);
  const oneYear = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const [form, setForm] = useState({
    calibration_date: today,
    next_due_date: oneYear,
    agency_name: "",
    agency_accreditation: "",
    agency_contact: "",
    certificate_number: "",
    certificate_url: "",
    result: "PASS",
    cost: "",
    invoice_number: "",
    performed_by: "",
    notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [measurements, setMeasurements] = useState([
    { parameter: "", expected: "", actual: "", deviation: "", within_tolerance: true },
  ]);
  const setM = (i, k, v) => setMeasurements((arr) => arr.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addM = () =>
    setMeasurements((arr) => [...arr, { parameter: "", expected: "", actual: "", deviation: "", within_tolerance: true }]);
  const removeM = (i) => setMeasurements((arr) => arr.filter((_, j) => j !== i));

  const { mutate, isPending } = useCreateCalibration({
    onDone: () => navigate("/asset/calibration"),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!selected?._id || !form.certificate_number || !form.certificate_url) return;
    const payload = {
      asset_ref: selected._id,
      calibration_date: form.calibration_date,
      next_due_date: form.next_due_date,
      agency_name: form.agency_name,
      agency_accreditation: form.agency_accreditation || undefined,
      agency_contact: form.agency_contact || undefined,
      certificate_number: form.certificate_number,
      certificate_url: form.certificate_url,
      result: form.result,
      measurements: measurements.filter((m) => m.parameter),
      cost: form.cost ? Number(form.cost) : undefined,
      invoice_number: form.invoice_number || undefined,
      performed_by: form.performed_by || undefined,
      notes: form.notes || undefined,
    };
    mutate(payload);
  };

  return (
    <div className="font-roboto-flex p-4 max-w-4xl">
      <button onClick={() => navigate("/asset/calibration")} className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3">
        <ArrowLeft size={14} /> Cancel
      </button>

      <form onSubmit={submit} className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
        <h1 className="text-xl font-bold">Record Calibration</h1>

        <Field label="Asset" required>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Survey / Lab tagged asset…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
            />
          </div>
          {!selected && taggedRows.length > 0 && (
            <div className="mt-1 max-h-40 overflow-auto border border-gray-200 dark:border-gray-800 rounded-md">
              {taggedRows.map((r) => (
                <button
                  key={r.asset_id}
                  type="button"
                  onClick={() => setSelected(r)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800"
                >
                  <span className="font-mono mr-2">{r.asset_id}</span>
                  {r.asset_name}
                </button>
              ))}
            </div>
          )}
          {selected && (
            <div className="mt-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md p-2 text-xs flex items-center justify-between">
              <span><b>{selected.asset_name}</b> <span className="font-mono ml-1">{selected.asset_id}</span></span>
              <button type="button" onClick={() => setSelected(null)} className="cursor-pointer text-red-600">Change</button>
            </div>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Calibration Date" required>
            <input type="date" value={form.calibration_date} onChange={(e) => set("calibration_date", e.target.value)} className={input} required />
          </Field>
          <Field label="Next Due Date" required>
            <input type="date" value={form.next_due_date} onChange={(e) => set("next_due_date", e.target.value)} className={input} required />
          </Field>
          <Field label="Result">
            <select value={form.result} onChange={(e) => set("result", e.target.value)} className={input}>
              {RESULTS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Agency Name" required>
            <input value={form.agency_name} onChange={(e) => set("agency_name", e.target.value)} className={input} required />
          </Field>
          <Field label="Accreditation">
            <input value={form.agency_accreditation} onChange={(e) => set("agency_accreditation", e.target.value)} placeholder="NABL / ISO 17025" className={input} />
          </Field>
          <Field label="Agency Contact">
            <input value={form.agency_contact} onChange={(e) => set("agency_contact", e.target.value)} className={input} />
          </Field>
          <Field label="Certificate Number" required>
            <input value={form.certificate_number} onChange={(e) => set("certificate_number", e.target.value)} className={input} required />
          </Field>
          <Field label="Certificate URL (S3)" required>
            <input value={form.certificate_url} onChange={(e) => set("certificate_url", e.target.value)} className={input} required />
          </Field>
          <Field label="Performed By">
            <input value={form.performed_by} onChange={(e) => set("performed_by", e.target.value)} className={input} />
          </Field>
          <Field label="Cost (₹)">
            <input type="number" step="0.01" value={form.cost} onChange={(e) => set("cost", e.target.value)} className={input} />
          </Field>
          <Field label="Invoice #">
            <input value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} className={input} />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Measurements</h3>
            <button type="button" onClick={addM} className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded">
              <Plus size={12} /> Add row
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-500">
              <tr>
                <th className="text-left px-2 py-1">Parameter</th>
                <th className="text-left px-2 py-1">Expected</th>
                <th className="text-left px-2 py-1">Actual</th>
                <th className="text-left px-2 py-1">Deviation</th>
                <th className="text-center px-2 py-1">Within</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-1"><input value={m.parameter} onChange={(e) => setM(i, "parameter", e.target.value)} className={input} /></td>
                  <td className="px-1"><input value={m.expected} onChange={(e) => setM(i, "expected", e.target.value)} className={input} /></td>
                  <td className="px-1"><input value={m.actual} onChange={(e) => setM(i, "actual", e.target.value)} className={input} /></td>
                  <td className="px-1"><input value={m.deviation} onChange={(e) => setM(i, "deviation", e.target.value)} className={input} /></td>
                  <td className="text-center"><input type="checkbox" checked={m.within_tolerance} onChange={(e) => setM(i, "within_tolerance", e.target.checked)} className="cursor-pointer accent-blue-600" /></td>
                  <td>
                    <button type="button" onClick={() => removeM(i)} className="cursor-pointer text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Field label="Notes">
          <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={`${input} resize-none`} />
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !selected || !form.certificate_number || !form.certificate_url}
            className="cursor-pointer flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            <Save size={14} /> {isPending ? "Saving…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

const input = "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md";
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default CalibrationForm;
