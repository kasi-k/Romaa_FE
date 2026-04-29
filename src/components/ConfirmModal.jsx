import { IoClose } from "react-icons/io5";
import { CheckCircle2 } from "lucide-react";

const ConfirmModal = ({
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Approve"
}) => {
  return (
    <div className="font-roboto-flex fixed inset-0 flex justify-center items-center backdrop-grayscale-50 drop-shadow-lg backdrop-blur-xs z-60">
      <div className="dark:bg-layout-dark bg-white rounded-md shadow-2xl p-6 w-[400px]">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 cursor-pointer dark:bg-layout-dark bg-white py-2 px-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <IoClose className="size-[24px] text-slate-500" />
          </button>
          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            <div className="mt-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full">
               <CheckCircle2 size={64} strokeWidth={1.5} />
            </div>
            <h2 className="text-center font-semibold text-2xl dark:text-white">
              {title || "Confirm Action"}
            </h2>
            <p className="text-center font-normal text-sm text-slate-500 dark:text-slate-400 px-4">
              {message || "Are you sure you want to proceed with this action?"}
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-8 text-sm font-normal">
            <button
              className="cursor-pointer border border-slate-300 dark:border-slate-700 dark:text-white px-6 py-2 rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-28"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded shadow-sm transition-colors w-28"
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
