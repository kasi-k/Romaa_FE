import React, { useRef, useEffect } from "react";

const OtpInput = ({ length = 6, value, onChange }) => {
  const inputs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Only allow numbers

    const newOtp = value.split("");
    // Take the last character entered (handling overwrite)
    newOtp[index] = val.substring(val.length - 1);
    const combinedOtp = newOtp.join("");
    onChange(combinedOtp);

    // Auto-focus next input
    if (val && index < length - 1 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle Backspace
    if (e.key === "Backspace" && !value[index] && index > 0 && inputs.current[index - 1]) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return; // Validate numbers only

    onChange(pastedData);
    
    // Focus the box after the pasted length or the last box
    const nextIndex = Math.min(pastedData.length, length - 1);
    if(inputs.current[nextIndex]) inputs.current[nextIndex].focus();
  };

  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`w-full h-12 text-center text-lg font-bold rounded-xl border outline-none transition-all
            ${
              value[index]
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500"
                : "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            }
          `}
        />
      ))}
    </div>
  );
};

export default OtpInput;