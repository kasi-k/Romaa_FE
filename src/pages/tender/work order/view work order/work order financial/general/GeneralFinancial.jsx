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
  mobilization_advance_percentage: yup
    .number()
    .min(0, "Must be >= 0")
    .required("Required"),
  mobilization_advance_amount: yup
    .number()
    .min(0, "Must be >= 0")
    .required("Required"),
  mobilization_advance_recovery_amount: yup
    .number()
    .min(0, "Must be >= 0")
    .required("Required"),
  retention_percentage: yup
    .number()
    .min(0, "Must be >= 0")
    .required("Required"),
});

const GeneralFinancial = () => {
  const { tender_id, workOrder_id } = useParams();
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
      mobilization_advance_percentage: 0,
      mobilization_advance_amount: 0,
      mobilization_advance_recovery_amount: 0,
      retention_percentage: 0,
    },
  });

  const watchedData = watch();

  useEffect(() => {
    const fetchFinancials = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/tender/getfinancialgenerals/${tender_id}/${workOrder_id}`
        );
        if (res.data && res.data.status && res.data.data) {
          reset(res.data.data);
        } else {
          toast.error("No financial data found");
        }
      } catch {
        toast.error("Failed to fetch financial generals");
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  }, [tender_id, workOrder_id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.put(
        `${API}/tender/updatefinancialgenerals/${tender_id}/${workOrder_id}`,
        data
      );
      toast.success("Financial generals updated successfully");
      setEditMode(false);
    } catch {
      toast.error("Failed to update financial generals");
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely format numbers
  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <>
      <div className="sm:my-2 flex sm:items-center flex-col sm:flex-row items-start sm:justify-between space-y-1.5 my-4">
        <Title
          title="Tender Management"
          sub_title="Financial Generals"
          page_title="Financial Generals"
        />
        {!editMode && (
          <button
            className="flex items-center gap-2 ml-2 bg-gray-400 text-white px-4 py-2 rounded"
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
                label="Mobilization Advance %"
                name="mobilization_advance_percentage"
                type="number"
                register={register}
                errors={errors}
                placeholder="Enter Mobilization Advance %"
                step="0.01"
                min="0"
                // If InputField supports valueAsNumber
                valueAsNumber
              />

              <InputField
                label="Mobilization Amount"
                name="mobilization_advance_amount"
                type="number"
                register={register}
                errors={errors}
                placeholder="Enter Mobilization Amount"
                step="0.01"
                min="0"
                valueAsNumber
              />

              <InputField
                label="Mobilization Recovery"
                name="mobilization_advance_recovery_amount"
                type="number"
                register={register}
                errors={errors}
                placeholder="Enter Mobilization Recovery"
                step="0.01"
                min="0"
                valueAsNumber
              />

              <InputField
                label="Retention %"
                name="retention_percentage"
                type="number"
                register={register}
                errors={errors}
                placeholder="Enter Retention %"
                step="0.01"
                min="0"
                valueAsNumber
              />
            </>
          ) : (
            <>
              <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
                Mobilization Advance %
              </p>
              <p className="text-sm col-span-1 dark:text-gray-400 text-gray-600">
                {formatNumber(watchedData.mobilization_advance_percentage)}%
              </p>

              <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
                Mobilization Amount
              </p>
              <p className="text-sm col-span-1 dark:text-gray-400 text-gray-600">
                ₹{formatNumber(watchedData.mobilization_advance_amount)}
              </p>

              <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
                Mobilization Recovery
              </p>
              <p className="text-sm col-span-1 dark:text-gray-400 text-gray-600">
                ₹{formatNumber(watchedData.mobilization_advance_recovery_amount)}
              </p>

              <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
                Retention %
              </p>
              <p className="text-sm col-span-1 dark:text-gray-400 text-gray-600">
                {formatNumber(watchedData.retention_percentage)}%
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
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => setEditMode(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default GeneralFinancial;
