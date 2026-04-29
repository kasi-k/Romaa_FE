import React, { useState } from "react";
import SearchableSelect from "../../../../components/SearchableSelect";
import Button from "../../../../components/Button";
import Title from "../../../../components/Title";
import { TbPencil, TbPlus } from "react-icons/tb";
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InputField } from "../../../../components/InputField";
import Modal from "../../../../components/Modal";
import { MdOutlineClose } from "react-icons/md";
import { LuPlus } from "react-icons/lu";
import { AiOutlineSave } from "react-icons/ai";

const schema = yup.object().shape({
  title: yup.string().required("Heading is required"),
  description: yup.string().required("Description is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required"),
  units: yup.string().required("Units are required"),
  rate: yup
    .number()
    .typeError("Rate must be a number")
    .required("Rate is required"),
  amount: yup.number().required("Amount is required"),
});

const EditRateAnalysis = () => {
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      units: "",
    },
  });

  const [data, setData] = useState({
    inletSluice: [
      {
        label: "Quantity",
        value: "203.00",
        key: "quantity",
      },
      {
        label: "Rate",
        value: "₹511.00",
        key: "rate",
      },
      {
        label: "Amount",
        value: "₹1,03,733.00",
        key: "amount",
      },
    ],
    road: [
      {
        label: "Quantity",
        value: "203.00",
        key: "quantity",
      },
      {
        label: "Rate",
        value: "₹511.00",
        key: "rate",
      },
      {
        label: "Amount",
        value: "₹1,03,733.00",
        key: "amount",
      },
    ],
    floodProtection: [
      {
        label: "Quantity",
        value: "203.00",
        key: "quantity",
      },
      {
        label: "Rate",
        value: "₹511.00",
        key: "rate",
      },
      {
        label: "Amount",
        value: "₹1,03,733.00",
        key: "amount",
      },
    ],
  });

  const updateField = (key, newValue, section) => {
    setData((prevData) => ({
      ...prevData,
      [section]: prevData[section].map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      ),
    }));
  };
  const handleSave = () => {
    data;
    navigate("..?tab=3");
  };

  const onSubmit = (formData) => {
    const newKey = formData.title;

    const newDataSet = [
      {
        label: "Description",
        value: formData.description,
        key: "description",
      },

      {
        label: "Units",
        value: formData.units,
        key: "units",
      },
      {
        label: "Quantity",
        value: formData.quantity,
        key: "quantity",
      },
      {
        label: "Rate",
        value: `₹${formData.rate}`,
        key: "rate",
      },
      {
        label: "Amount",
        value: `₹${formData.amount}`,
        key: "amount",
      },
    ];

    setData((prevData) => ({
      ...prevData,
      [newKey]: newDataSet,
    }));

    reset();
    setIsAdding(false);
  };

  const renderField = (field, section) => {
    if (field.key === "units") {
      return (
        <SearchableSelect
          value={field.value}
          onChange={(val) => updateField(field.key, val, section)}
          options={[
            { value: "A", label: "A" },
            { value: "B", label: "B" },
            { value: "C", label: "C" },
          ]}
          placeholder="Select unit"
        />
      );
    }

    return (
      <input
        type="text"
        className="w-full p-3 opacity-65  rounded-lg text-xs border border-input-bordergrey"
        value={field.value}
        onChange={(e) => updateField(field.key, e.target.value, section)}
      />
    );
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center my-2">
          <Title
            title="Projects Management"
            sub_title="Zero Cost"
            active_title="Edit Rate Analysis"
          />
          <div className="flex gap-4">
            <Button
              button_name="Add"
              button_icon={<LuPlus size={23} />}
              bgColor="dark:bg-layout-dark bg-white"
              textColor=" dark:text-white text-darkest-blue"
              onClick={() => setIsAdding(true)}
            />
            <Button
              button_name="Save"
              button_icon={<AiOutlineSave size={23} />}
              onClick={handleSave}
            />
          </div>
        </div>

        <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold text-center text-lg">
            Zero Cost Estimate-Rate Analysis
          </p>

          <div className="grid grid-cols-12  gap-2 items-center">
            {Object.entries(data).map(([section, fields]) => (
              <React.Fragment key={section}>
                <div className="col-span-12 flex items-center justify-between">
                  <p className="font-semibold col-span-12 py-2">
                    {section.replace(/([A-Z])/g, " $1")}{" "}
                  </p>

                  <Button
                    onClick={() => {
                      setData((prevData) => {
                        const newData = { ...prevData };
                        delete newData[section];
                        return newData;
                      });
                    }}
                    button_name={"Remove"}
                    button_icon={<MdOutlineClose size={16} />}
                    bgColor="dark:bg-icon-dark-red bg-red-50"
                    textColor="text-red-500"
                    paddingX="px-2.5"
                    paddingY="py-2.5"
                  />
                </div>

                {fields.map((field) => (
                  <React.Fragment key={field.key}>
                    <p className="col-span-4 font-medium">{field.label}</p>
                    <div className="col-span-8">
                      {renderField(field, section)}
                    </div>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex justify-end py-2 ">
          <Button
            onClick={() => navigate("..?tab=3")}
            button_name="Back"
            button_icon={<IoChevronBackSharp />}
          />
        </div>
      </div>
      {isAdding && (
        <Modal
          title="Add Rate Analysis"
          onclose={() => setIsAdding(false)}
          child={
            <>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 px-6 py-6">
                  <div className="space-y-4">
                    <InputField
                      label="Title"
                      name="title"
                      register={register}
                      errors={errors}
                      placeholder="Enter title"
                    />
                    <InputField
                      label="Description"
                      name="description"
                      register={register}
                      errors={errors}
                      placeholder="Enter description"
                    />
                    <InputField
                      label="Units"
                      name="units"
                      type="select"
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                      placeholder="Select unit"
                      options={[
                        { label: "A", value: "A" },
                        { label: "B", value: "B" },
                        { label: "C", value: "C" },
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
                      label="Amount"
                      name="amount"
                      register={register}
                      errors={errors}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={onclose}
                    className="cursor-pointer border dark:border-white border-darkest-blue dark:text-white text-darkest-blue px-6 py-2 rounded"
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
      )}
    </>
  );
};

export default EditRateAnalysis;
