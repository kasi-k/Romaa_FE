import { useState } from "react";
import { GitMerge, RefreshCw, Upload, Play, XCircle, Link, Unlink, Trash2 } from "lucide-react";
import {
  useGSTMatcherList, useGSTMatcherDetail,
  useUploadGSTEntries, useRunGSTMatch, useUnlinkGSTEntry, useDeleteGSTUpload,
} from "./hooks/useGSTMatcher";

const fmt = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtN = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const MATCH_STATUS_CLS = {
  matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ambiguous: "bg-amber-50 text-amber-700 border-amber-200",
  missing_in_books: "bg-red-50 text-red-600 border-red-200",
  missing_on_portal: "bg-blue-50 text-blue-700 border-blue-200",
  unmatched: "bg-gray-100 text-gray-500 border-gray-200",
};

/* ── Upload Modal ─────────────────────────────────────────────────── */
const UploadModal = ({ onClose }) => {
  const [form, setForm] = useState({ source: "GSTR-2B", return_period: "", entries: "" });
  const { mutate: upload, isPending } = useUploadGSTEntries({ onSuccess: onClose });

  const handleSubmit = (e) => {
    e.preventDefault();
    let entries;
    try { entries = JSON.parse(form.entries); } catch { alert("Invalid JSON in entries"); return; }
    upload({ source: form.source, return_period: form.return_period, entries });
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Upload 2A / 2B Entries</h2>
          <button type="button" onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Source</label>
              <select className={inp} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option>GSTR-2A</option>
                <option>GSTR-2B</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Return Period (MM-YYYY)</label>
              <input className={inp} required value={form.return_period} onChange={(e) => setForm({ ...form, return_period: e.target.value })} placeholder="04-2025" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Entries (JSON array)</label>
            <textarea className={`${inp} h-40 font-mono text-xs resize-none`} required value={form.entries} onChange={(e) => setForm({ ...form, entries: e.target.value })}
              placeholder={`[\n  { "vendor_gstin": "...", "invoice_no": "...", "taxable_value": 100000, "cgst": 9000, "sgst": 9000, "igst": 0, ... }\n]`} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50">
            {isPending ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── Detail Drawer ────────────────────────────────────────────────── */
const DetailDrawer = ({ id, onClose }) => {
  const [activeTab, setActiveTab] = useState("matched");
  const { data, isLoading } = useGSTMatcherDetail(id);
  const { mutate: unlink } = useUnlinkGSTEntry();
  const entries = data?.entries || [];

  const filtered = {
    matched: entries.filter((e) => e.match_status === "matched"),
    ambiguous: entries.filter((e) => e.match_status === "ambiguous"),
    unmatched: entries.filter((e) => ["missing_in_books", "missing_on_portal", "unmatched"].includes(e.match_status)),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Match Results — {data?.source} {data?.return_period}</h2>
            <p className="text-xs text-gray-400">{entries.length} entries</p>
          </div>
          <button onClick={onClose}><XCircle size={18} className="text-gray-400" /></button>
        </div>
        <div className="flex gap-1 px-6 pt-3">
          {[["matched", "Matched"], ["ambiguous", "Ambiguous"], ["unmatched", "Unmatched / Missing"]].map(([k, label]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === k ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              {label} ({filtered[k].length})
            </button>
          ))}
        </div>
        <div className="overflow-auto flex-1 px-6 py-3">
          {isLoading && <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>}
          {!isLoading && (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Vendor GSTIN", "Invoice No.", "Date", "Taxable", "CGST", "SGST", "IGST", "Status", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered[activeTab].map((e, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="px-3 py-2 font-mono text-gray-500">{e.vendor_gstin}</td>
                    <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">{e.invoice_no}</td>
                    <td className="px-3 py-2 text-gray-500">{fmt(e.invoice_date)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmtN(e.taxable_value)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-gray-600">₹{fmtN(e.cgst)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-gray-600">₹{fmtN(e.sgst)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-gray-600">₹{fmtN(e.igst)}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${MATCH_STATUS_CLS[e.match_status] || ""}`}>{e.match_status}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {e.matched_bill_ref && (
                        <button onClick={() => unlink({ id, entry_index: i })} title="Unlink" className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200">
                          <Unlink size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered[activeTab].length && <tr><td colSpan={9} className="text-center py-8 text-sm text-gray-400">No entries in this category.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const GSTMatcher = () => {
  const [params, setParams] = useState({ page: 1, limit: 20, source: "", return_period: "" });
  const [showUpload, setShowUpload] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [matchPeriod, setMatchPeriod] = useState({ return_period: "", source: "GSTR-2B" });

  const { data, isLoading, refetch } = useGSTMatcherList(params);
  const { mutate: runMatch, isPending: matching } = useRunGSTMatch();
  const { mutate: deleteUpload } = useDeleteGSTUpload();
  const rows = data?.data || [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <GitMerge size={18} className="text-teal-600 dark:text-teal-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · GST</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">GSTR-2A / 2B Matcher</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input value={matchPeriod.return_period} onChange={(e) => setMatchPeriod({ ...matchPeriod, return_period: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-28" placeholder="MM-YYYY" />
          <select value={matchPeriod.source} onChange={(e) => setMatchPeriod({ ...matchPeriod, source: e.target.value })}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
            <option>GSTR-2A</option>
            <option>GSTR-2B</option>
          </select>
          <button onClick={() => runMatch(matchPeriod)} disabled={matching || !matchPeriod.return_period}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
            <Play size={13} />{matching ? "Running…" : "Run Match"}
          </button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg">
            <Upload size={14} />Upload 2A/2B
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading && <div className="flex items-center justify-center py-12 text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-teal-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
        {!isLoading && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Source", "Period", "Entries", "Total Tax", "Matched", "Ambiguous", "Missing", ""].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.source}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{r.return_period}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-gray-600">{r.summary?.entry_count ?? (r.entries?.length ?? 0)}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmtN(r.summary?.total_tax)}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-emerald-600">{r.match_summary?.matched ?? "—"}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-amber-600">{r.match_summary?.ambiguous ?? "—"}</td>
                    <td className="px-4 py-2 tabular-nums text-right text-red-500">{r.match_summary?.missing_in_books ?? "—"}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => setDetailId(r._id)} title="View matches" className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-700">
                          <Link size={12} />
                        </button>
                        <button onClick={() => deleteUpload(r._id)} title="Delete upload" className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">No uploads yet. Click "Upload 2A/2B" to start.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {detailId && <DetailDrawer id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
};

export default GSTMatcher;
