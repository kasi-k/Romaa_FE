import React from "react";
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
  FiPhone,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import { useCreateEmployee, useManagersDropdown } from "./hooks/useEmployees";
import SearchableSelect from "../../../components/SearchableSelect";


// --- Schema ---
const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),

  userType: Yup.string().oneOf(["Office", "Site"]).required("User Type required"),
  designation: Yup.string().required("Designation required"),
  department: Yup.string().required("Department required"),
  hrStatus: Yup.string().required("HR Status required"),
  reportsTo: Yup.string().nullable(), // Allow null initially
  dateOfJoining: Yup.date().required("Date required"),
  employeeReference: Yup.string(),

  address_street: Yup.string().required("Street required"),
  address_city: Yup.string().required("City required"),
  address_state: Yup.string().required("State required"),
  address_pincode: Yup.string().required("Pincode required"),

  id_proof_type: Yup.string().required("ID Type required"),
  id_proof_number: Yup.string().required("ID Number required"),

  emergency_name: Yup.string().required("Contact Name required"),
  emergency_relationship: Yup.string().required("Relation required"),
  emergency_phone: Yup.string().required("Phone required"),

  leave_pl: Yup.number().typeError("Must be a number").min(0, "Cannot be negative").default(0),
  leave_cl: Yup.number().typeError("Must be a number").min(0, "Cannot be negative").default(12),
  leave_sl: Yup.number().typeError("Must be a number").min(0, "Cannot be negative").default(12),

  basicSalary: Yup.number().typeError("Must be a number").positive("Must be positive").required("Basic Salary is required"),
  accountHolderName: Yup.string().required("Account Holder Name is required"),
  bankName: Yup.string().required("Bank Name is required"),
  accountNumber: Yup.string().required("Account Number is required"),
  ifscCode: Yup.string().required("IFSC Code is required"),
  panNumber: Yup.string().required("PAN Number is required"),
  uanNumber: Yup.string(),
});

