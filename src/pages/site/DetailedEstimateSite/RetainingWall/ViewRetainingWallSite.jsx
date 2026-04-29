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
import { AiOutlineSave } from "react-icons/ai";
const schema = yup.object().shape({
  description: yup.string().required("Description is required"),
  nos: yup
    .number()
    .typeError("Nos must be a number")
    .required("Nos is required"),
  length: yup
    .number()
    .typeError("Length must be a number")
    .required("Length is required"),
  breadth: yup
    .number()
    .typeError("Breadth must be a number")
    .required("Breadth is required"),
  depth: yup
    .number()
    .typeError("Depth must be a number")
    .required("Depth is required"),
  contents: yup
    .number()
    .typeError("Contents must be a number")
    .required("Contents is required"),
  total: yup
    .number()
    .typeError("Total must be a number")
    .required("Total is required"),
});

const ViewRetainingWallSite = () => {
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
    0: [
      {
        label: "Description",
        value:
          "Dismantling clearing away and carefully stacking materials useful for reuse for any thickness of  Plain Cement mortar walls under 3m height",
        key: "description",
      },
      {
        label: "Nos",
        value: "1.00",
        key: "nos",
      },
      {
        label: "Length",
        value: "0.40",
        key: "length",
      },
      {
        label: "Breadth",
        value: "0.40",
        key: "breadth",
      },
      {
        label: "Depth",
        value: "0.40",
        key: "depth",
      },
      {
        label: "Contents",
        value: "100.00",
        key: "contents",
      },
      {
        label: "Total",
        value: "10,01,300.00",
        key: "total",
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
    const newKey = Object.keys(data).length;
    const newDataSet = [
      {
        label: "Description",
        value: formData.description,
        key: "description",
      },
      {
        label: "Nos",
        value: formData.nos,
        key: "nos",
      },
      {
        label: "Length",
        value: formData.length,
        key: "length",
      },
      {
        label: "Breadth",
        value: formData.breadth,
        key: "breadth",
      },
      {
        label: "Depth",
        value: formData.depth,
        key: "depth",
      },
      {
        label: "Contents",
        value: formData.contents,
        key: "contents",
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
              isEditing ? "Edit Retaining Wall" : "View Retaining Wall"
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
              onClick={() => navigate("..?tab=7")}
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
                <div className="grid grid-c gap-4 px-6 py-6">
                  <div className="space-y-4">
                    <InputField
                      label="Description"
                      name="description"
                      type="textarea"
                      register={register}
                      errors={errors}
                      placeholder="Enter Description of the item"
                    />
                    <InputField
                      label="Nos"
                      name="nos"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Nos"
                    />
                    <InputField
                      label="Length"
                      name="length"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Length"
                    />
                    <InputField
                      label="Breadth"
                      name="breadth"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Breadth"
                    />
                    <InputField
                      label="Depth"
                      name="depth"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Depth"
                    />
                    <InputField
                      label="Contents"
                      name="contents"
                      register={register}
                      errors={errors}
                      type="number"
                      placeholder="Enter Contents"
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

export default ViewRetainingWallSite;
