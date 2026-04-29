import React from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { Shield } from "lucide-react";
import { api } from "../../../services/api";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ReassignRoleModal = ({ employee, onclose, onSuccess }) => {
  const queryClient = useQueryClient();

  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles-dropdown"],
    queryFn: async () => {
      const { data } = await api.get("/role/list");
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { roleId: employee?.role?._id || employee?.role || "" },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put("/employee/role/re-assign", {
        employeeId: employee._id,
        roleId: payload.roleId,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Role reassigned successfully!");
      queryClient.invalidateQueries(["employees"]);
      if (onSuccess) onSuccess();
      onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reassign role");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Shield size={18} className="text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Reassign Role</h2>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-sm">
            <p className="text-gray-500 dark:text-gray-400">Employee</p>
            <p className="font-semibold text-gray-800 dark:text-white">{employee?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Current role: <span className="text-blue-600 dark:text-blue-400">{employee?.role?.roleName || "None"}</span>
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Assign New Role <span className="text-red-500">*</span>
            </label>
            {loadingRoles ? (
              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : (
              <select
                {...register("roleId", { required: "Role is required" })}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 ${
                  errors.roleId ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">Select a role</option>
                {(rolesData || []).map((r) => (
                  <option key={r._id} value={r._id}>{r.roleName}</option>
                ))}
              </select>
            )}
            {errors.roleId && <p className="text-red-500 text-[10px] mt-0.5">{errors.roleId.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onclose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 text-sm bg-darkest-blue hover:bg-blue-900 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
              Save Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignRoleModal;
