import SearchableSelect from "./SearchableSelect";

// Resolves dot-notation paths (e.g. "emd.emd_amount") into the nested errors object.
// RHF stores nested field errors as { emd: { emd_amount: {...} } }, not as flat keys.
const getError = (errors, name) =>
  name.split(".").reduce((obj, key) => obj?.[key], errors);

export const InputFieldTender = ({
  label,
  name,
  type = "text",
  placeholder,
  register,
  errors,
  options = [], // Only for type="select"
  disabled = false,
  rows = 3, // Only for type="textarea"
  className = "",
  step,
  // For type="select" with SearchableSelect
  watch,
  setValue,
  ...rest // Capture other props like onChange, maxLength, etc.
}) => {
  // 1. Base styles shared across all inputs
  const baseStyles = `
    w-full px-4 py-2.5 
    bg-white dark:bg-gray-800 
    border border-gray-300 dark:border-gray-700 
    rounded-lg 
    text-sm text-gray-900 dark:text-gray-100 
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
    transition-all duration-200
    disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  // 2. Error styles (Red border when error exists)
  const errorStyles = getError(errors, name)
    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
    : "";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* --- Label --- */}
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1"
        >
          {label}
        </label>
      )}

      {/* --- Input Logic --- */}
      {type === "select" ? (
        // A. DROPDOWN — SearchableSelect
        <SearchableSelect
          name={name}
          watch={watch}
          setValue={(n, v) => {
            setValue && setValue(n, v, { shouldValidate: true });
            if (rest.onChange) rest.onChange({ target: { name: n, value: v } });
          }}
          options={options}
          placeholder={placeholder || "Select an option"}
          disabled={disabled}
          hasError={!!getError(errors, name)}
        />
      ) : type === "textarea" ? (
        // B. TEXTAREA
        <textarea
          id={name}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name)}
          {...rest}
          className={`${baseStyles} ${errorStyles} resize-y`}
        />
      ) : (
        // C. STANDARD INPUT (text, number, date, email, password)
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          step={step}
          disabled={disabled}
          {...register(name)}
          {...rest}
          className={`${baseStyles} ${errorStyles}`}
        />
      )}

      {/* --- Error Message --- */}
      {getError(errors, name) && (
        <span className="text-[10px] font-semibold text-red-500 ml-1 animate-pulse">
          {getError(errors, name)?.message}
        </span>
      )}
    </div>
  );
};