import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../components/InputFieldTender";
import { useEditSecurityDeposit } from "../tenders/hooks/useTenders";

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(val ?? 0);

const EditSecurityDeposit = ({ item, onclose, onUpdated }) => {
  const sd = item?.emd?.approved_emd_details;
  const balanceLimit = sd?.security_deposit_pendingAmount || 0;
  const isBalanceZero = balanceLimit <= 0;

  // ✅ Balance-aware validation schema (mirrors EMD pattern)
  const schema = yup.object().shape({
    security_deposit_amount_collected: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .typeError("Please enter a valid amount")
      .required("Amount is required")
      .min(1, "Amount must be greater than 0")
      .max(balanceLimit, `Cannot exceed the pending balance of ${fmt(balanceLimit)}`),
    security_deposit_note: yup.string().required("Note is required"),
  });

  const { mutate: updateDeposit, isPending } = useEditSecurityDeposit({
    onSuccess: onUpdated,
    onClose: onclose,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = (data) => {
    updateDeposit({ tenderId: item.tender_id, data });
  };

  // ✅ Bulletproof numeric entry (typing + pasting)
  const handleNumericOnly = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setValue("security_deposit_amount_collected", value, { shouldValidate: true });
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text");
    if (/[^0-9]/.test(pasteData)) {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Collect Security Deposit</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item?.tender_name || item?.tender_id}</p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar flex flex-col gap-5">

          {/* Balance Summary */}
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex flex-col items-center py-4 px-2 bg-gray-50 dark:bg-gray-800/40">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{fmt(sd?.security_deposit_amount)}</span>
            </div>
            <div className="flex flex-col items-center py-4 px-2 bg-gray-50 dark:bg-gray-800/40">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Collected</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(sd?.security_deposit_amount_collected)}</span>
            </div>
            <div className="flex flex-col items-center py-4 px-2 bg-gray-50 dark:bg-gray-800/40">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Balance</span>
              <span className={`text-sm font-bold ${isBalanceZero ? "text-gray-400" : "text-red-500 dark:text-red-400"}`}>
                {fmt(balanceLimit)}
              </span>
            </div>
          </div>

          {/* Extra Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Project Name</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5 truncate">{item?.tender_name || "—"}</p>
            </div>
            <div className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Expiry Date</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5 truncate">
                {sd?.security_deposit_validity
                  ? new Date(sd.security_deposit_validity).toLocaleDateString("en-GB")
                  : "—"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* ✅ Guard: Show fully-paid banner when balance is zero */}
          {isBalanceZero && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Security Deposit fully collected. No pending balance.
              </p>
            </div>
          )}

          {/* Form Fields */}
          <form id="editSDForm" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <InputFieldTender
              label="Amount Collected"
              name="security_deposit_amount_collected"
              type="text"
              register={register}
              errors={errors}
              placeholder={isBalanceZero ? "Balance fully collected" : "Enter amount"}
              disabled={isBalanceZero}
              onChange={handleNumericOnly}
              onPaste={handlePaste}
            />
            <InputFieldTender
              label="Notes"
              name="security_deposit_note"
              type="textarea"
              register={register}
              errors={errors}
              placeholder="Payment method or reference"
              disabled={isBalanceZero}
            />
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onclose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editSDForm"
            disabled={isPending || isBalanceZero || !isValid}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </>
            ) : (
              <><IoSaveOutline size={16} /> Save Payment</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditSecurityDeposit;
