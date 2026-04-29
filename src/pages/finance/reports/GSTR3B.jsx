import { useState } from "react";
import { FileCog, RefreshCw, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { useGSTR3B } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fyStart = () => {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-04-01`;
};

const CompareRow = ({ label, docCgst, docSgst, docIgst, ledCgst, ledSgst, ledIgst }) => (
  <div className="grid grid-cols-[1fr_100px_100px_100px_100px_100px_100px] gap-0 px-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
    <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{label}</span>
    <span className="text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(docCgst)}</span>
    <span className="text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(docSgst)}</span>
    <span className="text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(docIgst)}</span>
    <span className="text-xs tabular-nums text-right text-indigo-600 dark:text-indigo-400">₹{fmt(ledCgst)}</span>
    <span className="text-xs tabular-nums text-right text-indigo-600 dark:text-indigo-400">₹{fmt(ledSgst)}</span>
    <span className="text-xs tabular-nums text-right text-indigo-600 dark:text-indigo-400">₹{fmt(ledIgst)}</span>
  </div>
);

const GSTR3B = () => {
  const [fromDate, setFromDate] = useState(fyStart());
  const [toDate,   setToDate]   = useState(new Date().toISOString().slice(0, 10));
  const [applied,  setApplied]  = useState({ from_date: fyStart(), to_date: new Date().toISOString().slice(0, 10) });

  const { data, isLoading, isError, refetch } = useGSTR3B(applied);
  const rec = data?.reconciliation || {};
  const payable = data?.net_gst_payable || {};

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gstr3b_${applied.from_date}_${applied.to_date}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <FileCog size={18} className="text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · GST</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">GSTR-3B — Net GST Payable</h1>
          </div>
        </div>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
        <button onClick={() => setApplied({ from_date: fromDate, to_date: toDate })} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        {data && <button onClick={downloadJSON} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Download size={13} />JSON</button>}
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {/* Mismatch banners */}
      {data && (!rec.output_match || !rec.input_match) && (
        <div className="mx-6 mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
            {!rec.output_match && <p>Output GST: document vs ledger mismatch — investigate account 2110 in General Ledger.</p>}
            {!rec.input_match  && <p>Input ITC: document vs ledger mismatch — investigate account 1080-CGST in General Ledger.</p>}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="px-6 py-4 space-y-4">
          {/* Document vs Ledger comparison */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Column header */}
            <div className="grid grid-cols-[1fr_100px_100px_100px_100px_100px_100px] gap-0 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Doc CGST</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Doc SGST</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Doc IGST</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider text-right">Ledger CGST</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider text-right">Ledger SGST</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider text-right">Ledger IGST</span>
            </div>
            <CompareRow
              label="Output Supplies"
              docCgst={data.output_supplies?.from_documents?.cgst} docSgst={data.output_supplies?.from_documents?.sgst} docIgst={data.output_supplies?.from_documents?.igst}
              ledCgst={data.output_supplies?.from_ledger?.cgst}    ledSgst={data.output_supplies?.from_ledger?.sgst}    ledIgst={data.output_supplies?.from_ledger?.igst}
            />
            <CompareRow
              label="Input ITC"
              docCgst={data.input_itc?.from_documents?.cgst} docSgst={data.input_itc?.from_documents?.sgst} docIgst={data.input_itc?.from_documents?.igst}
              ledCgst={data.input_itc?.from_ledger?.cgst}    ledSgst={data.input_itc?.from_ledger?.sgst}    ledIgst={data.input_itc?.from_ledger?.igst}
            />
          </div>

          {/* ITC Reversal + Net ITC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">ITC Reversed</p>
              <div className="flex gap-4 text-xs tabular-nums">
                <span className="text-gray-600 dark:text-gray-300">CGST: ₹{fmt(data.itc_reversed?.cgst)}</span>
                <span className="text-gray-600 dark:text-gray-300">SGST: ₹{fmt(data.itc_reversed?.sgst)}</span>
                <span className="text-gray-600 dark:text-gray-300">IGST: ₹{fmt(data.itc_reversed?.igst)}</span>
              </div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-1">Total: ₹{fmt(data.itc_reversed?.total)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Net ITC Available</p>
              <div className="flex gap-4 text-xs tabular-nums">
                <span className="text-gray-600 dark:text-gray-300">CGST: ₹{fmt(data.net_itc_available?.cgst)}</span>
                <span className="text-gray-600 dark:text-gray-300">SGST: ₹{fmt(data.net_itc_available?.sgst)}</span>
                <span className="text-gray-600 dark:text-gray-300">IGST: ₹{fmt(data.net_itc_available?.igst)}</span>
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">Total: ₹{fmt(data.net_itc_available?.total)}</p>
            </div>
          </div>

          {/* Net GST Payable tile */}
          <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${payable.total > 0 ? "bg-red-600" : "bg-emerald-600"}`}>
            <div className="flex items-center gap-2">
              {payable.total > 0
                ? <AlertTriangle size={18} className="text-white" />
                : <CheckCircle2 size={18} className="text-white" />}
              <span className="text-white font-bold">Net GST Payable</span>
            </div>
            <span className="text-white font-extrabold text-xl tabular-nums">₹{fmt(payable.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTR3B;
