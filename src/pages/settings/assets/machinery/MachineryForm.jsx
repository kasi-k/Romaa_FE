import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { API } from "../../../../constant";
import axios from "axios";
import SearchableSelect from "../../../../components/SearchableSelect";

// --- 1. Updated Validation Schema ---
const schema = Yup.object().shape({
  // Identity
  assetId: Yup.string().required("Asset ID is required"),
  assetName: Yup.string().required("Asset Name is required"),
  assetCategory: Yup.string().required("Category is required"),
  assetType: Yup.string().required("Type is required"),

  // Technical
  serialNumber: Yup.string().required("Serial No. is required"),
  modelNumber: Yup.string().required("Model No. is required"),
  chassisNumber: Yup.string().required("Chassis No. is required"),
  engineNumber: Yup.string().required("Engine No. is required"),
  manufacturingYear: Yup.number()
    .typeError("Must be a year")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Cannot be in future"),
  fuelType: Yup.string().required("Fuel Type is required"),
  fuelTankCapacity: Yup.number().typeError("Must be number").positive(),

  // Tracking
  trackingMode: Yup.string().required("Tracking Mode is required"),
  lastReading: Yup.number().typeError("Must be number").min(0).default(0),

  // Operational
  projectId: Yup.string().required("Project ID is required"),
  currentSite: Yup.string().required("Current Site is required"),

  // GPS (Conditional validation handled in UI logic usually, or loose here)
  gps: Yup.object().shape({
    isInstalled: Yup.boolean(),
    deviceId: Yup.string().when("isInstalled", {
      is: true,
      then: (schema) => schema.required("Device ID is required"),
    }),
    provider: Yup.string(),
  }),

  // Compliance (Dates)
  compliance: Yup.object().shape({
    insurancePolicyNo: Yup.string(),
    insuranceExpiry: Yup.date().nullable().typeError("Invalid Date"),
    fitnessCertExpiry: Yup.date().nullable().typeError("Invalid Date"),
    pollutionCertExpiry: Yup.date().nullable().typeError("Invalid Date"),
    roadTaxExpiry: Yup.date().nullable().typeError("Invalid Date"),
  }),

  // Vendor
  vendorName: Yup.string().required("Vendor Name is required"),

  // Financials
  purchaseCost: Yup.number().typeError("Must be a number").required("Required"),
  purchaseDate: Yup.date().required("Purchase Date is required"),
  supplierName: Yup.string(),
  invoiceNumber: Yup.string(),
});

