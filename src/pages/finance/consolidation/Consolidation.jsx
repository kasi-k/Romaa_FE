import { useState } from "react";
import { Layers, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import {
  useConsolidationEntities, useConsolidationTrialBalance,
  useConsolidationPnL, useConsolidationInterEntity,
} from "./hooks/useConsolidation";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const ENTITY_COLOURS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-teal-500", "bg-indigo-500", "bg-orange-500",
];

const currentFY = (() => {
  const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
})();

/* ── Entity legend ────────────────────────────────────────────────── */
const EntityLegend = ({ entities, colourMap }) => (
  <div className="flex flex-wrap gap-2">
    {entities.map((e) => (
      <span key={e.tender_id} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
        <span className={`w-2.5 h-2.5 rounded-full ${colourMap[e.tender_id] || "bg-gray-400"}`} />
        {e.tender_name || e.tender_id}
      </span>
    ))}
  </div>
);

/* ── Trial Balance Tab ────────────────────────────────────────────── */
const TrialBalanceTab = ({ params, colourMap }) => {
  const [open, setOpen] = useState({});
  const { data: tbData, isLoading } = useConsolidationTrialBalance(params);
  const rows = Array.isArray(tbData) ? tbData : [];

  return (
    <div className="space-y-3">
      {isLoading && <div className="py-12 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {rows.map((entity) => (
        <div key={entity.entity} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <button onClick={() => setOpen((o) => ({ ...o, [entity.entity]: !o[entity.entity] }))}
            className="w-full flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-left">
            {open[entity.entity] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colourMap[entity.entity] || "bg-gray-400"}`} />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{entity.entity_name || entity.entity}</span>
            <span className="ml-auto text-xs text-gray-400">Dr ₹{fmt(entity.totals?.debit)} / Cr ₹{fmt(entity.totals?.credit)}</span>
          </button>
          {open[entity.entity] && (
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                {["Code", "Account", "Type", "Debit", "Credit", "Balance"].map((h) => (
                  <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right first:text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(entity.rows || []).map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="px-4 py-2 font-mono text-gray-400">{r.account_code}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{r.account_name}</td>
                    <td className="px-4 py-2 text-gray-400">{r.account_type}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-gray-600">₹{fmt(r.debit)}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-gray-600">₹{fmt(r.credit)}</td>
                    <td className={`px-4 py-2 tabular-nums text-right font-semibold ${r.balance >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-600"}`}>₹{fmt(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
      {!isLoading && !rows.length && <div className="text-center py-12 text-sm text-gray-400">No data.</div>}
    </div>
  );
};

/* ── P&L Tab ──────────────────────────────────────────────────────── */
const PnLTab = ({ params, colourMap }) => {
  const { data, isLoading } = useConsolidationPnL(params);
  const entities = data?.entities || [];
  const cons = data?.consolidated;
  const elim = data?.eliminations;

  return (
    <div className="space-y-4">
      {isLoading && <div className="py-12 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {cons && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Consolidated Revenue", value: fmtCompact(cons.total_income), cls: "text-emerald-600 dark:text-emerald-400" },
            { label: "Consolidated Cost", value: fmtCompact(cons.total_expense), cls: "text-red-500 dark:text-red-400" },
            { label: "Net Profit (Consolidated)", value: fmtCompact(cons.net_profit), cls: cons.net_profit >= 0 ? "text-indigo-700 dark:text-indigo-300" : "text-red-600" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-extrabold tabular-nums mt-1 ${cls}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
      {elim && elim.total > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-3 text-xs">
          <p className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Eliminations — ₹{fmt(elim.total)} removed from consolidated totals</p>
          {elim.lines?.map((l, i) => (
            <p key={i} className="text-amber-600 dark:text-amber-400">{l.from_entity} → {l.to_entity}: ₹{fmt(l.amount)} ({l.reason})</p>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entities.map((e) => (
          <div key={e.entity} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <span className={`w-2.5 h-2.5 rounded-full ${colourMap[e.entity] || "bg-gray-400"}`} />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{e.entity_name}</span>
              <span className={`ml-auto text-sm font-extrabold tabular-nums ${e.net_profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtCompact(e.net_profit)}</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-gray-400">Revenue</p><p className="font-semibold text-emerald-600">{fmtCompact(e.total_income)}</p></div>
              <div><p className="text-gray-400">Expenses</p><p className="font-semibold text-red-500">{fmtCompact(e.total_expense)}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Inter-Entity Tab ─────────────────────────────────────────────── */
const InterEntityTab = ({ params }) => {
  const { data: rows, isLoading } = useConsolidationInterEntity(params);
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
      {isLoading && <div className="py-12 text-center text-sm text-gray-400">Loading…</div>}
      {!isLoading && (
        <table className="w-full text-xs">
          <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            {["From Entity", "To Entity", "JE No.", "Account", "Amount", "Reason"].map((h) => (
              <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {safeRows.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.from_entity}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.to_entity}</td>
                <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.je_no}</td>
                <td className="px-4 py-2 text-gray-500">{r.account_name}</td>
                <td className="px-4 py-2 tabular-nums text-right font-semibold text-amber-600 dark:text-amber-400">₹{fmt(r.amount)}</td>
                <td className="px-4 py-2 text-right text-gray-400">{r.reason}</td>
              </tr>
            ))}
            {!safeRows.length && <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No inter-entity transactions.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const Consolidation = () => {
  const [tab, setTab] = useState("pnl");
  const [fy, setFy] = useState(currentFY);
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const { data: entities = [], refetch } = useConsolidationEntities();
  const colourMap = Object.fromEntries(entities.map((e, i) => [e.tender_id, ENTITY_COLOURS[i % ENTITY_COLOURS.length]]));

  const pnlParams = { financial_year: fy };
  const tbParams = { as_of_date: asOf };
  const bsParams = { as_of_date: asOf };
  const ieParams = { financial_year: fy };

  const TABS = [
    { key: "pnl", label: "Profit & Loss" },
    { key: "tb", label: "Trial Balance" },
    { key: "bs", label: "Balance Sheet" },
    { key: "ie", label: "Inter-Entity" },
  ];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Consolidation — Multi-Entity Financials</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">FY</span>
            <input value={fy} onChange={(e) => setFy(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-24" placeholder="25-26" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">As of</span>
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          <EntityLegend entities={entities} colourMap={colourMap} />
        </div>
        <div className="flex gap-1 mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 w-fit">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === key ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {tab === "pnl" && <PnLTab params={pnlParams} colourMap={colourMap} />}
        {tab === "tb" && <TrialBalanceTab params={tbParams} colourMap={colourMap} entities={entities} />}
        {tab === "bs" && <TrialBalanceTab params={bsParams} colourMap={colourMap} entities={entities} />}
        {tab === "ie" && <InterEntityTab params={ieParams} />}
      </div>
    </div>
  );
};

export default Consolidation;
