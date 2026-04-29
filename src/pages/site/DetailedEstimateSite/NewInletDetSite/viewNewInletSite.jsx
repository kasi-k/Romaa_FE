import React, { useState } from "react";
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

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  number: yup
    .string()
    .required("Number is required"),
  length: yup
    .number()
    .typeError("Length must be a number")
    .required("Length is required"),
  breadth: yup
    .number()
    .typeError("Breadth must be a number")
    .required("Breadth is required"),
  density: yup
    .number()
    .typeError("Density must be a number")
    .required("Density is required"),
});

const ViewNewInletSite = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [data, setData] = useState({
    U_SCutOffWall: [
      { label: "Number", value: "11", key: "number", tooltip: "Total Count" },
      { label: "Length", value: "1", key: "length", tooltip: "In metres" },
      { label: "Breadth", value: "1", key: "breadth", tooltip: "In metres" },
      {
        label: "Density",
        value: "1",
        key: "density",
        tooltip: "In Cubic metres",
      },
    ],
    D_SCutOffWall: [
      { label: "Number", value: "11", key: "number", tooltip: "Total Count" },
      { label: "Length", value: "2", key: "length", tooltip: "In metres" },
      { label: "Breadth", value: "2", key: "breadth", tooltip: "In metres" },
      {
        label: "Density",
        value: "3",
        key: "density",
        tooltip: "In Cubic metres",
      },
    ],
    BarralPortionBelowG_L: [
      { label: "Number", value: "1", key: "number", tooltip: "Total Count" },
      { label: "Length", value: "4", key: "length", tooltip: "In metres" },
      { label: "Breadth", value: "2", key: "breadth", tooltip: "In metres" },
      {
        label: "Density",
        value: "7",
        key: "density",
        tooltip: "In Cubic metres",
      },
    ],
    FrontApronPortion: [
      { label: "Number", value: "6", key: "number", tooltip: "Total Count" },
      { label: "Length", value: "7", key: "length", tooltip: "In metres" },
      { label: "Breadth", value: "5", key: "breadth", tooltip: "In metres" },
      {
        label: "Density",
        value: "4",
        key: "density",
        tooltip: "In Cubic metres",
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

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const onSubmit = (formData) => {
    const newKey = formData.title.toLowerCase().replace(/\s+/g, "_");

    // Construct new dataset array for the new key
    const newDataSet = [
      {
        label: "Number",
        value: formData.number,
        key: "number",
        tooltip: "Total Count",
      },
      {
        label: "Length",
        value: formData.length,
        key: "length",
        tooltip: "In metres",
      },
      {
        label: "Breadth",
        value: formData.breadth,
        key: "breadth",
        tooltip: "In metres",
      },
      {
        label: "Density",
        value: formData.density,
        key: "density",
        tooltip: "In Cubic metres",
      },
    ];

    setData((prevData) => ({
      ...prevData,
      [newKey]: newDataSet,
    }));

    reset();
    setIsAdding(false);
  };

  const TooltipWrapper = ({ tooltip, children }) => {
    if (!tooltip) return children;
    return (
      <div className="relative group inline-block cursor-help">
        {children}
        <div className="absolute z-10 hidden group-hover:block bg-indigo-100 text-black text-xs font-semibold px-3 py-1 rounded shadow-md -top-6 left-36 -translate-x-1/2 w-52 whitespace-normal">
          {tooltip}
          <div className="absolute -bottom-1 left-1 w-3.5 h-3 bg-indigo-100 transform rotate-45"></div>
        </div>
      </div>
    );
  };

  const renderField = (field, section) => {
    if (isEditing) {
      return (
        <input
          type="text"
          className="w-full p-1 border dark:bg-layout-dark border-input-bordergrey rounded text-xs"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value, section)}
        />
      );
    }

    return (
      <TooltipWrapper tooltip={field.tooltip}>
        <p className="text-xs opacity-50">{field.value}</p>
      </TooltipWrapper>
    );
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center my-2">
          <Title
            title="Site Management"
            sub_title="Detailed Estimate"
            active_title={isEditing?"Edit New Inlet Det":"View New Inlet Det"}
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
                bgColor=" dark:bg-layout-dark bg-white"
                textColor="dark:text-white text-darkest-blue"
                onClick={() => setIsAdding(true)}
              />
              <Button button_name="Save" onClick={handleSaveClick} />
            </div>
          )}
        </div>

        <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold text-center text-lg">New Inlet Det</p>

          <div className="grid grid-cols-12 gap-2 items-start">
            {Object.entries(data).map(([section, fields]) => (
              <React.Fragment key={section}>
                <div className="col-span-12 flex items-center justify-between">
                  <p className="font-semibold col-span-12 py-2">
                    {section.replace(/([A-Z])/g, " $1")}{" "}
                  </p>
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
          title="Add NewInlet"
          onclose={() => setIsAdding(false)}
          child={
            <>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-c gap-4 px-6 py-6">
                  <div className="space-y-4">
                    <InputField
                      label="Title"
                      name="title"
                      register={register}
                      errors={errors}
                      placeholder="Enter title"
                      type="text"
                    />
                    <InputField
                      label="Number"
                      name="number"
                      register={register}
                      errors={errors}
                      placeholder="Enter number"
                      type="text"
                    />
                    <InputField
                      label="Length"
                      name="length"
                      register={register}
                      errors={errors}
                      placeholder="Enter length"
                      type="number"
                    />
                    <InputField
                      label="Breadth"
                      name="breadth"
                      register={register}
                      errors={errors}
                      placeholder="Enter breadth"
                      type="number"
                    />
                    <InputField
                      label="Density"
                      name="density"
                      register={register}
                      errors={errors}
                      placeholder="Enter density"
                      type="number"
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

export default ViewNewInletSite;
