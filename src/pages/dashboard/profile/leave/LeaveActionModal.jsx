import React, { useState } from "react";
import axios from "axios";
import { API } from "../../../../constant";
import { toast } from "react-toastify";
import { FiX, FiCheck, FiUser } from "react-icons/fi";

const LeaveActionModal = ({ isOpen, onClose, onSuccess, request, user }) => {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    if(!remarks) {
        toast.warning("Please enter remarks first.");
        return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leave/action`, {
        leaveRequestId: request._id,
        actionBy: user._id,
        role: "Manager",
        action: action, // "Approve" or "Reject"
        remarks: remarks
      }, { withCredentials: true });

      toast.success(`Leave ${action}d Successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action Failed");
    } finally {
      setLoading(false);
    }
  };

  if(!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-100">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Review Request</h3>
          <button onClick={onClose}><FiX className="text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-4">
           {/* Employee Summary */}
           <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                 {request.employeeId?.name?.[0]}
              </div>
              <div>
                 <p className="text-sm font-bold text-gray-800">{request.employeeId?.name}</p>
                 <p className="text-xs text-gray-500">{request.leaveType} • {request.totalDays} Days</p>
              </div>
           </div>

           {/* Leave Details */}
           <div className="text-sm space-y-2">
              <div className="flex justify-between">
                 <span className="text-gray-500">Date Range:</span>
                 <span className="font-medium">{new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                 <span className="text-gray-500">Reason:</span>
              </div>
              <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs italic">"{request.reason}"</p>
           </div>

           {/* Manager Remarks */}
           <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Manager Remarks *</label>
              <textarea 
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter comments (e.g., Ensure handover is done)..."
              ></textarea>
           </div>

           {/* Actions */}
           <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => handleAction("Reject")}
                disabled={loading}
                className="py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
              >
                Reject
              </button>
              <button 
                onClick={() => handleAction("Approve")}
                disabled={loading}
                className="py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
              >
                {loading ? "Processing..." : "Approve Leave"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionModal;