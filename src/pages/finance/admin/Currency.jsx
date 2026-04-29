import { useState } from "react";
import {
  Coins, RefreshCw, Plus, Power, PowerOff, TrendingUp, X,
} from "lucide-react";
import {
  useCurrencyList, useCurrencyRates,
  useUpsertCurrency, useUpsertExchangeRate, useDeactivateCurrency,
} from "../shared/hooks/useCurrency";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const todayStr = () => new Date().toISOString().split("T")[0];

/* ── Upsert Currency Modal ────────────────────────────────────────────── */
const UpsertCurrencyModal = ({ initial, onClose }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    code: initial?.code || "",
    name: initial?.name || "",
    symbol: initial?.symbol || "",
    decimals: initial?.decimals ?? 2,
    is_base: initial?.is_base ?? false,
    is_active: initial?.is_active ?? true,
  });
  const upsert = useUpsertCurrency({ onSuccess: onClose });

  const submit = () => {
    upsert.mutate({
      ...form,
      code: form.code.trim().toUpperCase(),
      decimals: Number(form.decimals) || 0,
    });
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800 dark:text-white">
            {isEdit ? `Edit ${initial.code}` : "Add Currency"}
          </p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className={`${inp} font-mono`}
              placeholder="USD"
              disabled={isEdit}
              maxLength={3}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Symbol</label>
            <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} className={inp} placeholder="$" />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} placeholder="US Dollar" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Decimals</label>
            <input type="number" min={0} max={6} value={form.decimals} onChange={(e) => setForm({ ...form, decimals: e.target.value })} className={inp} />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="is_active" className="text-xs text-gray-600 dark:text-gray-300 font-semibold">Active</label>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="is_base" checked={form.is_base} onChange={(e) => setForm({ ...form, is_base: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="is_base" className="text-xs text-gray-600 dark:text-gray-300 font-semibold">Base currency (usually INR)</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button
            onClick={submit}
            disabled={!form.code || !form.name || upsert.isPending}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
          >
            {upsert.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Upsert Exchange Rate Modal ───────────────────────────────────────── */
const UpsertRateModal = ({ currency, onClose }) => {
  const [form, setForm] = useState({
    from_currency: currency,
    date: todayStr(),
    rate: "",
    source: "manual",
    narration: "",
  });
  const upsert = useUpsertExchangeRate({ onSuccess: onClose });

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800 dark:text-white">Set Exchange Rate — {currency}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Rate (INR per 1 {currency})</label>
            <input type="number" step="0.0001" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className={inp} placeholder="83.50" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Source</label>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inp}>
              <option value="manual">Manual</option>
              <option value="rbi">RBI</option>
              <option value="xe">XE.com</option>
              <option value="bank">Bank quote</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Narration</label>
            <input value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} className={inp} placeholder="RBI reference rate" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button
            onClick={() => upsert.mutate({ ...form, rate: Number(form.rate) })}
            disabled={!form.rate || upsert.isPending}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
          >
            {upsert.isPending ? "Saving…" : "Save Rate"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Rate History Panel ───────────────────────────────────────────────── */
const RateHistory = ({ currency }) => {
  const { data: rates = [], isLoading } = useCurrencyRates(currency, 30);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <TrendingUp size={14} className="text-gray-400" />
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Rate History — {currency}</p>
        <span className="ml-auto text-xs text-gray-400">{rates.length}</span>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-gray-400">Loading…</div>
        ) : rates.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">No rates recorded for this currency</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/30">
              <tr>
                {["Date", "Rate (INR)", "Source", "Narration"].map((h) => (
                  <th key={h} className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rates.map((r, i) => (
                <tr key={r._id || i} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{fmtDate(r.date)}</td>
                  <td className="px-4 py-2 tabular-nums font-semibold text-gray-700 dark:text-gray-200">₹{Number(r.rate || 0).toFixed(4)}</td>
                  <td className="px-4 py-2 text-gray-400 capitalize">{r.source || "—"}</td>
                  <td className="px-4 py-2 text-gray-500">{r.narration || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────────── */
const Currency = () => {
  const { data: currencies = [], isLoading, refetch } = useCurrencyList();
  const deactivate = useDeactivateCurrency();
  const [editing, setEditing] = useState(null);
  const [addingRate, setAddingRate] = useState(null);
  const [selected, setSelected] = useState(null);

  const rows = Array.isArray(currencies) ? currencies : [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Coins size={18} className="text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Admin</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Currencies &amp; Exchange Rates</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing({})} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
            <Plus size={12} />Add Currency
          </button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Currencies</p>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/30">
                  <tr>
                    {["Code", "Name", "Symbol", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr
                      key={c.code}
                      onClick={() => setSelected(c.code)}
                      className={`border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 ${selected === c.code ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                    >
                      <td className="px-4 py-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.code}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-200">
                        {c.name}
                        {c.is_base && <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">BASE</span>}
                      </td>
                      <td className="px-4 py-2 text-gray-500">{c.symbol}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setAddingRate(c.code); }}
                            className="px-2 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            + Rate
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditing(c); }}
                            className="px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          >
                            Edit
                          </button>
                          {c.is_active && !c.is_base && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Deactivate ${c.code}?`)) deactivate.mutate(c.code);
                              }}
                              className="px-1.5 py-1 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Deactivate"
                            >
                              <PowerOff size={11} />
                            </button>
                          )}
                          {!c.is_active && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditing({ ...c, is_active: true }); }}
                              className="px-1.5 py-1 text-[10px] text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                              title="Reactivate"
                            >
                              <Power size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No currencies configured yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selected ? (
          <RateHistory currency={selected} />
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center">
            <TrendingUp size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-400">Select a currency on the left to view its rate history</p>
          </div>
        )}
      </div>

      {editing && <UpsertCurrencyModal initial={editing.code ? editing : null} onClose={() => setEditing(null)} />}
      {addingRate && <UpsertRateModal currency={addingRate} onClose={() => setAddingRate(null)} />}
    </div>
  );
};

export default Currency;
