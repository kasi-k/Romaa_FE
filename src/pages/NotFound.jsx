import { useNavigate } from "react-router-dom";
import { HardHat, ArrowLeft, Home, Construction } from "lucide-react";

const StripeBar = ({ position }) => {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <div
      className={`fixed ${position}-0 left-0 w-full h-2 z-50`}
      style={{
        backgroundImage: isDark
          ? "repeating-linear-gradient(45deg, #d97706 0px, #d97706 10px, #374151 10px, #374151 20px)"
          : "repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 10px, #1e293b 10px, #1e293b 20px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
};

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#0a0a0a] flex items-center justify-center p-6 font-roboto-flex relative overflow-hidden">
      {/* Stripe bars */}
      <StripeBar position="top" />
      <StripeBar position="bottom" />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light mode grid dots */}
        <div
          className="absolute inset-0 dark:hidden opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #314165 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Dark mode grid dots */}
        <div
          className="absolute inset-0 hidden dark:block opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow - light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[120px] dark:hidden" />
        {/* Glow - dark */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full hidden dark:block bg-orange-500/5 blur-[120px]" />
      </div>

      <div className="relative text-center max-w-md z-10">
        {/* Icon cluster */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {/* Outer ring */}
          <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-orange-300/50 dark:border-orange-700/30 animate-[spin_20s_linear_infinite]" />
          {/* Inner glow */}
          <div className="absolute w-28 h-28 rounded-full bg-orange-100 dark:bg-orange-950/40" />
          {/* Icon */}
          <div className="relative bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 border border-orange-100 dark:border-orange-900/30">
            <HardHat
              className="size-14 text-orange-500 dark:text-orange-400"
              strokeWidth={1.5}
            />
          </div>
          {/* Small floating icon */}
          <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
            <Construction className="size-4 text-darkest-blue dark:text-blue-400" />
          </div>
        </div>

        {/* 404 number */}
        <h1 className="text-[100px] font-black tracking-tighter leading-none mb-2">
          <span className="text-darkest-blue dark:text-white">4</span>
          <span className="relative inline-block text-orange-500 dark:text-orange-400">
            0
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-orange-300 dark:bg-orange-700" />
          </span>
          <span className="text-darkest-blue dark:text-white">4</span>
        </h1>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-2">
          Page Under Construction
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed max-w-sm mx-auto">
          Looks like this area is still being built. The page you're looking for
          doesn't exist or has been relocated.
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 my-8 max-w-[200px] mx-auto">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-orange-400 dark:bg-orange-500 rotate-45" />
            <div className="w-2 h-2 rounded-sm bg-darkest-blue dark:bg-blue-500 rotate-45" />
            <div className="w-2 h-2 rounded-sm bg-orange-400 dark:bg-orange-500 rotate-45" />
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-darkest-blue dark:bg-orange-500 text-white hover:bg-blue-900 dark:hover:bg-orange-600 shadow-lg shadow-blue-900/20 dark:shadow-orange-500/20 hover:shadow-xl transition-all cursor-pointer"
          >
            <Home className="size-4" />
            Dashboard
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-10">
          Error 404 &middot; Romaa Construction ERP
        </p>
      </div>
    </div>
  );
};

export default NotFound;