const Machinery = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      gps: { isInstalled: false },
      trackingMode: "HOURS",
      fuelType: "Diesel",
      assetCategory: "Heavy Earthmover",
      assetType: "OWN ASSET",
      vendorName: "Infraa",
    },
  });

  const modalRef = useRef(null);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const FOCUSABLE = 'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const trap = (e) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(el.querySelectorAll(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, []);

  // Watch GPS toggle to show/hide fields
  const isGpsInstalled = watch("gps.isInstalled");
  const assetType = watch("assetType");
  const isOwnAsset = assetType === "OWN ASSET";

  // Tenders fetched for Project ID dropdown
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/tender/gettenders`, { params: { page: 1, limit: 1000 } })
      .then((res) => {
        setTenders((res.data?.data || []).filter((t) => t.tender_status === "APPROVED"));
      })
      .catch(() => {});
  }, []);

  // Machinery suppliers fetched from vendor API
  const [machineryVendors, setMachineryVendors] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/vendor/getvendors`)
      .then((res) => {
        const vendors = res.data?.vendors || res.data?.data || res.data || [];
        const filtered = vendors.filter((v) => v.type === "Machinery Supplier");
        setMachineryVendors(filtered);
      })
      .catch(() => {});
  }, []);

  const selectedVendorName = watch("vendorName");
  const selectedVendor = machineryVendors.find(
    (v) => v.company_name === selectedVendorName
  );

  // Auto-set vendorName based on asset type
  useEffect(() => {
    if (isOwnAsset) {
      setValue("vendorName", "Infraa", { shouldValidate: true });
    } else {
      setValue("vendorName", "", { shouldValidate: false });
    }
  }, [isOwnAsset, setValue]);

  const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mt-1 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500";
  const labelClass = "font-medium text-xs text-gray-700 dark:text-gray-300";
  const errorClass = "text-red-500 text-[10px] mt-0.5";
  const sectionHeaderClass =
    "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2";

  const handleCreateAsset = async (formData) => {
    try {
      // Show loading toast

      // Prepare Payload (Ensure types match Schema)
      const payload = {
        ...formData,
        // Vendor reference
        vendorId: isOwnAsset ? null : (selectedVendor?.vendor_id || null),
        // Convert Number fields explicitly if needed
        manufacturingYear: Number(formData.manufacturingYear),
        fuelTankCapacity: Number(formData.fuelTankCapacity),
        purchaseCost: Number(formData.purchaseCost),
        lastReading: Number(formData.lastReading || 0),

        // Handle GPS Object Structure
        gps: {
          isInstalled: formData.gps?.isInstalled || false,
          deviceId: formData.gps?.deviceId || "",
          provider: formData.gps?.provider || "",
        },

        // Handle Dates (Ensure valid Date objects or ISO strings)
        compliance: {
          insurancePolicyNo: formData.compliance?.insurancePolicyNo,
          insuranceExpiry: formData.compliance?.insuranceExpiry || null,
          fitnessCertExpiry: formData.compliance?.fitnessCertExpiry || null,
          pollutionCertExpiry: formData.compliance?.pollutionCertExpiry || null,
          roadTaxExpiry: formData.compliance?.roadTaxExpiry || null,
        },
      };

      // API Call
      const response = await axios.post(
        `${API}/machineryasset/createasset`,
        payload,
      );

      if (response.status) {
        toast.success("Asset created successfully!");
        onclose(); // Close Modal
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create asset");
    }
  };

  return (
    <div className="font-roboto-flex fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/30 z-50 overflow-y-auto p-4 sm:py-10">
      <div ref={modalRef} className="dark:bg-gray-900 bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white truncate">
            Add New Machinery Asset
          </h2>
          <button
            onClick={onclose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0"
          >
            <IoClose className="size-5 sm:size-6 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleCreateAsset)}
          className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {/* --- 1. Basic Identity --- */}
          <div className={sectionHeaderClass}>1. Basic Identity & Location</div>

          <div>
            <label className={labelClass}>Asset ID *</label>
            <input
              {...register("assetId")}
              placeholder="e.g. EX-01"
              className={inputClass}
            />
            <p className={errorClass}>{errors.assetId?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Asset Name *</label>
            <input
              {...register("assetName")}
              placeholder="e.g. Hitachi Zaxis"
              className={inputClass}
            />
            <p className={errorClass}>{errors.assetName?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <SearchableSelect
              name="assetCategory"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={["Heavy Earthmover", "Transport Vehicle", "Stationary Equipment", "Lifting"]}
              hasError={!!errors.assetCategory}
            />
            <p className={errorClass}>{errors.assetCategory?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Asset Type *</label>
            <SearchableSelect
              name="assetType"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={[
                { value: "OWN ASSET", label: "Own Asset" },
                { value: "RENTAL ASSET", label: "Rental Asset" },
              ]}
              hasError={!!errors.assetType}
            />
            <p className={errorClass}>{errors.assetType?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Vendor Name *</label>
            {isOwnAsset ? (
              <input
                value="Infraa"
                readOnly
                className={`${inputClass} bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400`}
              />
            ) : (
              <SearchableSelect
                name="vendorName"
                watch={watch}
                setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
                options={machineryVendors.map((v) => ({
                  value: v.company_name,
                  label: v.company_name,
                }))}
                hasError={!!errors.vendorName}
                placeholder={
                  machineryVendors.length === 0
                    ? "No machinery suppliers found"
                    : "Select vendor..."
                }
              />
            )}
            <p className={errorClass}>{errors.vendorName?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Project *</label>
            <SearchableSelect
              name="projectId"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={tenders.map((t) => ({
                value: t.tender_id,
                label: `${t.tender_name} (${t.tender_id})`,
              }))}
              showValueSelected
              hasError={!!errors.projectId}
              placeholder={tenders.length === 0 ? "No projects found" : "Select project..."}
            />
            <p className={errorClass}>{errors.projectId?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Current Site *</label>
            <input
              {...register("currentSite")}
              placeholder="Location Name"
              className={inputClass}
            />
            <p className={errorClass}>{errors.currentSite?.message}</p>
          </div>

          {/* --- 2. Technical Specifications --- */}
          <div className={sectionHeaderClass}>2. Technical Specifications</div>

          <div>
            <label className={labelClass}>Serial Number *</label>
            <input {...register("serialNumber")} className={inputClass} />
            <p className={errorClass}>{errors.serialNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Model Number *</label>
            <input {...register("modelNumber")} className={inputClass} />
            <p className={errorClass}>{errors.modelNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Chassis Number *</label>
            <input {...register("chassisNumber")} className={inputClass} />
            <p className={errorClass}>{errors.chassisNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Engine Number *</label>
            <input {...register("engineNumber")} className={inputClass} />
            <p className={errorClass}>{errors.engineNumber?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Mfg Year</label>
            <input
              type="number"
              {...register("manufacturingYear")}
              className={inputClass}
            />
            <p className={errorClass}>{errors.manufacturingYear?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Fuel Type</label>
            <SearchableSelect
              name="fuelType"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={["Diesel", "Petrol", "Electric"]}
            />
          </div>

          <div>
            <label className={labelClass}>Tank Capacity (L)</label>
            <input
              type="number"
              {...register("fuelTankCapacity")}
              className={inputClass}
            />
          </div>

          {/* --- 3. Tracking & GPS --- */}
          <div className={sectionHeaderClass}>3. Tracking & GPS</div>

          <div>
            <label className={labelClass}>Tracking Mode</label>
            <SearchableSelect
              name="trackingMode"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={[
                { value: "HOURS", label: "Hours (HMR)" },
                { value: "KILOMETERS", label: "Kilometers (Odometer)" },
                { value: "UNITS", label: "Units (Production)" },
              ]}
            />
          </div>

          <div>
            <label className={labelClass}>Initial Reading</label>
            <input
              type="number"
              {...register("lastReading")}
              className={inputClass}
            />
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="gpsCheck"
              {...register("gps.isInstalled")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="gpsCheck"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium"
            >
              GPS Installed?
            </label>
          </div>

          {isGpsInstalled && (
            <>
              <div>
                <label className={labelClass}>GPS Device ID</label>
                <input {...register("gps.deviceId")} className={inputClass} />
                <p className={errorClass}>{errors.gps?.deviceId?.message}</p>
              </div>
              <div>
                <label className={labelClass}>GPS Provider</label>
                <input {...register("gps.provider")} className={inputClass} />
              </div>
            </>
          )}

          {/* --- 4. Compliance (Dates) --- */}
          <div className={sectionHeaderClass}>4. Compliance & Expiry Dates</div>

          <div>
            <label className={labelClass}>Insurance Policy No</label>
            <input
              {...register("compliance.insurancePolicyNo")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Insurance Expiry</label>
            <input
              type="date"
              {...register("compliance.insuranceExpiry")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Fitness Cert (FC) Expiry</label>
            <input
              type="date"
              {...register("compliance.fitnessCertExpiry")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Pollution (PUC) Expiry</label>
            <input
              type="date"
              {...register("compliance.pollutionCertExpiry")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Road Tax Expiry</label>
            <input
              type="date"
              {...register("compliance.roadTaxExpiry")}
              className={inputClass}
            />
          </div>

          {/* --- 5. Financials --- */}
          <div className={sectionHeaderClass}>5. Financials</div>

          <div>
            <label className={labelClass}>Purchase Date *</label>
            <input
              type="date"
              {...register("purchaseDate")}
              className={inputClass}
            />
            <p className={errorClass}>{errors.purchaseDate?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Purchase Cost *</label>
            <input
              type="number"
              {...register("purchaseCost")}
              className={inputClass}
            />
            <p className={errorClass}>{errors.purchaseCost?.message}</p>
          </div>

          <div>
            <label className={labelClass}>Supplier Name</label>
            <input {...register("supplierName")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Invoice No</label>
            <input {...register("invoiceNumber")} className={inputClass} />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onclose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(handleCreateAsset)}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-md"
          >
            Save Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Machinery;
