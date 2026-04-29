import { useState, useEffect, useMemo } from "react";
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
} from "react-icons/fi";
import { useEditContractWorker } from "./hooks/useContractWorkers";
import { useContractorsDropdown } from "../contract & Nmr/hooks/useContractors";
import SearchableSelect from "../../../components/SearchableSelect";

const schema = Yup.object().shape({
  contractor_id: Yup.string().required("Contractor is required"),
  employee_name: Yup.string().required("Name is required"),
  contact_phone: Yup.string().required("Phone is required"),
  gender: Yup.string().required("Gender is required"),
  age: Yup.number().typeError("Must be a number").positive("Must be positive").required("Age is required"),
  role: Yup.string().required("Role is required"),
  daily_wage: Yup.number().typeError("Must be a number").positive("Must be positive").required("Daily wage is required"),
  site_assigned: Yup.string(),
  status: Yup.string().required("Status is required"),
  id_proof_type: Yup.string().required("ID proof type is required"),
  id_proof_number: Yup.string().required("ID proof number is required"),
  address_street: Yup.string().required("Street is required"),
  address_city: Yup.string().required("City is required"),
  address_state: Yup.string().required("State is required"),
  address_country: Yup.string().required("Country is required"),
  address_pincode: Yup.string().required("Pincode is required"),
});

const roles = ["Mestri", "Mason", "M-Helper", "Carpenter", "C-Helper", "Bar Bender", "B-Helper", "Electrician", "Plumber", "Painter", "P-Helper", "Welder", "UnSkilled", "Other"];

