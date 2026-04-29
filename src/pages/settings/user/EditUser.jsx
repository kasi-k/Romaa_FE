import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiUserPlus,
  FiShield,
  FiSave,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiBriefcase,
  FiMonitor,
} from "react-icons/fi";
import { useReassignUserRole, useRolesDropdown } from "./hooks/useUsers";
import SearchableSelect from "../../../components/SearchableSelect";

// --- Validation Schema ---
const schema = yup.object().shape({
  role: yup.string().required("Please select a new role"),
  accessMode: yup.string().required("Please select an access mode"),
});

// ✅ Receive 'item' directly from the Table component
const EditUser = ({ item, onclose, onUpdated }) => {
  // Use 'item' passed from parent, fallback to empty object to prevent crashes
  const user = useMemo(() => item || {}, [item]);

  // --- TanStack Query Hooks ---
  const { data: roles = [], isLoading: isLoadingRoles } = useRolesDropdown();
  const { mutateAsync: updateRole, isPending: loading } = useReassignUserRole({
    onUpdated,
    onclose,
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: user.role?._id || user.role || "",
      accessMode: user.accessMode || "",
    },
  });

  // --- Reset Form when Modal Opens/Item Changes ---
  useEffect(() => {
    if (user) {
      reset({
        role: user.role?._id || user.role || "",
        accessMode: user.accessMode || "",
      });
    }
  }, [user, reset]);

  const selectedRoleId = useWatch({ control, name: "role" });

  // --- Submit Handler ---
  const onSubmit = async (data) => {
    const payload = {
      employeeId: user.employeeId,
      roleId: data.role,
      accessMode: data.accessMode,
    };

    // The mutation handles try/catch and toasts internally
    await updateRole(payload);
  };

  // Helper for Role Description
  const selectedRoleDescription = roles.find(
    (r) => r._id === selectedRoleId,
  )?.description;

  if (!user.employeeId) return null; // Don't render if no data

  return (
    // --- 1. Overlay (Fixed Modal Wrapper) ---
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font animation-fade-in">
      {/* --- 2. Modal Container --- */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
        {/* --- Header --- */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                <FiUserPlus size={20} />
              </span>
              Reassign User Role
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">
              Modify role and platform access
            </p>
          </div>

          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. User Identity Card (Read Only) */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 min-w-[3rem] rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xl font-bold text-gray-500 dark:text-gray-300">
                  {user.name?.charAt(0).toUpperCase() || <FiUser />}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">
                    {user.employeeId}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700">
                      <FiBriefcase className="text-gray-400" />
                      <span className="truncate">
                        {user.designation || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700">
                      <FiShield className="text-gray-400" />
                      <span className="truncate font-medium text-blue-600 dark:text-blue-400">
                        {user.role?.roleName || "No Role"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500">
                <FiMail /> {user.email}
              </div>
            </div>

            {/* 2. Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FiShield className="text-emerald-500" /> Assign New Role
                </label>
                <SearchableSelect
                  name="role"
                  watch={watch}
                  setValue={(n, v) => setValue(n, v, { shouldValidate: true })}
                  options={roles.map((r) => ({ value: r._id, label: r.roleName }))}
                  placeholder={isLoadingRoles ? "Loading roles..." : "-- Select Role --"}
                  disabled={isLoadingRoles}
                  hasError={!!errors.role}
                />
                {errors.role && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <FiAlertCircle /> {errors.role.message}
                  </p>
                )}
              </div>

              {/* Access Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FiMonitor className="text-purple-500" /> Access Mode
                </label>
                <SearchableSelect
                  name="accessMode"
                  watch={watch}
                  setValue={(n, v) => setValue(n, v, { shouldValidate: true })}
                  options={[
                    { value: "WEBSITE", label: "Website Only" },
                    { value: "MOBILE", label: "Mobile App Only" },
                    { value: "BOTH", label: "Both (Web & Mobile)" },
                  ]}
                  placeholder="-- Select Platform --"
                  hasError={!!errors.accessMode}
                />
                {errors.accessMode && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <FiAlertCircle /> {errors.accessMode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role Hint */}
            {selectedRoleDescription && (
              <div className="mt-0 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 italic">
                "
                <span className="font-semibold not-italic text-gray-700 dark:text-gray-300">
                  {selectedRoleDescription}
                </span>
                "
              </div>
            )}

            {/* --- Footer Buttons --- */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onclose}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 text-sm font-bold text-white bg-darkest-blue rounded-xl hover:bg-blue-900 shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <FiSave size={16} />
                )}
                {loading ? "Updating..." : "Update Access"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
