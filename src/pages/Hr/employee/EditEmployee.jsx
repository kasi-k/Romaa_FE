import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import { useEditEmployee, useManagersDropdown } from "./hooks/useEmployees";
import SearchableSelect from "../../../components/SearchableSelect";

// --- Schema ---
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),

  userType: yup.string().oneOf(["Office", "Site"]).required("User Type required"),
  designation: yup.string().required("Designation required"),
  department: yup.string().required("Department required"),
  hrStatus: yup.string().required("HR Status required"),
  reportsTo: yup.string().nullable(),
  dateOfJoining: yup.date().required("Date required"),
  employeeReference: yup.string(),

  address_street: yup.string().required("Street required"),
  address_city: yup.string().required("City required"),
  address_state: yup.string().required("State required"),
  address_pincode: yup.string().required("Pincode required"),

  id_proof_type: yup.string().required("ID Type required"),
  id_proof_number: yup.string().required("ID Number required"),

  emergency_name: yup.string().required("Contact Name required"),
  emergency_relationship: yup.string().required("Relation required"),
  emergency_phone: yup.string().required("Phone required"),

  leave_pl: yup.number().typeError("Must be a number").min(0, "Cannot be negative"),
  leave_cl: yup.number().typeError("Must be a number").min(0, "Cannot be negative"),
  leave_sl: yup.number().typeError("Must be a number").min(0, "Cannot be negative"),

  basicSalary: yup.number().typeError("Must be a number").positive("Must be positive").required("Basic Salary is required"),
  accountHolderName: yup.string().required("Account Holder Name is required"),
  bankName: yup.string().required("Bank Name is required"),
  accountNumber: yup.string().required("Account Number is required"),
  ifscCode: yup.string().required("IFSC Code is required"),
  panNumber: yup.string().required("PAN Number is required"),
  uanNumber: yup.string(),
});

