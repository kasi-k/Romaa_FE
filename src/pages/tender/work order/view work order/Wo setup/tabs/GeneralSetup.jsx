import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../../../../../../components/Title";
import { InputField } from "../../../../../../components/InputField";
import ButtonBg from "../../../../../../components/Button";
import { Save, Edit } from "lucide-react";
import { API } from "../../../../../../constant";

const schema = yup.object().shape({
  tender_business_type: yup.string().required("Business Type is required"),
  tender_project_division: yup
    .string()
    .required("Project Division is required"),
  tender_project_name: yup.string().required("Project Name is required"),
  tender_project_type: yup.string().required("Project Type is required"),
});

const GeneralSetup = () => {
  const { tender_id } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tender_business_type: "",
      tender_project_division: "",
      tender_project_name: "",
      tender_project_type: "",
    },
  });

  const watchedData = watch();

  // -------- FETCH DATA --------
  useEffect(() => {
    const fetchGeneralSetup = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/tender/getgenerlsetup/${tender_id}`,
        );

        if (res.data?.status && res.data?.data) {
          reset(res.data.data);
        } else {
          toast.error("No general setup data found");
        }
      } catch (err) {
        toast.error("Failed to fetch general setup");
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralSetup();
  }, [tender_id, reset]);

  // -------- SUBMIT --------
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.put(`${API}/tender/updategenerlsetup/${tender_id}`, data);
      toast.success("General setup updated successfully");
      setEditMode(false);
    } catch (err) {
      toast.error("Failed to update general setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title
          title="Tender Management"
          sub_title="General Setup"
          page_title="General Setup"
        />

        {!editMode && (
          <button
            className="flex items-center gap-2 ml-2 bg-darkest-blue text-white px-4 py-2 rounded"
            type="button"
            onClick={() => setEditMode(true)}
          >
            <Edit size={16} /> Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="dark:bg-layout-dark bg-white rounded-md p-6 grid grid-cols-2 gap-4">
          {editMode ? (
            <>
              <InputField
                label="Business Type"
                name="tender_business_type"
                register={register}
                errors={errors}
                placeholder="Enter Business Type"
              />

              <InputField
                label="Project Division"
                name="tender_project_division"
                register={register}
                errors={errors}
                placeholder="Enter Project Division"
              />

              <InputField
                label="Project Name"
                name="tender_project_name"
                register={register}
                errors={errors}
                placeholder="Enter Project Name"
              />

              <InputField
                label="Project Type"
                name="tender_project_type"
                register={register}
                errors={errors}
                placeholder="Enter Project Type"
              />
            </>
          ) : (
            <>
              <p className="text-sm font-bold dark:text-white text-gray-800">
                Business Type
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                {watchedData.tender_business_type}
              </p>

              <p className="text-sm font-bold dark:text-white text-gray-800">
                Project Division
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                {watchedData.tender_project_division}
              </p>

              <p className="text-sm font-bold dark:text-white text-gray-800">
                Project Name
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                {watchedData.tender_project_name}
              </p>

              <p className="text-sm font-bold dark:text-white text-gray-800">
                Project Type
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                {watchedData.tender_project_type}
              </p>
            </>
          )}
        </div>

        {editMode && (
          <div className="flex justify-end mt-6 gap-2">
            <ButtonBg
              type="submit"
              button_name="Save"
              button_icon={<Save size={16} />}
              loading={loading}
            />
            <button
              type="button"
              className="bg-white text-black px-4 py-2 rounded"
              onClick={() => setEditMode(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default GeneralSetup;
