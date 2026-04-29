import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../../../components/InputFieldTender";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  penalty_type: yup.string().required("Penalty type is required"),
  penalty_amount: yup
    .number()
    .typeError("Penalty amount must be a number")
    .required("Penalty amount is required")
    .positive("Penalty amount must be positive"),
  penalty_date: yup.date().required("Penalty date is required"),
  description: yup.string().required("Description is required"),
  status: yup
    .string()
    .oneOf(["pending", "paid", "waived"], "Status is required")
    .required("Status is required"),
});

const AddPenalty = ({ onclose, onSuccess }) => {
  const { tender_id } = useParams();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      penalty_type: "",
      status: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        tender_id,
        listOfPenalties: [
          {
            penalty_type: data.penalty_type,
            penalty_amount: data.penalty_amount,
            penalty_date: data.penalty_date,
            description: data.description,
            status: data.status,
          },
        ],
      };

      await axios.post(`${API}/penalty/add`, payload);
      if (onSuccess) onSuccess();
      setLoading(false);
      reset();
      onclose();
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Failed to add penalty");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tight">Add Penalty</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Authorize or log a penalty for this tender</p>
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
          <form id="addPenaltyForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Penalty Information Section */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-blue-600 rounded-full" />
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Penalty Information</h2>
                </div>
              </div>

              <InputFieldTender
                label="Penalty Type"
                name="penalty_type"
                type="select"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                options={[
                  { value: "late delivery", label: "Late Delivery" },
                  { value: "non-compliance", label: "Non Compliance" },
                  { value: "damage", label: "Damage" },
                  { value: "other", label: "Other" },
                ]}
              />

              <InputFieldTender
                label="Penalty Amount"
                name="penalty_amount"
                type="number"
                register={register}
                errors={errors}
                placeholder="Enter penalty amount"
              />

              <InputFieldTender
                label="Penalty Date"
                name="penalty_date"
                type="date"
                register={register}
                errors={errors}
              />

              <InputFieldTender
                label="Status"
                name="status"
                type="select"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "paid", label: "Paid" },
                  { value: "waived", label: "Waived" },
                ]}
              />

              <div className="col-span-1 md:col-span-2 mt-2">
                <InputFieldTender
                  label="Description"
                  name="description"
                  type="textarea"
                  register={register}
                  errors={errors}
                  placeholder="Enter penalty description details"
                  rows={3}
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
            form="addPenaltyForm"
            disabled={loading}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <IoSaveOutline size={16} /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPenalty;
