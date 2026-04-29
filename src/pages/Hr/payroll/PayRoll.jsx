import React, { useState } from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { DollarSign, Eye, Receipt, CreditCard } from "lucide-react";
import { FiRefreshCw as FiRefresh, FiSearch } from "react-icons/fi";
import { TbFileExport } from "react-icons/tb";
import Pagination from "../../../components/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { usePayrollList, useExportPayrollExcel } from "./hooks/usePayroll";
import GeneratePayrollModal from "./GeneratePayrollModal";
import SetTDSModal from "./SetTDSModal";
import UpdatePayrollStatusModal from "./UpdatePayrollStatusModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const StatusBadge = ({ status }) => {
  const config = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Processed: "bg-blue-50 text-blue-700 border-blue-200",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config[status] || "bg-gray-50 text-gray-600"}`}>
      {status}
    </span>
  );
};

const PayRoll = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [generateModal, setGenerateModal] = useState(false);
  const [tdsItem, setTdsItem] = useState(null);
  const [statusItem, setStatusItem] = useState(null);
  const itemsPerPage = 10;

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching, refetch } = usePayrollList({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    month,
    year,
  });
  const { mutate: exportExcel, isPending: isExporting } = useExportPayrollExcel();

  const allRecords = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const paginated  = allRecords;

  const totalNetPay = allRecords.reduce((sum, r) => sum + (r.netPay || 0), 0);
  const paidCount   = allRecords.filter((r) => r.status === "Paid").length;
  const pendingCount = allRecords.filter((r) => r.status === "Pending").length;

  return (
    <div className="font-layout-font h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <Title title="HR Management" sub_title="Payroll" page_title="Payroll" />
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh">
            <FiRefresh className={`text-lg ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <ButtonBg
            button_icon={<TbFileExport size={20} className={isExporting ? "animate-spin" : ""} />}
            button_name={isExporting ? "Exporting..." : "Export"}
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            onClick={() => exportExcel({ month, year })}
            disabled={isExporting || allRecords.length === 0}
          />
          <ButtonBg button_icon={<DollarSign size={18} />} button_name="Generate" onClick={() => setGenerateModal(true)} />
        </div>
      </div>

      {/* Month/Year + Search */}
      <div className="bg-white dark:bg-layout-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => { setMonth(+e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => { setYear(+e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Records", value: allRecords.length, color: "blue" },
          { label: "Paid", value: paidCount, color: "emerald" },
          { label: "Pending", value: pendingCount, color: "amber" },
          { label: "Total Net Pay", value: `₹${(totalNetPay / 100000).toFixed(1)}L`, color: "purple" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-layout-dark border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-layout-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-darkest-blue text-white text-[11px] font-bold uppercase tracking-widest">
              <th className="px-5 py-3 rounded-tl-xl">Employee</th>
              <th className="px-5 py-3">Basic</th>
              <th className="px-5 py-3">Gross</th>
              <th className="px-5 py-3">Deductions</th>
              <th className="px-5 py-3">TDS</th>
              <th className="px-5 py-3 font-bold">Net Pay</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full" /></td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <DollarSign size={36} className="text-gray-200" />
                    <p>No payroll records for {MONTHS[month - 1]} {year}</p>
                    <button onClick={() => setGenerateModal(true)} className="text-blue-600 text-sm hover:underline">
                      Generate payroll now
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((rec) => (
                <tr key={rec._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{rec.employeeId?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{rec.employeeId?.employeeId} · {rec.employeeId?.designation}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">₹{rec.earnings?.basic?.toLocaleString() || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">₹{rec.earnings?.grossPay?.toLocaleString() || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-rose-600">₹{rec.deductions?.totalDeductions?.toLocaleString() || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-purple-600">₹{rec.deductions?.tds || 0}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-emerald-600">₹{rec.netPay?.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* View Payslip */}
                      <button
                        onClick={() => navigate("viewpayroll", { state: { item: rec } })}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="View Payslip"
                      >
                        <Eye size={15} />
                      </button>
                      {/* Set TDS */}
                      {rec.status !== "Paid" && (
                        <button
                          onClick={() => setTdsItem(rec)}
                          className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          title="Set TDS"
                        >
                          <Receipt size={15} />
                        </button>
                      )}
                      {/* Update Status */}
                      {rec.status !== "Paid" && (
                        <button
                          onClick={() => setStatusItem(rec)}
                          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          title="Update Status"
                        >
                          <CreditCard size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="mt-3">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      )}

      {/* Modals */}
      {generateModal && (
        <GeneratePayrollModal onclose={() => setGenerateModal(false)} onSuccess={refetch} />
      )}
      {tdsItem && (
        <SetTDSModal item={tdsItem} onclose={() => setTdsItem(null)} onSuccess={refetch} />
      )}
      {statusItem && (
        <UpdatePayrollStatusModal item={statusItem} onclose={() => setStatusItem(null)} onSuccess={refetch} />
      )}
    </div>
  );
};

export default PayRoll;
