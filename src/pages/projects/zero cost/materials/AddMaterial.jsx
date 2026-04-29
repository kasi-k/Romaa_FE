import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../../components/Modal";
import { InputField } from "../../../../components/InputField";

const schema = yup.object().shape({
  itemdesc: yup.string().required("Item Description is required"),
  units: yup.string().required("Units are required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .positive("Quantity must be positive")
    .required("Quantity is required"),
  rate: yup
    .number()
    .typeError("Rate must be a number")
    .positive("Rate must be positive")
    .required("Rate is required"),
  rateinctax: yup
    .number()
    .typeError("Rate IncTax must be a number")
    .positive("Rate IncTax must be positive")
    .required("Rate IncTax is required"),
  totalamnt: yup
    .number()
    .typeError("Total Amount must be a number")
    .positive("Total Amount must be positive")
    .required("Total Amount is required"),
  totalmaterial: yup
    .string()
    .matches(/^\d+%$/, "Total Material must be a percentage (e.g., 70%)")
    .required("Total Material is required"),
});

const AddMaterial = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      units: "",
    },
  });

  const onSubmit = (data) => {
    data;
    onclose();
  };

  return (
    <>
      <Modal
        title="Add Materials"
        widthClassName="lg:w-[420px] md:w-[420px] w-96"
        onclose={onclose}
        child={
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 px-6 py-6">
                <div className="space-y-4">
                  <InputField
                    label="Item Description"
                    name="itemdesc"
                    register={register}
                    errors={errors}
                    placeholder="Enter item description"
                  />
                  <InputField
                    label="Units"
                    name="units"
                    type="select"
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    placeholder={"Select unit"}
                    options={[
                      { label: "Cubic Meter", value: "Cubic Meter" },
                      { label: "Bags", value: "Bags" },
                      { label: "Tons", value: "Tons" },
                      { label: "Kilograms", value: "Kilograms" },
                      { label: "Liters", value: "Liters" },
                    ]}
                  />
                  <InputField
                    label="Quantity"
                    name="quantity"
                    register={register}
                    errors={errors}
                    placeholder="Enter quantity"
                  />
                  <InputField
                    label="Rate"
                    name="rate"
                    register={register}
                    errors={errors}
                    placeholder="Enter rate"
                  />
                  <InputField
                    label="Rate IncTax"
                    name="rateinctax"
                    register={register}
                    errors={errors}
                    placeholder="Enter rate inctax"
                  />

                  <InputField
                    label="Total Amount"
                    name="totalamnt"
                    register={register}
                    errors={errors}
                    placeholder="Enter total amount"
                  />

                  <InputField
                    label="Total material"
                    name="totalmaterial"
                    register={register}
                    errors={errors}
                    placeholder="Enter total material"
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
                  Add
                </button>
              </div>
            </form>
          </>
        }
      />
    </>
  );
};

export default AddMaterial;
