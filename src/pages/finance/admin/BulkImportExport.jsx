import { useRef, useState } from "react";
import {
  Download, Upload, FileText, CheckCircle2, AlertTriangle, Loader2, FileDown,
} from "lucide-react";
import {
  downloadBulkTemplate,
  useBulkImport,
  useBulkImportJob,
  downloadBulkExport,
} from "../shared/hooks/useBulkImportExport";

/* Spec §10 supported modules */
const IMPORT_MODULES = [
  { value: "purchasebill", label: "Purchase Bill" },
  { value: "paymentvoucher", label: "Payment Voucher" },
  { value: "receiptvoucher", label: "Receipt Voucher" },
  { value: "journalentry", label: "Journal Entry" },
  { value: "expensevoucher", label: "Expense Voucher" },
  { value: "creditnote", label: "Credit Note" },
  { value: "debitnote", label: "Debit Note" },
];

const REPORT_EXPORTS = [
  { value: "trial_balance", label: "Trial Balance" },
  { value: "profit_loss", label: "Profit &amp; Loss" },
  { value: "ledger", label: "General Ledger" },
  { value: "aged_payables", label: "Aged Payables" },
];

const todayStr = () => new Date().toISOString().split("T")[0];

/* ── Import Panel ───────────────────────────────────────────────────── */
const ImportPanel = () => {
  const inputRef = useRef(null);
  const [module, setModule] = useState("purchasebill");
  const [jobId, setJobId] = useState(null);
  const imp = useBulkImport({ onSuccess: (data) => setJobId(data?.job_id) });
  const { data: job } = useBulkImportJob(jobId);

  const pickFile = () => inputRef.current?.click();
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    imp.mutate({ module, file });
    e.target.value = "";
  };

  const pct = job?.total ? Math.round(((job.success + job.failed) / job.total) * 100) : 0;
  const done = job?.status === "completed" || job?.status === "failed";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Upload size={14} className="text-emerald-500" />
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Bulk Import</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-end">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Module</label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none"
            >
              {IMPORT_MODULES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => downloadBulkTemplate(module)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 dark:border-gray-700 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FileDown size={12} />Template
          </button>
          <button
            onClick={pickFile}
            disabled={imp.isPending}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
          >
            <Upload size={12} />
            {imp.isPending ? "Uploading…" : "Upload CSV"}
          </button>
          <input ref={inputRef} type="file" accept=".csv,.xlsx" hidden onChange={onFile} />
        </div>

        <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/40 px-3 py-2 flex items-start gap-2">
          <AlertTriangle size={12} className="text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
            Download the template first — the backend expects matching column headers. Max 10MB per file.
          </p>
        </div>

        {jobId && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40">
              {!done ? <Loader2 size={13} className="animate-spin text-blue-500" /> : job?.status === "completed" ? <CheckCircle2 size={13} className="text-emerald-500" /> : <AlertTriangle size={13} className="text-red-500" />}
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {job?.filename || "Import job"} · {job?.status || "pending"}
              </p>
              <span className="ml-auto text-[10px] text-gray-400 font-mono">{jobId}</span>
            </div>
            <div className="p-4 space-y-3">
              {job && (
                <>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${job.status === "failed" ? "bg-red-500" : job.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Success</p>
                      <p className="font-bold text-emerald-600">{job.success ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Failed</p>
                      <p className="font-bold text-red-500">{job.failed ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total</p>
                      <p className="font-bold text-gray-700 dark:text-gray-200">{job.total ?? 0}</p>
                    </div>
                  </div>
                  {Array.isArray(job.errors) && job.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-red-100 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 rounded-lg p-2">
                      <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">Row errors ({job.errors.length})</p>
                      <ul className="text-[11px] text-red-700/90 dark:text-red-300/90 space-y-0.5 font-mono">
                        {job.errors.slice(0, 50).map((e, i) => (
                          <li key={i}>Row {e.row}: {e.message}</li>
                        ))}
                        {job.errors.length > 50 && <li className="text-[10px] italic">…+{job.errors.length - 50} more</li>}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Export Panel ───────────────────────────────────────────────────── */
const ExportPanel = () => {
  const ALL_EXPORTS = [...IMPORT_MODULES, ...REPORT_EXPORTS];
  const [module, setModule] = useState("purchasebill");
  const [format, setFormat] = useState("excel");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(todayStr());
  const [finYear, setFinYear] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await downloadBulkExport(module, {
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        fin_year: finYear || undefined,
        format,
      });
    } finally {
      setBusy(false);
    }
  };

  const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Download size={14} className="text-blue-500" />
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Export</p>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Module / Report</label>
          <select value={module} onChange={(e) => setModule(e.target.value)} className={inp}>
            <optgroup label="Vouchers &amp; Bills">
              {IMPORT_MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </optgroup>
            <optgroup label="Reports">
              {REPORT_EXPORTS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inp} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inp} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">FY (opt.)</label>
          <input value={finYear} onChange={(e) => setFinYear(e.target.value)} placeholder="25-26" className={`${inp} w-24`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className={inp}>
            <option value="excel">Excel (.xlsx)</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>
      <div className="px-5 pb-5">
        <button
          onClick={run}
          disabled={busy}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
          {busy ? "Exporting…" : "Download export"}
        </button>
        <p className="text-[10px] text-gray-400 mt-2">
          Large exports are streamed — the browser may take a moment to start the download.
        </p>
      </div>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────────────── */
const BulkImportExport = () => {
  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Admin</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Bulk Import &amp; Export</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        <ImportPanel />
        <ExportPanel />
      </div>
    </div>
  );
};

export default BulkImportExport;
