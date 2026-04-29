import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  Calendar, 
  User, 
  MapPin, 
  Building2, 
  FileText, 
  Hash,
  Clock
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineFileAdd } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import RequestRegister from "./RequestRegister";
import { API } from "../../../constant";

// --- UI Sub-Components ---

const StatusBadge = ({ status }) => {
  const config = {
    "Request Raised": { color: "bg-blue-100 text-blue-700 border-blue-200", label: "New Request" },
    "Quotation Requested": { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Enquiry Sent" },
    "Quotation Received": { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Quotes Received" },
    "Vendor Approved": { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Vendor Selected" },
    "Work Order Issued": { color: "bg-indigo-100 text-indigo-700 border-indigo-200", label: "Order Issued" },
    "Completed": { color: "bg-green-100 text-green-700 border-green-200", label: "Completed" },
  };

  const current = config[status] || { color: "bg-gray-100 text-gray-600 border-gray-200", label: status || "Pending" };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center w-fit gap-2 ${current.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {current.label}
    </span>
  );
};

const InfoCard = ({ title, icon, children, accentColor = "border-blue-500" }) => (
  <div className={`bg-white dark:bg-layout-dark rounded-md shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden`}>
    <div className={`px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2 border-l-4 ${accentColor}`}>
      {icon}
      <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 mb-4 last:mb-0">
    <div className="mt-0.5 text-gray-400 dark:text-gray-500 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">{value || "-"}</p>
    </div>
  </div>
);

// --- Main Component ---

const ViewPurchaseRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safe State Access
  const passedItem = location.state?.item || {};
  console.log(passedItem);
  const requestIdParam = passedItem.requestId;
  const projectIdParam = passedItem.projectId; // Assuming 'projectName' holds the ID based on context

  const [requestRegister, setRequestRegister] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestIdParam || !projectIdParam) return;
      
      try {
        const res = await axios.get(
          `${API}/purchaseorderrequest/api/getdetailbyId/${projectIdParam}/${requestIdParam}`
        );
        setData(res.data?.data);
      } catch (err) {
        console.error("Error fetching request:", err);
        toast.error("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestIdParam, projectIdParam]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Retrieving Request Details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Request Not Found</p>
        <Button button_name="Go Back" onClick={() => navigate("..")} />
      </div>
    );
  }

  // Formatting Dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="h-full flex flex-col dark:bg-[#0b0f19] p-2">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Title
              title="Purchase Management"
              sub_title="Purchase Requests"
              page_title={data.requestId}
            />
            <div className="mt-2 flex items-center gap-3">
               <StatusBadge status={data.status} />
               <span className="text-xs text-gray-400">Created on {formatDate(data.requestDate)}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              button_name="Request Register"
              button_icon={<AiOutlineFileAdd size={18} />}
              onClick={() => setRequestRegister(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
            />
            <Button
              button_name="Back"
              button_icon={<ChevronLeft size={18} />}
              onClick={() => navigate("..")}
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            />
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto pb-10 space-y-3 pr-2 custom-scrollbar">
          
          {/* INFO GRIDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            
            {/* 1. GENERAL INFO */}
            <InfoCard title="General Information" icon={<FileText size={16} className="text-blue-500"/>} accentColor="border-l-blue-500">
              <DetailRow icon={<Hash size={16} />} label="Request Title" value={data.title} />
              <DetailRow icon={<Building2 size={16} />} label="Project ID" value={data.projectId} />
              <DetailRow icon={<User size={16} />} label="Created By" value={data.createdBy?.name || "Admin"} />
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{data.description || "No additional description provided."}"
                </p>
              </div>
            </InfoCard>

            {/* 2. SITE INFO */}
            <InfoCard title="Site Details" icon={<MapPin size={16} className="text-emerald-500"/>} accentColor="border-l-emerald-500">
              <DetailRow icon={<Building2 size={16} />} label="Site Name" value={data.siteDetails?.siteName} />
              <DetailRow icon={<MapPin size={16} />} label="Location" value={data.siteDetails?.location} />
              <DetailRow icon={<User size={16} />} label="Site Incharge" value={data.siteDetails?.siteIncharge} />
            </InfoCard>

            {/* 3. TIMELINE INFO */}
            <InfoCard title="Timeline" icon={<Clock size={16} className="text-purple-500"/>} accentColor="border-l-purple-500">
              <DetailRow icon={<Calendar size={16} />} label="Request Date" value={formatDate(data.requestDate)} />
              <DetailRow icon={<Calendar size={16} className="text-red-400" />} label="Required By" value={
                <span className="text-red-500 font-semibold">{formatDate(data.requiredByDate)}</span>
              } />
              <DetailRow icon={<Clock size={16} />} label="Last Updated" value={formatDate(data.updatedAt)} />
            </InfoCard>

          </div>

          {/* MATERIALS TABLE CARD */}
          <div className="bg-white dark:bg-layout-dark rounded-md shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                Materials Required
                <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  {data.materialsRequired?.length || 0} Items
                </span>
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-16 text-center">#</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Material Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right ">Quantity</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-center ">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.materialsRequired?.length > 0 ? (
                    data.materialsRequired.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-center text-gray-400 font-mono">{index + 1}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.materialName}
                        </td>
                        <td className="px-6 py-3 text-sm text-right font-bold text-gray-700 dark:text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                          {item.unit}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                        No materials listed for this request.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {requestRegister && (
        <RequestRegister onclose={() => setRequestRegister(false)} />
      )}
    </>
  );
};

export default ViewPurchaseRequest;