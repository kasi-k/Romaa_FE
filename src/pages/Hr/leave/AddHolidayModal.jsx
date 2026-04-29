import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { FiCalendar } from "react-icons/fi";
import { useAddHoliday, useUpdateHoliday } from "./hooks/useLeave";

const TYPES = ["National", "Regional", "Optional", "Weekend"];

const AddHolidayModal = ({ onclose, onSuccess, item }) => {
  const isEdit = !!item;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { date: "", name: "", type: "National", description: "" },
  });

  useEffect(() => {
    if (item) {
      reset({
        date: item.date?.split("T")[0] || "",
        name: item.name || "",
        type: item.type || "National",
        description: item.description || "",
      });
    }
  }, [item, reset]);

  const addMutation = useAddHoliday({ onSuccess, onclose });
  const updateMutation = useUpdateHoliday({ id: item?._id, onSuccess, onclose });

  const onSubmit = (data) => {
    if (isEdit) updateMutation.mutate(data);
    else addMutation.mutate(data);
  };

  const loading = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <FiCalendar className="text-indigo-600" size={16} />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">
              {isEdit ? "Edit Holiday" : "Add Holiday"}
            </h2>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("date", { required: "Date is required" })}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 ${
                errors.date ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.date && <p className="text-red-500 text-[10px] mt-0.5">{errors.date.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Republic Day"
              {...register("name", { required: "Name is required" })}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Type</label>
            <select
              {...register("type")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Short description..."
              {...register("description")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onclose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-darkest-blue hover:bg-blue-900 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              {isEdit ? "Save Changes" : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHolidayModal;
