import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import { InputField } from "../../components/InputField";

const schema = yup.object().shape({
  siteName: yup
    .string()
    .oneOf(["site 1", "site 2", "site 3"], "Invalid Site Name")
    .required("site Name is required"),
  problemTitle: yup
    .string()
    .oneOf(
      ["item rate contarct", "percentage", "lumpsum"],
      "Invalid Problem Title"
    )
    .required("problemTitle is required"),
  category: yup
    .string()
    .oneOf(["category 1", "category 2", "category 3"], "Invalid Category")
    .required("category is required"),
  assignedto: yup.string().required("assign Name is required"),
  description: yup.string().required("Description is required"),
});



const AddSite = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      siteName: "",
      problemTitle: "",
      category: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    onclose();
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50  drop-shadow-lg z-20">
      <div className=" shadow-lg py-2  dark:bg-layout-dark bg-white  rounded-md  max-w-md">
        <div className="grid">
          <button
            onClick={onclose}
            className=" place-self-end   cursor-pointer dark:bg-layout-dark bg-white  rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-6 md:-my-5  -my-3 lg:shadow-md md:shadow-md shadow-none lg:py-2.5 md:py-2.5 py-1 lg:px-2.5 md:px-2.5 px-1 "
          >
            <IoClose className="size-[24px]" />
          </button>
          <h1 className="text-center font-medium text-2xl py-2">
            New Site Problem
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" px-6 py-6">
              <div className=" lg:space-y-6 space-y-3">
                <InputField
                  label="Site Name"
                  type="select"
                  name="siteName"
                  placeholder="Select a site"
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  options={[
                    {
                      value: "site 1",
                      label: "site 1",
                    },
                    { value: "site 2", label: "site 2" },
                    { value: "site 3", label: "site 3" },
                  ]}
                />
                <InputField
                  label="Problem Title"
                  type="select"
                  name="problemTitle"
                  placeholder="Select a problem title"
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  options={[
                    {
                      value: "item rate contarct",
                      label: "Item Rate contract",
                    },
                    { value: "percentage", label: "Percentage" },
                    { value: "lumpsum", label: "Lumpsum" },
                  ]}
                />
                <InputField
                  label="Category"
                  type="select"
                  name="category"
                  placeholder="Select a category"
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  options={[
                    {
                      value: "category 1",
                      label: "Category 1",
                    },
                    { value: "category 2", label: "Category 2" },
                    { value: "category 3", label: "Category 3" },
                  ]}
                />
                <InputField
                  label="Assign To"
                  name="assignedto"
                  register={register}
                  errors={errors}
                  placeholder="Enter name of person to assign"
                />
                <InputField
                  label="Description"
                  type="textarea"
                  name="description"
                  register={register}
                  errors={errors}
                  placeholder="Description of the problem"
                />
                <InputField
                  label="Upload Media"
                  type="file"
                  name="file"
                  register={register}
                  errors={errors}
                  //placeholder="Description of the problem"
                />
              </div>
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="cursor-pointer  border dark:border-white dark:text-white  border-darkest-blue  text-darkest-blue px-6 py-2   rounded"
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
        </div>
      </div>
    </div>
  );
};

export default AddSite;