const EditEmployee = ({ onUpdated, onclose }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const employee = state?.item || {}; 

  // --- TanStack Query Hooks ---
  const { data: managers = [] } = useManagersDropdown();
  const { mutateAsync: updateEmployee, isPending: loading } = useEditEmployee({ 
    employeeId: employee.employeeId, 
    onUpdated, 
    onclose 
  });

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
      // Identity
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",

      // Job Profile & HR
      userType: employee.userType || "Office",
      designation: employee.designation || "",
      department: employee.department || "",
      hrStatus: employee.hrStatus || "Probation",
      
      // Handle populated object vs string ID for reportsTo
      reportsTo: typeof employee.reportsTo === 'object' ? employee.reportsTo?._id : (employee.reportsTo || ""),
      
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : "",
      employeeReference: employee.employeeReference || "",
      
      // Address Flattening
      address_street: employee.address?.street || "",
      address_city: employee.address?.city || "",
      address_state: employee.address?.state || "",
      address_pincode: employee.address?.pincode || "",
      
      // Documents Flattening
      id_proof_type: employee.idProof?.type || "",
      // Select fields
      id_proof_number: employee.idProof?.number || "",

      // Emergency Contact Flattening
      emergency_name: employee.emergencyContact?.name || "",
      emergency_relationship: employee.emergencyContact?.relationship || "",
      emergency_phone: employee.emergencyContact?.phone || "",

      // Leave Balances Flattening
      leave_pl: employee.leaveBalance?.PL ?? 0,
      leave_cl: employee.leaveBalance?.CL ?? 12,
      leave_sl: employee.leaveBalance?.SL ?? 12,

      // Payroll Flattening
      basicSalary: employee.payroll?.basicSalary || 0,
      accountHolderName: employee.payroll?.accountHolderName || "",
      bankName: employee.payroll?.bankName || "",
      accountNumber: employee.payroll?.accountNumber || "",
      ifscCode: employee.payroll?.ifscCode || "",
      panNumber: employee.payroll?.panNumber || "",
      uanNumber: employee.payroll?.uanNumber || "",
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      
      userType: data.userType,
      designation: data.designation,
      department: data.department,
      hrStatus: data.hrStatus,
      reportsTo: data.reportsTo || null,
      dateOfJoining: data.dateOfJoining,
      employeeReference: data.employeeReference,

      address: {
        street: data.address_street,
        city: data.address_city,
        state: data.address_state,
        pincode: data.address_pincode,
      },
      idProof: {
          type: data.id_proof_type,
          number: data.id_proof_number
      },
      emergencyContact: {
        name: data.emergency_name,
        relationship: data.emergency_relationship,
        phone: data.emergency_phone,
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
    await updateEmployee(payload);
  };

  // --- Styles ---
  const sectionHeaderClass = "col-span-full text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mt-4 mb-2 flex items-center gap-2";

  if (!employee._id) {
    return <div className="p-6 text-red-500 text-center">Error: No employee data loaded.</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* --- Header --- */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiUser className="text-xl" /></span>
              Edit Employee Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1 ml-11">Update details for <span className="font-semibold text-gray-700">{employee.name}</span></p>
          </div>
          <button 
            type="button"
            onClick={() => onclose ? onclose() : navigate(-1)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
          >
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

            <Input label="Full Name *" name="name" register={register} error={errors.name} />
            <Input label="Email ID *" type="email" name="email" register={register} error={errors.email} />
            <Input label="Mobile No *" type="phone" name="phone" register={register} error={errors.phone} />
            
            {/* 2. Job Profile & HR Section */}
            <div className={sectionHeaderClass}>
              <FiBriefcase /> Job Profile & Reporting
            </div>

            <Select label="Department *" name="department" watch={watch} setValue={setValue} error={errors.department} options={departments} />
            <Input label="Designation *" name="designation" register={register} error={errors.designation} />
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

            <Input label="Employee Reference" name="employeeReference" register={register} error={errors.employeeReference} />
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

            <Input label="Basic Salary (₹) *" type="number" name="basicSalary" register={register} error={errors.basicSalary} />
            <Input label="Account Holder Name *" name="accountHolderName" register={register} error={errors.accountHolderName} />
            <Input label="Bank Name *" name="bankName" register={register} error={errors.bankName} />

            <Input label="Account Number *" name="accountNumber" register={register} error={errors.accountNumber} />
            <Input label="IFSC Code *" name="ifscCode" register={register} error={errors.ifscCode} />
            <div className="md:col-span-1"></div>

            <Input label="PAN Number *" name="panNumber" register={register} error={errors.panNumber} />
            <Input label="UAN Number (PF)" name="uanNumber" register={register} error={errors.uanNumber} />
            <div className="md:col-span-1"></div>

            {/* 5. Address Section */}
            <div className={sectionHeaderClass}>
              <FiMapPin /> Residential Address
            </div>

            <div className="md:col-span-2">
              <Input label="Street / Building *" name="address_street" register={register} error={errors.address_street} />
            </div>
            <Input label="City *" name="address_city" register={register} error={errors.address_city} />
            <Input label="Pincode *" name="address_pincode" register={register} error={errors.address_pincode} />
            <Input label="State *" name="address_state" register={register} error={errors.address_state} />

            {/* 6. Legal & Emergency Section */}
            <div className={sectionHeaderClass}>
              <FiShield /> Legal Documents
            </div>

            <Select label="ID Proof Type *" name="id_proof_type" watch={watch} setValue={setValue} error={errors.id_proof_type} options={["Aadhar", "Passport", "Voter ID"]} />
            <Input label="ID Proof Number *" name="id_proof_number" register={register} error={errors.id_proof_number} />
            <div className="md:col-span-1"></div>

            <div className={sectionHeaderClass}>
              <FiPhone />  Emergency Contact
            </div>
            <Input label="Emergency Contact Name *" name="emergency_name" register={register} error={errors.emergency_name} />
            <Input label="Relationship *" name="emergency_relationship" register={register} error={errors.emergency_relationship} />
            <Input label="Emergency Phone *" name="emergency_phone" register={register} error={errors.emergency_phone} />

          </form>
        </div>

        {/* --- Footer Actions --- */}
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

export default EditEmployee;