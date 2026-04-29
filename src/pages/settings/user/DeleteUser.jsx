import React from "react";
import { toast } from "react-toastify";
import { 
  FiAlertTriangle, 
  FiX, 
  FiUserX, 
  FiShield,
  FiUser
} from "react-icons/fi";
import { useRevokeUserAccess } from "./hooks/useUsers";


const DeleteUser = ({ item, onclose, onDelete }) => {
  // Safe fallback if item is undefined
  const user = item || {};

  // TanStack Query Mutation
  const { mutateAsync: revokeAccess, isPending: loading } = useRevokeUserAccess({ onDelete, onclose });

  const handleRemoveRole = async () => {
    try {
      // Payload: Send roleId as null to unassign
      const payload = { 
        employeeId: user.employeeId, 
        roleId: null 
      };

      await revokeAccess(payload);
      toast.success(`Access revoked for ${user.name}`);
    } catch (err) {
      // Errors are handled in the mutation's onError callback
      console.error("Error revoking role:", err);
      toast.error(err.response?.data?.message || "Failed to revoke access");
    }
  };

  if (!user.employeeId) return null;

  return (
    // --- Overlay ---
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font animate-fade-in">
      
      {/* --- Modal Card --- */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all scale-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onclose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="p-6 text-center">
          
          {/* 1. Warning Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6 animate-pulse-slow">
            <FiAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>

          {/* 2. Text Content */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Revoke System Access?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to remove the role from this user? They will 
            <span className="font-bold text-red-500"> lose access </span> 
            to the dashboard immediately.
          </p>

          {/* 3. User Identity Card (Confirmation Context) */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6 text-left flex items-center gap-3 relative overflow-hidden">
             {/* Red accent line */}
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
             
             <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-300">
                {user.name?.charAt(0).toUpperCase() || <FiUser />}
             </div>
             <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="font-mono">{user.employeeId}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                        <FiShield size={10} /> {user.role?.roleName || "Current Role"}
                    </span>
                </div>
             </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onclose}
              className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveRole}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <FiUserX size={16} />
              )}
              {loading ? "Revoking..." : "Revoke Access"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeleteUser;