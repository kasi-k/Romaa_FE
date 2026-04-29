import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";
import {
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiShield,
  FiSave,
  FiCalendar,
  FiDollarSign,
  FiChevronDown,
  FiSearch,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useEditContractor, useTendersForAssignment } from "./hooks/useContractors";
import SearchableSelect from "../../../components/SearchableSelect";

const schema = Yup.object().shape({
  contractor_name: Yup.string().required("Contractor name is required"),
  contact_person: Yup.string().required("Contact person is required"),
  contact_phone: Yup.string().required("Contact phone is required"),
  contact_email: Yup.string().email("Invalid email").required("Email is required"),
  business_type: Yup.string().required("Business type is required"),
  license_number: Yup.string(),
  gst_number: Yup.string(),
  pan_number: Yup.string(),
  contract_start_date: Yup.date().required("Start date is required"),
  contract_end_date: Yup.date().required("End date is required"),
  status: Yup.string().required("Status is required"),
  remarks: Yup.string(),
  address_street: Yup.string().required("Street is required"),
  address_city: Yup.string().required("City is required"),
  address_state: Yup.string().required("State is required"),
  address_country: Yup.string().required("Country is required"),
  address_pincode: Yup.string().required("Pincode is required"),
  bank_name: Yup.string(),
  branch_name: Yup.string(),
  account_number: Yup.string(),
  ifsc_code: Yup.string(),
  account_holder_name: Yup.string(),
  upi_id: Yup.string(),
  payment_terms: Yup.string(),
  place_of_supply: Yup.string().oneOf(["InState", "Others"]),
  credit_day: Yup.number()
    .transform((v, o) => (o === "" ? undefined : v))
    .nullable(),
});

const businessTypes = ["Civil", "Electrical", "Plumbing", "Mechanical", "HVAC", "Fire Safety", "Painting", "Carpentry", "Other"];
const wageCategories = ["Mestri", "Mason", "M-Helper", "Carpenter", "C-Helper", "Bar Bender", "B-Helper", "Electrician", "Plumber", "Painter", "P-Helper", "Welder", "UnSkilled", "Other"];

