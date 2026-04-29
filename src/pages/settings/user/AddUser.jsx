import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiUserPlus,
  FiShield,
  FiUserCheck,
  FiSave,
  FiAlertCircle,
  FiLock,
  FiEye,
  FiEyeOff,
  FiMonitor
} from "react-icons/fi";
import { useRolesDropdown, useUnassignedEmployees, useGrantUserAccess } from "./hooks/useUsers";
import SearchableSelect from "../../../components/SearchableSelect";


// --- Validation Schema ---
const schema = yup.object().shape({
  employeeId: yup.string().required("Please select an employee"),
  password: yup.string().required("Password is required").min(6, "Min 6 characters"),
  role: yup.string().required("Please assign a role"),
  accessMode: yup.string().required("Please select an access mode"),
});

const AddUser = ({ onclose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // --- TanStack Query Hooks ---
  const { data: unassignedResp, isLoading: isLoadingUsers } = useUnassignedEmployees({ page: 1, limit: 1000 });
  const unassignedUsers = useMemo(
    () => (Array.isArray(unassignedResp) ? unassignedResp : (unassignedResp?.data || [])),
    [unassignedResp]
  );
  const { data: roles = [], isLoading: isLoadingRoles } = useRolesDropdown();
  const { mutateAsync: grantAccess, isPending: loading } = useGrantUserAccess({ onSuccess, onclose });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      employeeId: "",
      role: "",
      accessMode: "",
    },
  });

  const selectedEmployeeId = useWatch({ control, name: "employeeId" });
  const selectedRoleId = useWatch({ control, name: "role" }); 

  // --- Update User Preview ---
  useEffect(() => {
    if (selectedEmployeeId && unassignedUsers.length > 0) {
      const user = unassignedUsers.find(u => u.employeeId === selectedEmployeeId);
      setSelectedUserDetails(user || null);
    } else {
      setSelectedUserDetails(null);
    }
  }, [selectedEmployeeId, unassignedUsers]);

  // --- Submit Handler ---
  const onSubmit = async (data) => {
    const payload = { 
      role: data.role, 
      password: data.password, 
      accessMode: data.accessMode,
      status: "Active" 
    };

    // The mutation handles try/catch and toasts internally
    await grantAccess({ employeeId: data.employeeId, payload });
  };

  const selectedRoleDescription = roles.find(r => r._id === selectedRoleId)?.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font animation-fade-in">
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
        
        {/* --- Header --- */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                <FiUserPlus size={20} />
              </span>
              Assign Role Access
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Grant system login to an employee</p>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
            <IoClose size={22} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. Select Employee */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                Select Staff Member
              </label>
              <SearchableSelect
                name="employeeId"
                watch={watch}
                setValue={(n, v) => setValue(n, v, { shouldValidate: true })}
                options={unassignedUsers.map((u) => ({ value: u.employeeId, label: `${u.name} — ${u.employeeId}` }))}
                placeholder={isLoadingUsers ? "Loading staff..." : "-- Choose Unassigned Staff --"}
                disabled={isLoadingUsers}
                hasError={!!errors.employeeId}
              />
              {errors.employeeId && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><FiAlertCircle /> {errors.employeeId.message}</p>
              )}
            </div>

            {/* Verification Card */}
            {selectedUserDetails && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                        <FiUserCheck size={22} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedUserDetails.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUserDetails.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                           <span className="h-2 w-2 rounded-full bg-green-500"></span>
                           <span className="text-[10px] uppercase font-bold text-green-600 tracking-wide">Ready for Access</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FiLock /> Set Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter secure password"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all hover:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><FiAlertCircle /> {errors.password.message}</p>
              )}
            </div>

            {/* 3. Assign Role & Access Mode (Grid Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <FiShield className="text-emerald-500" /> Assign Role
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
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><FiAlertCircle /> {errors.role.message}</p>
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
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><FiAlertCircle /> {errors.accessMode.message}</p>
                  )}
                </div>

            </div>

            {/* Role Hint */}
            {selectedRoleDescription && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 italic">
                    "<span className="font-semibold not-italic text-gray-700 dark:text-gray-300">{selectedRoleDescription}</span>"
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
                {loading ? "Granting..." : "Grant Access"}
              </button>
            </div>

          </form>
        </div>
        
      </div>
    </div>
  );
};

export default AddUser;