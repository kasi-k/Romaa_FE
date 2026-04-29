import React, { useState } from "react";
import Button from "../../../../components/Button";
import Title from "../../../../components/Title";
import { TbPencil, TbPlus } from "react-icons/tb";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InputField } from "../../../../components/InputField";
import Modal from "../../../../components/Modal";
import { MdOutlineClose } from "react-icons/md";
import { AiOutlineSave } from "react-icons/ai";
const schema = yup.object().shape({
  description: yup.string(),
  itemDescription: yup.string().required("Item Description is required"),
  unit: yup
    .number()
    .typeError("Unit must be a number")
    .required("Unit is required"),
  plannedQty: yup
    .number()
    .typeError("Planned Qty must be a number")
    .required("Planned Qty is required"),
  executedQty: yup
    .number()
    .typeError("Executed Qty must be a number")
    .required("Executed Qty is required"),
  rate: yup
    .number()
    .typeError("Rate must be a number")
    .required("Rate is required"),
  cost: yup
    .number()
    .typeError("Cost must be a number")
    .required("Cost is required"),
  total: yup.string(),
});

const ViewRetainingAbstractSite = () => {
  const location = useLocation();
  const rowData = location.state?.item;
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState(rowData.description || "");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [data, setData] = useState(
    Array.isArray(rowData?.details)
      ? rowData.details.reduce((acc, detail, idx) => {
          acc[idx] = [
            { label: "Item Description", value: detail.item, key: "item" },
            { label: "Unit", value: detail.nos, key: "nos" },
            {
              label: "Planned Qty",
              value: detail.plannedQty,
              key: "plannedQty",
            },
            {
              label: "Executed Qty",
              value: detail.executedQty,
              key: "executedQty",
            },
            { label: "Rate", value: detail.rate, key: "rate" },
            { label: "Cost", value: `₹ ${detail.costs}`, key: "costs" },
            { label: "Total", value: detail.total, key: "total" },
          ];
          return acc;
        }, {})
      : {}
  );

  const updateField = (key, newValue, section) => {
    setData((prevData) => ({
      ...prevData,
      [section]: prevData[section].map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      ),
    }));
  };

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const onSubmit = (formData) => {
    const newKey = Object.keys(data).length;
    const newDataSet = [
      {
        label: "Description",
        value: formData.description,
        key: "description",
      },
      {
        label: "Item Description",
        value: formData.itemDescription,
        key: "itemDescription",
      },
      {
        label: "Unit",
        value: formData.unit,
        key: "unit",
      },
      {
        label: "Planned Qty",
        value: formData.plannedQty,
        key: "plannedQty",
      },
      {
        label: "Executed Qty",
        value: formData.executedQty,
        key: "executedQty",
      },
      {
        label: "Rate",
        value: formData.rate,
        key: "rate",
      },
      {
        label: "Cost",
        value: formData.cost,
        key: "cost",
      },
      {
        label: "Total",
        value: formData.total,
        key: "total",
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
    if (isEditing) {
      if (field.key === "description") {
        return (
          <textarea
            className="w-full p-1 border dark:border-border-dark-grey border-input-bordergrey rounded text-xs"
            value={field.value}
            onChange={(e) => updateField(field.key, e.target.value, section)}
            rows={4}
          />
        );
      }
      return (
        <input
          type="text"
          className="w-full p-1 border dark:border-border-dark-grey border-input-bordergrey rounded text-xs"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value, section)}
        />
      );
    }

    return <p className="text-xs opacity-50">{field.value}</p>;
  };

  return (
    <>
      <div className="h-full">
        <div className="flex justify-between items-center my-2">
          <Title
            title="Projects Management"
            sub_title="Detailed Estimate"
            active_title={
              isEditing ? "Edit Retaining Abstract" : "View Retaining Abstract"
            }
          />
          {!isEditing ? (
            <Button
              button_name="Edit"
              button_icon={<TbPencil size={23} />}
              onClick={handleEditClick}
            />
          ) : (
            <div className="flex gap-2 items-center">
              <Button
                button_name="Add "
                button_icon={<TbPlus size={20} />}
                bgColor="dark:bg-layout-dark bg-white"
                textColor="dark:text-white text-darkest-blue"
                onClick={() => setIsAdding(true)}
              />
              <Button
                button_name="Save"
                button_icon={<AiOutlineSave size={23} />}
                onClick={handleSaveClick}
              />
            </div>
          )}
        </div>
        <div className="h-11/12 overflow-y-auto no-scrollbar">
          <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
            <p className="font-semibold text-center text-lg">Retaining Wall</p>
            <div className="font-semibold">
              {isEditing ? (
                <div className="grid grid-cols-12 gap-2">
                  <label className="col-span-4">Description</label>
                  <textarea
                    className="w-full col-span-8 p-1 border dark:border-border-dark-grey border-input-bordergrey rounded text-xs"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              ) : (
                rowData.description
              )}
            </div>
            <div className="grid grid-cols-12 gap-2 items-start">
              {Object.entries(data).map(([section, fields]) => (
                <React.Fragment key={section}>
                  <div className="col-span-12 flex items-center justify-end">
                    {isEditing && (
                      <Button
                        onClick={() => {
                          setData((prevData) => {
                            const newData = { ...prevData };
                            delete newData[section];
                            return newData;
                          });
                        }}
                        button_name="Remove"
                        button_icon={<MdOutlineClose size={20} />}
                        bgColor="dark:bg-icon-dark-red bg-red-200"
                        textColor="text-red-500"
                      />
                    )}
                  </div>

                  {!isEditing && (
                    <div className="col-span-12  font-semibold text-base py-1">
                      {fields.find((f) => f.key === "description")?.value}
                    </div>
                  )}

                  {fields.map((field) => {
                    if (!isEditing) {
                      if (field.key === "description") return null;
                      if (
                        field.key === "total" &&
                        (!field.value ||
                          field.value === "0" ||
                          field.value === 0)
                      )
                        return null;
                    }

                    return (
                      <React.Fragment key={field.key}>
                        <p className="col-span-4 font-medium">{field.label}</p>
                        <div className="col-span-8">
                          {renderField(field, section)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex justify-end py-2 ">
            <Button
              onClick={() => navigate("..?tab=8")}
              button_name="Back"
              button_icon={<IoChevronBackSharp />}
            />
          </div>
        </div>
      </div>
      {isAdding && (
        <Modal
          title="Add Retaining Wall "
          widthClassName="lg:w-[420px] md:w-[400px] w-96"
          onclose={() => setIsAdding(false)}
          child={
            <>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid  gap-4 px-6 py-6">
                  <div className="space-y-4">
                    <InputField
                      label="Description"
                      name="description"
                      type="textarea"
                      register={register}
                      errors={errors}
                      placeholder="Enter Description"
                    />
                    <InputField
                      label="Item Description"
                      name="itemDescription"
                      register={register}
                      errors={errors}
                      placeholder="Enter Item Description"
                    />
                    <InputField
                      label="Unit"
                      name="unit"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Unit"
                    />
                    <InputField
                      label="Planned Qty"
                      name="plannedQty"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Planned Qty"
                    />
                    <InputField
                      label="Executed Qty"
                      name="executedQty"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Executed Qty"
                    />
                    <InputField
                      label="Rate"
                      name="rate"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Rate"
                    />
                    <InputField
                      label="Cost"
                      name="cost"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Cost"
                    />
                    <InputField
                      label="Total"
                      name="total"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Total"
                    />
                  </div>
                </div>
                <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
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
      )}
    </>
  );
};

export default ViewRetainingAbstractSite;
