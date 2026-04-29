import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ThemeToggle from "../../components/ThemeToggle";
import LOGO from "../../assets/images/romaa logo.png";
import LOGO_D from "../../assets/images/romaadark.png";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { API } from "../../constant";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault(); // Prevent default form submit
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/employee/forgot-password`, { email });
      
      toast.success("OTP sent to your email!");
      // Navigate to Reset Password page, passing email in state for convenience
      navigate("/resetpassword", { state: { email } });
      
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to send email";
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

      {/* Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-layout-dark rounded-2xl shadow-xl p-8 mx-4 border border-gray-100 dark:border-gray-800">
        
        {/* Header (Logo + Title) */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={LOGO} alt="logo" className="h-12 w-auto dark:hidden" />
            <img src={LOGO_D} alt="logo" className="h-12 w-auto hidden dark:block" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendEmail} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <FiMail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all placeholder-gray-400"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-darkest-blue hover:bg-blue-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>Send OTP <FiArrowRight /></>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-medium transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;