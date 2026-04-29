import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  date: yup.string().required("Date is required"),
  location: yup.string().required("Location is required"),
  status: yup.string().required("Status is required"),
  description: yup.string().required("Description is required"),
});

const RaiseTickets = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    onclose();
  };

  return (
    <div>
      <Modal
        onclose={onclose}
        title="Raise Tickets"
        child={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 px-6 py-6">
              <div className="space-y-4">
                <InputField
                  label="Name"
                  name="name"
                  register={register}
                  errors={errors}
                  placeholder="Type Here"
                />
                <InputField
                  label="Date"
                  name="date"
                  register={register}
                  errors={errors}
                  placeholder="Type Here"
                  type="date"
                />
                <InputField
                  label="Location"
                  name="location"
                  register={register}
                  errors={errors}
                  placeholder="Type Here"
                />
                <InputField
                  type="select"
                  label="Status"
                  name="status"
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  placeholder="Select"
                  options={[
                    { label: "Completed", value: "complete" },
                    { label: "Progress", value: "progress" },
                    { label: "Not Completed", value: "notcomplete" }
                  ]}
                />
                <InputField
                  type="textarea"
                  label="Description"
                  name="description"
                  register={register}
                  errors={errors}
                  placeholder="Type Here"
                />
              </div>
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="cursor-pointer border dark:border-white dark:text-white border-darkest-blue text-darkest-blue px-6 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer px-6 py-2 bg-darkest-blue text-white rounded"
              >
                Raise Tickets
              </button>
            </div>
          </form>
        }
      />
    </div>
  );
};

export default RaiseTickets;
