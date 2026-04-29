import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import axios from "axios";
import { InputFieldTender } from "../../../../../components/InputFieldTender";
import { useParams } from "react-router-dom";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  payment_date: yup.date().required("Payment date is required"),
  company_name: yup.string().required("Company name is required"),
  proposed_amount: yup
    .number()
    .typeError("Proposed value must be a number")
    .required("Proposed value is required")
    .min(0, "Proposed value cannot be negative"),
  emd_amount: yup
    .number()
    .typeError("EMD amount must be a number")
    .required("EMD amount is required")
    .min(0, "EMD amount cannot be negative"),
  payment_bank: yup.string().required("Bank name is required"),
  payment_method: yup.string().required("Payment method is required"),
  dd_no: yup.string().required("DD/Cheque No is required"),
  notes: yup.string().nullable(),
});

const AddEMD = ({ onclose, onSuccess }) => {
  const { tender_id } = useParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      payment_method: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        company_name: data.company_name,
        proposed_amount: Number(data.proposed_amount),
        emd_amount: Number(data.emd_amount),
        payment_date: data.payment_date,
        payment_bank: data.payment_bank,
        payment_method: data.payment_method,
        dd_no: data.dd_no,
        notes: data.notes,
        created_by_user: "ADMIN",
      };

      await axios.post(`${API}/emd/addproposal/${tender_id}`, payload);
      setLoading(false);
      if (onSuccess) onSuccess();
      onclose();
      toast.success("EMD Proposal added successfully");
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to add EMD proposal");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tight">Add EMD Proposal</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Submit a new bid proposal for this tender</p>
          </div>
          <button
            onClick={onclose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="addEMDForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Proposal Details Section */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-blue-600 rounded-full" />
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Proposal Details</h2>
                </div>
              </div>

              <InputFieldTender
                label="Company Name"
                name="company_name"
                register={register}
                errors={errors}
                placeholder="Enter company name"
              />

              <InputFieldTender
                label="Payment Date"
                name="payment_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputFieldTender
                label="Bid Value (Proposed)"
                name="proposed_amount"
                type="number"
                register={register}
                errors={errors}
                placeholder="0.00"
              />

              <InputFieldTender
                label="EMD Amount"
                name="emd_amount"
                type="number"
                register={register}
                errors={errors}
                placeholder="0.00"
              />

              {/* Payment Section */}
              <div className="col-span-1 md:col-span-2 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-green-600 rounded-full" />
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Payment Information</h2>
                </div>
              </div>

              <InputFieldTender
                label="Bank Name"
                name="payment_bank"
                register={register}
                errors={errors}
                placeholder="Enter bank name"
              />

              <InputFieldTender
                label="Payment Method"
                name="payment_method"
                type="select"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                options={[
                  { value: "DD", label: "Demand Draft" },
                  { value: "NEFT", label: "NEFT/RTGS" },
                  { value: "Cheque", label: "Cheque" },
                  { value: "Cash", label: "Cash" },
                  { value: "Online", label: "Online Transfer" },
                ]}
                placeholder="Select method"
              />

              <InputFieldTender
                label="DD / Cheque No"
                name="dd_no"
                register={register}
                errors={errors}
                placeholder="Enter number"
              />

              <div className="col-span-1 md:col-span-2">
                <InputFieldTender
                  label="Notes"
                  name="notes"
                  type="textarea"
                  register={register}
                  errors={errors}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
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
            form="addEMDForm"
            disabled={loading}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : <><IoSaveOutline size={16} /> Save Proposal</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEMD;
