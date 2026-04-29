import React from "react";
import Modal from "../../../../../components/Modal";
import { InputField } from "../../../../../components/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";

const schema = yup.object().shape({
  title:yup.string().required("Title is required"),
  time: yup.string().required("Time is required"),
  date: yup.date().required("Due Date is required"),
  notes: yup
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .required("Description is required"),
});

const AddFollowUp = ({ onclose, onSuccess }) => {
   const { tender_id } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      // POST to backend with tender_id
      const res = await axios.post(`${API}/tender/addfollowup/${tender_id}`, data);

      console.log("Response:", res.data);
      onclose();
       onSuccess();
    } catch (error) {
      console.error("Error adding followup:", error);
      alert("Failed to add followup");
    }
  };
  return (
    <>
      <Modal
        widthClassName="lg:w-[500px] md:w-[400px] w-96"
        onclose={onclose}
        title="Add Follow Up"
        child={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 p-6">
               <InputField
                label=" Tilte"
                name="title"
                register={register}
                errors={errors}
                type="text"
              />
              <InputField
                label=" Date"
                name="date"
                register={register}
                errors={errors}
                type="date"
              />
              <InputField
                label="Time"
                name="time"
                register={register}
                errors={errors}
                placeholder="Enter time"
                type="time"
              />

              <InputField
                label="Note"
                type="textarea"
                name="notes"
                placeholder="Enter a brief notes"
                register={register}
                errors={errors}
              />
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="cursor-pointer  border  dark:border-white border-darkest-blue dark:text-white text-darkest-blue px-6 py-2   rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer px-6 bg-darkest-blue text-white  rounded"
              >
                Save
              </button>
            </div>
          </form>
        }
      />
    </>
  );
};

export default AddFollowUp;