const AddEmployee = ({ onclose, onSuccess }) => {
  // --- TanStack Query Hooks ---
  const { data: managers = [] } = useManagersDropdown();
  const { mutateAsync: createEmployee, isPending: loading } = useCreateEmployee({ onSuccess, onclose });

  // Construction-oriented Departments
  const departments = [
    "Project",
    "Planning",
    "Site",
    "Purchase",
    "Human Resources",
    "Finance",
    "Safety/EHS",
    "QA/QC"
  ];

  const {
    register,
    handleSubmit,
    setValue, 
    watch,    
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userType: "Office",
      hrStatus: "Probation",
      department: "",
      id_proof_type: "",
      leave_pl: 0,
      leave_cl: 12,
      leave_sl: 12,
      reportsTo: ""
    }
  });

  const sectionHeaderClass = "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2 flex items-center gap-2";

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      status: "Active",
      
      department: data.department,
      hrStatus: data.hrStatus,
      reportsTo: data.reportsTo || null,

      address: {
        street: data.address_street,
        city: data.address_city,
        state: data.address_state,
        pincode: data.address_pincode
      },
      idProof: {
        type: data.id_proof_type,
        number: data.id_proof_number
      },
      emergencyContact: {
        name: data.emergency_name,
        relationship: data.emergency_relationship,
        phone: data.emergency_phone
      },
      leaveBalance: {
        PL: data.leave_pl,
        CL: data.leave_cl,
        SL: data.leave_sl
      },
      payroll: {
        basicSalary: data.basicSalary,
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        panNumber: data.panNumber,
        uanNumber: data.uanNumber
      }
    };

    // Trigger the mutation
    await createEmployee(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">

        {/* --- Header --- */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiUser className="text-xl" /></span>
              New Employee Onboarding
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Register new staff details for HRMS</p>
          </div>
          <button onClick={onclose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
            <IoClose size={24} />
          </button>
        </div>

        {/* --- Scrollable Form Area --- */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* 1. Identity Section */}
            <div className={sectionHeaderClass}>
              <FiShield /> Identity & Contact
            </div>

            <Input label="Full Name *" name="name" register={register} error={errors.name} placeholder="John Doe" />
            <Input label="Email ID *" type="email" name="email" register={register} error={errors.email} placeholder="john@company.com" />
            <Input label="Mobile No *" type="phone" name="phone" register={register} error={errors.phone} placeholder="9876543210" />

            {/* 2. Job Profile & HR Section */}
            <div className={sectionHeaderClass}>
              <FiBriefcase /> Job Profile & Reporting
            </div>

            <Select label="Department *" name="department" watch={watch} setValue={setValue} error={errors.department} options={departments} />
            <Input label="Designation *" name="designation" register={register} error={errors.designation} placeholder="e.g. Site Engineer" />
            <Input label="Date of Joining *" type="date" name="dateOfJoining" register={register} error={errors.dateOfJoining} />

            <Select label="Work Type *" name="userType" watch={watch} setValue={setValue} error={errors.userType} options={["Office", "Site"]} />
            <Select label="HR Status *" name="hrStatus" watch={watch} setValue={setValue} error={errors.hrStatus} options={["Probation", "Confirmed", "Notice Period"]} />

            {/* Searchable Select for Reports To */}
            <SearchableSelect
              label="Reports To (Manager)"
              name="reportsTo"
              options={managers}
              setValue={setValue}
              watch={watch}
              error={errors.reportsTo}
              placeholder="Search Manager..."
            />

            <Input label="Employee Reference" name="employeeReference" register={register} error={errors.employeeReference} placeholder="e.g. John Doe" />
            <div className="md:col-span-2"></div>

            {/* 3. Leave Allocation */}
            <div className={sectionHeaderClass}>
              <FiCalendar /> Leave Allocation (Current Year)
            </div>

            <Input label="PL (Privilege Leave) *" type="number" name="leave_pl" register={register} error={errors.leave_pl} />
            <Input label="CL (Casual Leave) *" type="number" name="leave_cl" register={register} error={errors.leave_cl} />
            <Input label="SL (Sick Leave) *" type="number" name="leave_sl" register={register} error={errors.leave_sl} />


            {/* 4. Payroll & Bank Details */}
            <div className={sectionHeaderClass}>
              <FiDollarSign /> Payroll & Bank Details
            </div>

            <Input label="Basic Salary (₹) *" type="number" name="basicSalary" register={register} error={errors.basicSalary} placeholder="0.00" />
            <Input label="Account Holder Name *" name="accountHolderName" register={register} error={errors.accountHolderName} />
            <Input label="Bank Name *" name="bankName" register={register} error={errors.bankName} placeholder="e.g. HDFC Bank" />

            <Input label="Account Number *" name="accountNumber" register={register} error={errors.accountNumber} />
            <Input label="IFSC Code *" name="ifscCode" register={register} error={errors.ifscCode} placeholder="HDFC0001234" />
            <div className="md:col-span-1"></div>

            <Input label="PAN Number *" name="panNumber" register={register} error={errors.panNumber} placeholder="ABCDE1234F" />
            <Input label="UAN Number (PF)" name="uanNumber" register={register} error={errors.uanNumber} placeholder="12-digit UAN" />
            <div className="md:col-span-1"></div>


            {/* 5. Address Section */}
            <div className={sectionHeaderClass}>
              <FiMapPin /> Residential Address
            </div>

            <div className="md:col-span-2">
              <Input label="Street / Building *" name="address_street" register={register} error={errors.address_street} placeholder="Flat No, Street Name" />
            </div>
            <Input label="City *" name="address_city" register={register} error={errors.address_city} />
            <Input label="Pincode *" name="address_pincode" register={register} error={errors.address_pincode} />
            <Input label="State *" name="address_state" register={register} error={errors.address_state} />


            {/* 6. Legal & Emergency Section */}
            <div className={sectionHeaderClass}>
              <FiShield /> Legal Documents
            </div>

            <Select label="ID Proof Type *" name="id_proof_type" watch={watch} setValue={setValue} error={errors.id_proof_type} options={["Aadhar", "Passport", "Voter ID"]} />
            <Input label="ID Proof Number *" name="id_proof_number" register={register} error={errors.id_proof_number} placeholder="XXXX-XXXX-XXXX" />
            <div className="md:col-span-1"></div>

            <div className={sectionHeaderClass}>
              <FiPhone />  Emergency Contact
            </div>
            <Input label="Emergency Contact Name *" name="emergency_name" register={register} error={errors.emergency_name} />
            <Input label="Relationship *" name="emergency_relationship" register={register} error={errors.emergency_relationship} placeholder="Father/Spouse" />
            <Input label="Emergency Phone *" name="emergency_phone" register={register} error={errors.emergency_phone} />

          </form>
        </div>

        {/* Footer Actions */}
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
            {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <FiSave />}
            {loading ? "Creating..." : "Confirm & Create"}
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

export default AddEmployee;