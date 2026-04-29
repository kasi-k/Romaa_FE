import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../../components/Modal";
import { FaAsterisk, FaLock, FaKey, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../constant";

// --- Validation Schema ---
const schema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Current Password is required"),
  newPassword: yup
    .string()
    .required("New Password is required")
    .min(6, "Password must be at least 6 characters")
    .notOneOf([yup.ref('oldPassword'), null], "New password cannot be the same as old password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

// --- Reusable Input Component with Toggle ---
const InputField = ({ label, name, register, errors, placeholder, type = "text", icon }) => {
  // State to toggle visibility (only used if type is password)
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        {icon} {label} <span className="text-red-400 text-[8px]"><FaAsterisk /></span>
      </label>
      
      <div className="relative">
        <input
          type={isPasswordField && showPassword ? "text" : type}
          placeholder={placeholder}
          {...register(name)}
          className={`border border-gray-300 rounded-xl outline-none py-3 pl-4 ${isPasswordField ? "pr-10" : "pr-4"} w-full text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
            errors[name] ? "border-red-500 focus:ring-red-200" : ""
          }`}
        />
        
        {/* Toggle Button (Only for password fields) */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>

      {errors[name] && <p className="text-red-500 text-[10px] text-end font-medium">{errors[name].message}</p>}
    </div>
  );
};

const ChangePassword = ({ onclose }) => {
  const [loading, setLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = { 
        oldPassword: data.oldPassword,
        newPassword: data.newPassword 
      };

      await axios.post(
        `${API}/employee/reset-password`, 
        payload, 
        { withCredentials: true }
      );

      toast.success("Password changed successfully");
      onclose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Secure Password Change"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          
          <div className="space-y-5">
            {/* 1. Current Password */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <InputField
                  label="Current Password"
                  name="oldPassword"
                  type="password"
                  register={register}
                  errors={errors}
                  placeholder="Enter your current password"
                  icon={<FaKey className="text-gray-400" />}
                />
            </div>

            {/* 2. New Passwords */}
            <div className="space-y-4">
                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  register={register}
                  errors={errors}
                  placeholder="Enter new password"
                  icon={<FaLock className="text-gray-400" />}
                />
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  register={register}
                  errors={errors}
                  placeholder="Re-enter new password"
                  icon={<FaShieldAlt className="text-gray-400" />}
                />
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs">
            <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-200 text-blue-700 rounded-full w-4 h-4 flex items-center justify-center font-bold">i</span>
                <span className="font-bold">Password Policy:</span>
            </div>
            <ul className="list-disc ml-6 space-y-0.5 opacity-80">
                <li>Minimum 6 characters required</li>
                <li>Cannot be the same as the previous password</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onclose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-darkest-blue text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : "Update Password"}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default ChangePassword;