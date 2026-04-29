import { useState, useRef } from "react";
import { FileSearch, RefreshCw, Upload, Trash2 } from "lucide-react";
import { useForm26ASList, useForm26ASReconcile, useUploadForm26AS, useDeleteForm26AS } from "./hooks/useForm26AS";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const currentFY = (() => {
  const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
})();

const TABS = [
  { key: "matched", label: "Matched" },
  { key: "only26as", label: "Only in 26AS" },
  { key: "onlybooks", label: "Only in Books" },
];

/* ── Upload Modal ───────────────────────────────────────────────── */
const UploadModal = ({ onClose }) => {
  const [text, setText] = useState("");
  const upload = useUploadForm26AS({ onSuccess: onClose });

  const handleUpload = () => {
    try {
      const entries = JSON.parse(text);
      upload.mutate(Array.isArray(entries) ? entries : [entries]);
    } catch {
      alert("Invalid JSON. Paste an array of 26AS entries.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-3">
        <p className="text-sm font-bold text-gray-800 dark:text-white">Upload Form 26AS Entries (JSON)</p>
        <p className="text-xs text-gray-400">Paste a JSON array of entries: deductor_name, tan, amount, tds_amount, financial_year, quarter, date.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
          placeholder='[{"deductor_name":"ABC Ltd","tan":"AABC12345A","amount":100000,"tds_amount":10000,"financial_year":"25-26","quarter":"Q1"}]'
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-mono bg-white dark:bg-gray-800 dark:text-white focus:outline-none resize-none" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleUpload} disabled={!text || upload.isPending}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
            {upload.isPending ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────── */
const Form26AS = () => {
  const [fy, setFy] = useState(currentFY);
  const [quarter, setQuarter] = useState("Q1");
  const [tab, setTab] = useState("matched");
  const [showUpload, setShowUpload] = useState(false);
  const [listPage, setListPage] = useState(1);

  const { data: listData, isLoading: listLoading, refetch } = useForm26ASList({ financial_year: fy, page: listPage });
  const { data: reconcile, isLoading: reconLoading } = useForm26ASReconcile({ financial_year: fy, quarter });
  const deleteMut = useDeleteForm26AS();

  const rows = Array.isArray(listData?.data) ? listData.data : [];
  const totalPages = listData?.totalPages || 1;

  const matched = Array.isArray(reconcile?.matched) ? reconcile.matched : [];
  const only26as = Array.isArray(reconcile?.only_in_26as) ? reconcile.only_in_26as : [];
  const onlyBooks = Array.isArray(reconcile?.only_in_books) ? reconcile.only_in_books : [];

  const tabRows = tab === "matched" ? matched : tab === "only26as" ? only26as : onlyBooks;

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <FileSearch size={18} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Enterprise</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Form 26AS Reconciliation</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 font-semibold">FY</span>
            <input value={fy} onChange={(e) => setFy(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-24" placeholder="25-26" />
          </div>
          <select value={quarter} onChange={(e) => setQuarter(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
            {["Q1","Q2","Q3","Q4"].map((q) => <option key={q}>{q}</option>)}
          </select>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">
            <Upload size={13} />Upload 26AS
          </button>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>

          {reconcile && (
            <div className="ml-auto flex gap-3 text-xs">
              {[
                { label: "Matched", count: matched.length, cls: "text-emerald-600" },
                { label: "Only 26AS", count: only26as.length, cls: "text-amber-600" },
                { label: "Only Books", count: onlyBooks.length, cls: "text-red-500" },
              ].map(({ label, count, cls }) => (
                <div key={label} className="text-center">
                  <p className={`text-lg font-extrabold tabular-nums ${cls}`}>{count}</p>
                  <p className="text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Reconciliation Tabs */}
        <div>
          <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 w-fit mb-3">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === key ? "bg-blue-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {reconLoading && <div className="py-10 text-center text-sm text-gray-400">Loading reconciliation…</div>}
            {!reconLoading && (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Deductor", "TAN", "Amount", "TDS", "Quarter", "Match Status"].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {tabRows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">{r.deductor_name}</td>
                      <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.tan}</td>
                      <td className="px-4 py-2 tabular-nums text-right text-gray-600">₹{fmt(r.amount)}</td>
                      <td className="px-4 py-2 tabular-nums text-right font-semibold text-red-500">₹{fmt(r.tds_amount)}</td>
                      <td className="px-4 py-2 text-gray-400">{r.quarter}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tab === "matched" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                          tab === "only26as" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>
                          {tab === "matched" ? "Matched" : tab === "only26as" ? "26AS Only" : "Books Only"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!tabRows.length && <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No records in this category.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Raw uploaded entries */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Uploaded 26AS Entries</p>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {listLoading && <div className="py-8 text-center text-sm text-gray-400">Loading…</div>}
            {!listLoading && (
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Deductor", "TAN", "Amount", "TDS", "FY", "Quarter", ""].map((h) => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left last:text-right">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{r.deductor_name}</td>
                      <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.tan}</td>
                      <td className="px-4 py-2 tabular-nums text-right text-gray-600">₹{fmt(r.amount)}</td>
                      <td className="px-4 py-2 tabular-nums text-right text-red-500">₹{fmt(r.tds_amount)}</td>
                      <td className="px-4 py-2 text-gray-400">{r.financial_year}</td>
                      <td className="px-4 py-2 text-gray-400">{r.quarter}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => deleteMut.mutate(r._id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No entries uploaded.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-2">
              <button disabled={listPage === 1} onClick={() => setListPage((p) => p - 1)}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40">Prev</button>
              <span className="text-xs text-gray-500 py-1">{listPage} / {totalPages}</span>
              <button disabled={listPage === totalPages} onClick={() => setListPage((p) => p + 1)}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};

export default Form26AS;
