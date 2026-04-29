import React, { useState } from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { Pencil, User, Briefcase, MapPin, Shield, Settings, FolderOpen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import EditEmployee from "./EditEmployee";
import ReassignRoleModal from "./ReassignRoleModal";
import UpdateAccessModal from "./UpdateAccessModal";
import AssignProjectsModal from "./AssignProjectsModal";

const ViewEmployee = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [onEdit, setOnEdit] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [accessModal, setAccessModal] = useState(false);
  const [projectsModal, setProjectsModal] = useState(false);

  // Safe access to employee object
  const employee = state?.item || {};

  if (!state?.item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No employee data found.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-2 text-blue-600 underline text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Helper to Render Field
  const InfoBlock = ({ label, value, className = "" }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-200 break-words">
        {value || "-"}
      </span>
    </div>
  );

  // Helper for Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Inactive": return "bg-gray-100 text-gray-700 border-gray-200";
      case "Suspended": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <>
      {!onEdit ? (
        <div className="font-layout-font">
          {/* --- Header Section --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <Title
              title="HR Management"
              sub_title="Employee Details"
              page_title={employee.name || "View Employee"}
            />
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => setProjectsModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <FolderOpen size={14} /> Assign Projects
              </button>
              <button
                onClick={() => setAccessModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
              >
                <Settings size={14} /> Access Settings
              </button>
              <button
                onClick={() => setRoleModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
              >
                <Shield size={14} /> Reassign Role
              </button>
              <ButtonBg
                button_name="Edit Profile"
                button_icon={<Pencil size={16} />}
                onClick={() => setOnEdit(true)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            
            {/* --- Section 1: Identity & Status --- */}
            <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <User className="text-blue-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Identity & Account</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoBlock label="Employee ID" value={employee.employeeId} />
                <InfoBlock label="Full Name" value={employee.name} />
                <InfoBlock label="Email (Login)" value={employee.email} />
                <InfoBlock label="Phone" value={employee.phone} />
                <InfoBlock label="Employee Reference" value={employee.employeeReference || "N/A"} />
                
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</span>
                  <span className="text-sm font-bold text-darkest-blue dark:text-blue-400">
                    {/* Handle if role is populated object OR just ID */}
                    {employee.role?.roleName || employee.role || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border w-fit ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
              </div> 
            </div>

            {/* --- Section 2: Job Details --- */}
            <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <Briefcase className="text-emerald-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Job Profile</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoBlock label="Designation" value={employee.designation} />
                <InfoBlock 
                  label="Date of Joining" 
                  value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB") : "-"} 
                />
                <InfoBlock label="Work Location" value={employee.userType} />
                
                {/* Show Assigned Project only if Site User */}
                {employee.userType === "Site" && (
                  <InfoBlock 
                    label="Assigned Project" 
                    value={employee.assignedProject?.name || "Not Assigned"} 
                  />
                )}
              </div>
            </div>

            {/* --- Section 3: Address & Personal --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                
                {/* Address */}
                <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <MapPin className="text-amber-500" size={20} />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Address Details</h3>
                    </div>
                    <div className="space-y-4">
                        <InfoBlock label="Street" value={employee.address?.street} />
                        <div className="grid grid-cols-3 gap-4">
                            <InfoBlock label="City" value={employee.address?.city} />
                            <InfoBlock label="State" value={employee.address?.state} />
                            <InfoBlock label="Pincode" value={employee.address?.pincode} />
                        </div>
                    </div>
                </div>

                {/* Emergency & ID */}
                <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <Shield className="text-rose-500" size={20} />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Legal & Emergency</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <InfoBlock label="ID Type" value={employee.idProof?.type} />
                        <InfoBlock label="ID Number" value={employee.idProof?.number} />
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-lg border border-rose-100 dark:border-rose-900/30">
                        <p className="text-xs font-bold text-rose-600 mb-3 uppercase">Emergency Contact</p>
                        <div className="grid grid-cols-3 gap-4">
                            <InfoBlock label="Name" value={employee.emergencyContact?.name} />
                            <InfoBlock label="Relation" value={employee.emergencyContact?.relationship} />
                            <InfoBlock label="Phone" value={employee.emergencyContact?.phone} />
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      ) : (
        <EditEmployee item={employee} onCancel={() => setOnEdit(false)} />
      )}

      {roleModal && (
        <ReassignRoleModal employee={employee} onclose={() => setRoleModal(false)} />
      )}
      {accessModal && (
        <UpdateAccessModal employee={employee} onclose={() => setAccessModal(false)} />
      )}
      {projectsModal && (
        <AssignProjectsModal employee={employee} onclose={() => setProjectsModal(false)} />
      )}
    </>
  );
};

export default ViewEmployee;