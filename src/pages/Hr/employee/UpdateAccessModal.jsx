import React from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { Settings } from "lucide-react";
import { api } from "../../../services/api";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ACCESS_MODES = ["WEBSITE", "MOBILE", "BOTH"];
const STATUSES = ["Active", "Inactive", "Suspended"];
const SHIFT_TYPES = ["General", "Night", "Morning", "Flexible"];

const UpdateAccessModal = ({ employee, onclose, onSuccess }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      status: employee?.status || "Active",
      accessMode: employee?.accessMode || "BOTH",
      shiftType: employee?.shiftType || "General",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/employee/update-access/${employee._id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Access settings updated!");
      queryClient.invalidateQueries(["employees"]);
      if (onSuccess) onSuccess();
      onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update access");
    },
  });

  const LabelSelect = ({ label, name, options }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
      <select
        {...register(name)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Settings size={18} className="text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Update Access</h2>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
            <p className="font-semibold text-gray-800 dark:text-white">{employee?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{employee?.employeeId} · {employee?.designation}</p>
          </div>

          <LabelSelect label="Status" name="status" options={STATUSES} />
          <LabelSelect label="Access Mode" name="accessMode" options={ACCESS_MODES} />
          <LabelSelect label="Shift Type" name="shiftType" options={SHIFT_TYPES} />

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onclose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAccessModal;
