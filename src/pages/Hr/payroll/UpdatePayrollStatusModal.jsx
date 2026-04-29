import React from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { ArrowRight, CreditCard } from "lucide-react";
import { useUpdatePayrollStatus } from "./hooks/usePayroll";

const STATUS_FLOW = {
  Pending: "Processed",
  Processed: "Paid",
};

const UpdatePayrollStatusModal = ({ item, onclose, onSuccess }) => {
  const nextStatus = STATUS_FLOW[item?.status];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      transactionId: "",
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  const mutation = useUpdatePayrollStatus({ onSuccess, onclose });

  const onSubmit = (data) => {
    mutation.mutate({
      id: item._id,
      status: nextStatus,
      ...(nextStatus === "Paid" ? { transactionId: data.transactionId, paymentDate: data.paymentDate } : {}),
    });
  };

  if (!item || !nextStatus) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <CreditCard size={18} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Update Payroll Status</h2>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Status transition */}
          <div className="flex items-center justify-center gap-4 py-2">
            <StatusChip status={item.status} />
            <ArrowRight size={18} className="text-gray-400" />
            <StatusChip status={nextStatus} highlight />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{item.employeeId?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Net Pay</span>
              <span className="font-bold text-emerald-600">₹{item.netPay?.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment fields — only when marking as Paid */}
          {nextStatus === "Paid" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. NEFT20260430001"
                  {...register("transactionId", { required: "Transaction ID is required" })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 ${
                    errors.transactionId ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.transactionId && <p className="text-red-500 text-[10px] mt-0.5">{errors.transactionId.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Payment Date</label>
                <input
                  type="date"
                  {...register("paymentDate")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onclose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 text-sm bg-darkest-blue hover:bg-blue-900 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              Mark as {nextStatus}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusChip = ({ status, highlight }) => {
  const colors = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Processed: "bg-blue-50 text-blue-700 border-blue-200",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${colors[status] || "bg-gray-50 text-gray-600"} ${highlight ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}>
      {status}
    </span>
  );
};

export default UpdatePayrollStatusModal;
