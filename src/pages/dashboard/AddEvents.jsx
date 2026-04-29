import React from "react";
import Modal from "../../components/Modal"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {InputField} from "../../components/InputField"

const schema = yup.object().shape({
   etitle: yup.string().required("Event Title is required"),
  date: yup.string().required("Date is required"),
  description: yup.string().required("Description is required"),
});

const AddEvents = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    onclose();
  };

  return (
    <>
      <Modal
        title="Add Events"
        onclose={onclose}
        widthClassName="w-[450px]"
        child={
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-c gap-4 px-6 py-6">
                <div className="space-y-4">
                    <InputField
                      label="Event Title"
                      name="etitle"
                      register={register}
                      errors={errors}
                      placeholder="Enter bank name"
                    />
                  <InputField
                    label="Date"
                    name="date"
                    register={register}
                    errors={errors}
                    type="date"
                  />
                 
                  <InputField
                    label="Description"
                    name="description"
                    register={register}
                    errors={errors}
                    placeholder="Type here"
                    type="textarea"
                  />
                  
                </div>
              </div>
              <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={onclose}
                  className="cursor-pointer border border-darkest-blue text-darkest-blue px-6 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 bg-darkest-blue text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </>
        }
      />
    </>
  );
};

export default AddEvents;
