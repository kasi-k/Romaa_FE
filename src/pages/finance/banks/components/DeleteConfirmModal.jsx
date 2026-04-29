import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useDeleteAccount } from "../hooks/useAccountTree";

const DeleteConfirmModal = ({ account, onClose }) => {
  const { mutate, isPending } = useDeleteAccount({ onSuccess: onClose });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-orange-400" />

        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 flex items-center justify-center mb-4">
            <Trash2 size={20} className="text-rose-600 dark:text-rose-400" />
          </div>

          {/* Text */}
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Delete Account
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-gray-200">{account.account_name}</strong>?
            <br />
            This is a soft delete — the record is preserved for history.
          </p>

          {/* Account code chip */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 mb-5">
            <code className="text-xs font-mono text-gray-500 dark:text-gray-400">{account.account_code}</code>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.account_name}</span>
          </div>

          {/* Warning for group accounts */}
          {account.is_group && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 mb-4">
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                This is a group account. Deletion will fail if it has active child accounts.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => mutate(account._id)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
