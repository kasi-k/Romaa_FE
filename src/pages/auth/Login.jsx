import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoEyeOff, IoEye } from "react-icons/io5";

// Assets & Components
import LOGO from "../../assets/images/romaa logo.png";
import LOGO_D from "../../assets/images/romaadark.png";
import LOGIN_BG from "../../assets/images/login-bg.png";
import ThemeToggle from "../../components/ThemeToggle";

// Context
import { useAuth } from "../../context/AuthContext";
import { API } from "../../constant";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Local State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Login Handler ---
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${API}/employee/login`,
        { email, password },
        { withCredentials: true },
      );

      if (res.data.status) {
        login(res.data.data.user);
      }
    } catch (err) {
      console.error("Login Error:", err);
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Dynamic Greeting ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="h-screen flex w-full font-layout-font transition-colors duration-300 overflow-hidden">
      {/* Left Panel: Brand & Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-darkest-blue h-full">
        <img
          src={LOGIN_BG}
          alt="Construction Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-110 animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b5e]/90 via-darkest-blue/80 to-[#0B1120]/60"></div>

        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="Romaa Logo" className="h-10 w-auto " />
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tight">
              Precision Engineering. <br />
              <span className="text-blue-400">Streamlined Management.</span>
            </h2>
            <p className="text-lg text-gray-300 font-medium leading-relaxed opacity-90 border-l-4 border-blue-500 pl-6 py-1">
              Transforming construction projects with our state-of-the-art
              enterprise resource platform.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-bold opacity-60 uppercase tracking-widest">
            <span>© {new Date().getFullYear()} Romaa Infra</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#F8FAFC] dark:bg-overall_bg-dark transition-colors duration-300 relative h-full">
        {/* Top Header Section (Mobile & Desktop Theme Switcher) */}
        <div className="absolute top-0 right-0 left-0 p-8 flex justify-between items-start z-20 pointer-events-none">
          <div className="lg:hidden pointer-events-auto">
            <img src={LOGO} alt="Logo" className="h-7 dark:hidden" />
            <img src={LOGO_D} alt="Logo" className="h-7 hidden dark:block" />
          </div>
          <div className="ml-auto pointer-events-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-8">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:mb-12">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tighter leading-tight">
                {getGreeting()}, <br />
                <span className="text-darkest-blue dark:text-blue-500">
                  Welcome.
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-lg leading-relaxed max-w-sm">
                Log in to Romaa Infra to manage your data.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase">
                  Authentication Gateway
                </label>
                <div className="space-y-3 lg:space-y-4">
                  <div className="relative group">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-13 font-medium bg-white dark:bg-layout-dark border-2 border-gray-300 dark:border-gray-800 rounded-xl px-5 text-[14px] focus:outline-none focus:ring-8 focus:ring-darkest-blue/5 dark:focus:ring-blue-500/5 focus:border-darkest-blue dark:focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      placeholder="Organization Email"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-13 bg-white dark:bg-layout-dark border-2 border-gray-300 dark:border-gray-800 rounded-xl px-5 pr-14 text-[14px] font-medium focus:outline-none focus:ring-8 focus:ring-darkest-blue/5 dark:focus:ring-blue-500/5 focus:border-darkest-blue dark:focus:border-blue-500 transition-all duration-300 text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      placeholder="Gateway Password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-darkest-blue dark:group-focus-within:text-blue-500 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <IoEyeOff size={20} />
                      ) : (
                        <IoEye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Secure
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/forgotpassword")}
                  className="hover:text-darkest-blue dark:hover:text-blue-400 transition-all underline underline-offset-2"
                >
                  Reset Access
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-500 rounded-r-xl text-red-600 dark:text-red-400 text-xs">
                  <p className="font-black italic tracking-wide">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full h-14 flex items-center justify-center rounded-xl text-[14px] font-black text-white tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-darkest-blue/20 hover:shadow-blue-500/30 active:scale-95 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed opacity-80"
                    : "bg-darkest-blue hover:bg-[#1a2b5e]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Verifying</span>
                  </div>
                ) : (
                  "Initiate Login"
                )}
              </button>
            </form>

            <div className="mt-10 lg:mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600">
              <div>Romaa Group</div>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="hover:text-darkest-blue transition-colors underline-offset-4"
                >
                  Support
                </a>
                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                <a
                  href="#"
                  className="hover:text-darkest-blue transition-colors underline-offset-4"
                >
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Copyright Footer (Mobile only/at bottom) */}
        <div className="p-4 text-center lg:hidden">
          <p className="text-gray-400 dark:text-gray-600 text-[8px] font-black tracking-widest uppercase">
            © {new Date().getFullYear()} Romaa Infra.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
