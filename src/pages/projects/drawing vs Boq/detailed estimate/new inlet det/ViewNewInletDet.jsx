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
  topic: yup.string().required("Topic is required"),
  description: yup.string(),
  number: yup.string().required("Number is required"),
  lenght: yup.string().required("Length is required"),
  breadth: yup.string().required("Breadth is required"),
  density: yup.string().required("Density is required"),
});

const ViewNewInletDet = () => {
  const [isEditing, setIsEditing] = useState(false);
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
      topic: "",
    },
  });

  const [data, setData] = useState({
    "U/S Cut Off Wall": {
      description:
        "Dismantling clearing away and carefully stacking materials useful for reuse for any thickness of  Cement mortar walls under 3m height.",
      fields: [
        { label: "Number", value: "1*8*1", key: "number" },
        { label: "Length", value: "5.06", key: "length" },
        { label: "Breadth", value: "5.06", key: "breadth" },
        { label: "Density", value: "5.06", key: "density" },
      ],
    },
    "D/S Cut off wall": {
      fields: [
        { label: "Number", value: "1*8*1", key: "number" },
        { label: "Length", value: "5.06", key: "length" },
        { label: "Breadth", value: "5.06", key: "breadth" },
        { label: "Density", value: "5.06", key: "density" },
      ],
    },
    "Barral Portion Below G.L": {
      fields: [
        { label: "Number", value: "1*8*1", key: "number" },
        { label: "Length", value: "5.06", key: "length" },
        { label: "Breadth", value: "5.06", key: "breadth" },
        { label: "Density", value: "5.06", key: "density" },
      ],
    },
    "Front Apron Portion": {
      fields: [
        { label: "Number", value: "1*8*1", key: "number" },
        { label: "Length", value: "5.06", key: "length" },
        { label: "Breadth", value: "5.06", key: "breadth" },
        { label: "Density", value: "5.06", key: "density" },
      ],
    },
  });

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => setIsEditing(false);

  const onSubmit = (formData) => {
    const newKey = formData.topic;
    const newDataSet = {
      description: formData.description,
      fields: [
        { label: "Number", value: formData.number, key: "number" },
        { label: "Length", value: formData.lenght, key: "length" },
        { label: "Breadth", value: formData.breadth, key: "breadth" },
        { label: "Density", value: formData.density, key: "density" },
      ],
    };

    setData((prevData) => ({
      ...prevData,
      [newKey]: newDataSet,
    }));

    reset();
    setIsAdding(false);
  };

  const updateField = (key, value, topic) => {
    setData((prevData) => {
      const updatedFields = prevData[topic].fields.map((field) =>
        field.key === key ? { ...field, value } : field
      );
      return {
        ...prevData,
        [topic]: {
          ...prevData[topic],
          fields: updatedFields,
        },
      };
    });
  };

  const renderField = (field, section) => {
    if (isEditing) {
      return (
        <input
          type="text"
          className="w-full p-1 border  border-input-bordergrey dark:border-border-dark-grey rounded text-xs outline-none"
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
        <div className="flex justify-between items-center my-2 h-1/12">
          <Title
            title="Project Management"
            sub_title="Detailed Estimate"
            active_title={isEditing?"Edit New Inlet Det":"View New Inlet Det "}
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
                button_name="Add"
                button_icon={<TbPlus size={20} />}
                bgColor="dark:bg-layout-dark bg-white"
                textColor="dark:text-white text-darkest-blue"
                onClick={() => setIsAdding(true)}
              />
              <Button button_name="Save" button_icon={<AiOutlineSave  size={23}/>} onClick={handleSaveClick} />
            </div>
          )}
        </div>
        <div className="h-11/12 overflow-y-auto no-scrollbar">
          <div className="font-roboto-flex dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm">
            <p className="font-semibold text-center text-lg">Bill of Qty</p>

            <div className="grid grid-cols-12 gap-2 items-start">
              {Object.entries(data).map(([section, details]) => (
                <React.Fragment key={section}>
                  <div className="col-span-12 py-2">
                    {isEditing && details.description ? (
                      <div className="flex gap-2 items-center justify-between">
                        <label className="font-medium">Description</label>
                        <textarea
                          className="font-semibold pt-4 w-full border rounded p-2"
                          value={details.description}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ) : details.description ? (
                      <p className="font-semibold pt-4">
                        {details.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="col-span-12 flex items-center justify-between ">
                    <p className="font-semibold text-lg">
                      {section.replace(/([A-Z])/g, " $1")}
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
                        button_name={"Remove"}
                        button_icon={<MdOutlineClose size={20} />}
                        bgColor="dark:bg-icon-dark-red bg-red-200"
                        textColor="text-red-500"
                      />
                    )}
                  </div>

                  {details.fields.map((field) => (
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
        </div>
        <div className="flex justify-end py-2">
          <Button
            onClick={() => navigate("..?tab=3")}
            button_name="Back"
            button_icon={<IoChevronBackSharp />}
          />
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <Modal
          widthClassName="lg:w-[420px] md:w-[500px] w-96"
          title="Add New Inlet Det"
          onclose={() => setIsAdding(false)}
          child={
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 px-6 py-6">
                <InputField
                  label="Description"
                  name="description"
                  register={register}
                  errors={errors}
                  placeholder="Enter description"
                />
                <InputField
                  label="Topic"
                  name="topic"
                  type="select"
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  placeholder="Select topic"
                  options={[
                    { label: "A", value: "A" },
                    { label: "B", value: "B" },
                    { label: "C", value: "C" },
                  ]}
                />

                <InputField
                  label="Number"
                  name="number"
                  register={register}
                  errors={errors}
                  type="number"
                  placeholder="Enter number"
                />
                <InputField
                  label="Length"
                  name="lenght"
                  register={register}
                  errors={errors}
                  type="number"
                  placeholder="Enter length"
                />
                <InputField
                  label="Breadth"
                  name="breadth"
                  register={register}
                  errors={errors}
                  type="number"
                  placeholder="Enter breadth"
                />
                <InputField
                  label="Density"
                  name="density"
                  register={register}
                  errors={errors}
                  type="number"
                  placeholder="Enter density"
                />
              </div>

              <div className="mx-5 text-xs flex justify-end gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="border dark:border-white border-darkest-blue dark:text-white text-darkest-blue px-6 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-darkest-blue text-white px-6 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          }
        />
      )}
    </>
  );
};

export default ViewNewInletDet;
