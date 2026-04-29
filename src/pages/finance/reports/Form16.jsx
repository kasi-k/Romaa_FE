import { useState } from "react";
import { FileText, RefreshCw, Printer } from "lucide-react";
import { useForm16 } from "./hooks/useFinanceReports";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const Form16 = () => {
  const currentFY = (() => {
    const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
  })();

  const [deductor, setDeductor] = useState({ tan: "", name: "", pan: "", address: "" });
  const [params, setParams] = useState({ financial_year: currentFY, employee_id: "" });
  const [applied, setApplied] = useState(null);

  const { data, isLoading, isError, refetch } = useForm16(applied ? { ...applied, ...deductor } : {});
  const apply = () => { if (params.employee_id) setApplied({ ...params }); };

  const inp = "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <div className="flex flex-col h-full font-roboto-flex bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Finance · Compliance</p>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Form 16 — Annual Salary TDS Certificate</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {[{ key: "tan", placeholder: "Deductor TAN" }, { key: "name", placeholder: "Deductor Name" }, { key: "pan", placeholder: "Deductor PAN" }, { key: "address", placeholder: "Deductor Address" }].map(({ key, placeholder }) => (
            <input key={key} className={inp} placeholder={placeholder} value={deductor[key]} onChange={(e) => setDeductor({ ...deductor, [key]: e.target.value })} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input className={`${inp} w-24`} placeholder="FY (25-26)" value={params.financial_year} onChange={(e) => setParams({ ...params, financial_year: e.target.value })} />
          <input className={`${inp} w-52`} placeholder="Employee ID (ObjectId)" value={params.employee_id} onChange={(e) => setParams({ ...params, employee_id: e.target.value })} />
          <button onClick={apply} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Fetch</button>
          {data && <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50"><Printer size={13} />Print</button>}
          <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><RefreshCw size={15} /></button>
        </div>
      </div>

      {isLoading && <div className="flex-1 flex items-center justify-center text-sm text-gray-400"><span className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full mr-2" />Loading…</div>}
      {isError && <div className="flex-1 flex items-center justify-center text-sm text-red-500">Failed. <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>}

      {data && (
        <div className="px-6 py-5 space-y-4 max-w-3xl mx-auto w-full">
          {/* Part A — TDS deducted */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h2 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">Part A — TDS Deducted & Deposited</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-gray-400">Employee</span><p className="font-semibold text-gray-700 dark:text-gray-200">{data.employee_name}</p></div>
              <div><span className="text-gray-400">PAN</span><p className="font-mono text-gray-700 dark:text-gray-200">{data.employee_pan || "—"}</p></div>
              <div><span className="text-gray-400">FY</span><p className="font-semibold">{data.financial_year}</p></div>
              <div><span className="text-gray-400">Assessment Year</span><p className="font-semibold">{data.assessment_year}</p></div>
            </div>
            {data.quarterly_tds?.length > 0 && (
              <table className="w-full mt-4 text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  {["Quarter", "TDS Deducted", "TDS Deposited", "Challan No."].map((h) => <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase text-right first:text-left">{h}</th>)}
                </tr></thead>
                <tbody>
                  {data.quarterly_tds.map((q, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="px-3 py-2 font-semibold text-indigo-700 dark:text-indigo-400">{q.quarter}</td>
                      <td className="px-3 py-2 tabular-nums text-right">₹{fmt(q.tds_deducted)}</td>
                      <td className="px-3 py-2 tabular-nums text-right">₹{fmt(q.tds_deposited)}</td>
                      <td className="px-3 py-2 font-mono text-gray-400 text-right">{q.challan_no || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Part B — Income details */}
          {data.part_b && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">Part B — Income & Tax Computation</h2>
              <div className="space-y-1.5 text-xs">
                {[
                  ["Gross Salary", data.part_b.gross_salary],
                  ["Allowances (Exempt)", data.part_b.exempt_allowances],
                  ["Net Salary", data.part_b.net_salary],
                  ["Deductions u/s 80C etc.", data.part_b.deductions],
                  ["Total Taxable Income", data.part_b.taxable_income],
                  ["Tax on Income", data.part_b.tax_on_income],
                  ["Rebate u/s 87A", data.part_b.rebate_87a],
                  ["Tax Payable", data.part_b.tax_payable],
                  ["TDS Deducted", data.part_b.tds_deducted],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-gray-50 dark:border-gray-800 py-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="tabular-nums font-semibold text-gray-700 dark:text-gray-200">₹{fmt(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!data && !isLoading && !isError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <FileText size={44} className="opacity-20" />
          <p className="text-sm font-semibold">Enter deductor details, employee ID and FY, then click Fetch.</p>
        </div>
      )}
    </div>
  );
};

export default Form16;