const EditNMR = ({ onUpdated, onclose }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const nmr = state?.item || {};

  const { data: contractors = [] } = useContractorsDropdown();
  const { mutateAsync: updateWorker, isPending: loading } = useEditContractWorker({
    workerId: nmr.worker_id,
    onUpdated,
    onclose,
  });

  // Track if contractor was changed by user (to avoid resetting pre-filled values on mount)
  const [contractorManuallyChanged, setContractorManuallyChanged] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contractor_id: nmr.contractor_id ?? "",
      employee_name: nmr.employee_name ?? "",
      contact_phone: nmr.contact_phone ?? "",
      gender: nmr.gender ?? "",
      age: nmr.age ?? "",
      role: nmr.role ?? "",
      daily_wage: nmr.daily_wage ?? "",
      site_assigned: nmr.site_assigned ?? "",
      status: nmr.status ?? "ACTIVE",
      id_proof_type: nmr.id_proof_type ?? "",
      id_proof_number: nmr.id_proof_number || "",
      address_street: nmr.address?.street || "",
      address_city: nmr.address?.city || "",
      address_state: nmr.address?.state || "",
      address_country: nmr.address?.country || "India",
      address_pincode: nmr.address?.pincode || "",
    },
  });

  const selectedContractorId = watch("contractor_id");
  const selectedRole = watch("role");

  const selectedContractor = useMemo(
    () => contractors.find((c) => c.value === selectedContractorId),
    [contractors, selectedContractorId]
  );

  // Site options from selected contractor's assigned projects (only active)
  const siteOptions = useMemo(() => {
    if (!selectedContractor) return [];
    return selectedContractor.assigned_projects
      .filter((p) => p.status === "active")
      .map((p) => p.project_name);
  }, [selectedContractor]);

  // Auto-fill wage when role changes based on contractor's wage_fixing
  useEffect(() => {
    if (!selectedContractor || !selectedRole) return;
    const match = selectedContractor.wage_fixing.find(
      (w) => w.category === selectedRole
    );
    if (match) {
      setValue("daily_wage", match.wage);
    }
  }, [selectedRole, selectedContractor, setValue]);

  // Reset role, wage, site only when contractor is manually changed (not on initial load)
  useEffect(() => {
    if (contractorManuallyChanged) {
      setValue("role", "");
      setValue("daily_wage", "");
      setValue("site_assigned", "");
      setContractorManuallyChanged(false);
    }
  }, [selectedContractorId, contractorManuallyChanged, setValue]);

  const onSubmit = async (data) => {
    const payload = {
      contractor_id: data.contractor_id,
      employee_name: data.employee_name,
      contact_phone: data.contact_phone,
      gender: data.gender,
      age: data.age,
      role: data.role,
      daily_wage: data.daily_wage,
      site_assigned: data.site_assigned,
      status: data.status,
      id_proof_type: data.id_proof_type,
      id_proof_number: data.id_proof_number,
      address: {
        street: data.address_street,
        city: data.address_city,
        state: data.address_state,
        country: data.address_country,
        pincode: data.address_pincode,
      },
    };

    await updateWorker(payload);
  };

  const sectionHeaderClass = "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2 flex items-center gap-2";

  if (!nmr.worker_id) {
    return <div className="p-6 text-red-500 text-center">Error: No contract worker data loaded.</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiUser className="text-xl" /></span>
              Edit Contract Worker
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Update details for <span className="font-semibold text-gray-700">{nmr.employee_name}</span></p>
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

            {/* 1. Personal Details */}
            <div className={sectionHeaderClass}>
              <FiUser /> Personal Details
            </div>
            <Input label="Full Name *" name="employee_name" register={register} error={errors.employee_name} />
            <Input label="Phone *" name="contact_phone" register={register} error={errors.contact_phone} />
            <Select label="Gender *" name="gender" watch={watch} setValue={setValue} error={errors.gender} options={["Male", "Female", "Other"]} />
            <Input label="Age *" type="number" name="age" register={register} error={errors.age} />
            <Select label="Status *" name="status" watch={watch} setValue={setValue} error={errors.status} options={["ACTIVE", "INACTIVE", "LEFT"]} />
            <div className="md:col-span-1"></div>

            {/* 2. Work Profile */}
            <div className={sectionHeaderClass}>
              <FiBriefcase /> Work Profile
            </div>
            <SearchableSelect
              label="Contractor *"
              name="contractor_id"
              options={contractors}
              setValue={(name, value) => {
                setValue(name, value);
                setContractorManuallyChanged(true);
              }}
              watch={watch}
              error={errors.contractor_id}
              placeholder="Search Contractor..."
            />
            <Select label="Role *" name="role" watch={watch} setValue={setValue} error={errors.role} options={roles} />
            <Input label="Daily Wage (Rs) *" type="number" name="daily_wage" register={register} error={errors.daily_wage} />

            {/* Site — dropdown from contractor's assigned projects */}
            <Select
              label="Site Assigned"
              name="site_assigned"
              watch={watch}
              setValue={setValue}
              error={errors.site_assigned}
              options={siteOptions}
              disabled={siteOptions.length === 0}
              placeholder={siteOptions.length === 0 ? "Select contractor first" : "Select site..."}
            />
            <div className="md:col-span-2"></div>

            {/* Wage hint */}
            {selectedContractor?.wage_fixing?.length > 0 && (
              <div className="col-span-full">
                <div className="flex flex-wrap gap-2">
                  {selectedContractor.wage_fixing.map((w, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md border ${
                        selectedRole === w.category
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {w.category}: <span className="font-medium">Rs {w.wage}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Address */}
            <div className={sectionHeaderClass}>
              <FiMapPin /> Address
            </div>
            <div className="md:col-span-2">
              <Input label="Street / Area *" name="address_street" register={register} error={errors.address_street} />
            </div>
            <Input label="City *" name="address_city" register={register} error={errors.address_city} />
            <Input label="State *" name="address_state" register={register} error={errors.address_state} />
            <Input label="Country *" name="address_country" register={register} error={errors.address_country} />
            <Input label="Pincode *" name="address_pincode" register={register} error={errors.address_pincode} />

            {/* 4. ID Proof */}
            <div className={sectionHeaderClass}>
              <FiShield /> Identity Document
            </div>
            <Select label="ID Proof Type *" name="id_proof_type" watch={watch} setValue={setValue} error={errors.id_proof_type} options={["Aadhaar", "PAN", "Voter ID", "Driving License", "Passport"]} />
            <Input label="ID Proof Number *" name="id_proof_number" register={register} error={errors.id_proof_number} />
            <div className="md:col-span-1"></div>

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

// --- Reusable Components ---
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

export default EditNMR;
