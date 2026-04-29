import { useState } from "react";
import Title from "../../../components/Title";
import ButtonBg from "../../../components/Button";
import { Pencil, User, Briefcase, MapPin, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import EditNMR from "./EditNMR";

const ViewNMR = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const worker = state?.item || {};
  const [onEdit, setOnEdit] = useState(false);

  if (!state?.item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No contract worker data found.</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-blue-600 underline text-sm">Go Back</button>
      </div>
    );
  }

  const InfoBlock = ({ label, value, className = "" }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-200 break-words">{value || "-"}</span>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "INACTIVE": return "bg-gray-100 text-gray-700 border-gray-200";
      case "LEFT": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <>
      {!onEdit ? (
        <div className="font-layout-font flex flex-col overflow-hidden h-screen">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <Title title="HR Management" sub_title="NMR Details" page_title={worker.employee_name || "View NMR"} />
            <div className="mt-4 sm:mt-0">
              <ButtonBg button_name="Edit Profile" button_icon={<Pencil size={16} />} onClick={() => setOnEdit(true)} />
            </div>
          </div>

          <div className="flex-1 p-6 pt-2 space-y-4 overflow-y-auto">

            {/* Personal Info & Status */}
            <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <User className="text-blue-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoBlock label="Worker ID" value={worker.worker_id} />
                <InfoBlock label="Full Name" value={worker.employee_name} />
                <InfoBlock label="Phone" value={worker.contact_phone} />
                <InfoBlock label="Gender" value={worker.gender} />
                <InfoBlock label="Age" value={worker.age} />
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border w-fit ${getStatusColor(worker.status)}`}>
                    {worker.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Work Profile */}
            <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <Briefcase className="text-emerald-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Work Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoBlock label="Contractor ID" value={worker.contractor_id} />
                <InfoBlock label="Role" value={worker.role} />
                <InfoBlock label="Daily Wage" value={worker.daily_wage ? `Rs ${worker.daily_wage}` : "-"} />
                <InfoBlock label="Site Assigned" value={worker.site_assigned} />
              </div>
            </div>

            {/* Address & ID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <MapPin className="text-amber-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Address</h3>
                </div>
                <div className="space-y-4">
                  <InfoBlock label="Street" value={worker.address?.street} />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoBlock label="City" value={worker.address?.city} />
                    <InfoBlock label="State" value={worker.address?.state} />
                    <InfoBlock label="Country" value={worker.address?.country} />
                    <InfoBlock label="Pincode" value={worker.address?.pincode} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Shield className="text-rose-500" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Identity Document</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <InfoBlock label="ID Proof Type" value={worker.id_proof_type} />
                  <InfoBlock label="ID Proof Number" value={worker.id_proof_number} />
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <EditNMR />
      )}
    </>
  );
};

export default ViewNMR;
