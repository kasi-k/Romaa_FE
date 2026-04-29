import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  Award,
  DollarSign,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { PiLinkBold } from "react-icons/pi";

// --- Helper: Status Badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    "Quotation Requested": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    "Pending": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    "Approved": "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    "Rejected": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status || "Pending"}
    </span>
  );
};

// --- Helper: Info Card ---
const InfoCard = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
      {icon}
      <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5 space-y-3 flex-1">
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-start border-b border-gray-50 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
    <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
    <span className={`text-sm font-medium text-right ${highlight ? 'text-red-500 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
      {value || "-"}
    </span>
  </div>
);

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, actionType, vendorName }) => {
  if (!isOpen) return null;

  const isApprove = actionType === "Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 transform transition-all scale-100">
        <div className="p-6 text-center">
          <div className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center ${isApprove ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isApprove ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
          </div>
          
          <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
            {isApprove ? "Accept Quotation?" : "Reject Quotation?"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to <span className={`font-bold ${isApprove ? "text-green-600" : "text-red-600"}`}>{isApprove ? "Accept" : "Reject"}</span> the quotation from <span className="font-semibold text-gray-800 dark:text-gray-200">"{vendorName}"</span>?
            {isApprove && <span className="block mt-2 text-xs bg-yellow-50 text-yellow-700 p-2 rounded border border-yellow-200">Note: Accepting this will automatically reject other pending quotations.</span>}
          </p>

          <div className="flex gap-3 justify-center">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-md transition-colors flex items-center gap-2 ${
                isApprove 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isApprove ? "Yes, Accept" : "Yes, Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---
const ViewPurchaseEnquiry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const passedItem = location.state?.item || {};
  const requestIdParam = passedItem.requestId;
  const projectIdParam = passedItem.projectId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    quotationId: null,
    actionType: null, // "Approved" or "Rejected"
    vendorName: ""
  });

  // Fetch Data
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestIdParam || !projectIdParam) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API}/purchaseorderrequest/api/getQuotationRequested/${projectIdParam}/${requestIdParam}`
        );
        const fetchedData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;
        setData(fetchedData);
      } catch (err) {
        console.error("Error fetching request:", err);
        toast.error("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestIdParam, projectIdParam]);

  // 1. Triggered when user clicks a button in table
  const openConfirmation = (quotationId, actionType, vendorName) => {
    setModalConfig({
      isOpen: true,
      quotationId,
      actionType,
      vendorName
    });
  };

  // 2. Triggered when user clicks "Yes" in Modal
  const handleConfirmAction = async () => {
    const { quotationId, actionType } = modalConfig;
    if (!data) return;

    try {
      const endpoint = actionType === "Approved"
        ? `${API}/purchaseorderrequest/api/purchase-requests/${requestIdParam}/approve-vendor`
        : `${API}/purchaseorderrequest/api/purchase-requests/${requestIdParam}/reject-vendor`;

      const res = await axios.put(endpoint, { quotationId });

      if (res.data.success) {
        toast.success(`Quotation ${actionType} successfully!`);

        // Optimistic UI Update
        setData((prev) => {
          if (actionType === "Approved") {
            return {
              ...prev,
              status: "Work Order Issued",
              vendorQuotations: prev.vendorQuotations.map((q) => {
                if (q.quotationId === quotationId) return { ...q, approvalStatus: "Approved" };
                return { ...q, approvalStatus: "Rejected" };
              }),
            };
          } 
          // Rejected logic
          return {
            ...prev,
            vendorQuotations: prev.vendorQuotations.map((q) =>
              q.quotationId === quotationId ? { ...q, approvalStatus: "Rejected" } : q
            ),
          };
        });
      }
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(error.response?.data?.message || "Action Failed");
    } finally {
      // Close Modal
      setModalConfig({ ...modalConfig, isOpen: false });
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/purchase/enquiryform/${projectIdParam}/${requestIdParam}`;
    navigator.clipboard.writeText(link);
    toast.success("Enquiry link copied!");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading Enquiry Details...</p>
        </div>
      </div>
    );
  }

  // 4. No Data State
  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <AlertCircle size={40} className="text-gray-300" />
        <p className="text-gray-500">No Data Found. Please navigate from the list.</p>
        <Button button_name="Go Back" onClick={() => navigate("..")} />
      </div>
    );
  }

  // Logic to Find L1
  const quotations = data.vendorQuotations || [];
  const sortedQuotes = [...quotations].sort((a, b) => a.totalQuotedValue - b.totalQuotedValue);
  const l1VendorId = sortedQuotes.length > 0 ? sortedQuotes[0].quotationId : null;

  return (
    <div className="h-full flex flex-col dark:bg-[#0b0f19] p-4 overflow-hidden font-roboto-flex">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-4">
        <div>
          <Title
            title="Purchase Management"
            sub_title="Enquiry Details"
            page_title={data.requestId}
          />
          <div className="mt-2 flex items-center gap-3">
             <StatusBadge status={data.status} />
             <span className="text-xs text-gray-400 flex items-center gap-1">
               <Calendar size={12}/> Req Date: {new Date(data.requestDate).toLocaleDateString()}
             </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            button_name="Copy Link"
            button_icon={<PiLinkBold size={18} />}
            onClick={handleCopyLink}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
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

        {/* --- INFO CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* Card 1: General Info */}
          <InfoCard title="General Information" icon={<FileText size={16} className="text-blue-500" />}>
            <DetailRow label="Title" value={data.title} />
            <DetailRow label="Project ID" value={data.projectId} />
            <DetailRow label="Required By" value={new Date(data.requiredByDate).toLocaleDateString()} highlight />
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
               <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Description</p>
               <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{data.description}"</p>
            </div>
          </InfoCard>

          <InfoCard title="Site Details" icon={<MapPin size={16} className="text-emerald-500"/>}>
            <DetailRow label="Site Name" value={data.siteDetails?.siteName} />
            <DetailRow label="Location" value={data.siteDetails?.location} />
            <DetailRow label="Incharge" value={data.siteDetails?.siteIncharge} />
            <DetailRow label="PO Status" value={data.purchaseOrder?.progressStatus} />
          </InfoCard>

          <InfoCard title="Invited Vendors" icon={<User size={16} className="text-purple-500"/>}>
            {data.permittedVendor?.length > 0 ? (
              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                {data.permittedVendor.map((v) => {
                  const hasResponded = quotations.some(q => q.vendorId === v.vendorId);
                  return (
                    <div key={v._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{v.vendorName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{v.vendorId}</span>
                      </div>
                      {hasResponded ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-medium">
                          <CheckCircle2 size={10} /> Received
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded font-medium">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-4">No specific vendors assigned.</p>
            )}
          </InfoCard>
        </div>

        {/* COMPARATIVE STATEMENT */}
        <div className="bg-white dark:bg-layout-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-gray-800/50 gap-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Award className="text-amber-500" size={20} />
                Comparative Statement
              </h3>
              <p className="text-xs text-gray-500 mt-1">Comparing {quotations.length} received quotations.</p>
            </div>
            {l1VendorId && (
              <div className="flex items-center gap-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                <Award size={14} />
                L1 Vendor: <strong>{quotations.find(q => q.quotationId === l1VendorId)?.vendorName}</strong>
              </div>
            )}
          </div>

          {quotations.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
              <AlertCircle size={48} className="opacity-20" />
              <p>No quotations have been received/entered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold border-b dark:border-gray-700">
                    {/* Fixed Material Column */}
                    <th className="px-6 py-4 min-w-[200px] border-r dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Material Request
                    </th>
                    {quotations.map((vendor) => (
                      <th key={vendor._id} className={`px-6 py-4 min-w-[240px] text-center border-r dark:border-gray-700 relative align-top ${vendor.quotationId === l1VendorId ? "bg-green-50/50 dark:bg-green-900/10" : ""}`}>
                        {vendor.quotationId === l1VendorId && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm text-gray-800 dark:text-white font-bold">{vendor.vendorName}</span>
                          <span className="text-[10px] font-normal text-gray-500 flex items-center gap-1">
                            <Briefcase size={10}/> {vendor.quotationId}
                          </span>
                          <span className="text-[10px] font-normal text-gray-400">
                            {new Date(vendor.quotationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {data.materialsRequired?.map((reqMat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 border-r dark:border-gray-700 sticky left-0 bg-white dark:bg-layout-dark z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <p className="font-bold text-gray-700 dark:text-gray-200">{reqMat.materialName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                            Qty: <strong>{reqMat.quantity}</strong> {reqMat.unit}
                          </span>
                          {reqMat.hsnSac && (
                          <div className="text-[10px] text-gray-400 mt-1 pl-1">
                            GST: {(reqMat.taxStructure?.igst || 0) + (reqMat.taxStructure?.cess || 0)}%  | CGST: {(reqMat.taxStructure?.cgst || 0)}% | SGST: {(reqMat.taxStructure?.sgst || 0)}%
                          </div>
                        )}
                        </div>
                      </td>
                      {quotations.map((vendor) => {
                        const quoteItem = vendor.quoteItems?.find(q => q.materialName === reqMat.materialName);
                        return (
                          <td key={vendor._id} className={`px-6 py-4 text-center border-r dark:border-gray-700 ${vendor.quotationId === l1VendorId ? "bg-green-50/20 dark:bg-green-900/5" : ""}`}>
                            {quoteItem ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                 Quoted Rate: ₹{quoteItem.quotedUnitRate}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Total Amount: ₹{quoteItem.totalAmount?.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-red-300 italic">Not Quoted</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 text-right font-bold text-gray-600 dark:text-gray-300 uppercase text-xs sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 border-r dark:border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Total Quoted Value
                    </td>
                    {quotations.map((vendor) => (
                      <td key={vendor._id} className={`px-6 py-4 text-center border-r dark:border-gray-700 ${vendor.quotationId === l1VendorId ? "bg-green-100/30 dark:bg-green-900/20" : ""}`}>
                        <div className={`text-lg font-bold flex items-center justify-center gap-0.5 ${vendor.quotationId === l1VendorId ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-white"}`}>
                         
                          ₹{vendor.totalQuotedValue?.toLocaleString()}
                        </div>
                        {vendor.quotationId === l1VendorId && (
                          <span className="text-[10px] uppercase font-bold text-green-600 tracking-wide block mt-1">Lowest Bid (L1)</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-white dark:bg-layout-dark border-t border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 text-right font-bold text-gray-400 uppercase text-xs sticky left-0 bg-white dark:bg-layout-dark z-10 border-r dark:border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Decision
                    </td>
                    {quotations.map((vendor) => (
                      <td key={vendor._id} className={`px-6 py-4 text-center border-r dark:border-gray-700 ${vendor.quotationId === l1VendorId ? "bg-green-50/10 dark:bg-green-900/5" : ""}`}>
                        {vendor.approvalStatus === "Pending" ? (
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => openConfirmation(vendor.quotationId, "Approved", vendor.vendorName)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <CheckCircle2 size={14} /> Accept
                            </button>
                            <button
                              onClick={() => openConfirmation(vendor.quotationId, "Rejected", vendor.vendorName)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <StatusBadge status={vendor.approvalStatus} />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal Render */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmAction}
        actionType={modalConfig.actionType}
        vendorName={modalConfig.vendorName}
      />
    </div>
  );
};

export default ViewPurchaseEnquiry;