import { useState } from "react";
import { Lock, RefreshCw, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import {
  useLedgerSealStatus,
  useLedgerSealList,
  useLedgerSealVerify,
  useLedgerSealVerifySeq,
  useSealApproved,
} from "./hooks/useLedgerSeal";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const TABS = [
  { key: "status", label: "Status" },
  { key: "verify", label: "Verify Range" },
  { key: "chain", label: "Chain Ledger" },
];

/* ── Status Tab ─────────────────────────────────────────────────── */
const StatusTab = () => {
  const { data: status, isLoading } = useLedgerSealStatus();
  const seal = useSealApproved();

  if (isLoading) return <div className="py-12 text-center text-sm text-gray-400">Loading…</div>;

  const isSealed = status?.last_sealed_at != null;
  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-6 flex items-center gap-5 ${isSealed ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"}`}>
        {isSealed ? <ShieldCheck size={36} className="text-emerald-600 shrink-0" /> : <ShieldAlert size={36} className="text-amber-600 shrink-0" />}
        <div>
          <p className={`text-sm font-extrabold ${isSealed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
            {isSealed ? "Ledger Sealed" : "Unsealed Entries Present"}
          </p>
          {isSealed ? (
            <p className="text-xs text-gray-500 mt-1">Last sealed: {status?.last_sealed_at?.slice(0, 10)} · JEs in chain: {status?.sealed_count ?? "—"}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Pending approved JEs: {status?.pending_count ?? "—"}</p>
          )}
          {status?.last_hash && (
            <p className="text-[10px] font-mono text-gray-400 mt-1 truncate max-w-xs">Last hash: {status.last_hash}</p>
          )}
        </div>
        <div className="ml-auto">
          <button onClick={() => seal.mutate()} disabled={seal.isPending}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
            <Lock size={14} />{seal.isPending ? "Sealing…" : "Seal Approved JEs"}
          </button>
        </div>
      </div>

      {status?.stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total JEs Sealed", value: status.stats.total_sealed },
            { label: "Pending (Approved, Unsealed)", value: status.stats.pending_seal },
            { label: "Tamper Alerts", value: status.stats.tamper_alerts, alert: (status.stats.tamper_alerts || 0) > 0 },
          ].map(({ label, value, alert }) => (
            <div key={label} className={`bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-4 ${alert && value ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-800"}`}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-extrabold tabular-nums mt-1 ${alert && value ? "text-red-600" : "text-gray-800 dark:text-white"}`}>{value ?? "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Verify Tab ─────────────────────────────────────────────────── */
const VerifyTab = () => {
  /* Full-chain verify — spec: GET /ledger-seal/verify (no params). */
  const { data: fullVerify, isLoading: loadingFull, refetch } = useLedgerSealVerify();

  /* Sequence-range verify — spec: GET /ledger-seal/verify-seq?from=N&to=N */
  const [range, setRange] = useState({ from: "", to: "" });
  const [applied, setApplied] = useState({});
  const { data: seqVerify, isLoading: loadingSeq } = useLedgerSealVerifySeq(applied);

  const renderResult = (d) => {
    if (!d) return null;
    const ok = d.is_valid ?? d.verified ?? d.all_valid;
    const broken = Array.isArray(d.broken) ? d.broken : d.tampered_entries || [];
    return (
      <div className={`rounded-xl border p-5 ${ok ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"}`}>
        <div className="flex items-center gap-3 mb-3">
          {ok ? <ShieldCheck size={22} className="text-emerald-600" /> : <AlertTriangle size={22} className="text-red-600" />}
          <p className={`text-sm font-bold ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-400"}`}>
            {ok ? "Chain intact — all entries verified" : `${broken.length} tampered entries detected`}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div><p className="text-gray-400">Entries</p><p className="font-bold text-gray-700 dark:text-gray-200">{d.entries_count ?? d.seals_checked ?? d.checked ?? 0}</p></div>
          <div><p className="text-gray-400">Last hash</p><p className="font-mono text-[10px] text-gray-500 truncate">{d.last_hash || "—"}</p></div>
          <div><p className="text-gray-400">Broken</p><p className="font-bold text-gray-700 dark:text-gray-200">{broken.length}</p></div>
        </div>
        {broken.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Tampered seals:</p>
            {broken.map((b, i) => (
              <p key={i} className="text-xs font-mono text-red-600 dark:text-red-400">
                #{b.sequence ?? "?"} · {b.je_no || "—"} — {b.reason || "hash mismatch"}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full chain integrity</p>
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <RefreshCw size={12} /> Recheck
          </button>
        </div>
        {loadingFull ? (
          <div className="py-8 text-center text-sm text-gray-400">Verifying full chain…</div>
        ) : (
          renderResult(fullVerify)
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Verify sequence range
        </p>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            min="1"
            placeholder="From seq"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-32"
          />
          <input
            type="number"
            min="1"
            placeholder="To seq (opt.)"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-32"
          />
          <button
            onClick={() =>
              setApplied({
                from: range.from ? Number(range.from) : undefined,
                to: range.to ? Number(range.to) : undefined,
              })
            }
            disabled={!range.from}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
          >
            Verify range
          </button>
        </div>
        {loadingSeq && <div className="py-4 text-center text-sm text-gray-400">Verifying range…</div>}
        {!loadingSeq && seqVerify && renderResult(seqVerify)}
      </div>
    </div>
  );
};

/* ── Chain Tab ──────────────────────────────────────────────────── */
const ChainTab = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLedgerSealList({ page });
  const rows = Array.isArray(data?.data) ? data.data : [];
  const totalPages = data?.totalPages || 1;
  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
        {isLoading && <div className="py-8 text-center text-sm text-gray-400">Loading…</div>}
        {!isLoading && (
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              {["JE No.", "Date", "Amount", "Sealed At", "Hash (truncated)"].map((h) => (
                <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id || r.je_no} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.je_no}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.date?.slice(0, 10)}</td>
                  <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(r.amount)}</td>
                  <td className="px-4 py-2 text-gray-400">{r.sealed_at?.slice(0, 16)?.replace("T", " ")}</td>
                  <td className="px-4 py-2 text-right font-mono text-gray-400 text-[10px]">{r.hash?.slice(0, 16)}…</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">No sealed entries.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40">Prev</button>
          <span className="text-xs text-gray-500 py-1">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const LedgerSeal = () => {
  const [tab, setTab] = useState("status");

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={18} className="text-slate-600 dark:text-slate-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Ledger Seal — Tamper-Proof Chain</h1>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 w-fit">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === key ? "bg-slate-700 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {tab === "status" && <StatusTab />}
        {tab === "verify" && <VerifyTab />}
        {tab === "chain" && <ChainTab />}
      </div>
    </div>
  );
};

export default LedgerSeal;
