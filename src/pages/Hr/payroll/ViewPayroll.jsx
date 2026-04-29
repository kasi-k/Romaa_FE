import React from "react";
import LOGO from "../../../assets/images/romaa logo.png";
import Title from "../../../components/Title";
import { useLocation, useNavigate } from "react-router-dom";
import { TbFileExport } from "react-icons/tb";
import ButtonBg from "../../../components/Button";
import { ArrowLeft, Printer } from "lucide-react";

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

const Row = ({ label, value, highlight }) => (
  <div className={`flex justify-between py-2 border-b border-gray-100 text-sm last:border-0 ${highlight ? "font-bold" : ""}`}>
    <span className="text-gray-600">{label}</span>
    <span className={highlight ? "text-gray-900 text-base" : "text-gray-800"}>{value}</span>
  </div>
);

const ViewPayroll = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rec = state?.item;

  if (!rec) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
        <p>No payroll record found.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const emp = rec.employeeId || {};
  const monthName = MONTHS[(rec.month || 1) - 1];

  return (
    <div className="font-layout-font">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <Title title="HR Management" sub_title="Payroll" page_title="Payslip" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <ButtonBg button_icon={<Printer size={18} />} button_name="Print" onClick={() => window.print()} bgColor="dark:bg-layout-dark bg-white" textColor="dark:text-white text-darkest-blue" />
          <ButtonBg button_icon={<TbFileExport size={20} />} button_name="Export" />
        </div>
      </div>

      {/* Payslip Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* Payslip Header */}
        <div className="bg-darkest-blue px-8 py-6 text-white flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-200 mb-1">Pay Slip</p>
            <h1 className="text-2xl font-bold">ROMAA</h1>
            <p className="text-xs text-blue-200 mt-1">Construction ERP</p>
          </div>
          <div className="text-right">
            <img src={LOGO} alt="ROMAA" className="w-24 h-auto filter brightness-0 invert mb-2" />
            <p className="text-xs text-blue-200">
              {monthName} {rec.year}
            </p>
            <StatusBadge status={rec.status} />
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Employee Details</p>
              <div className="space-y-1.5">
                {[
                  { label: "Name", value: emp.name || "—" },
                  { label: "Employee ID", value: emp.employeeId || "—" },
                  { label: "Designation", value: emp.designation || "—" },
                  { label: "Department", value: emp.department || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-28 shrink-0">{label}:</span>
                    <span className="text-gray-800 dark:text-gray-100 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Bank Details</p>
              <div className="space-y-1.5">
                {[
                  { label: "Bank", value: emp.payroll?.bankName || "—" },
                  { label: "Account", value: emp.payroll?.accountNumber ? `****${emp.payroll.accountNumber.slice(-4)}` : "—" },
                  { label: "IFSC", value: emp.payroll?.ifscCode || "—" },
                  { label: "PAN", value: emp.payroll?.panNumber || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-28 shrink-0">{label}:</span>
                    <span className="text-gray-800 dark:text-gray-100 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings */}
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Earnings
              </p>
              <div className="space-y-0">
                <Row label="Basic Salary" value={`₹${rec.earnings?.basic?.toLocaleString() || 0}`} />
                <Row label="HRA (40%)" value={`₹${rec.earnings?.hra?.toLocaleString() || 0}`} />
                <Row label="DA (10%)" value={`₹${rec.earnings?.da?.toLocaleString() || 0}`} />
                {(rec.earnings?.overtimePay || 0) > 0 && (
                  <Row label="Overtime Pay" value={`₹${rec.earnings.overtimePay?.toLocaleString()}`} />
                )}
                <Row label="Gross Pay" value={`₹${rec.earnings?.grossPay?.toLocaleString() || 0}`} highlight />
              </div>
            </div>

            {/* Deductions */}
            <div>
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Deductions
              </p>
              <div className="space-y-0">
                <Row label="PF (12%)" value={`₹${rec.deductions?.pf?.toLocaleString() || 0}`} />
                <Row label="ESI (0.75%)" value={`₹${rec.deductions?.esi?.toLocaleString() || 0}`} />
                {(rec.deductions?.lwpDeduction || 0) > 0 && (
                  <Row label="LWP Deduction" value={`₹${rec.deductions.lwpDeduction?.toLocaleString()}`} />
                )}
                {(rec.deductions?.halfDayDeduction || 0) > 0 && (
                  <Row label="Half-Day Deduction" value={`₹${rec.deductions.halfDayDeduction?.toLocaleString()}`} />
                )}
                <Row label="TDS" value={`₹${rec.deductions?.tds || 0}`} />
                <Row label="Total Deductions" value={`₹${rec.deductions?.totalDeductions?.toLocaleString() || 0}`} highlight />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Net Pay */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Net Pay</p>
              <p className="text-xs text-gray-500 mt-0.5">
                For {monthName} {rec.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-700">
                ₹{rec.netPay?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Info (if Paid) */}
          {rec.status === "Paid" && rec.transactionId && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-xs font-bold text-blue-600 mb-2 uppercase">Payment Details</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="ml-2 font-mono font-medium text-gray-800 dark:text-gray-100">{rec.transactionId}</span>
                </div>
                {rec.paymentDate && (
                  <div>
                    <span className="text-gray-500">Payment Date:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                      {new Date(rec.paymentDate).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
          <span>Generated by ROMAA ERP</span>
          <span>This is a computer-generated payslip</span>
        </div>
      </div>
    </div>
  );
};

export default ViewPayroll;
