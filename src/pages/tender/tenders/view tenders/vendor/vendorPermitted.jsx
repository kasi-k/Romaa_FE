import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../../../components/InputFieldTender";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// ✅ Validation Schema
const schema = yup.object().shape({
  type: yup.string().required("Vendor Type is required"),
  vendor_id: yup.string().required("Vendor ID is required"),
  company_name: yup.string().required("Vendor Name is required"),
  agreement_start: yup.date().required("Agreement Start Date is required"),
  agreement_end: yup.date().nullable(),
  permitted_by: yup.string().required("Permitted By is required"),
  permitted_status: yup
    .string()
    .oneOf(["APPROVED", "PENDING", "REJECTED"])
    .required("Permitted Status is required"),
  remarks: yup.string().nullable(),
});

const AddPermittedVendor = ({ onclose, onSuccess }) => {
  const { tender_id } = useParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "",
      vendor_id: "",
      company_name: "",
      permitted_status: "",
    },
  });

  const vendorType = watch("type");
  const vendorId = watch("vendor_id");
  const vendorName = watch("company_name");

  useEffect(() => {
    if (vendorType) {
      axios
        .get(`${API}/vendor/getallvendorsselect?type=${vendorType}`)
        .then((res) => {
          setVendors(res.data.data || []);
          setValue("vendor_id", "");
          setValue("company_name", "");
        })
        .catch((err) => {
          console.error("Failed to fetch vendors", err);
          setVendors([]);
        });
    } else {
      setVendors([]);
      setValue("vendor_id", "");
      setValue("company_name", "");
    }
  }, [vendorType, setValue]);

  useEffect(() => {
    if (vendorId) {
      const found = vendors.find((v) => v.vendor_id === vendorId);
      if (found && found.company_name !== vendorName) {
        setValue("company_name", found.company_name, { shouldValidate: true });
      }
    }
  }, [vendorId, vendors, vendorName, setValue]);

  useEffect(() => {
    if (vendorName) {
      const found = vendors.find((v) => v.company_name === vendorName);
      if (found && found.vendor_id !== vendorId) {
        setValue("vendor_id", found.vendor_id, { shouldValidate: true });
      }
    }
  }, [vendorName, vendors, vendorId, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const vendorsPayload = [
        {
          vendor_id: data.vendor_id,
          type: data.type,
          vendor_name: data.company_name,
          agreement_start: new Date(data.agreement_start).toISOString(),
          agreement_end: new Date(data.agreement_end).toISOString(),
          permitted_by: data.permitted_by,
          permitted_status: data.permitted_status,
          remarks: data.remarks,
        },
      ];

      const payload = {
        tender_id: tender_id,
        vendors: vendorsPayload,
      };

      await axios.post(`${API}/permittedvendor/add`, payload);
      if (onSuccess) onSuccess();
      setLoading(false);
      reset();
      onclose();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to add permitted vendor");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tight">Add Permitted Vendor</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Authorize a vendor for this tender</p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="addPermittedVendorForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Vendor Information Section */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-blue-600 rounded-full" />
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Vendor Selection</h2>
                </div>
              </div>

              <InputFieldTender
                label="Vendor Type"
                name="type"
                type="select"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                placeholder="Select Type"
                options={[
                  { label: "Cement Supplier", value: "Cement Supplier" },
                  { label: "Steel Supplier", value: "Steel Supplier" },
                  { label: "Sand Supplier", value: "Sand Supplier" },
                  { label: "Aggregate Supplier", value: "Aggregate Supplier" },
                  { label: "Bricks Supplier", value: "Bricks Supplier" },
                  { label: "Electrical Contractor", value: "Electrical Contractor" },
                  { label: "Plumbing Contractor", value: "Plumbing Contractor" },
                  { label: "Paint Supplier", value: "Paint Supplier" },
                  { label: "Tiles Supplier", value: "Tiles Supplier" },
                  { label: "Wood Supplier", value: "Wood Supplier" },
                ]}
              />

              <InputFieldTender
                label="Vendor ID"
                name="vendor_id"
                type="select"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                placeholder="Select ID"
                options={vendors.map((v) => ({ label: v.vendor_id, value: v.vendor_id }))}
                disabled={!vendorType}
              />

              <InputFieldTender
                label="Vendor Name"
                name="company_name"
                type="select"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                placeholder="Select Name"
                options={vendors.map((v) => ({ label: v.company_name, value: v.company_name }))}
                disabled={!vendorType}
              />

              <InputFieldTender
                label="Permitted Status"
                name="permitted_status"
                type="select"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                options={[
                  { value: "APPROVED", label: "Approved" },
                  { value: "PENDING", label: "Pending" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
              />

              {/* Agreement Section */}
              <div className="col-span-1 md:col-span-2 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-green-600 rounded-full" />
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Agreement Details</h2>
                </div>
              </div>

              <InputFieldTender
                label="Agreement Start"
                name="agreement_start"
                type="date"
                register={register}
                errors={errors}
              />

              <InputFieldTender
                label="Agreement End"
                name="agreement_end"
                type="date"
                register={register}
                errors={errors}
              />

              <InputFieldTender
                label="Permitted By"
                name="permitted_by"
                register={register}
                errors={errors}
                placeholder="Enter person name"
              />

              <InputFieldTender
                label="Remarks"
                name="remarks"
                register={register}
                errors={errors}
                placeholder="Optional notes"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onclose}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="addPermittedVendorForm"
            disabled={loading}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : <><IoSaveOutline size={16} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermittedVendor;
