import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";

const ComingSoon = ({ title, description }) => {
  const location = useLocation();
  return (
    <div className="font-roboto-flex flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
        <Construction size={36} className="text-amber-600 dark:text-amber-400" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title || "Coming Soon"}
      </h1>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 mb-3">
        {description ||
          "This screen is being built. The backend API is ready — the UI will land in an upcoming phase."}
      </p>
      <code className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        {location.pathname}
      </code>
    </div>
  );
};

export default ComingSoon;
