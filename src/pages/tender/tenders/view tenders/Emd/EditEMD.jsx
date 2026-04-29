import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import axios from "axios";
import { InputFieldTender } from "../../../../../components/InputFieldTender";
import { useParams } from "react-router-dom";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";

// Schema strictly for Approval
const schema = yup.object().shape({
  status: yup.string().default("APPROVED"),
  level: yup.string().required("Level/Rank is required"),
  security_deposit: yup.object({
    security_deposit_amount: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .required("Security Deposit amount is required")
      .positive("Amount must be positive"),
    security_deposit_validity: yup
      .string() // Using string for HTML date input compatibility
      .required("SD Expiry Date is required"),
  }),
});

const EditEMD = ({ onclose, item, onUpdated }) => {
  const { tender_id } = useParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "APPROVED",
      level: item?.level || "",
      security_deposit: {
        security_deposit_amount: item?.security_deposit?.security_deposit_amount || "",
        security_deposit_validity: item?.security_deposit?.security_deposit_validity || "",
      },
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Strict payload for approveproposal API
      const payload = {
        status: "APPROVED",
        level: data.level,
        security_deposit: {
          security_deposit_amount: Number(data.security_deposit.security_deposit_amount),
          security_deposit_validity: data.security_deposit.security_deposit_validity,
        }
      };

      await axios.put(
        `${API}/emd/approveproposal/${tender_id}/${item.proposal_id}`,
        payload
      );

      toast.success("Proposal Approved and SD Logged Successfully");
      if (onUpdated) onUpdated();
      onclose();
    } catch (error) {
      console.error("Approval Error:", error);
      toast.error(error.response?.data?.message || "Error approving proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tight">
              Approve EMD Proposal
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {item?.company_name} | ID: {item?.proposal_id}
            </p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="approveEMDForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-green-600 rounded-full" />
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Final Approval Details</h2>
                </div>
              </div>

              {/* Status Display (ReadOnly) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1">
                  Action
                </label>
                <div className="w-full px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400 font-bold flex items-center gap-2">
                  <IoCheckmarkCircleOutline /> SET TO APPROVED
                </div>
              </div>

              <InputFieldTender
                label="Rank (Read Only)"
                name="level"
                register={register}
                errors={errors}
                disabled={true}
              />

              {/* Security Deposit Area */}
              <div className="col-span-1 md:col-span-2 mt-2 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <IoCheckmarkCircleOutline className="text-blue-600 dark:text-blue-400 size-5" />
                  <h2 className="text-sm font-bold text-blue-800 dark:text-blue-300">Security Deposit Requirements</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputFieldTender
                    label="SD Amount"
                    name="security_deposit.security_deposit_amount"
                    type="number"
                    register={register}
                    errors={errors}
                    placeholder="Enter SD amount"
                  />
                  <InputFieldTender
                    label="SD Expiry Date"
                    name="security_deposit.security_deposit_validity"
                    type="date"
                    register={register}
                    errors={errors}
                  />
                </div>
                
                <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded border border-dashed border-blue-200 dark:border-blue-800">
                   <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                    <strong>Note:</strong> Executing this action will finalize the tender. All other competing proposals will be marked as rejected automatically by the system.
                  </p>
                </div>
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
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="approveEMDForm"
            disabled={loading}
            className="px-8 py-2 text-sm font-bold text-white rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 bg-green-600 hover:bg-green-700"
          >
            {loading ? "Processing..." : (
              <>
                <IoCheckmarkCircleOutline size={18} /> 
                Approve & Finalize
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEMD;