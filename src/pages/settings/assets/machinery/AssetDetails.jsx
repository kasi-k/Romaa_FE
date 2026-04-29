import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, MapPin, Calendar, Truck, FileText, Settings, 
  CreditCard, AlertCircle, CheckCircle2, Clock, 
  Activity, Download, PenTool 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../../../../constant";
import { toast } from "react-toastify";
// Import your EditMachinery component (adjust path as necessary)
import EditMachinery from "./EditMachinery";
import Loader from "../../../../components/Loader";
import FuelWidget from "./FuelWidget";
import FuelHistoryModal from "./FuelHistoryModal";

const AssetDetails = () => {
  const navigate = useNavigate();
  const { assetId } = useParams();
  
  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("daily");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal State
  const [isFuelHistoryOpen, setIsFuelHistoryOpen] = useState(false);

  const fetchAsset = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/machineryasset/getbyid/${assetId}`);
      setData(res.data.data || res.data || {}); 
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    setLoading(true); 
    fetchAsset();
  }, [fetchAsset]);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleAssetUpdated = () => {
    fetchAsset(); 
    setIsEditModalOpen(false); 
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800",
      Maintenance: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800",
      Idle: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${styles[status] || styles.Idle}`}>
        {status || "Unknown"}
      </span>
    );
  };

  const ComplianceRow = ({ label, date }) => {
    if (!date) return null;
    const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    
    let colorClass = "text-emerald-600 dark:text-emerald-400";
    let icon = <CheckCircle2 size={16} className="text-emerald-500" />;
    let statusText = `${daysLeft} days remaining`;

    if (daysLeft < 0) {
      colorClass = "text-red-600 dark:text-red-400";
      icon = <AlertCircle size={16} className="text-red-500" />;
      statusText = `Expired ${Math.abs(daysLeft)} days ago`;
    } else if (daysLeft < 30) {
      colorClass = "text-amber-600 dark:text-amber-400";
      icon = <AlertCircle size={16} className="text-amber-500" />;
      statusText = `Expires in ${daysLeft} days`;
    }

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
            <p className="text-xs text-gray-500">{formatDate(date)}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold ${colorClass} bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded`}>
          {statusText}
        </span>
      </div>
    );
  };

  const DetailItem = ({ label, value }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1 truncate">{value || "-"}</p>
    </div>
  );

  if (loading) return <Loader />;

  if (!data) return <div className="p-10 text-center">Asset not found</div>;

  return (
    <div className="h-full overflow-y-auto no-scrollbar text-gray-800 dark:text-gray-200 font-sans pb-10">
      
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:h-16 sm:py-0 sm:flex-nowrap">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {data.assetName}
                </h1>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-500 truncate">
                  <span>{data.assetId}</span>
                  <span>•</span>
                  <span className="truncate">{data.assetType}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <Settings size={16} /> Manage
              </button>

              <button
                onClick={handleEditClick}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md transition-all"
              >
                <PenTool size={14} className="sm:hidden" />
                <PenTool size={16} className="hidden sm:inline" />
                <span className="hidden xs:inline sm:inline">Edit Details</span>
                <span className="xs:hidden sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-3 md:justify-between">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{data.assetName}</h2>
                  <StatusBadge status={data.currentStatus} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-1 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><Truck size={14}/> {data.assetCategory}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> Mfg: {data.manufacturingYear}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase font-semibold">Current Location</p>
                <div className="flex items-center gap-1.5 mt-1 text-blue-600 dark:text-blue-400 font-medium text-sm">
                  <MapPin size={16} className="shrink-0" />
                  <span className="truncate">{data.currentSite}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">Project: {data.projectId}</p>
              </div>
              <div className="h-auto w-px bg-gray-100 dark:bg-gray-800 hidden md:block"></div>
              <div>
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase font-semibold">Utilization</p>
                <div className="flex items-center gap-1.5 mt-1 text-gray-900 dark:text-white font-bold text-base sm:text-lg">
                  <Activity size={16} className="text-purple-500" />
                  {data.lastReading} <span className="text-xs font-normal text-gray-500">{data.trackingMode?.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
     
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings size={18} className="text-gray-400" /> Technical Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="Serial Number" value={data.serialNumber} />
                <DetailItem label="Model Number" value={data.modelNumber} />
                <DetailItem label="Chassis Number" value={data.chassisNumber} />
                <DetailItem label="Engine Number" value={data.engineNumber} />
                <DetailItem label="Fuel Type" value={data.fuelType} />
                <DetailItem label="Tank Capacity" value={`${data.fuelTankCapacity} L`} />
                <DetailItem label="Supplier" value={data.supplierName} />
                <DetailItem label="GPS Device" value={data.gps?.isInstalled ? `Online (${data.gps.provider})` : "Not Installed"} />
              </div>
            </div>

      
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-[400px] sm:h-[500px]">
              <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" /> Activity Logs
                </h3>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {['daily', 'maintenance'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold rounded-md capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-auto flex-1 p-4 sm:p-6 text-center text-gray-500 text-sm">
                Log table content would go here...
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FuelWidget
              asset={data}
              onRefreshed={fetchAsset}
              onViewHistory={() => setIsFuelHistoryOpen(true)}
            />

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-gray-400" /> Compliance
              </h3>
              <div className="space-y-1">
                <ComplianceRow label="Insurance Policy" date={data.compliance?.insuranceExpiry} />
                <ComplianceRow label="Fitness Certificate" date={data.compliance?.fitnessCertExpiry} />
                <ComplianceRow label="Pollution Check (PUC)" date={data.compliance?.pollutionCertExpiry} />
                <ComplianceRow label="Road Tax" date={data.compliance?.roadTaxExpiry} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-400" /> Financials
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Purchase Cost</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(data.purchaseCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Purchase Date</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                    {formatDate(data.purchaseDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Invoice Number</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                    {data.invoiceNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Download size={18} className="text-gray-400" /> Attachments
              </h3>
               <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                  <button className="text-xs text-blue-600 font-medium mt-2 hover:underline">
                    Upload New
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditMachinery
          asset={data}
          onclose={handleCloseModal}
          onUpdate={handleAssetUpdated}
        />
      )}

      {isFuelHistoryOpen && (
        <FuelHistoryModal
          asset={data}
          onClose={() => setIsFuelHistoryOpen(false)}
        />
      )}

    </div>
  );
};

export default AssetDetails;