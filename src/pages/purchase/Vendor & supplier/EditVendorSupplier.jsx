import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import {
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiShield,
  FiSave,
  FiCreditCard,
} from "react-icons/fi";
import SearchableSelect from "../../../components/SearchableSelect";

const schema = yup.object().shape({
  type: yup
    .string()
    .oneOf(
      [
        "Cement Supplier",
        "Steel Supplier",
        "Sand Supplier",
        "Aggregate Supplier",
        "Bricks Supplier",
        "Electrical Contractor",
        "Plumbing Contractor",
        "Paint Supplier",
        "Tiles Supplier",
        "Wood Supplier",
        "Machinery Supplier",
      ],
      "Select a valid Vendor Type"
    )
    .required("Vendor Type is required"),
  company_name: yup.string().required("Company name is required"),
  contact_person: yup.string().required("Contact Person is required"),
  contact_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Contact Phone is required"),
  contact_email: yup.string().email("Invalid email").required("Contact Email is required"),
  place_of_supply: yup.string().required("Place of Supply is required"),
  address_street: yup.string().required("Street is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  gstin: yup.string().required("GSTIN is required"),
  pan_no: yup.string().required("PAN Number is required"),
  account_name: yup.string().required("Account Name is required"),
  account_number: yup.string().required("Account Number is required"),
  bank_name: yup.string().required("Bank Name is required"),
  ifsc_code: yup.string().required("IFSC Code is required"),
  branch: yup.string().required("Branch is required"),
  credit_day: yup.number().typeError("Credit Days must be a number").required("Credit Days is required"),
  status: yup.string().required("Status is required"),
});

const VENDOR_TYPES = [
  "Cement Supplier",
  "Steel Supplier",
  "Sand Supplier",
  "Aggregate Supplier",
  "Bricks Supplier",
  "Electrical Contractor",
  "Plumbing Contractor",
  "Paint Supplier",
  "Tiles Supplier",
  "Wood Supplier",
];

const EditVendorSupplier = ({ onclose, onUpdated, item }) => {
  const [loading, setLoading] = useState(false);
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: item.type,
      company_name: item.company_name,
      contact_person: item.contact_person,
      contact_phone: item.contact_phone,
      contact_email: item.contact_email,
      place_of_supply: item.place_of_supply || "",
      address_street: item.address?.street,
      address_city: item.address?.city,
      address_state: item.address?.state,
      address_country: item.address?.country,
      address_pincode: item.address?.pincode,
      gstin: item.gstin,
      pan_no: item.pan_no,
      account_name: item.bank_details?.account_name,
      account_number: item.bank_details?.account_number,
      bank_name: item.bank_details?.bank_name,
      ifsc_code: item.bank_details?.ifsc_code,
      branch: item.bank_details?.branch,
      credit_day: item.credit_day,
      status: item.status,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        type: data.type,
        company_name: data.company_name,
        contact_person: data.contact_person,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        place_of_supply: data.place_of_supply,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          country: data.address_country,
          pincode: data.address_pincode,
        },
        gstin: data.gstin,
        pan_no: data.pan_no,
        bank_details: {
          account_name: data.account_name,
          account_number: data.account_number,
          bank_name: data.bank_name,
          ifsc_code: data.ifsc_code,
          branch: data.branch,
        },
        credit_day: data.credit_day,
        status: data.status,
      };

      await axios.put(`${API}/vendor/updatevendor/${item.vendor_id}`, payload);
      toast.success("Vendor updated successfully");
      if (onUpdated) onUpdated();
      onclose();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sectionHeaderClass =
    "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2 flex items-center gap-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
<div ref={modalRef} className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FiUser className="text-xl" />
              </span>
              Edit Vendor / Supplier
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Update vendor details below</p>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Section 1: Vendor Info */}
            <div className={sectionHeaderClass}>
              <FiBriefcase /> Vendor Information
            </div>

            <SearchableSelect
              label="Vendor Type *"
              name="type"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={VENDOR_TYPES}
              error={errors.type}
            />
            <Input label="Company Name *" name="company_name" register={register} error={errors.company_name} placeholder="Enter company name" />
            <Input label="Contact Person *" name="contact_person" register={register} error={errors.contact_person} placeholder="Enter contact person" />
            <Input label="Contact Phone *" name="contact_phone" register={register} error={errors.contact_phone} placeholder="Enter phone number" />
            <Input label="Contact Email *" type="email" name="contact_email" register={register} error={errors.contact_email} placeholder="Enter email" />
            <Input label="Credit Days *" type="number" name="credit_day" register={register} error={errors.credit_day} placeholder="Enter credit days" />
            <SearchableSelect
              label="Place of Supply *"
              name="place_of_supply"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={["InState", "Others"]}
              error={errors.place_of_supply}
            />

            {/* Section 2: Address */}
            <div className={sectionHeaderClass}>
              <FiMapPin /> Address Details
            </div>

            <div className="md:col-span-2">
              <Input label="Street Address *" name="address_street" register={register} error={errors.address_street} placeholder="Enter street" />
            </div>
            <Input label="City *" name="address_city" register={register} error={errors.address_city} placeholder="Enter city" />
            <Input label="State *" name="address_state" register={register} error={errors.address_state} placeholder="Enter state" />
            <Input label="Country *" name="address_country" register={register} error={errors.address_country} placeholder="Enter country" />
            <Input label="Pincode *" name="address_pincode" register={register} error={errors.address_pincode} placeholder="Enter pincode" />

            {/* Section 3: Tax Info */}
            <div className={sectionHeaderClass}>
              <FiShield /> Tax Information
            </div>

            <Input label="GSTIN *" name="gstin" register={register} error={errors.gstin} placeholder="Enter GSTIN" />
            <Input label="PAN No *" name="pan_no" register={register} error={errors.pan_no} placeholder="Enter PAN No" />
            <div className="md:col-span-1"></div>

            {/* Section 4: Bank Details */}
            <div className={sectionHeaderClass}>
              <FiCreditCard /> Bank Details
            </div>

            <Input label="Account Holder Name *" name="account_name" register={register} error={errors.account_name} placeholder="Enter account name" />
            <Input label="Account Number *" name="account_number" register={register} error={errors.account_number} placeholder="Enter account number" />
            <Input label="Bank Name *" name="bank_name" register={register} error={errors.bank_name} placeholder="Enter bank name" />
            <Input label="IFSC Code *" name="ifsc_code" register={register} error={errors.ifsc_code} placeholder="Enter IFSC code" />
            <Input label="Branch Name *" name="branch" register={register} error={errors.branch} placeholder="Enter branch name" />
            <div className="md:col-span-1"></div>

            {/* Section 5: Status */}
            <div className={sectionHeaderClass}>
              <FiUser /> Status
            </div>

            <SearchableSelect
              label="Status *"
              name="status"
              watch={watch}
              setValue={(name, val) => setValue(name, val, { shouldValidate: true })}
              options={["ACTIVE", "INACTIVE", "BLACKLISTED"]}
              error={errors.status}
            />

          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onclose}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <FiSave />
            )}
            {loading ? "Saving..." : "Update Vendor"}
          </button>
        </div>

      </div>
    </div>
  );
};

// Reusable Input
const Input = ({ label, name, type = "text", register, error, placeholder }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      {...register(name)}
      placeholder={placeholder}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
    />
    {error && <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>}
  </div>
);

export default EditVendorSupplier;
