import React, { useEffect, useRef, useState } from "react";
import romaaLogo from "../../../../assets/images/RomaaInfra.png";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  useWorkOrderRequestDetails,
  useSubmitVendorQuotation,
} from "../../hooks/useProjects";

const WorkOrderRequestForm = ({ onCancel, onSubmit }) => {
  const { tenderId, requestId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [priceErrors, setPriceErrors] = useState({});
  const [workOrderRequestId, setWorkOrderRequestId] = useState("");
  const [selectedContractor, setSelectedContractor] = useState(null); // { contractorId, contractorName }
  const [contractorSearch, setContractorSearch] = useState("");
  const [showContractorList, setShowContractorList] = useState(false);
  const [deliveryPeriod, setDeliveryPeriod] = useState("");
  const contractorRef = useRef(null);

  const { data: requestDetails, isLoading: loading } =
    useWorkOrderRequestDetails(tenderId, requestId);
  const { mutateAsync: submitQuotation, isPending: isSubmitting } =
    useSubmitVendorQuotation();

  // Only the contractors explicitly invited to this request
  const permittedContractors = requestDetails?.permittedContractor || [];

  // Close contractor dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (contractorRef.current && !contractorRef.current.contains(e.target))
        setShowContractorList(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (
      requestDetails?.materialsRequired &&
      Array.isArray(requestDetails.materialsRequired)
    ) {
      const formatted = requestDetails.materialsRequired.map((item, index) => ({
        sno: index + 1,
        work: item.detailedDescription || "Work",
        unit: item.unit || "",
        quantity: item.quantity || 0,
        enterPrice: "",
        total: "",
        materialId: item._id,
        material: item.materialName || "",
      }));
      setRows(formatted);
      setWorkOrderRequestId(requestDetails._id);
    }
  }, [requestDetails]);

  const handlePriceChange = (index, value) => {
    // Allow empty, digits, and one decimal point only
    const isValid = value === "" || /^\d*\.?\d*$/.test(value);
    setPriceErrors((prev) => ({
      ...prev,
      [index]: isValid ? "" : "Only numbers allowed",
    }));
    if (!isValid) return;

    const updatedRows = [...rows];
    updatedRows[index].enterPrice = value;
    updatedRows[index].total = value ? Number(value) * updatedRows[index].quantity : "";
    setRows(updatedRows);
  };

  const handleSubmit = async () => {
    const hasEmpty = rows.some((r) => !r.enterPrice);
    if (hasEmpty) {
      toast.warning("Please enter price for all items");
      return;
    }
    if (!selectedContractor) {
      toast.warning("Please select a contractor before submitting");
      return;
    }
    if (!deliveryPeriod) {
      toast.warning("Please select a delivery date");
      return;
    }

    const quoteItems = rows.map((r) => ({
      materialName: r.material,
      detailedDescription: r.work,
      quotedUnitRate: Number(r.enterPrice),
      unit: r.unit,
      quantity: Number(r.quantity),
      totalAmount: Number(r.total),
    }));

    try {
      const payload = {
        workOrderRequestId,
        tenderId,
        contractorId: selectedContractor.contractorId,
        contractorName: selectedContractor.contractorName,
        deliveryPeriod,
        quoteItems,
      };

      const res = await submitQuotation({ workOrderRequestId, payload });
      toast.success("Your quotation submitted successfully!");

      setSelectedContractor(null);
      setContractorSearch("");
      setDeliveryPeriod("");
      setRows((prev) =>
        prev.map((row) => ({ ...row, enterPrice: "", total: "" }))
      );

      if (onSubmit) onSubmit(res);
      else navigate(-1);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit contractor quotation"
      );
    }
  };

  const overallTotal = rows.reduce(
    (acc, row) => acc + (Number(row.total) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">

          {/* Header */}
          <div className="bg-darkest-blue px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="bg-white rounded-xl px-4 py-2 shadow-md">
                <img
                  src={romaaLogo}
                  alt="ROMAA"
                  className="h-8 sm:h-10 object-contain"
                />
              </div>
              <div className="text-center sm:text-right">
                <h2 className="text-white text-xl sm:text-2xl font-bold tracking-wide">
                  Work Order Request
                </h2>
                <p className="text-white text-xs sm:text-sm mt-0.5">
                  Contractor Quotation Submission
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-4 py-6 sm:px-8 sm:py-8">

            {/* Contractor & Delivery Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-blue-500 inline-block"></span>
                Contractor Details
                <span className="flex-1 h-0.5 bg-slate-100 inline-block"></span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Contractor Name Dropdown */}
                <div className="group" ref={contractorRef}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Contractor <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={selectedContractor ? selectedContractor.contractorName : contractorSearch}
                      onChange={(e) => {
                        setSelectedContractor(null);
                        setContractorSearch(e.target.value);
                        setShowContractorList(true);
                      }}
                      onFocus={() => setShowContractorList(true)}
                      placeholder="Search contractor name..."
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all duration-200"
                    />
                    {selectedContractor && (
                      <button
                        type="button"
                        onClick={() => { setSelectedContractor(null); setContractorSearch(""); }}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    )}
                    {showContractorList && (
                      <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {permittedContractors
                          .filter((c) =>
                            c.contractorName?.toLowerCase().includes(contractorSearch.toLowerCase())
                          )
                          .map((c) => (
                            <li
                              key={c.contractorId}
                              onMouseDown={() => {
                                setSelectedContractor(c);
                                setContractorSearch("");
                                setShowContractorList(false);
                              }}
                              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 flex flex-col"
                            >
                              <span className="font-semibold text-slate-800">{c.contractorName}</span>
                              <span className="text-xs text-slate-400 font-mono">{c.contractorId}</span>
                            </li>
                          ))}
                        {permittedContractors.filter((c) =>
                          c.contractorName?.toLowerCase().includes(contractorSearch.toLowerCase())
                        ).length === 0 && (
                          <li className="px-4 py-3 text-sm text-slate-400 italic text-center">No contractors found</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Delivery Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      value={deliveryPeriod}
                      onChange={(e) => setDeliveryPeriod(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-blue-500 inline-block"></span>
                Materials &amp; Pricing
                <span className="flex-1 h-0.5 bg-slate-100 inline-block"></span>
              </h3>

              {loading ? (
                /* Skeleton Loader */
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-700 text-white">
                          {["S.No", "Work Description", "Unit", "Qty", "Unit Price (₹)", "Total (₹)"].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr
                            key={index}
                            className={`border-b border-slate-100 transition-colors hover:bg-blue-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            }`}
                          >
                            <td className="px-4 py-3 text-center text-slate-500 font-medium">
                              {row.sno}
                            </td>
                            <td className="px-4 py-3 text-left max-w-xs">
                              <p className="text-slate-700 capitalize">{row.work}</p>
                              {row.material && <p className="text-xs text-blue-600 mt-0.5">{row.material}</p>}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">
                              {row.unit}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-700">
                              {row.quantity}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="text"
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
                                <p className="text-red-500 text-xs mt-1 whitespace-nowrap">
                                  {priceErrors[index]}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-28 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-green-700">
                                {row.total ? `₹${Number(row.total).toLocaleString()}` : "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-700 text-white">
                          <td colSpan="5" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                            Overall Total Amount
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-base">
                            ₹{overallTotal.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {rows.map((row, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-darkest-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {row.sno}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 capitalize leading-snug">{row.work}</p>
                              {row.material && <p className="text-xs text-blue-600 mt-0.5">{row.material}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Card Details */}
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

                        {/* Price Input */}
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
                              <p className="text-red-500 text-xs mt-1">
                                {priceErrors[index]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 font-medium mb-1 block">
                              Total (₹)
                            </label>
                            <div className="w-full bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center text-sm font-semibold text-green-700">
                              {row.total ? `₹${Number(row.total).toLocaleString()}` : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Mobile Overall Total */}
                    <div className="bg-slate-700 rounded-xl px-5 py-4 flex items-center justify-between">
                      <span className="text-white text-sm font-semibold uppercase tracking-wider">
                        Overall Total
                      </span>
                      <span className="text-white text-lg font-bold">
                        ₹{overallTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={onCancel}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-2.5 bg-darkest-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-900 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-900/20"
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

export default WorkOrderRequestForm;
