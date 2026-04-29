import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";

const requestTypeOptions = [
  "Material",
  "Service",
  "Asset",
];

const costCenterOptions = [
  "Site",
  "Head Office",
  "Warehouse",
];

const priorityOptions = [
  "High",
  "Medium",
  "Low",
];

const schema = yup.object().shape({
  requesttype: yup
    .string()
    .oneOf(requestTypeOptions, "Select a valid Request Type")
    .required("Request Type is required"),
  costcenter: yup
    .string()
    .oneOf(costCenterOptions, "Select a valid Cost Center")
    .required("Cost Center is required"),
  priority: yup
    .string()
    .oneOf(priorityOptions, "Select a valid Priority")
    .required("Priority is required"),
});

const RequestRegister = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      requesttype: "",
      costcenter: "",
      priority: "",
    },
  });

  const onSubmit = (data) => {
    data;
    onclose();
  };

  return (
    <>
      <Modal
        title="Request Register"
        widthClassName="lg:w-[450px] md:w-[420px] w-96"
        onclose={onclose}
        child={
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 px-6 py-6">
                <div className="space-y-4">
                  <InputField
                    label="Request Type"
                    name="requesttype"
                    type="select"
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    placeholder={"Select Request type"}
                    options={[
                      { label: "Material", value: "Material" },
                      { label: "Service", value: "Service" },
                      { label: "Asset", value: "Asset" },
                    ]}
                  />
                  <InputField
                    label="Cost Center"
                    name="costcenter"
                    type="select"
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    placeholder={"Select cost center"}
                    options={[
                      { label: "Site", value: "Site" },
                      { label: "Head Office", value: "Head Office" },
                      { label: "Warehouse", value: "Warehouse" },
                    ]}
                  />
                  <InputField
                    label="Priority"
                    name="priority"
                    type="select"
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    placeholder={"Select priority"}
                    options={[
                      { label: "High", value: "High" },
                      { label: "Medium", value: "Medium" },
                      { label: "Low", value: "Low" },
                    ]}
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

export default RequestRegister;
