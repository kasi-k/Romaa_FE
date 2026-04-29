import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  User,
  FileText,
  DollarSign,
  AlertCircle,
  Printer,
  Truck,
  Check,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import Button from "../../../components/Button";
import Title from "../../../components/Title";

// --- Assets ---
import LOGO from "../../../assets/images/romaa logo.png";
import Icon from "../../../assets/images/logo icon.png";

// --- Helper: Status Badge (Screen Only) ---
const StatusBadge = ({ status }) => {
  const styles = {
    "Vendor Approved":
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    "Work Order Issued":
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    "In Progress":
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    Completed:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {status}
    </span>
  );
};

// --- Helper: Info Card (Screen Only) ---
const InfoCard = ({ title, icon, children, className }) => (
  <div
    className={`bg-white dark:bg-layout-dark rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col ${className}`}
  >
    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
      {icon}
      <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div className="p-5 space-y-3 flex-1">{children}</div>
  </div>
);

const DetailRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-start border-b border-gray-50 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
    <span className="text-xs font-semibold text-gray-400 uppercase">
      {label}
    </span>
    <span
      className={`text-sm font-medium text-right ${highlight ? "text-blue-600 font-bold" : "text-gray-800 dark:text-gray-200"}`}
    >
      {value || "-"}
    </span>
  </div>
);

const ViewPurchaseOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedItem = location.state?.item || {};
  const requestIdParam = passedItem.requestId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passingLoading, setPassingLoading] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestIdParam) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API}/purchaseorderrequest/api/getQuotationApproved/${requestIdParam}`,
        );
        const fetchedData = Array.isArray(res.data?.data)
          ? res.data.data[0]
          : res.data?.data;
        setData(fetchedData);
      } catch (err) {
        console.error("Error fetching PO:", err);
        toast.error("Failed to load Purchase Order details");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestIdParam]);

  const handlePassPO = async () => {
    // If already issued, do nothing
    if (data.status === "Purchase Order Issued") return;

    setPassingLoading(true);
    try {
      // API call to pass PO
      await axios.put(
        `${API}/purchaseorderrequest/api/pass_po/${requestIdParam}`,
        {
          status: "Purchase Order Issued",
        },
      );

      toast.success("PO passed successfully");

      // Update Local State (Optimistic UI Update)
      setData((prev) => ({
        ...prev,
        status: "Purchase Order Issued",
      }));
    } catch (error) {
      console.error("Error passing PO:", error);
      toast.error(
        error.response?.data?.message || "Failed to pass Purchase Order",
      );
    } finally {
      setPassingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  if (!data)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No Data Found
      </div>
    );

  const vendor = data.selectedVendor;
  const isPOIssued = data.status === "Purchase Order Issued";
  const isInState = vendor?.place_of_supply === "InState";

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section {
            position: absolute; left: 0; top: 0;
            width: 210mm; background: white !important; color: black !important;
          }
        }
      `}</style>

      {/* =======================================
          1. SCREEN VIEW (MODERN UI)
          Has class 'print:hidden' so it vanishes on print
         ======================================= */}
      <div className="h-full flex flex-col  dark:bg-[#0b0f19] p-4 overflow-hidden font-roboto-flex print:hidden">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <Title
              title="Purchase Management"
              sub_title="Order Summary"
              page_title={`Purchase Order #${data.requestId}`}
            />
            <div className="mt-2 flex items-center gap-3">
              <StatusBadge status={data.status} />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} /> Issued:{" "}
                {new Date(
                  data.purchaseOrder?.issueDate || Date.now(),
                ).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {data.status !== "Completed" && (
              <Button
                button_name={
                  isPOIssued
                    ? "PO Passed"
                    : passingLoading
                      ? "Processing..."
                      : "Pass PO"
                }
                button_icon={<Check size={18} />}
                onClick={handlePassPO}
                bgColor={isPOIssued ? "bg-green-800" : "bg-orange-500"}
                textColor="text-white"
                paddingX="px-4"
                paddingY="py-2"
                disabled={isPOIssued || passingLoading}
              />
            )}
            <Button
              button_name="View Invoice"
              button_icon={<Printer size={18} />}
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
          {/* INFO CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <InfoCard
              title="Project Info"
              icon={<FileText size={16} className="text-blue-500" />}
            >
              <DetailRow label="Project ID" value={data.projectId} />
              <DetailRow label="Title" value={data.title} />
              <DetailRow
                label="Delivery By"
                value={
                  vendor?.deliveryPeriod
                    ? new Date(vendor.deliveryPeriod).toLocaleDateString()
                    : "-"
                }
              />
              <div className="pt-1">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                  Description
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  "{data.description}"
                </p>
              </div>
            </InfoCard>

            <InfoCard
              title="Site Details"
              icon={<MapPin size={16} className="text-emerald-500" />}
            >
              <DetailRow label="Site Name" value={data.siteDetails?.siteName} />
              <DetailRow label="Location" value={data.siteDetails?.location} />
              <DetailRow
                label="Incharge"
                value={data.siteDetails?.siteIncharge}
              />
              <DetailRow
                label="Progress"
                value={data.purchaseOrder?.progressStatus}
              />
            </InfoCard>

            <InfoCard
              title="Selected Vendor"
              icon={<User size={16} className="text-purple-500" />}
            >
              <DetailRow label="Name" value={vendor?.vendorName} highlight />
              <DetailRow label="Vendor ID" value={vendor?.vendorId} />
              <DetailRow label="Contact" value={vendor?.contact || "-"} />
              <div className="pt-1">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                  Address
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {vendor?.address || "-"}
                </p>
              </div>
            </InfoCard>
          </div>

          {/* PURCHASE ORDER ITEMS TABLE (SCREEN) */}
          <div className="bg-white dark:bg-layout-dark rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Truck className="text-blue-500" size={20} />
                Purchase Order Items
              </h3>
              <span className="text-xs text-gray-500 bg-white dark:bg-gray-700 px-3 py-1 rounded border border-gray-200 dark:border-gray-600">
                Ref:{" "}
                <span className="font-mono font-bold text-gray-700 dark:text-gray-200">
                  {vendor?.quotationId || "N/A"}
                </span>
              </span>
            </div>

            {!vendor?.quoteItems ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <AlertCircle size={48} className="opacity-20" />
                <p>No item details found for this approved vendor.</p>
              </div>
            ) : (() => {
              const totalTaxAmt = vendor.quoteItems?.reduce((acc, item) => {
                const taxableValue = (item.quantity || 0) * (item.quotedUnitRate || 0);
                const tax = isInState
                  ? (taxableValue * ((item.taxStructure?.cgst || 0) + (item.taxStructure?.sgst || 0))) / 100
                  : (taxableValue * (item.taxStructure?.igst || 0)) / 100;
                return acc + tax;
              }, 0) || 0;
              const netPayableAmt = (vendor.totalQuotedValue || 0) + totalTaxAmt;
              const fmtNum = (n) =>
                Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

              return (
                <>
                  {/* ── Scrollable items table ── */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left table-fixed">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold border-b dark:border-gray-700">
                          <th className="px-3 py-3 border-r dark:border-gray-700 text-center" style={{ width: "48px" }}>
                            S.No
                          </th>
                          <th className="px-4 py-3 border-r dark:border-gray-700">
                            Material Description
                          </th>
                          <th className="px-3 py-3 border-r dark:border-gray-700 text-center" style={{ width: isInState ? "88px" : "100px" }}>
                            Qty / Unit
                          </th>
                          <th className="px-3 py-3 border-r dark:border-gray-700 text-right" style={{ width: isInState ? "88px" : "100px" }}>
                            Rate (₹)
                          </th>
                          <th className="px-3 py-3 border-r dark:border-gray-700 text-right" style={{ width: isInState ? "96px" : "112px" }}>
                            Taxable Val (₹)
                          </th>
                          {isInState ? (
                            <>
                              <th className="px-3 py-3 border-r dark:border-gray-700 text-right" style={{ width: "88px" }}>CGST</th>
                              <th className="px-3 py-3 border-r dark:border-gray-700 text-right" style={{ width: "88px" }}>SGST</th>
                            </>
                          ) : (
                            <th className="px-3 py-3 border-r dark:border-gray-700 text-right" style={{ width: "112px" }}>IGST</th>
                          )}
                          <th className="px-3 py-3 text-right bg-blue-50/50 dark:bg-blue-900/10" style={{ width: isInState ? "96px" : "112px" }}>
                            Total (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {vendor.quoteItems?.map((item, idx) => {
                          const taxableValue =
                            (item.quantity || 0) * (item.quotedUnitRate || 0);
                          const cgstAmt =
                            (taxableValue * (item.taxStructure?.cgst || 0)) / 100;
                          const sgstAmt =
                            (taxableValue * (item.taxStructure?.sgst || 0)) / 100;
                          const igstAmt =
                            (taxableValue * (item.taxStructure?.igst || 0)) / 100;
                          const totalTax = isInState ? cgstAmt + sgstAmt : igstAmt;
                          const rowTotal = taxableValue + totalTax;

                          return (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-[11px]"
                            >
                              <td className="px-4 py-3 text-center border-r dark:border-gray-700 text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3 border-r dark:border-gray-700">
                                <div className="font-bold text-gray-700 dark:text-gray-200">
                                  {item.materialName}
                                </div>
                                <div className="text-[9px] text-gray-400 uppercase">
                                  HSN: {item.hsnSac || "N/A"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center border-r dark:border-gray-700">
                                {item.quantity}{" "}
                                <span className="text-gray-400">{item.unit}</span>
                              </td>
                              <td className="px-4 py-3 text-right border-r dark:border-gray-700 tabular-nums font-medium">
                                {fmtNum(item.quotedUnitRate)}
                              </td>
                              <td className="px-4 py-3 text-right border-r dark:border-gray-700 tabular-nums font-medium">
                                {fmtNum(taxableValue)}
                              </td>
                              {isInState ? (
                                <>
                                  <td className="px-4 py-3 text-right border-r dark:border-gray-700 bg-gray-50/30 dark:bg-transparent">
                                    <div className="tabular-nums font-medium">{fmtNum(cgstAmt)}</div>
                                    <div className="text-[9px] text-gray-400">{item.taxStructure?.cgst}%</div>
                                  </td>
                                  <td className="px-4 py-3 text-right border-r dark:border-gray-700 bg-gray-50/30 dark:bg-transparent">
                                    <div className="tabular-nums font-medium">{fmtNum(sgstAmt)}</div>
                                    <div className="text-[9px] text-gray-400">{item.taxStructure?.sgst}%</div>
                                  </td>
                                </>
                              ) : (
                                <td className="px-4 py-3 text-right border-r dark:border-gray-700 bg-gray-50/30 dark:bg-transparent">
                                  <div className="tabular-nums font-medium">{fmtNum(igstAmt)}</div>
                                  <div className="text-[9px] text-gray-400">{item.taxStructure?.igst}%</div>
                                </td>
                              )}
                              <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-800 dark:text-gray-200 bg-blue-50/20 dark:bg-blue-900/5">
                                {fmtNum(rowTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Summary panel — outside scroll so it's always fully visible ── */}
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end">
                    <div className="w-72 space-y-2 text-sm">
                      {/* Base Value */}
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Base Value
                        </span>
                        <span className="tabular-nums font-semibold text-gray-800 dark:text-gray-200">
                          ₹ {fmtNum(vendor.totalQuotedValue)}
                        </span>
                      </div>
                      {/* Tax */}
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          {isInState ? "Tax (CGST + SGST)" : "Tax (IGST)"}
                        </span>
                        <span className="tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                          + ₹ {fmtNum(totalTaxAmt)}
                        </span>
                      </div>
                      {/* Net Payable */}
                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                            Net Payable
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5 italic">
                            Base Value + GST
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 mr-1">₹</span>
                          <span className="text-xl font-black tabular-nums text-blue-700 dark:text-blue-400">
                            {fmtNum(netPayableAmt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── PRINT / INVOICE ─────────────────────────────────────────────────── */}
      {(() => {
        const ITEMS_PER_PAGE = 6;
        const allItems = vendor?.quoteItems || [];

        // Per-item tax calculations
        const itemRows = allItems.map((item) => {
          const taxable = (item.quantity || 0) * (item.quotedUnitRate || 0);
          const cgst    = (taxable * (item.taxStructure?.cgst || 0)) / 100;
          const sgst    = (taxable * (item.taxStructure?.sgst || 0)) / 100;
          const igst    = (taxable * (item.taxStructure?.igst || 0)) / 100;
          const total   = isInState ? taxable + cgst + sgst : taxable + igst;
          return { ...item, taxable, cgst, sgst, igst, total };
        });

        const baseValue    = vendor?.totalQuotedValue || 0;
        const totalTaxable = itemRows.reduce((s, r) => s + r.taxable, 0);

        // Group items by their GST rate combination
        const gstGroupMap = {};
        itemRows.forEach((item) => {
          const key = `${item.taxStructure?.cgst||0}_${item.taxStructure?.sgst||0}_${item.taxStructure?.igst||0}`;
          if (!gstGroupMap[key]) gstGroupMap[key] = {
            cgstRate: item.taxStructure?.cgst || 0,
            sgstRate: item.taxStructure?.sgst || 0,
            igstRate: item.taxStructure?.igst || 0,
            taxable: 0, cgst: 0, sgst: 0, igst: 0,
          };
          gstGroupMap[key].taxable += item.taxable;
          gstGroupMap[key].cgst    += item.cgst;
          gstGroupMap[key].sgst    += item.sgst;
          gstGroupMap[key].igst    += item.igst;
        });
        const gstGroups  = Object.values(gstGroupMap);
        const totalAllTax = isInState
          ? gstGroups.reduce((s, g) => s + g.cgst + g.sgst, 0)
          : gstGroups.reduce((s, g) => s + g.igst, 0);
        const netPayable  = baseValue + totalAllTax;
        const hasCgst = isInState;
        const hasSgst = isInState;
        const hasIgst = !isInState;

        const pFmt  = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const pDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
        const poNo  = data.purchaseOrder?.poNumber  || data.requestId || "—";
        const issued = data.purchaseOrder?.issueDate || data.requestDate;

        // Chunk items into pages
        const chunks = [];
        if (allItems.length === 0) { chunks.push([]); }
        else { for (let i = 0; i < itemRows.length; i += ITEMS_PER_PAGE) chunks.push(itemRows.slice(i, i + ITEMS_PER_PAGE)); }
        const totalPages = chunks.length;

        const CompactHeader = () => (
          <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: "2px solid #2B3A6B" }}>
            <img src={LOGO} alt="ROMAA" className="h-9 w-auto object-contain" />
            <div className="text-right text-xs text-gray-500">
              <span className="font-semibold text-gray-800 font-mono">{poNo}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>{pDate(issued)}</span>
              <span className="ml-2 text-[10px] text-gray-400 italic">contd.</span>
            </div>
          </div>
        );

        const ItemsTable = ({ chunk, startIdx }) => (
          <div className="relative flex-1">
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `url(${Icon})`, backgroundRepeat: "no-repeat",
              backgroundPosition: "center", backgroundSize: "28%", opacity: 0.04,
            }} />
            <table className="w-full relative" style={{ borderCollapse: "collapse", fontSize: "10px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #2B3A6B" }}>
                  {[
                    { h: "Sl.",                 w: "24px",   align: "center" },
                    { h: "Material Description",w: "auto",   align: "left"   },
                    { h: "HSN",                 w: "48px",   align: "right"  },
                    { h: "Qty",                 w: "40px",   align: "right"  },
                    { h: "Unit",                w: "36px",   align: "right"  },
                    { h: "Rate (Rs.)",          w: "72px",   align: "right"  },
                    { h: "Taxable Val",         w: "72px",   align: "right"  },
                    { h: "Total (Rs.)",         w: "72px",   align: "right"  },
                  ].map(({ h, w, align }) => (
                    <th key={h} className="py-2 pb-2 font-bold text-gray-700"
                      style={{ textAlign: align, width: w, paddingRight: align === "right" ? "4px" : 0 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chunk.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="py-2 text-center text-gray-400">{startIdx + i + 1}</td>
                    <td className="py-2 pr-2 text-gray-800 font-medium">{item.materialName}</td>
                    <td className="py-2 pr-1 text-right text-gray-500">{item.hsnSac || "—"}</td>
                    <td className="py-2 pr-1 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-2 pr-1 text-right text-gray-500 uppercase">{item.unit}</td>
                    <td className="py-2 pr-1 text-right text-gray-600">{pFmt(item.quotedUnitRate)}</td>
                    <td className="py-2 pr-1 text-right text-gray-600">{pFmt(item.taxable)}</td>
                    <td className="py-2 text-right text-gray-800 font-semibold">{pFmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        return (
          <div id="print-section" className="hidden print:block font-roboto-flex text-black bg-white">
            {chunks.map((chunk, pageIdx) => {
              const isFirst = pageIdx === 0;
              const isLast  = pageIdx === totalPages - 1;
              const startIdx = pageIdx * ITEMS_PER_PAGE;

              return (
                <div key={pageIdx} style={{
                  width: "210mm", height: "297mm", boxSizing: "border-box",
                  padding: "10mm 12mm", display: "flex", flexDirection: "column",
                  background: "white", pageBreakAfter: isLast ? "auto" : "always", overflow: "hidden",
                }}>

                  {isFirst ? (
                    <>
                      {/* Page 1 full header */}
                      <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "3px solid #2B3A6B" }}>
                        <img src={LOGO} alt="ROMAA" className="h-12 w-auto object-contain" />
                        <div className="text-right">
                          <p className="font-extrabold text-xl tracking-[0.2em] uppercase" style={{ color: "#2B3A6B" }}>PURCHASE ORDER</p>
                          <div className="mt-1 text-xs space-y-0.5 text-gray-500">
                            <p>PO No &nbsp;<span className="font-semibold text-gray-800 font-mono">{poNo}</span></p>
                            <p>Date &nbsp;&nbsp;<span className="font-semibold text-gray-800">{pDate(issued)}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* FROM / TO */}
                      <div className="grid grid-cols-2 mb-3" >
                        <div className="px-4 py-3" >
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "#2B3A6B" }}>From</p>
                          <p className="font-extrabold text-sm leading-tight" style={{ color: "#2B3A6B" }}>ROMAA INFRAA PVT. LTD</p>
                          <div className="text-[11px] leading-[1.6] text-gray-500 mt-1">
                            <p>1/107, P.R. Road, Nerkundram, Chennai – 600107</p>
                            <p>Ph: 044-23333333 &nbsp;·&nbsp; </p>
                            <p>GSTIN: 33AAECR6992B1Z9</p>
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "#2B3A6B" }}>To</p>
                          <p className="font-extrabold text-sm leading-tight text-gray-900">{vendor?.vendorName || "—"}</p>
                          <div className="text-[11px] leading-[1.6] text-gray-500 mt-1">
                            <p className="whitespace-pre-line">{vendor?.address || "—"}</p>
                            {vendor?.contact && <p>Ph: {vendor.contact}</p>}
                            {vendor?.gstin   && <p>GSTIN: {vendor.gstin}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Ref row */}
                      <div className="flex justify-between gap-6 text-[11px] mb-3">
                        
                        <p className="text-gray-500">Ref No. &nbsp;<span className="font-semibold text-gray-800">{vendor?.quotationId || "—"}</span></p>
                        <p className="text-gray-500">Ref Date &nbsp;<span className="font-semibold text-gray-800">{pDate(vendor?.deliveryPeriod)}</span></p>
                        {data.siteDetails?.siteIncharge && (
                          <p className="text-gray-500">Incharge &nbsp;<span className="font-semibold text-gray-800">{data.siteDetails.siteIncharge}</span></p>
                        )}
                        {data.siteDetails?.location && (
                          <p className="text-gray-500">Site &nbsp;<span className="font-semibold text-gray-800">{data.siteDetails.location}</span></p>
                        )}
                      </div>
                      <div className="mb-3" style={{ borderTop: "1px solid #e2e8f0" }} />
                    </>
                  ) : (
                    <CompactHeader />
                  )}

                  {/* Items table */}
                  <ItemsTable chunk={chunk} startIdx={startIdx} />

                  {/* Last page only: tax summary + terms + footer */}
                  {isLast && (
                    <div className="mt-4 space-y-3">

                      {/* Tax summary — left: GST table, right: net payable */}
                      <div className="flex justify-between items-start" style={{ paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>

                        {/* LEFT — Tax Breakup pivot table (rates as columns) */}
                        {(() => {
                          const thS = { border: "1px solid #cbd5e1", padding: "4px 8px", background: "#f1f5f9", fontWeight: "700", color: "#374151", whiteSpace: "nowrap" };
                          const tdS = { border: "1px solid #cbd5e1", padding: "4px 8px", color: "#374151" };
                          const tdR = { ...tdS, textAlign: "right" };
                          const totalCgst = gstGroups.reduce((s, g) => s + g.cgst, 0);
                          const totalSgst = gstGroups.reduce((s, g) => s + g.sgst, 0);
                          const totalIgst = gstGroups.reduce((s, g) => s + g.igst, 0);
                          return (
                            <div>
                              <p style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: "6px" }}>Tax Breakup</p>
                              <table style={{ borderCollapse: "collapse", fontSize: "10px" }}>
                                <thead>
                                  <tr>
                                    <th style={{ ...thS, textAlign: "left", minWidth: "80px" }}>Rate Slab</th>
                                    <th style={{ ...thS, textAlign: "right", minWidth: "76px" }}>Taxable Val</th>
                                    {hasCgst && <th style={{ ...thS, textAlign: "right", minWidth: "64px" }}>CGST</th>}
                                    {hasSgst && <th style={{ ...thS, textAlign: "right", minWidth: "64px" }}>SGST</th>}
                                    {hasIgst && <th style={{ ...thS, textAlign: "right", minWidth: "64px" }}>IGST</th>}
                                    <th style={{ ...thS, textAlign: "right", minWidth: "72px" }}>Tax Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {gstGroups.map((g, gi) => {
                                    const slabLabel = isInState
                                      ? `${g.cgstRate}% CGST + ${g.sgstRate}% SGST`
                                      : `${g.igstRate}% IGST`;
                                    const rowTax = isInState ? g.cgst + g.sgst : g.igst;
                                    return (
                                      <tr key={gi}>
                                        <td style={{ ...tdS, fontWeight: "500", color: "#2B3A6B" }}>{slabLabel}</td>
                                        <td style={tdR}>{pFmt(g.taxable)}</td>
                                        {hasCgst && <td style={tdR}>{g.cgstRate > 0 ? pFmt(g.cgst) : <span style={{ color: "#9ca3af" }}>—</span>}</td>}
                                        {hasSgst && <td style={tdR}>{g.sgstRate > 0 ? pFmt(g.sgst) : <span style={{ color: "#9ca3af" }}>—</span>}</td>}
                                        {hasIgst && <td style={tdR}>{g.igstRate > 0 ? pFmt(g.igst) : <span style={{ color: "#9ca3af" }}>—</span>}</td>}
                                        <td style={{ ...tdR, fontWeight: "600" }}>{pFmt(rowTax)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr style={{ borderTop: "2px solid #94a3b8", background: "#f8fafc" }}>
                                    <td style={{ ...tdS, fontWeight: "700" }}>Total</td>
                                    <td style={{ ...tdR, fontWeight: "700" }}>{pFmt(totalTaxable)}</td>
                                    {hasCgst && <td style={{ ...tdR, fontWeight: "700" }}>{pFmt(totalCgst)}</td>}
                                    {hasSgst && <td style={{ ...tdR, fontWeight: "700" }}>{pFmt(totalSgst)}</td>}
                                    {hasIgst && <td style={{ ...tdR, fontWeight: "700" }}>{pFmt(totalIgst)}</td>}
                                    <td style={{ ...tdR, fontWeight: "700", color: "#2B3A6B" }}>{pFmt(totalAllTax)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          );
                        })()}

                        {/* RIGHT — Net Payable */}
                        <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Net Payable</p>
                          <p className="font-extrabold text-xl tabular-nums" style={{ color: "#2B3A6B" }}>
                            ₹ {pFmt(netPayable)}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">(Incl. all applicable taxes)</p>
                        </div>

                      </div>

                      {/* Terms */}
                      <div className="text-[11px] leading-[1.55]" style={{ paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Terms &amp; Conditions</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                          <li>All materials must conform to the specifications mentioned in the purchase request.</li>
                          <li>Delivery to be made at the site address mentioned above within the agreed delivery period.</li>
                          <li>Payment will be made within 30 days of receipt of materials and invoice.</li>
                          <li>Any damage or shortage during transit is the vendor's responsibility.</li>
                          <li>GST invoice must be submitted along with delivery for tax credit eligibility.</li>
                          <li>10% of payment will be withheld until quality inspection is completed.</li>
                          <li>TDS will be deducted as applicable under Income Tax Act.</li>
                        </ol>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end items-end" style={{ paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                        <div className="text-center">
                          <div className="mb-6 text-[10px] text-gray-500">
                            <p className="font-bold text-gray-800 uppercase tracking-wide text-[11px]">for ROMAA INFRAA PVT. LTD</p>
                          </div>
                          <div style={{ width: "150px", borderTop: "1px solid #94a3b8" }} />
                          <p className="text-[9px] text-gray-400 mt-1 italic">Authorised Signatory</p>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        );
      })()}
    </>
  );
};

export default ViewPurchaseOrder;
