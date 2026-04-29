import { useForm, useFieldArray } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { useUpdateNMRAttendance } from "./hooks/useNMRAttendance";
import SearchableSelect from "../../../components/SearchableSelect";

const STATUSES = ["PRESENT", "ABSENT", "HALF_DAY"];

const EditNMRAttendance = ({ record, onClose }) => {
  const { control, register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      verified_by: record.verified_by || "",
      attendance_list: (record.attendance_list || []).map((w) => ({
        worker_id: w.worker_id,
        worker_name: w.worker_name,
        category: w.category,
        status: w.status || "PRESENT",
        in_time: w.in_time || "",
        out_time: w.out_time || "",
        daily_wage: w.daily_wage,
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "attendance_list" });

  const updateMutation = useUpdateNMRAttendance({
    id: record._id,
    onClose,
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center backdrop-blur-xs backdrop-grayscale-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-layout-dark rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Attendance</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <IoClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          {/* Verified By */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Verified By
            </label>
            <input
              {...register("verified_by")}
              placeholder="Employee ID"
              className="mt-1 block w-full sm:w-64 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Workers Table */}
          <div className="overflow-auto flex-1 px-6 py-4">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-2 py-2 text-left">Worker</th>
                  <th className="px-2 py-2 text-left">Category</th>
                  <th className="px-2 py-2 text-center">Status</th>
                  <th className="px-2 py-2 text-center">In Time</th>
                  <th className="px-2 py-2 text-center">Out Time</th>
                  <th className="px-2 py-2 text-right">Daily Wage</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, idx) => (
                  <tr
                    key={field.id}
                    className="border-b border-gray-50 dark:border-gray-800"
                  >
                    <td className="px-2 py-2 font-medium">
                      {field.worker_name || field.worker_id}
                    </td>
                    <td className="px-2 py-2 text-gray-500">{field.category || "-"}</td>
                    <td className="px-2 py-2">
                      <SearchableSelect
                        name={`attendance_list.${idx}.status`}
                        watch={watch}
                        setValue={(n, v) => setValue(n, v, { shouldValidate: true })}
                        options={STATUSES}
                        placeholder="Select status"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="time"
                        {...register(`attendance_list.${idx}.in_time`)}
                        className="border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-xs outline-none bg-white dark:bg-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="time"
                        {...register(`attendance_list.${idx}.out_time`)}
                        className="border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-xs outline-none bg-white dark:bg-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-2 py-2 text-right text-gray-600 dark:text-gray-300">
                      {field.daily_wage != null ? `₹${field.daily_wage}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-darkest-blue text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50 hover:opacity-90"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNMRAttendance;
