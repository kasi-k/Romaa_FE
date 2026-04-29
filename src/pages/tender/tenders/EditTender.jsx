import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../components/InputFieldTender";
import { useEditTender } from "./hooks/useTenders";
import { useAllClients } from "../clients/hooks/useClients";

// --- VALIDATION SCHEMA ---
const schema = yup.object().shape({
  tender_name: yup.string().required("Tender Name is required"),
  tender_start_date: yup.date().required("Published Date is required"),
  tender_type: yup.string().required("Tender Type is required"),
  client_id: yup.string().required("Client ID is required"),
  client_name: yup.string().required("Client Name is required"),
  tender_contact_person: yup.string(),
  tender_contact_phone: yup.string().matches(/^[0-9\s-]+$/, "Only numbers, spaces, and hyphens are allowed"),
  tender_contact_email: yup.string().email("Invalid email"),
  tender_location: yup.object({
    city: yup.string(),
    state: yup.string(),
    country: yup.string(),
    pincode: yup.string(),
  }),
  tender_duration: yup.string().required("Duration is required"),
  consider_completion_duration: yup.string().required("Completion Duration is required"),
  tender_value: yup.number().typeError("Must be a number").positive().required("Cost is required"),
  tender_end_date: yup.date().required("Due Date is required"),
  emd: yup.object({
    emd_amount: yup.number(),
    emd_validity: yup.date(),
  }),
  tender_description: yup.string().max(500).required("Description is required"),
  site_location: yup.object({
    latitude: yup.number().typeError("Num required"),
    longitude: yup.number().typeError("Num required"),
  }),
});

// Helper to format date for input (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

const SectionHeader = ({ title }) => (
  <div className="col-span-2 mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      {title}
    </h3>
  </div>
);

const EditTender = ({ item, onclose, onUpdated }) => {
  // 1. Get Cached Clients (No extra API call)
  const { data: clients = [] } = useAllClients();

  // 2. Setup Mutation
  const { mutate: updateTender, isPending } = useEditTender({
    onSuccess: onUpdated,
    onClose: onclose,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...item,
      tender_start_date: formatDate(item.tender_start_date),
      tender_end_date: formatDate(item.tender_end_date),
      emd: {
        ...item.emd,
        emd_validity: formatDate(item.emd?.emd_validity),
      },
    },
  });

  const fillClientFields = useCallback(
    (found) => {
      if (!found) return;
      setValue("client_id", found.client_id, { shouldValidate: true });
      setValue("client_name", found.client_name, { shouldValidate: true });
      setValue("tender_contact_person", found.contact_person, {
        shouldValidate: true,
      });
      setValue("tender_contact_phone", found.contact_phone ?? "", {
        shouldValidate: true,
      });
      setValue("tender_contact_email", found.contact_email, {
        shouldValidate: true,
      });
    },
    [setValue],
  );
  const onSubmit = (data) => {
    updateTender({ id: item.tender_id, data });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Edit Tender Details
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Update project information
            </p>
          </div>
          <button
            onClick={onclose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <form
            id="editTenderForm"
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-x-8 gap-y-4"
          >
            <SectionHeader title="Project Details" />
            <div className="col-span-2">
              <InputFieldTender
                label="Tender Name"
                name="tender_name"
                placeholder="Enter tender name"
                register={register}
                errors={errors}
              />
            </div>

            <div className="col-span-1">
              <InputFieldTender
                label="Tender Type"
                type="select"
                name="tender_type"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                options={[
                  { value: "item rate contarct", label: "Item Rate" },
                  { value: "percentage", label: "Percentage" },
                  { value: "lumpsum", label: "Lumpsum" },
                ]}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Estimated Value (₹)"
                name="tender_value"
                type="text"
                onInput={(e) =>
                  (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
                }
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-2">
              <InputFieldTender
                label="Description"
                type="textarea"
                name="tender_description"
                placeholder="Scope of work..."
                register={register}
                errors={errors}
              />
            </div>

            <SectionHeader title="Client Information" />
            <div className="col-span-1">
              <InputFieldTender
                label="Client ID"
                type="select"
                name="client_id"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                options={clients.map((c) => ({
                  value: c.client_id,
                  label: c.client_id,
                }))}
                onChange={(e) =>
                  fillClientFields(
                    clients.find((c) => c.client_id === e.target.value),
                  )
                }
              />
            </div>

            <div className="col-span-1">
              <InputFieldTender
                label="Client Name"
                type="select"
                name="client_name"
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                options={clients.map((c) => ({
                  value: c.client_name,
                  label: c.client_name,
                }))}
                onChange={(e) =>
                  fillClientFields(
                    clients.find((c) => c.client_name === e.target.value),
                  )
                }
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Contact Person"
                name="tender_contact_person"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Phone Number"
                name="tender_contact_phone"
                type="text"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-2">
              <InputFieldTender
                label="Email Address"
                name="tender_contact_email"
                type="email"
                register={register}
                errors={errors}
              />
            </div>

            <SectionHeader title="Schedule & EMD" />
            <div className="col-span-1">
              <InputFieldTender
                label="Published Date"
                name="tender_start_date"
                type="date"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Bid Submission Due"
                name="tender_end_date"
                type="date"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Duration"
                name="tender_duration"
                placeholder="e.g. 12 Months"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Completion Target"
                name="consider_completion_duration"
                placeholder="e.g. 10 Months"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="EMD Amount (₹)"
                name="emd.emd_amount"
                type="text"
                onInput={(e) =>
                  (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
                }
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="EMD Validity"
                name="emd.emd_validity"
                type="date"
                register={register}
                errors={errors}
              />
            </div>

            <SectionHeader title="Site Location" />
            <div className="col-span-1">
              <InputFieldTender
                label="City"
                name="tender_location.city"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="State"
                name="tender_location.state"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Pincode"
                name="tender_location.pincode"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Country"
                name="tender_location.country"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Latitude"
                name="site_location.latitude"
                type="number"
                step="0.000001"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Longitude"
                name="site_location.longitude"
                type="number"
                step="0.000001"
                register={register}
                errors={errors}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onclose}
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editTenderForm"
            disabled={isPending}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              "Updating..."
            ) : (
              <>
                <IoSaveOutline size={16} /> Update Tender
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTender;
