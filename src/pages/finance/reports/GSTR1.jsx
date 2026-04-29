import { useState } from "react";
import { FileText, RefreshCw, Download } from "lucide-react";
import { useGSTR1 } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fyStart = () => {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-04-01`;
};

const TABS = ["b2b", "b2cl", "b2cs", "cdnr", "cdnur"];
const TAB_LABEL = { b2b: "B2B", b2cl: "B2CL", b2cs: "B2CS", cdnr: "CDNR", cdnur: "CDNUR" };

const B2BRow = ({ row }) => (
  <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
    <td className="px-3 py-2 text-xs font-mono text-gray-500">{fmtDate(row.bill_date)}</td>
    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200">{row.client_name}</td>
    <td className="px-3 py-2 text-xs font-mono text-gray-500">{row.client_gstin || <span className="text-amber-500">—</span>}</td>
    <td className="px-3 py-2 text-xs text-gray-500">{row.place_of_supply || "—"}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(row.taxable)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.cgst_amt)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.sgst_amt)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.igst_amt)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right font-semibold text-gray-800 dark:text-white">₹{fmt(row.invoice_value)}</td>
  </tr>
);

const B2CSRow = ({ row }) => (
  <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">{row.client_state || "—"}</td>
    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">{row.place_of_supply || "—"}</td>
    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">{row.tax_mode}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">{row.rate_pct}%</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(row.taxable)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.cgst)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.sgst)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.igst)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-500">{row.invoice_count}</td>
  </tr>
);

const CDNRow = ({ row, isCDNR }) => (
  <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
    <td className="px-3 py-2 text-xs font-mono text-gray-500">{fmtDate(row.ccn_date)}</td>
    <td className="px-3 py-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">{row.ccn_no}</td>
    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200">{row.client_name}</td>
    <td className="px-3 py-2 text-xs font-mono text-gray-500">
      {isCDNR ? (row.client_gstin || <span className="text-amber-500">—</span>) : "—"}
    </td>
    <td className="px-3 py-2 text-xs text-gray-500">{row.place_of_supply || "—"}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-700 dark:text-gray-200">₹{fmt(row.taxable)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.cgst_amt)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.sgst_amt)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right text-gray-600 dark:text-gray-300">₹{fmt(row.igst_amt)}</td>
    <td className="px-3 py-2 text-xs tabular-nums text-right font-semibold text-gray-800 dark:text-white">₹{fmt(row.cn_value)}</td>
  </tr>
);

const GSTR1 = () => {
  const [fromDate, setFromDate] = useState(fyStart());
  const [toDate,   setToDate]   = useState(new Date().toISOString().slice(0, 10));
  const [applied,  setApplied]  = useState({ from_date: fyStart(), to_date: new Date().toISOString().slice(0, 10) });
  const [tab,      setTab]      = useState("b2b");

  const { data, isLoading, isError, refetch } = useGSTR1(applied);
  const summary = data?.summary || {};

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gstr1_${applied.from_date}_${applied.to_date}.json`;
    a.click();
  };

  const rows = data?.[tab]?.rows || [];

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-2 mr-auto">
          <FileText size={18} className="text-orange-600 dark:text-orange-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · GST</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">GSTR-1 — Outward Supplies</h1>
          </div>
        </div>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" />
        <button onClick={() => setApplied({ from_date: fromDate, to_date: toDate })} className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors">Apply</button>
        {data && <button onClick={downloadJSON} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Download size={13} />JSON</button>}
        <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
      </div>

      {/* Summary strip */}
      {data && (
        <div className="mx-6 mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Taxable", value: summary.total_taxable },
            { label: "CGST", value: summary.total_cgst },
            { label: "SGST", value: summary.total_sgst },
            { label: "IGST", value: summary.total_igst },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-base font-extrabold tabular-nums text-gray-800 dark:text-white mt-0.5">₹{fmt(value)}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          <span className="animate-spin h-5 w-5 border-2 border-orange-400 border-t-transparent rounded-full mr-2" />Loading…
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Failed to load. <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {data && (
        <div className="mx-6 mt-4 mb-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 w-fit">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-orange-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                {TAB_LABEL[t]}
                {data[t]?.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === t ? "bg-orange-500" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                    {data[t].count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
            {tab === "b2cs" ? (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["State", "Place of Supply", "Tax Mode", "Rate %", "Taxable", "CGST", "SGST", "IGST", "# Invoices"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{rows.map((r, i) => <B2CSRow key={i} row={r} />)}</tbody>
              </table>
            ) : (tab === "cdnr" || tab === "cdnur") ? (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Date", "CN No.", "Client", "GSTIN", "Place of Supply", "Taxable", "CGST", "SGST", "IGST", "CN Value"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{rows.map((r, i) => <CDNRow key={i} row={r} isCDNR={tab === "cdnr"} />)}</tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  {["Date", "Client", "GSTIN", "Place of Supply", "Taxable", "CGST", "SGST", "IGST", "Invoice Value"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right first:text-left">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{rows.map((r, i) => <B2BRow key={i} row={r} />)}</tbody>
              </table>
            )}
            {!rows.length && <p className="text-center text-sm text-gray-400 py-8">No data for this section.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTR1;