const EditContractor = ({ onUpdated, onclose }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const contractor = state?.item || {};

  const { mutateAsync: updateContractor, isPending: loading } = useEditContractor({
    contractorId: contractor.contractor_id,
    onUpdated,
    onclose,
  });
  const { data: tenders = [] } = useTendersForAssignment();

  // Dynamic arrays pre-populated from contractor data
  const [selectedProjects, setSelectedProjects] = useState(
    () => (contractor.assigned_projects || []).filter((p) => p.status !== "withdrawn")
  );
  const [wageFixing, setWageFixing] = useState(
    () => (contractor.wage_fixing || []).map((w) => ({ category: w.category || "", wage: w.wage || "" }))
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contractor_name: contractor.contractor_name || "",
      contact_person: contractor.contact_person || "",
      contact_phone: contractor.contact_phone || "",
      contact_email: contractor.contact_email || "",
      business_type: contractor.business_type || "",
      license_number: contractor.license_number || "",
      gst_number: contractor.gst_number || "",
      pan_number: contractor.pan_number || "",
      contract_start_date: contractor.contract_start_date?.substring(0, 10) || "",
      contract_end_date: contractor.contract_end_date?.substring(0, 10) || "",
      status: contractor.status || "ACTIVE",
      remarks: contractor.remarks || "",
      address_street: contractor.address?.street || "",
      address_city: contractor.address?.city || "",
      address_state: contractor.address?.state || "",
      address_country: contractor.address?.country || "India",
      address_pincode: contractor.address?.pincode || "",
      bank_name: contractor.account_details?.bank_name || "",
      branch_name: contractor.account_details?.branch_name || "",
      account_number: contractor.account_details?.account_number || "",
      ifsc_code: contractor.account_details?.ifsc_code || "",
      account_holder_name: contractor.account_details?.account_holder_name || "",
      upi_id: contractor.account_details?.upi_id || "",
      payment_terms: contractor.account_details?.payment_terms || "",
      place_of_supply: contractor.place_of_supply || "",
      credit_day: contractor.credit_day ?? "",
    },
  });

  // --- Assigned Projects handlers ---
  const addProject = (tender) => {
    if (!selectedProjects.find((p) => p.tender_id === tender.tender_id)) {
      setSelectedProjects((prev) => [
        ...prev,
        {
          tender_id: tender.tender_id,
          project_name: tender.tenderName || tender.project_name || tender.tender_id,
          assigned_date: new Date().toISOString().split("T")[0],
          status: "active",
        },
      ]);
    }
  };

  const removeProject = (tenderId) => {
    setSelectedProjects((prev) => prev.filter((p) => p.tender_id !== tenderId));
  };

  // --- Wage Fixing handlers ---
  const addWageRow = () => {
    setWageFixing((prev) => [...prev, { category: "", wage: "" }]);
  };

  const updateWageRow = (index, field, value) => {
    setWageFixing((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeWageRow = (index) => {
    setWageFixing((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    const payload = {
      contractor_name: data.contractor_name,
      contact_person: data.contact_person,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      business_type: data.business_type,
      license_number: data.license_number,
      gst_number: data.gst_number,
      pan_number: data.pan_number,
      place_of_supply: data.place_of_supply,
      credit_day: data.credit_day,
      contract_start_date: data.contract_start_date,
      contract_end_date: data.contract_end_date,
      status: data.status,
      remarks: data.remarks,
      address: {
        street: data.address_street,
        city: data.address_city,
        state: data.address_state,
        country: data.address_country,
        pincode: data.address_pincode,
      },
      account_details: {
        bank_name: data.bank_name,
        branch_name: data.branch_name,
        account_number: data.account_number,
        ifsc_code: data.ifsc_code,
        account_holder_name: data.account_holder_name,
        upi_id: data.upi_id,
        payment_terms: data.payment_terms,
      },
      assigned_projects: selectedProjects,
      wage_fixing: wageFixing
        .filter((w) => w.category && w.wage)
        .map((w) => ({ category: w.category, wage: Number(w.wage) })),
    };

    await updateContractor(payload);
  };

  const sectionHeaderClass = "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2 flex items-center gap-2";

  if (!contractor.contractor_id) {
    return <div className="p-6 text-red-500 text-center">Error: No contractor data loaded.</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiBriefcase className="text-xl" /></span>
              Edit Contractor
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Update details for <span className="font-semibold text-gray-700">{contractor.contractor_name}</span></p>
          </div>
          <button
            type="button"
            onClick={() => onclose ? onclose() : navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* 1. Contractor & Contact */}
            <div className={sectionHeaderClass}>
              <FiUser /> Contractor & Contact Details
            </div>
            <Input label="Contractor Name *" name="contractor_name" register={register} error={errors.contractor_name} />
            <Input label="Contact Person *" name="contact_person" register={register} error={errors.contact_person} />
            <Input label="Contact Phone *" name="contact_phone" register={register} error={errors.contact_phone} />
            <Input label="Contact Email *" type="email" name="contact_email" register={register} error={errors.contact_email} />
            <Select label="Business Type *" name="business_type" watch={watch} setValue={setValue} error={errors.business_type} options={businessTypes} />
            <Input label="License Number" name="license_number" register={register} error={errors.license_number} />
            <Select label="Place of Supply" name="place_of_supply" watch={watch} setValue={setValue} error={errors.place_of_supply} options={["InState", "Others"]} />
            <Input label="Credit Days" name="credit_day" register={register} error={errors.credit_day} placeholder="30" onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !["Backspace","Delete","Tab","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault(); }} />

            {/* 2. Legal Documents */}
            <div className={sectionHeaderClass}>
              <FiShield /> Legal & Tax Documents
            </div>
            <Input label="GST Number" name="gst_number" register={register} error={errors.gst_number} />
            <Input label="PAN Number" name="pan_number" register={register} error={errors.pan_number} />
            <Select label="Status *" name="status" watch={watch} setValue={setValue} error={errors.status} options={["ACTIVE", "INACTIVE", "SUSPENDED", "BLACKLISTED"]} />

            {/* 3. Contract Period */}
            <div className={sectionHeaderClass}>
              <FiCalendar /> Contract Period
            </div>
            <Input label="Contract Start Date *" type="date" name="contract_start_date" register={register} error={errors.contract_start_date} />
            <Input label="Contract End Date *" type="date" name="contract_end_date" register={register} error={errors.contract_end_date} />
            <div className="md:col-span-1"></div>

            {/* 4. Assigned Projects */}
            <div className={sectionHeaderClass}>
              <FiBriefcase /> Assigned Projects
            </div>
            <div className="col-span-full">
              <ProjectSelector
                tenders={tenders}
                selectedProjects={selectedProjects}
                onAdd={addProject}
                onRemove={removeProject}
              />
            </div>

            {/* 5. Wage Fixing */}
            <div className={sectionHeaderClass}>
              <FiDollarSign /> Wage Fixing
            </div>
            <div className="col-span-full">
              <WageFixingTable
                rows={wageFixing}
                onAdd={addWageRow}
                onUpdate={updateWageRow}
                onRemove={removeWageRow}
              />
            </div>

            {/* 6. Address */}
            <div className={sectionHeaderClass}>
              <FiMapPin /> Office Address
            </div>
            <div className="md:col-span-2">
              <Input label="Street / Building *" name="address_street" register={register} error={errors.address_street} />
            </div>
            <Input label="City *" name="address_city" register={register} error={errors.address_city} />
            <Input label="State *" name="address_state" register={register} error={errors.address_state} />
            <Input label="Country *" name="address_country" register={register} error={errors.address_country} />
            <Input label="Pincode *" name="address_pincode" register={register} error={errors.address_pincode} />

            {/* 7. Bank Details */}
            <div className={sectionHeaderClass}>
              <FiDollarSign /> Bank & Payment Details
            </div>
            <Input label="Account Holder Name" name="account_holder_name" register={register} error={errors.account_holder_name} />
            <Input label="Bank Name" name="bank_name" register={register} error={errors.bank_name} />
            <Input label="Branch Name" name="branch_name" register={register} error={errors.branch_name} />
            <Input label="Account Number" name="account_number" register={register} error={errors.account_number} />
            <Input label="IFSC Code" name="ifsc_code" register={register} error={errors.ifsc_code} />
            <Input label="UPI ID" name="upi_id" register={register} error={errors.upi_id} />
            <Select label="Payment Terms" name="payment_terms" watch={watch} setValue={setValue} error={errors.payment_terms} options={["Net 15", "Net 30", "Net 45", "Net 60", "Immediate"]} />
            <div className="md:col-span-2">
              <Input label="Remarks" name="remarks" register={register} error={errors.remarks} />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={() => onclose ? onclose() : navigate(-1)}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <FiSave />}
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Project Selector (searchable multi-select from tenders API) ---
const ProjectSelector = ({ tenders, selectedProjects, onAdd, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIds = selectedProjects.map((p) => p.tender_id);
  const availableTenders = tenders.filter(
    (t) =>
      !selectedIds.includes(t.tender_id) &&
      (t.tenderName || t.project_name || t.tender_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full" ref={wrapperRef}>
      {selectedProjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedProjects.map((p) => (
            <span
              key={p.tender_id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              {p.project_name}
              <button
                type="button"
                onClick={() => onRemove(p.tender_id)}
                className="text-blue-400 hover:text-red-500 transition-colors"
              >
                <IoClose size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white cursor-pointer flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-400">
            {selectedProjects.length > 0
              ? `${selectedProjects.length} project(s) selected`
              : "Select projects to assign..."}
          </span>
          <FiChevronDown className="text-gray-500" />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                className="w-full text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {availableTenders.length > 0 ? (
                availableTenders.map((t) => (
                  <div
                    key={t.tender_id}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-200 flex justify-between items-center"
                    onClick={() => {
                      onAdd(t);
                      setSearchTerm("");
                    }}
                  >
                    <span>{t.tenderName || t.project_name || t.tender_id}</span>
                    <span className="text-[10px] text-gray-400">{t.tender_id}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 text-center">No projects available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Wage Fixing Table ---
const WageFixingTable = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="w-full">
      {rows.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Category</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Wage (Rs/day)</th>
                <th className="w-10 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-2">
                    <SearchableSelect
                      value={row.category}
                      onChange={(val) => onUpdate(index, "category", val)}
                      options={wageCategories}
                      placeholder="Select category..."
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.wage}
                      onChange={(e) => onUpdate(index, "wage", e.target.value)}
                      placeholder="800"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <FiPlus size={14} /> Add Wage Category
      </button>
    </div>
  );
};

// --- Reusable Components ---
const Input = ({ label, name, type = "text", register, error, placeholder, ...rest }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      {...register(name)}
      placeholder={placeholder}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
      {...rest}
    />
    {error && <p className="text-red-500 text-[10px] mt-0.5">{error.message}</p>}
  </div>
);

const Select = ({ label, name, watch, setValue, error, options, disabled, placeholder }) => (
  <SearchableSelect
    label={label}
    name={name}
    watch={watch}
    setValue={(n, v) => setValue(n, v, { shouldValidate: true })}
    options={options}
    placeholder={placeholder || "Select..."}
    disabled={disabled}
    error={error}
  />
);

export default EditContractor;
