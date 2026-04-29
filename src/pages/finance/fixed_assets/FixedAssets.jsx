import { useState } from "react";
import {
  Package, Plus, RefreshCw, BarChart2, XCircle, Archive, Trash2,
  PlayCircle, AlertTriangle
} from "lucide-react";
import {
  useAssetRegister, useAssetList, useCreateAsset,
  useArchiveAsset, usePostDepreciation, useDepreciateOne, useDisposeAsset,
  usePostITDepreciation, useDualDepreciationReport,
} from "./hooks/useFixedAssets";
import DeleteModal from "../../../components/DeleteModal";
import AttachmentsBadge from "../shared/components/AttachmentsBadge";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_CLS = {
  active:             "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700",
  fully_depreciated:  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700",
  disposed:           "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  archived:           "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const CATEGORIES = ["Plant & Machinery", "Vehicles", "Equipment & Tools", "Furniture & Fixtures", "Other"];
const METHODS = ["SLM", "WDV"];

/* ── Create Asset Form ────────────────────────────────────────────── */
const CreateAssetForm = ({ onClose }) => {
  const [form, setForm] = useState({
    asset_name: "", category: "Plant & Machinery",
    acquisition_date: "", acquisition_cost: "", salvage_value: "0",
    depreciation_method: "SLM", useful_life_months: "96", wdv_rate_pct: "0",
    asset_account_code: "1110",
    accumulated_depreciation_account_code: "1110-DEP",
    depreciation_expense_account_code: "5410",
    tender_id: "", narration: "",
    /* IT Act block + rate for dual-depreciation report (spec §5, §24) */
    it_block: "Plant", it_rate_pct: "15", it_acquired_in_year_half: false,
    linked_machinery_id: "",
  });

  const { mutate: create, isPending } = useCreateAsset({ onClose });

  const handleSubmit = (e) => {
    e.preventDefault();
    create({
      ...form,
      acquisition_cost: parseFloat(form.acquisition_cost) || 0,
      salvage_value: parseFloat(form.salvage_value) || 0,
      useful_life_months: parseInt(form.useful_life_months) || 0,
      wdv_rate_pct: parseFloat(form.wdv_rate_pct) || 0,
      it_rate_pct: parseFloat(form.it_rate_pct) || 0,
    });
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">New Fixed Asset</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Asset Name</label>
              <input className={inp} required value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} placeholder="e.g. Tata Hitachi EX210" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Depreciation Method</label>
              <select className={inp} value={form.depreciation_method} onChange={(e) => setForm({ ...form, depreciation_method: e.target.value })}>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Acquisition Date</label>
              <input type="date" className={inp} required value={form.acquisition_date} onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Cost (₹)</label>
              <input type="number" step="0.01" className={inp} required value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Salvage Value (₹)</label>
              <input type="number" step="0.01" className={inp} value={form.salvage_value} onChange={(e) => setForm({ ...form, salvage_value: e.target.value })} />
            </div>
            {form.depreciation_method === "SLM" ? (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Useful Life (months)</label>
                <input type="number" className={inp} required value={form.useful_life_months} onChange={(e) => setForm({ ...form, useful_life_months: e.target.value })} />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">WDV Rate (%/year)</label>
                <input type="number" step="0.01" className={inp} required value={form.wdv_rate_pct} onChange={(e) => setForm({ ...form, wdv_rate_pct: e.target.value })} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">Account Codes</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Asset Account</label>
                <input className={inp} value={form.asset_account_code} onChange={(e) => setForm({ ...form, asset_account_code: e.target.value })} placeholder="1110" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Accum. Dep. Account</label>
                <input className={inp} value={form.accumulated_depreciation_account_code} onChange={(e) => setForm({ ...form, accumulated_depreciation_account_code: e.target.value })} placeholder="1110-DEP" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Dep. Expense Account</label>
                <input className={inp} value={form.depreciation_expense_account_code} onChange={(e) => setForm({ ...form, depreciation_expense_account_code: e.target.value })} placeholder="5410" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">Income Tax Act Classification</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">IT Block</label>
                <select className={inp} value={form.it_block} onChange={(e) => setForm({ ...form, it_block: e.target.value })}>
                  {["Building", "Plant", "Furniture", "Computers", "Vehicles", "Other"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">IT Rate (%)</label>
                <input type="number" step="0.01" className={inp} value={form.it_rate_pct} onChange={(e) => setForm({ ...form, it_rate_pct: e.target.value })} placeholder="15" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="it_half_year"
                  checked={form.it_acquired_in_year_half}
                  onChange={(e) => setForm({ ...form, it_acquired_in_year_half: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="it_half_year" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Acquired in 2nd half of FY (half-year IT rate)
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tender ID (optional)</label>
              <input className={inp} value={form.tender_id} onChange={(e) => setForm({ ...form, tender_id: e.target.value })} placeholder="TND-001" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Linked Machinery ID</label>
              <input className={inp} value={form.linked_machinery_id} onChange={(e) => setForm({ ...form, linked_machinery_id: e.target.value })} placeholder="MCH-003" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Narration</label>
              <input className={inp} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50">
            {isPending ? "Saving…" : "Add Asset"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Dispose Form ─────────────────────────────────────────────────── */
const DisposeForm = ({ assetId, onClose }) => {
  const [form, setForm] = useState({ disposal_date: new Date().toISOString().slice(0, 10), disposal_amount: "0", cash_account_code: "", gain_loss_account_code: "4200", notes: "" });
  const { mutate: dispose, isPending } = useDisposeAsset({ onSuccess: onClose });
  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-400";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); dispose({ id: assetId, ...form, disposal_amount: parseFloat(form.disposal_amount) || 0 }); }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Dispose Asset</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Disposal Date</label><input type="date" className={inp} required value={form.disposal_date} onChange={(e) => setForm({ ...form, disposal_date: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Sale Proceeds (₹, 0 for scrap)</label><input type="number" step="0.01" className={inp} value={form.disposal_amount} onChange={(e) => setForm({ ...form, disposal_amount: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Cash Account Code</label><input className={inp} value={form.cash_account_code} onChange={(e) => setForm({ ...form, cash_account_code: e.target.value })} placeholder="1070-HDFC" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Gain/Loss Account Code</label><input className={inp} value={form.gain_loss_account_code} onChange={(e) => setForm({ ...form, gain_loss_account_code: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label><input className={inp} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">{isPending ? "Processing…" : "Dispose"}</button>
        </div>
      </form>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const FixedAssets = () => {
  const [tab, setTab] = useState("register");
  const [listParams, setListParams] = useState({ page: 1, limit: 20, status: "", category: "" });
  const [registerParams, setRegisterParams] = useState({ as_of_date: new Date().toISOString().slice(0, 10) });
  const [dualParams, setDualParams] = useState({ as_of: new Date().toISOString().slice(0, 10) });
  const [showCreate, setShowCreate] = useState(false);
  const [disposeId, setDisposeId] = useState(null);
  const [archiveId, setArchiveId] = useState(null);
  const [depPeriod, setDepPeriod] = useState("");

  const { data: regData, isLoading: regLoading, refetch: refetchReg } = useAssetRegister(registerParams);
  const { data: listData, isLoading: listLoading, refetch: refetchList } = useAssetList(listParams);
  const { data: dualData, isLoading: dualLoading } = useDualDepreciationReport(dualParams);
  const { mutate: archive } = useArchiveAsset();
  const { mutate: postDep, isPending: depPosting } = usePostDepreciation();
  const { mutate: postITDep, isPending: itDepPosting } = usePostITDepreciation();
  const { mutate: depOne } = useDepreciateOne();

  const register = regData?.rows || [];
  const registerTotals = regData?.totals || {};
  const list = listData?.data || [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <Package size={18} className="text-teal-600 dark:text-teal-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Assets</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Fixed Asset Register</h1>
          </div>
        </div>
        {/* Post depreciation */}
        <div className="flex items-center gap-1.5">
          <input type="month" value={depPeriod} onChange={(e) => setDepPeriod(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          <button
            onClick={() => postDep(depPeriod ? `${depPeriod}-01` : undefined)}
            disabled={depPosting}
            title="Post monthly Book depreciation for all assets"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <PlayCircle size={13} />Book Dep
          </button>
          <button
            onClick={() => postITDep(depPeriod ? `${depPeriod}-01` : undefined)}
            disabled={itDepPosting}
            title="Post IT-Act shadow depreciation (no JE)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <PlayCircle size={13} />IT-Act Dep
          </button>
        </div>
        <button onClick={() => { refetchReg(); refetchList(); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={15} />Add Asset
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 w-fit">
          {[{ key: "register", label: "Register" }, { key: "list", label: "Asset List" }, { key: "dual", label: "Dual Depreciation" }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === key ? "bg-teal-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "register" && (
          <>
            {/* Register filters + totals */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">As of</span>
                <input type="date" value={registerParams.as_of_date}
                  onChange={(e) => setRegisterParams({ ...registerParams, as_of_date: e.target.value })}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400" />
              </div>
              <select value={registerParams.category || ""}
                onChange={(e) => setRegisterParams({ ...registerParams, category: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400">
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Totals strip */}
            {registerTotals.asset_count > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Assets", value: registerTotals.asset_count, cls: "text-gray-800 dark:text-white", isCurrency: false },
                  { label: "Total Cost", value: fmtCompact(registerTotals.total_cost), cls: "text-gray-700 dark:text-gray-200" },
                  { label: "Accum. Dep.", value: fmtCompact(registerTotals.total_accumulated_depreciation), cls: "text-amber-600 dark:text-amber-400" },
                  { label: "Net Book Value", value: fmtCompact(registerTotals.total_net_book_value), cls: "text-teal-600 dark:text-teal-400" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className={`text-base font-extrabold mt-0.5 tabular-nums ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {regLoading && <div className="flex items-center justify-center py-12 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-teal-400 border-t-transparent rounded-full mr-2" />Loading…</div>}

            {!regLoading && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    {["Asset", "Category", "Acquired", "Cost", "Accum. Dep.", "NBV", "Method", "Status", ""].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {register.map((a, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-3 py-2">
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{a.asset_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{a.asset_no}</p>
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-right">{a.category}</td>
                        <td className="px-3 py-2 text-gray-500 text-right">{fmtDate(a.acquisition_date)}</td>
                        <td className="px-3 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(a.acquisition_cost)}</td>
                        <td className="px-3 py-2 tabular-nums text-right text-amber-600 dark:text-amber-400">₹{fmt(a.accumulated_depreciation)}</td>
                        <td className="px-3 py-2 tabular-nums text-right font-semibold text-teal-600 dark:text-teal-400">₹{fmt(a.net_book_value)}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{a.depreciation_method}</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${STATUS_CLS[a.status] || STATUS_CLS.active}`}>{a.status}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <AttachmentsBadge sourceType="FixedAsset" sourceRef={a._id} sourceNo={a.asset_no} />
                        </td>
                      </tr>
                    ))}
                    {!register.length && <tr><td colSpan={9} className="text-center py-12 text-sm text-gray-400">No assets. Click &ldquo;Add Asset&rdquo; to start.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "list" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <select value={listParams.status || ""} onChange={(e) => setListParams({ ...listParams, status: e.target.value, page: 1 })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="fully_depreciated">Fully Depreciated</option>
                <option value="disposed">Disposed</option>
                <option value="archived">Archived</option>
              </select>
              <select value={listParams.category || ""} onChange={(e) => setListParams({ ...listParams, category: e.target.value, page: 1 })}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {listLoading && <div className="flex items-center justify-center py-12 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-teal-400 border-t-transparent rounded-full mr-2" />Loading…</div>}

            {!listLoading && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    {["Asset", "Category", "Cost", "NBV", "Status", "Tender", ""].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {list.map((a) => (
                      <tr key={a._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-3 py-2">
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{a.asset_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{a.asset_no}</p>
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-right">{a.category}</td>
                        <td className="px-3 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(a.acquisition_cost)}</td>
                        <td className="px-3 py-2 tabular-nums text-right font-semibold text-teal-600 dark:text-teal-400">₹{fmt(a.net_book_value)}</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${STATUS_CLS[a.status] || STATUS_CLS.active}`}>{a.status}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-right">{a.tender_id || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {a.status === "active" && (
                              <>
                                <button onClick={() => depOne({ id: a._id })} title="Post depreciation (this asset)" className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700 transition-colors"><BarChart2 size={13} /></button>
                                <button onClick={() => setDisposeId(a._id)} title="Dispose" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors"><AlertTriangle size={13} /></button>
                                <button onClick={() => setArchiveId(a._id)} title="Archive" className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors"><Archive size={13} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!list.length && <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No assets found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "dual" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">As of</span>
                <input type="date" value={dualParams.as_of}
                  onChange={(e) => setDualParams({ ...dualParams, as_of: e.target.value })}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
              </div>
              <p className="text-xs text-gray-400">Book depreciation posts JEs (P&L). IT-Act is a shadow register — no JEs, used for deferred-tax working only.</p>
            </div>

            {dualLoading && <div className="flex items-center justify-center py-12 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full mr-2" />Loading…</div>}

            {!dualLoading && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left" rowSpan={2}>Asset</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center border-l border-gray-200 dark:border-gray-700" colSpan={3}>Book (Companies Act)</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center border-l border-gray-200 dark:border-gray-700" colSpan={3}>IT Act (WDV Block)</th>
                      <th className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right border-l border-gray-200 dark:border-gray-700">Timing Diff</th>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-700">
                      {["Cost", "Accum. Dep.", "NBV"].map((h) => <th key={`b-${h}`} className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">{h}</th>)}
                      {["Cost", "Accum. Dep.", "NBV"].map((h) => <th key={`it-${h}`} className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right border-l border-gray-200 dark:border-gray-700">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(dualData || []).map((a, i) => {
                      const timingDiff = (a.book_nbv || 0) - (a.it_nbv || 0);
                      return (
                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                          <td className="px-3 py-2">
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{a.asset_name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{a.asset_no}</p>
                          </td>
                          <td className="px-3 py-2 tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmtCompact(a.book_cost)}</td>
                          <td className="px-3 py-2 tabular-nums text-right text-amber-600 dark:text-amber-400">₹{fmtCompact(a.book_acc_dep)}</td>
                          <td className="px-3 py-2 tabular-nums text-right font-semibold text-teal-600 dark:text-teal-400">₹{fmtCompact(a.book_nbv)}</td>
                          <td className="px-3 py-2 tabular-nums text-right text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-800">₹{fmtCompact(a.it_cost)}</td>
                          <td className="px-3 py-2 tabular-nums text-right text-amber-600 dark:text-amber-400">₹{fmtCompact(a.it_acc_dep)}</td>
                          <td className="px-3 py-2 tabular-nums text-right font-semibold text-purple-600 dark:text-purple-400">₹{fmtCompact(a.it_nbv)}</td>
                          <td className={`px-3 py-2 tabular-nums text-right font-semibold border-l border-gray-100 dark:border-gray-800 ${timingDiff > 0 ? "text-red-500" : timingDiff < 0 ? "text-emerald-600" : "text-gray-400"}`}>
                            {timingDiff >= 0 ? "+" : ""}₹{fmtCompact(timingDiff)}
                          </td>
                        </tr>
                      );
                    })}
                    {!(dualData || []).length && <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">No dual depreciation data. Run Book + IT-Act depreciation first.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && <CreateAssetForm onClose={() => setShowCreate(false)} />}
      {disposeId && <DisposeForm assetId={disposeId} onClose={() => setDisposeId(null)} />}
      {archiveId && (
        <DeleteModal
          deletetitle="Archive this asset?"
          onclose={() => setArchiveId(null)}
          onDelete={() => { archive(archiveId); setArchiveId(null); }}
        />
      )}
    </div>
  );
};

export default FixedAssets;
