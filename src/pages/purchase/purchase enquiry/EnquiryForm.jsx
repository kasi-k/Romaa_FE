import { useEffect, useState } from "react";
import romaaLogo from "../../../assets/images/RomaaInfra.png";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../constant";
import { useParams } from "react-router-dom";

const EnquiryForm = ({ onCancel, onSubmit }) => {
  const { tenderId, requestId } = useParams();

  const [rows, setRows]                           = useState([]);
  const [priceErrors, setPriceErrors]             = useState({});
  const [purchaseOrderRequestId, setPurchaseOrderRequestId] = useState("");
  const [loading, setLoading]                     = useState(true);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [selectedVendor, setSelectedVendor]       = useState("");
  const [deliveryPeriod, setDeliveryPeriod]       = useState("");

  /* ── fetch materials ───────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(
          `${API}/purchaseorderrequest/api/getdetailbyId/${tenderId}/${requestId}`,
        );
        const data = res.data?.data;
        if (data?.materialsRequired && Array.isArray(data.materialsRequired)) {
          setRows(
            data.materialsRequired.map((item, index) => ({
              sno:        index + 1,
              material:   item.materialName || "Material",
              unit:       item.unit || "",
              quantity:   item.quantity || 0,
              enterPrice: "",
              total:      "",
              materialId: item._id,
            })),
          );
          setPurchaseOrderRequestId(data._id);
        }
      } catch {
        toast.error("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [tenderId, requestId]);

  /* ── price change ──────────────────────────────────────────────────────── */
  const handlePriceChange = (index, value) => {
    const isValid = value === "" || /^\d*\.?\d*$/.test(value);
    setPriceErrors((prev) => ({
      ...prev,
      [index]: isValid ? "" : "Numbers only",
    }));
    if (!isValid) return;

    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        enterPrice: value,
        total: value ? Number(value) * updated[index].quantity : "",
      };
      return updated;
    });
  };

  /* ── submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (rows.some((r) => !r.enterPrice)) {
      toast.warning("Please enter price for all items");
      return;
    }
    if (!selectedVendor.trim()) {
      toast.warning("Please enter a vendor ID before submitting");
      return;
    }
    if (!deliveryPeriod) {
      toast.warning("Please select a delivery date");
      return;
    }

    const quoteItems = rows.map((r) => ({
      materialName:   r.material,
      quotedUnitRate: Number(r.enterPrice),
      unit:           r.unit,
      quantity:       Number(r.quantity),
      totalAmount:    Number(r.total),
      materialId:     r.materialId,
    }));

    setIsSubmitting(true);
    try {
      const payload = {
        purchaseOrderRequestId,
        tenderId,
        vendorId:       selectedVendor.toUpperCase(),
        deliveryPeriod,
        quoteItems,
      };

      const res = await axios.post(
        `${API}/purchaseorderrequest/api/purchase-requests/${purchaseOrderRequestId}/vendor-quotation`,
        payload,
      );

      toast.success("Quotation submitted successfully!");
      setSelectedVendor("");
      setDeliveryPeriod("");
      setRows((prev) => prev.map((r) => ({ ...r, enterPrice: "", total: "" })));

      if (onSubmit) onSubmit(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallTotal = rows.reduce((acc, r) => acc + (Number(r.total) || 0), 0);

  /* ── render ────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="bg-darkest-blue px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="bg-white rounded-xl px-4 py-2 shadow-md">
                <img src={romaaLogo} alt="ROMAA" className="h-8 sm:h-10 object-contain" />
              </div>
              <div className="text-center sm:text-right">
                <h2 className="text-white text-xl sm:text-2xl font-bold tracking-wide">
                  Purchase Enquiry
                </h2>
                <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
                  Vendor Quotation Submission
                </p>
              </div>
            </div>
          </div>

          {/* ── Form Body ──────────────────────────────────────────────────── */}
          <div className="px-4 py-6 sm:px-8 sm:py-8">

            {/* Vendor & Delivery Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-blue-500 inline-block" />
                Vendor Details
                <span className="flex-1 h-0.5 bg-slate-100 inline-block" />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Vendor ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Vendor ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      placeholder="Enter Vendor ID"
                      className="w-full pl-10 pr-4 py-2.5 text-sm uppercase border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Delivery Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      value={deliveryPeriod}
                      onChange={(e) => setDeliveryPeriod(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Materials & Pricing Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-blue-500 inline-block" />
                Materials &amp; Pricing
                <span className="flex-1 h-0.5 bg-slate-100 inline-block" />
              </h3>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* ── Desktop Table ── */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-700 text-white">
                          {["S.No", "Material", "Unit", "Qty", "Unit Price (₹)", "Total (₹)"].map((h) => (
                            <th key={h}
                              className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={index}
                            className={`border-b border-slate-100 transition-colors hover:bg-blue-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            }`}>
                            <td className="px-4 py-3 text-center text-slate-500 font-medium">
                              {row.sno}
                            </td>
                            <td className="px-4 py-3 text-left text-slate-700 capitalize font-medium">
                              {row.material}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">
                              {row.unit || "—"}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-700">
                              {row.quantity}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={row.enterPrice}
                                onChange={(e) => handlePriceChange(index, e.target.value)}
                                placeholder="0.00"
                                className={`w-28 border rounded-lg px-3 py-1.5 text-center text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent bg-blue-50 focus:bg-white transition-all ${
                                  priceErrors[index]
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-blue-200 focus:ring-blue-400"
                                }`}
                              />
                              {priceErrors[index] && (
                                <p className="text-red-500 text-xs mt-1">{priceErrors[index]}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-28 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-green-700">
                                {row.total ? `₹${Number(row.total).toLocaleString("en-IN")}` : "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-700 text-white">
                          <td colSpan={5} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                            Total Quoted Value
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-base">
                            ₹{overallTotal.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* ── Mobile Cards ── */}
                  <div className="md:hidden space-y-3">
                    {rows.map((row, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-darkest-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {row.sno}
                            </span>
                            <p className="text-sm font-semibold text-slate-700 capitalize leading-snug">
                              {row.material}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div className="bg-slate-50 rounded-lg p-2">
                            <span className="text-slate-400 block mb-0.5">Unit</span>
                            <span className="font-semibold text-slate-700">{row.unit || "—"}</span>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2">
                            <span className="text-slate-400 block mb-0.5">Quantity</span>
                            <span className="font-semibold text-slate-700">{row.quantity}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-slate-500 font-medium mb-1 block">
                              Unit Price (₹)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={row.enterPrice}
                              onChange={(e) => handlePriceChange(index, e.target.value)}
                              placeholder="0.00"
                              className={`w-full border rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent bg-blue-50 focus:bg-white transition-all ${
                                priceErrors[index]
                                  ? "border-red-400 focus:ring-red-400"
                                  : "border-blue-200 focus:ring-blue-400"
                              }`}
                            />
                            {priceErrors[index] && (
                              <p className="text-red-500 text-xs mt-1">{priceErrors[index]}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 font-medium mb-1 block">
                              Total (₹)
                            </label>
                            <div className="w-full bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center text-sm font-semibold text-green-700">
                              {row.total ? `₹${Number(row.total).toLocaleString("en-IN")}` : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-slate-700 rounded-xl px-5 py-4 flex items-center justify-between">
                      <span className="text-white text-sm font-semibold uppercase tracking-wider">
                        Total Quoted Value
                      </span>
                      <span className="text-white text-lg font-bold">
                        ₹{overallTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* ── Action Buttons ── */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={onCancel}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-2.5 bg-darkest-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-900/20"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Quotation
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;
