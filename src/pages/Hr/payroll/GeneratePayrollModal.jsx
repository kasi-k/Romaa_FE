import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { DollarSign, Users, User } from "lucide-react";
import { useGeneratePayroll, useBulkGeneratePayroll } from "./hooks/usePayroll";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const GeneratePayrollModal = ({ onclose, onSuccess }) => {
  const [mode, setMode] = useState("bulk"); // "bulk" | "single"
  const [bulkResult, setBulkResult] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      employeeId: "",
    },
  });

  const singleMutation = useGeneratePayroll({
    onSuccess: () => { if (onSuccess) onSuccess(); onclose(); },
    onclose,
  });

  const bulkMutation = useBulkGeneratePayroll({
    onSuccess: (data) => {
      setBulkResult(data?.data);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    const payload = { month: parseInt(data.month), year: parseInt(data.year) };
    if (mode === "single") {
      singleMutation.mutate({ ...payload, employeeId: data.employeeId });
    } else {
      bulkMutation.mutate(payload);
    }
  };

  const loading = singleMutation.isPending || bulkMutation.isPending;

  if (bulkResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
        <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-bold text-gray-800 dark:text-white">Bulk Generation Result</h3>
            <button onClick={onclose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"><IoClose size={18} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Generated", value: bulkResult.generated?.length ?? 0, color: "emerald" },
                { label: "Skipped", value: bulkResult.skipped?.length ?? 0, color: "amber" },
                { label: "Errors", value: bulkResult.errors?.length ?? 0, color: "rose" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-100 dark:border-${color}-800 rounded-xl p-4`}>
                  <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            {bulkResult.errors?.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-xs font-bold text-rose-700 mb-2">Errors:</p>
                {bulkResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-rose-600">{e.employeeId}: {e.message}</p>
                ))}
              </div>
            )}
            <button
              onClick={onclose}
              className="w-full py-2.5 bg-darkest-blue text-white rounded-xl font-semibold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Generate Payroll</h2>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "bulk", label: "Bulk (All Employees)", icon: <Users size={16} /> },
              { id: "single", label: "Single Employee", icon: <User size={16} /> },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  mode === id
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Month / Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Month</label>
              <select
                {...register("month", { required: true })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Year</label>
              <select
                {...register("year", { required: true })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Single Mode: Employee ID */}
          {mode === "single" && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter MongoDB Employee _id"
                {...register("employeeId", { required: mode === "single" ? "Employee ID is required" : false })}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 ${
                  errors.employeeId ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.employeeId && <p className="text-red-500 text-[10px] mt-0.5">{errors.employeeId.message}</p>}
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
            <strong>Note:</strong> Generating payroll will calculate earnings and deductions based on attendance data.
            Existing payroll for the same month/year will be skipped.
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onclose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-darkest-blue hover:bg-blue-900 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              {mode === "bulk" ? "Generate for All" : "Generate Payroll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePayrollModal;
