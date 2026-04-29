import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ThemeToggle from "../../components/ThemeToggle";
import LOGO from "../../assets/images/romaa logo.png";
import LOGO_D from "../../assets/images/romaadark.png";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { FiLock, FiShield, FiKey } from "react-icons/fi";
import { API } from "../../constant";
import OtpInput from "../../components/OtpInput";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email passed from previous screen (optional but good UX)
  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (otpValue) => {
    setFormData((prev) => ({ ...prev, otp: otpValue }));
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      const payload = {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      };

      // Correct Endpoint: verify-reset-password
      await axios.post(`${API}/employee/reset-password-with-otp`, payload);

      toast.success("Password reset successful! Please login.");
      navigate("/"); // Redirect to Login
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Reset failed. Invalid OTP or expired.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative font-layout-font min-h-screen flex items-center justify-center bg-[#E3ECFF] dark:bg-overall_bg-dark transition-colors duration-300">
      
      {/* Theme Toggle */}
      <div className="absolute right-8 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-layout-dark rounded-2xl shadow-xl p-8 mx-4 border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={LOGO} alt="logo" className="h-12 w-auto dark:hidden" />
            <img src={LOGO_D} alt="logo" className="h-12 w-auto hidden dark:block" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter the OTP sent to <b>{formData.email || "your email"}</b>
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          
          {/* Email (Read Only or Editable if missed) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Confirm Email"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 dark:text-white transition-all text-sm"
              required
            />
          </div>

          {/* OTP */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Verification Code
                </label>
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Check your email
                </span>
            </div>
            
            <OtpInput 
                length={6} 
                value={formData.otp} 
                onChange={handleOtpChange} 
            />
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all text-sm"
                placeholder="Minimum 6 characters"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm Password</label>
            <div className="relative">
              <FiShield className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all text-sm"
                placeholder="Re-enter password"
                required
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-darkest-blue hover:bg-blue-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-70 mt-4"
          >
            {loading ? "Verifying..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;