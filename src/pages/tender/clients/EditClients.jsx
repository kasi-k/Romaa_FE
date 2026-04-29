import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose, IoSaveOutline, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { InputFieldTender } from "../../../components/InputFieldTender";
import { useEditClient } from "./hooks/useClients";

// --- VALIDATION SCHEMA ---
const schema = yup.object().shape({
  client_name: yup.string().required("Client Name is required"),
});

// --- SECTION HEADER ---
const SectionHeader = ({ title, children }) => (
  <div className="col-span-2 mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
      {title}
    </h3>
    {children}
  </div>
);

const EditClients = ({ item, onclose, onUpdated }) => {

  // 1. Setup Mutation Hook
  const { mutate: updateClient, isPending } = useEditClient({
    onSuccess: onUpdated,
    onClose: onclose
  });

  // 2. Initialize Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      client_name: item.client_name,
      pan_no: item.pan_no,
      cin_no: item.cin_no,
      gstin: item.gstin,
      contact_person: item.contact_person,
      contact_email: item.contact_email,
      contact_phone: item.contact_phone,
      contact_persons: item.contact_persons || [],
      city: item.address?.city,
      state: item.address?.state,
      country: item.address?.country,
      pincode: item.address?.pincode,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contact_persons",
  });

  // 3. Submit Handler
  const onSubmit = (data) => {
    const payload = {
      client_name: data.client_name,
      pan_no: data.pan_no,
      cin_no: data.cin_no,
      gstin: data.gstin,
      contact_person: data.contact_person,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      contact_persons: data.contact_persons,
      address: {
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      },
    };

    updateClient({ id: item.client_id, payload });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-layout-font">

      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">

        {/* --- Header --- */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Edit Client Details</h1>
            <p className="text-xs text-gray-500 mt-0.5">Update business information</p>
          </div>
          <button onClick={onclose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* --- Form Body --- */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <form id="editClientForm" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-8 gap-y-4">

            {/* 1. Corporate Identity */}
            <SectionHeader title="Corporate Identity" />

            <div className="col-span-2">
              <InputFieldTender label="Client Name" name="client_name" placeholder="Enter full client name" register={register} errors={errors} />
            </div>

            <div className="col-span-1">
              <InputFieldTender label="PAN Number" name="pan_no" placeholder="Enter PAN" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
              <InputFieldTender label="GST Number" name="gstin" placeholder="Enter GSTIN" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
              <InputFieldTender label="CIN Number" name="cin_no" placeholder="Enter CIN" register={register} errors={errors} />
            </div>

            {/* 2. Primary Contact */}
            <SectionHeader title="Primary Contact" />

            <div className="col-span-2">
              <InputFieldTender
                label="Contact Person"
                name="contact_person"
                placeholder="Enter contact person name"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Email Address"
                name="contact_email"
                type="email"
                placeholder="Enter contact email"
                register={register}
                errors={errors}
              />
            </div>
            <div className="col-span-1">
              <InputFieldTender
                label="Phone"
                name="contact_phone"
                placeholder="Enter phone number"
                register={register}
                errors={errors}
              />
            </div>

            {/* 3. Additional Contacts */}
            <SectionHeader title="Additional Contacts">
              <button
                type="button"
                onClick={() => append({ name: "", phone: "" })}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <IoAddCircleOutline size={16} /> ADD CONTACT
              </button>
            </SectionHeader>

            {fields.length > 0 ? (
              <div className="col-span-2 space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative grid grid-cols-2 gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-800/20">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                    >
                      <IoTrashOutline size={14} />
                    </button>
                    <InputFieldTender
                      label={`Name #${index + 1}`}
                      name={`contact_persons.${index}.name`}
                      placeholder="Person name"
                      register={register}
                      errors={errors}
                    />
                    <InputFieldTender
                      label="Phone"
                      name={`contact_persons.${index}.phone`}
                      placeholder="Phone number"
                      register={register}
                      errors={errors}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-2 text-xs text-gray-400 dark:text-gray-600 italic">
                No additional contacts added.
              </div>
            )}

            {/* 4. Address Details */}
            <SectionHeader title="Billing Address" />

            <div className="col-span-1">
              <InputFieldTender label="City" name="city" placeholder="Enter city" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
              <InputFieldTender label="State" name="state" placeholder="Enter state" register={register} errors={errors} />
            </div>

            <div className="col-span-1">
              <InputFieldTender label="Pincode" name="pincode" placeholder="6-digit pincode" register={register} errors={errors} />
            </div>
            <div className="col-span-1">
              <InputFieldTender label="Country" name="country" placeholder="Enter country" register={register} errors={errors} />
            </div>

          </form>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onclose}
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editClientForm"
            disabled={isPending}
            className="px-8 py-2 text-sm font-bold text-white bg-darkest-blue hover:bg-blue-900 rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Updating..." : (
              <>
                <IoSaveOutline size={16} /> Update Client
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditClients;
