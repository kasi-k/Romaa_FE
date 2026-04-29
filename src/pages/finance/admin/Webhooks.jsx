import { useState } from "react";
import { Webhook, RefreshCw, Plus, Trash2, X, Copy, Check } from "lucide-react";
import {
  useWebhookSubscriptions,
  useCreateWebhookSubscription,
  useDeleteWebhookSubscription,
} from "../shared/hooks/useWebhooks";

/* Spec §42: available finance events */
const EVENTS = [
  "finance.bill.created",
  "finance.bill.approved",
  "finance.payment.created",
  "finance.je.approved",
  "finance.approval.approved",
  "finance.approval.rejected",
  "finance.credit_note.created",
  "finance.debit_note.created",
  "finance.asset.disposed",
  "finance.year_end.closed",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

/* Generate a random hex string for secret pre-fill */
const randSecret = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  }
  let s = "";
  for (let i = 0; i < 64; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
};

/* ── Create Modal ────────────────────────────────────────────────────── */
const NewSubscriptionModal = ({ onClose }) => {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState([]);
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const create = useCreateWebhookSubscription({ onSuccess: onClose });

  const toggleEvent = (ev) => {
    setEvents((es) => (es.includes(ev) ? es.filter((e) => e !== ev) : [...es, ev]));
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800 dark:text-white">New Webhook Subscription</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Target URL</label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inp} placeholder="https://your-system.com/romaa-hook" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">HMAC Secret</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSecret(randSecret())} className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">
                Generate
              </button>
              {secret && (
                <button type="button" onClick={copySecret} className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  {copied ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
                </button>
              )}
            </div>
          </div>
          <input value={secret} onChange={(e) => setSecret(e.target.value)} className={`${inp} font-mono text-[11px]`} placeholder="Used to sign delivery payloads" />
          <p className="text-[10px] text-gray-400 mt-1">Store this safely — it won&apos;t be shown again once saved.</p>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Events to subscribe to</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {EVENTS.map((ev) => {
              const on = events.includes(ev);
              return (
                <button
                  key={ev}
                  type="button"
                  onClick={() => toggleEvent(ev)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-left border transition ${
                    on
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {on ? "✓ " : "  "}{ev}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{events.length} event{events.length !== 1 ? "s" : ""} selected</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button
            onClick={() => create.mutate({ url, events, secret })}
            disabled={!url || !events.length || !secret || create.isPending}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
          >
            {create.isPending ? "Creating…" : "Create subscription"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────────── */
const Webhooks = () => {
  const { data: subscriptions = [], isLoading, refetch } = useWebhookSubscriptions();
  const remove = useDeleteWebhookSubscription();
  const [showNew, setShowNew] = useState(false);

  const rows = Array.isArray(subscriptions) ? subscriptions : [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Webhook size={18} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Admin</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Outbound Webhooks</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
            <Plus size={12} />New Subscription
          </button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4">
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">How deliveries work</p>
          <ul className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 space-y-0.5 list-disc list-inside">
            <li>Each delivery includes <code className="font-mono">X-Romaa-Signature</code>, the HMAC-SHA256 of the raw body using your secret.</li>
            <li>Your server should respond with HTTP 2xx within 10 seconds, else it counts as a failure.</li>
            <li>After 10 consecutive failures the subscription is auto-disabled — delete and re-subscribe to re-enable.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Active subscriptions</p>
            <span className="text-xs text-gray-400">{rows.length}</span>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No subscriptions yet. Click &ldquo;New Subscription&rdquo; to add one.</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/30">
                  <tr>
                    {["URL", "Events", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s._id || s.subscription_id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-4 py-2">
                        <p className="font-mono text-[11px] text-gray-700 dark:text-gray-200 truncate max-w-xs" title={s.url}>{s.url}</p>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(s.events || []).slice(0, 3).map((e) => (
                            <span key={e} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {e.replace("finance.", "")}
                            </span>
                          ))}
                          {(s.events || []).length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] text-gray-400">+{s.events.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.is_active !== false ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {s.is_active !== false ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-400">{fmtDate(s.createdAt)}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this webhook subscription?")) remove.mutate(s._id || s.subscription_id);
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showNew && <NewSubscriptionModal onClose={() => setShowNew(false)} />}
    </div>
  );
};

export default Webhooks;
