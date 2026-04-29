import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../../components/Modal";
import { FaAsterisk } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../constant";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().matches(/^[0-9]{10}$/, "10 digit number required").required("Phone is required"),
  street: yup.string().required("Street is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  pincode: yup.string().required("Pincode is required"),
});

const InputField = ({ label, name, register, errors, defaultValue, disabled }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label} {!disabled && <span className="text-red-400">*</span>}
    </label>
    <input
      type="text"
      defaultValue={defaultValue}
      disabled={disabled}
      {...register(name)}
      className={`border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
        errors[name] ? "border-red-500" : ""
      } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}`}
    />
    {errors[name] && <p className="text-red-500 text-[10px] text-end">{errors[name].message}</p>}
  </div>
);

const EditProfile = ({ onclose, data }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      street: data.address?.street,
      city: data.address?.city,
      state: data.address?.state,
      pincode: data.address?.pincode,
    }
  });

  const onSubmit = async (formData) => {
    try {
      // Reconstruct nested object structure
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
        }
      };

      // API Call (Assuming standard update endpoint)
      await axios.put(`${API}/employee/update/${data.employeeId}`, payload, { withCredentials: true });
      
      // Update Local Storage immediately to reflect changes without reload
      const updatedUser = { ...data, ...payload };
      localStorage.setItem("crm_user", JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully");
      onclose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <Modal
      title="Edit Profile"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <InputField label="Full Name" name="name" register={register} errors={errors} />
            <InputField label="Employee ID" name="employeeId" register={register} errors={errors} defaultValue={data.employeeId} disabled />
            
            <InputField label="Email Address" name="email" register={register} errors={errors} />
            <InputField label="Phone Number" name="phone" register={register} errors={errors} />
          </div>

          <div className="border-t border-gray-100 pt-4 mb-2">
            <p className="text-sm font-bold text-gray-800 mb-3">Address Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                    <InputField label="Street / Area" name="street" register={register} errors={errors} />
                </div>
                <InputField label="City" name="city" register={register} errors={errors} />
                <InputField label="State" name="state" register={register} errors={errors} />
                <InputField label="Pincode" name="pincode" register={register} errors={errors} />
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={onclose} className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-darkest-blue text-white rounded-lg text-sm hover:bg-blue-900">Save Changes</button>
          </div>
        </form>
      }
    />
  );
};

export default EditProfile;