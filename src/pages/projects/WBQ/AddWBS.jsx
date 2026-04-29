import React from "react";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

// Validation Schema
const getSchema = (maxQuantity) =>
  Yup.object().shape({
    phase: Yup.string().trim().required("Phase is required"),
    quantity: Yup.number()
      .typeError("Quantity must be a number")
      .positive("Quantity must be greater than zero")
      .max(maxQuantity, `Quantity exceeds remaining balance (${maxQuantity})`)
      .required("Quantity is required"),
  });

const AddPhaseModal = ({ isOpen, onclose, onSave, maxQuantity }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(getSchema(maxQuantity)),
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    await onSave(data); // data contains { phase, quantity }
    reset(); // reset the form after successful save
    onclose();
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20">
      <div className="mx-2 shadow-lg py-2.5 dark:bg-overall_bg-dark bg-white rounded-md w-[500px]">
        <div className="grid">
          <button
            onClick={onclose}
            className="place-self-end cursor-pointer dark:bg-overall_bg-dark bg-white rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-2 md:-my-4 -my-3"
            disabled={isSubmitting}
          >
            <IoClose className="size-[26px]" />
          </button>

          <h1 className="text-center font-medium text-2xl py-2">Add Phase</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-8 gap-6 px-4 py-2">
              <label className="col-span-3 mb-1 text-gray-700 dark:text-gray-300">
                Phase
              </label>
              <input
                type="text"
                {...register("phase")}
                className={`col-span-5 dark:bg-overall_bg-dark border dark:border-border-dark-grey rounded-lg outline-none py-2.5 pl-2 text-xs font-light ${
                  errors.phase ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                placeholder="Enter phase name"
              />
              {errors.phase && (
                <p className="text-red-500 text-xs mt-1 col-span-8">
                  {errors.phase.message}
                </p>
              )}

              <label className="col-span-3 mb-1 text-gray-700 dark:text-gray-300">
                Quantity
              </label>
              <input
                type="number"
                {...register("quantity")}
                className={`col-span-5 dark:bg-overall_bg-dark border dark:border-border-dark-grey rounded-lg outline-none py-2.5 pl-2 text-xs font-light ${
                  errors.quantity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-red-500 text-lg mt-1 col-span-8">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 my-4">
              <button
                type="button"
                onClick={onclose}
                disabled={isSubmitting}
                className="cursor-pointer border border-darkest-blue dark:border-border-dark-grey px-6 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`cursor-pointer px-6 text-white rounded ${
                  isSubmitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-darkest-blue"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPhaseModal;
