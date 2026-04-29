import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useTaggedAssetList } from "../tagged/hooks/useTaggedAsset";
import { useBulkInventoryList } from "../bulk/hooks/useBulkInventory";
import { useCreateIssuance } from "./hooks/useIssuance";
import StatusChip from "../_shared/StatusChip";

const STEPS = ["Pick Asset", "Pick Custodian", "Issue Details", "Handover Proof"];
const KINDS = ["TAGGED", "BULK", "MACHINERY"];
const RECIPIENT_KINDS = ["EMPLOYEE", "CONTRACTOR", "CONTRACT_WORKER", "SITE"];
const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"];

const IssuanceCreate = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    asset_kind: params.get("asset_kind") || "TAGGED",
    asset: null,
    assigned_to_kind: "EMPLOYEE",
    assigned_to_id: "",
    assigned_to_name: "",
    contractor_id: "",
    project_id: "",
    site_name: "",
    quantity: 1,
    issue_date: new Date().toISOString().slice(0, 10),
    expected_return_date: "",
    condition_on_issue: "GOOD",
    purpose: "",
    handover_signature_url: "",
    handover_photo_url: "",
  });
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const { mutate, isPending } = useCreateIssuance({
    onDone: (saved) => {
      if (saved?.issue_id) navigate(`/asset/issuance/${saved.issue_id}`);
      else navigate("/asset/issuance");
    },
  });

  const submit = () => {
    if (!data.asset?._id) return;
    if (!data.expected_return_date) return;
    const payload = {
      asset_kind: data.asset_kind,
      asset_ref: data.asset._id,
      assigned_to_kind: data.assigned_to_kind,
      assigned_to_id: data.assigned_to_id || undefined,
      assigned_to_name: data.assigned_to_name || undefined,
      contractor_id: data.contractor_id || undefined,
      project_id: data.project_id || undefined,
      site_name: data.site_name || undefined,
      quantity: data.asset_kind === "BULK" ? Number(data.quantity) : 1,
      issue_date: data.issue_date,
      expected_return_date: data.expected_return_date,
      condition_on_issue: data.condition_on_issue,
      purpose: data.purpose || undefined,
      handover_signature_url: data.handover_signature_url || undefined,
      handover_photo_url: data.handover_photo_url || undefined,
    };
    mutate(payload);
  };

  const canNext = useMemo(() => {
    if (step === 0) return !!data.asset?._id;
    if (step === 1) return !!data.assigned_to_name;
    if (step === 2) return !!data.expected_return_date && (data.asset_kind !== "BULK" || Number(data.quantity) > 0);
    return true;
  }, [step, data]);

  return (
    <div className="font-roboto-flex p-4">
      <button onClick={() => navigate("/asset/issuance")} className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3">
        <ArrowLeft size={14} /> Cancel
      </button>

      <div className="bg-white dark:bg-layout-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
                i < step ? "bg-emerald-600 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "font-bold text-gray-900 dark:text-white" : "text-gray-500"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />}
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          {step === 0 && <PickAssetStep data={data} set={set} />}
          {step === 1 && <PickCustodianStep data={data} set={set} />}
          {step === 2 && <DetailsStep data={data} set={set} />}
          {step === 3 && <ProofStep data={data} set={set} />}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
          >
            <ArrowLeft size={14} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={isPending || !data.expected_return_date}
              className="cursor-pointer px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50"
            >
              {isPending ? "Submitting…" : "Submit Issuance"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const input = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md";
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const PickAssetStep = ({ data, set }) => {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);

  const tagged = useTaggedAssetList(
    data.asset_kind === "TAGGED" ? { search: debounced || undefined, status: "ACTIVE", limit: 15 } : { limit: 0 },
  );
  const bulk = useBulkInventoryList(
    data.asset_kind === "BULK" ? { search: debounced || undefined, is_active: "true", limit: 15 } : { limit: 0 },
  );

  const taggedRows = tagged.data?.data?.rows || tagged.data?.data || [];
  const bulkRows = bulk.data?.data?.rows || bulk.data?.data || [];
  const machineryRows = []; // out-of-scope picker; user can use the Machinery list to issue

  const rows =
    data.asset_kind === "TAGGED" ? taggedRows :
    data.asset_kind === "BULK" ? bulkRows : machineryRows;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => { set("asset_kind", k); set("asset", null); set("quantity", k === "BULK" ? 1 : 1); }}
            className={`cursor-pointer px-3 py-1.5 text-xs rounded ${
              data.asset_kind === k ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {data.asset_kind === "MACHINERY" ? (
        <div className="text-sm text-gray-500 p-6 text-center">
          Machinery issuance is initiated from the Machinery detail page (operator handover).
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search asset…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
            />
          </div>
          <div className="max-h-72 overflow-auto border border-gray-200 dark:border-gray-800 rounded-md">
            {rows.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No assets found.</p>
            ) : rows.map((r) => {
              const id = r.asset_id || r.item_id;
              const name = r.asset_name || r.item_name;
              return (
                <button
                  key={id}
                  onClick={() => set("asset", r)}
                  className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800 ${
                    data.asset?._id === r._id
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{id}</span>
                    <span className="font-semibold">{name}</span>
                    {r.status && <StatusChip value={r.status} />}
                    {data.asset_kind === "BULK" && (
                      <span className="ml-auto text-xs text-gray-500">
                        Avail: {r.total_qty_available} {r.unit_of_measure}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {data.asset && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md p-3 text-sm">
              Selected: <strong>{data.asset.asset_name || data.asset.item_name}</strong>
              <span className="ml-2 font-mono text-xs">{data.asset.asset_id || data.asset.item_id}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PickCustodianStep = ({ data, set }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <Field label="Recipient kind">
      <select value={data.assigned_to_kind} onChange={(e) => set("assigned_to_kind", e.target.value)} className={input}>
        {RECIPIENT_KINDS.map((k) => <option key={k}>{k}</option>)}
      </select>
    </Field>
    <Field label="Recipient ID">
      <input value={data.assigned_to_id} onChange={(e) => set("assigned_to_id", e.target.value)} placeholder="EMP-021 / contractor / site" className={input} />
    </Field>
    <Field label="Recipient Name" required>
      <input value={data.assigned_to_name} onChange={(e) => set("assigned_to_name", e.target.value)} className={input} />
    </Field>
    {data.assigned_to_kind === "CONTRACT_WORKER" && (
      <Field label="Contractor ID">
        <input value={data.contractor_id} onChange={(e) => set("contractor_id", e.target.value)} className={input} />
      </Field>
    )}
    <Field label="Project ID">
      <input value={data.project_id} onChange={(e) => set("project_id", e.target.value)} placeholder="TND-007" className={input} />
    </Field>
    <Field label="Site Name">
      <input value={data.site_name} onChange={(e) => set("site_name", e.target.value)} className={input} />
    </Field>
  </div>
);

const DetailsStep = ({ data, set }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {data.asset_kind === "BULK" && (
      <Field label="Quantity" required>
        <input
          type="number"
          min="1"
          max={data.asset?.total_qty_available}
          value={data.quantity}
          onChange={(e) => set("quantity", e.target.value)}
          className={input}
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Available: {data.asset?.total_qty_available} {data.asset?.unit_of_measure}
        </p>
      </Field>
    )}
    <Field label="Issue Date">
      <input type="date" value={data.issue_date} onChange={(e) => set("issue_date", e.target.value)} className={input} />
    </Field>
    <Field label="Expected Return" required>
      <input type="date" value={data.expected_return_date} onChange={(e) => set("expected_return_date", e.target.value)} className={input} />
    </Field>
    <Field label="Condition on Issue">
      <select value={data.condition_on_issue} onChange={(e) => set("condition_on_issue", e.target.value)} className={input}>
        {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
      </select>
    </Field>
    <div className="md:col-span-2">
      <Field label="Purpose">
        <textarea rows={3} value={data.purpose} onChange={(e) => set("purpose", e.target.value)} className={`${input} resize-none`} />
      </Field>
    </div>
  </div>
);

const ProofStep = ({ data, set }) => (
  <div className="space-y-3">
    <p className="text-xs text-gray-500">
      Upload to S3 and paste the URLs here. (Native uploader integration is left as a follow-up.)
    </p>
    <Field label="Photo URL">
      <input value={data.handover_photo_url} onChange={(e) => set("handover_photo_url", e.target.value)} className={input} />
    </Field>
    <Field label="Signature URL">
      <input value={data.handover_signature_url} onChange={(e) => set("handover_signature_url", e.target.value)} className={input} />
    </Field>
    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-xs">
      <p className="font-bold mb-1">Summary</p>
      <p>{data.asset_kind} · {data.asset?.asset_id || data.asset?.item_id} · {data.asset?.asset_name || data.asset?.item_name}</p>
      <p>To: {data.assigned_to_name} ({data.assigned_to_kind})</p>
      <p>Project: {data.project_id || "—"} · Site: {data.site_name || "—"}</p>
      <p>Issue: {data.issue_date} · Expected return: {data.expected_return_date || "—"}</p>
      {data.asset_kind === "BULK" && <p>Quantity: {data.quantity} {data.asset?.unit_of_measure}</p>}
    </div>
  </div>
);

export default IssuanceCreate;
