import React from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { ClipboardEdit } from "lucide-react";
import { useApplyRegularization } from "./hooks/useAttendance";

const CATEGORY_OPTIONS = [
  "Late Entry",
  "Missed Punch",
  "Work on Leave",
  "System Glitch",
  "Work From Home",
];

const ApplyRegularizationModal = ({ onclose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: "",
      category: "Missed Punch",
      reason: "",
      correctedInTime: "",
      correctedOutTime: "",
    },
  });

  const category = watch("category");
  const mutation = useApplyRegularization({ onSuccess, onclose });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <ClipboardEdit size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Apply Regularization</h2>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              {...register("date", { required: "Date is required" })}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                errors.date ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.date && <p className="text-red-500 text-[10px] mt-0.5">{errors.date.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register("category", { required: "Category is required" })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Corrected Times (show for Missed Punch / Late Entry) */}
          {(category === "Missed Punch" || category === "Late Entry") && (
            <div className="grid grid-cols-2 gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-lg">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  Corrected In-Time
                </label>
                <input
                  type="time"
                  {...register("correctedInTime")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  Corrected Out-Time
                </label>
                <input
                  type="time"
                  {...register("correctedOutTime")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain the reason for regularization..."
              {...register("reason", { required: "Reason is required", minLength: { value: 10, message: "Min 10 characters" } })}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all ${
                errors.reason ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.reason && <p className="text-red-500 text-[10px] mt-0.5">{errors.reason.message}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onclose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending && (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
              )}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyRegularizationModal;
