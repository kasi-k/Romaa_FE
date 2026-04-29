import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";

const schema = yup.object().shape({
  fromdate: yup.date().required("From Date is required"),
  todate: yup
    .date()
    .required("To Date is required")
    .min(yup.ref("fromdate"), "To Date cannot be before From Date"),
});

// ✅ Reusable Input component
const InputField = ({
  label,
  name,
  register,
  errors,
  placeholder,
  type = "text",
}) => (
  <div className="grid grid-cols-12 items-center py-2 px-4">
    <label className="col-span-5 text-sm font-medium">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      {...register(name)}
      className={`col-span-7 border dark:border-border-dark-grey border-input-bordergrey rounded-lg outline-none py-1.5 px-2 placeholder:text-xs placeholder:font-light
        ${errors[name] ? "border-red-500" : ""}`}
    />
    {errors[name] && (
      <p className="text-red-500 text-xs col-span-12 text-right mt-1">
        {errors[name].message}
      </p>
    )}
  </div>
);

const Filters = ({ onclose, onFilter }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    onFilter(data); // Send filter data to parent
    onclose(); // Close modal
  };

  return (
    // ✅ Background overlay — clicking outside modal closes it
    <div
      className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20"
      onClick={onclose}
    >
      {/* ✅ Modal content — stop click propagation so clicking inside doesn't close modal */}
      <div
        className="mx-2 shadow-lg py-2 dark:bg-overall_bg-dark bg-white rounded-md w-96"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ Close button */}
        <div className="grid">
          <button
            type="button"
            onClick={onclose}
            className="place-self-end cursor-pointer dark:bg-overall_bg-dark bg-white rounded-full -mx-4 -my-4 shadow-md py-2.5 px-2.5"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* ✅ Heading */}
        <h1 className="text-center font-medium text-2xl py-2">Filter</h1>

        {/* ✅ Filter form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="From Date"
            name="fromdate"
            type="date"
            register={register}
            errors={errors}
          />
          <InputField
            label="To Date"
            name="todate"
            type="date"
            register={register}
            errors={errors}
          />

          {/* ✅ Action buttons */}
          <div className="mx-5 text-xs flex justify-end gap-2 my-4">
            <button
              type="button"
              onClick={onclose}
              className="border dark:border-white border-darkest-blue dark:text-white text-darkest-blue px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-darkest-blue text-white px-6 py-2 rounded"
            >
              Show Results
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Filters;
