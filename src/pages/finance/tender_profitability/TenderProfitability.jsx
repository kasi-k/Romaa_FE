import { useState } from "react";
import { TrendingUp, RefreshCw, ChevronRight } from "lucide-react";
import { useTenderProfitability } from "../reports/hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtCompact = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e7) return `₹${((n || 0) / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${((n || 0) / 1e5).toFixed(2)} L`;
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const marginColour = (pct) => {
  if (pct === null || pct === undefined) return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500", bar: "bg-gray-300" };
  if (pct > 10) return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" };
  if (pct >= 3) return { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", bar: "bg-amber-400" };
  return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", bar: "bg-red-500" };
};

/* ── Tender Card ──────────────────────────────────────────────────── */
const TenderCard = ({ t }) => {
  const [open, setOpen] = useState(false);
  const mc = marginColour(t.margin_pct);
  const barW = Math.min(Math.max(t.margin_pct || 0, 0), 40) * 2.5;

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${mc.bg}`}>
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{t.tender_name || t.tender_id}</p>
            <p className="text-[10px] text-gray-400 font-mono">{t.tender_id}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-lg font-extrabold tabular-nums ${mc.text}`}>{t.margin_pct != null ? `${Number(t.margin_pct).toFixed(1)}%` : "—"}</p>
            <p className="text-[10px] text-gray-400">Margin</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
          <div className={`h-1.5 rounded-full ${mc.bar}`} style={{ width: `${barW}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><p className="text-gray-400">Contract Value</p><p className="font-semibold text-gray-700 dark:text-gray-200">{fmtCompact(t.contract_value)}</p></div>
          <div><p className="text-gray-400">Revenue Billed</p><p className="font-semibold text-gray-700 dark:text-gray-200">{fmtCompact(t.revenue_billed)}</p></div>
          <div><p className="text-gray-400">Cost Incurred</p><p className="font-semibold text-red-500">{fmtCompact(t.cost_incurred)}</p></div>
          <div><p className="text-gray-400">Gross Profit</p><p className={`font-semibold ${(t.gross_profit || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtCompact(t.gross_profit)}</p></div>
        </div>

        <button onClick={() => setOpen(!open)} className="mt-3 flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ChevronRight size={11} className={`transition-transform ${open ? "rotate-90" : ""}`} />
          {open ? "Hide breakdown" : "Cost breakdown"}
        </button>

        {open && t.cost_breakdown && (
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
            {Object.entries(t.cost_breakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400 capitalize">{k}</span>
                <span className="font-semibold text-gray-600 dark:text-gray-300">{fmtCompact(v)}</span>
              </div>
            ))}
          </div>
        )}

        {t.forecast_margin_pct != null && (
          <p className="mt-2 text-[10px] text-gray-400">
            Forecast at completion: <strong className={mc.text}>{Number(t.forecast_margin_pct).toFixed(1)}%</strong>
            {t.cost_to_complete > 0 && <span> · CTC: {fmtCompact(t.cost_to_complete)}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const TenderProfitability = () => {
  const [params, setParams] = useState({ from_date: "", to_date: "", tender_id: "" });
  const [applied, setApplied] = useState({});

  const { data: tenders = [], isLoading, refetch } = useTenderProfitability(applied);

  const safeT = Array.isArray(tenders) ? tenders : [];
  const portfolioMargin = safeT.length
    ? safeT.reduce((s, t) => s + (t.gross_profit || 0), 0) / Math.max(safeT.reduce((s, t) => s + (t.revenue_billed || 0), 0), 1) * 100
    : null;

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Analytics</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Tender Profitability</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={params.from_date} onChange={(e) => setParams({ ...params, from_date: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          <input type="date" value={params.to_date} onChange={(e) => setParams({ ...params, to_date: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none" />
          <input value={params.tender_id} onChange={(e) => setParams({ ...params, tender_id: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-32" placeholder="Tender ID" />
          <button onClick={() => setApplied({ ...params })} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg">Fetch</button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          {portfolioMargin != null && (
            <div className="ml-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Portfolio Margin</p>
              <p className={`text-lg font-extrabold tabular-nums ${portfolioMargin > 10 ? "text-emerald-600" : portfolioMargin >= 3 ? "text-amber-600" : "text-red-500"}`}>
                {portfolioMargin.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading && <div className="py-12 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeT.map((t) => <TenderCard key={t.tender_id} t={t} />)}
            {!safeT.length && (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <TrendingUp size={44} className="mx-auto opacity-20 mb-3" />
                <p className="text-sm font-semibold">Set a date range and click Fetch to load profitability data.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderProfitability;
