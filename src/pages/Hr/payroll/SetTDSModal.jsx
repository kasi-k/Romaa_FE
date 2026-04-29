import React from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { Receipt } from "lucide-react";
import { useSetPayrollTDS } from "./hooks/usePayroll";

const SetTDSModal = ({ item, onclose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { taxAmount: item?.deductions?.tds || 0 },
  });

  const mutation = useSetPayrollTDS({ onSuccess, onclose });

  const onSubmit = (data) => {
    mutation.mutate({ id: item._id, taxAmount: parseFloat(data.taxAmount) });
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <Receipt size={18} className="text-purple-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Set TDS</h2>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{item.employeeId?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gross Pay</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">₹{item.earnings?.grossPay?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current TDS</span>
              <span className="font-semibold text-purple-600">₹{item.deductions?.tds || 0}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-500">Net Pay (before update)</span>
              <span className="font-bold text-emerald-600">₹{item.netPay?.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              TDS Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              {...register("taxAmount", {
                required: "TDS amount is required",
                min: { value: 0, message: "Cannot be negative" },
              })}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 ${
                errors.taxAmount ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.taxAmount && <p className="text-red-500 text-[10px] mt-0.5">{errors.taxAmount.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Net pay will be recalculated automatically after saving.</p>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onclose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              Save TDS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetTDSModal;
