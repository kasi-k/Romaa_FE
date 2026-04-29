import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import SearchableSelect from "./SearchableSelect";

// Resolves dot-notation paths (e.g. "emd.emd_amount") into the nested errors object.
// RHF stores nested field errors as { emd: { emd_amount: {...} } }, not as flat keys.
const getError = (errors, name) =>
  name.split(".").reduce((obj, key) => obj?.[key], errors);

export const InputField = ({
  label,
  name,
  register,
  errors,
  placeholder,
  type = "text",
  colInp = "col-span-5",
  colLab = "col-span-3",
  options = [],
  onChange,
  readOnly = false,
  // For type="select" with SearchableSelect
  watch,
  setValue,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="grid grid-cols-8 items-center gap-4">
      <label className={`${colLab} text-sm font-medium`}>{label}</label>

      {type === "select" ? (
        <div className="col-span-5">
          <SearchableSelect
            name={name}
            watch={watch}
            setValue={(n, v) => {
              setValue && setValue(n, v, { shouldValidate: true });
              if (onChange) onChange({ target: { name: n, value: v } });
            }}
            options={options}
            placeholder={placeholder || "Select..."}
            hasError={!!getError(errors, name)}
          />
        </div>
      ) : type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          {...register(name)}
          readOnly={readOnly} 
          className={`${colInp} border dark:border-border-dark-grey border-input-bordergrey rounded-lg outline-none py-2 px-2 placeholder:text-xs placeholder:font-light
        ${getError(errors, name) ? "border-red-500" : ""}`}
          rows={4}
        />
      ) : type === "file" ? (
        <input
          type="file"
          placeholder={placeholder}
          {...register(name)}
          
          className={`col-span-5 border appearance-none dark:border-border-dark-grey border-input-bordergrey rounded-lg outline-none py-2 px-2 placeholder:text-xs placeholder:font-light
        ${getError(errors, name) ? "border-red-500" : ""}`}
        />
      ) : type === "password" ? (
        <div className="col-span-5 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            readOnly={readOnly} 
            {...register(name)}
            className={`w-full border appearance-none dark:border-border-dark-grey border-input-bordergrey rounded-lg outline-none py-2 px-2 pr-8 placeholder:text-xs placeholder:font-light
            ${getError(errors, name) ? "border-red-500" : ""}`}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          readOnly={readOnly} 
          {...register(name)}
          className={`col-span-5 border dark:border-border-dark-grey border-input-bordergrey rounded-lg outline-none py-2 px-2 placeholder:text-xs placeholder:font-light
        ${getError(errors, name) ? "border-red-500" : ""}`}
        />
      )}

      {getError(errors, name) && (
        <p className="text-red-500 text-xs col-span-8 text-end">
          {getError(errors, name).message}
        </p>
      )}
    </div>
  );
};
