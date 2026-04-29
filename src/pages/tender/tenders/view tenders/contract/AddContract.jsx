import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../../../components/Modal";
import { InputField } from "../../../../../components/InputField";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// ✅ Validation Schema
const schema = yup.object().shape({
  contractWorker_id: yup.string().required("Contract Worker ID is required"),
  contractWorker_name: yup.string().required("Contract Worker Name is required"),
  contractStart_date: yup.date().required("Contract Start Date is required"),
  contractEnd_date: yup.date().required("Contract End Date is required"),
  contratctSite: yup.string().required("Contract Site is required"),
  contractStatus: yup.string().oneOf(
    ["Active", "Inactive", "Completed", "Terminated"],
    "Contract Status is required"
  ).required("Contract Status is required"),
});

const AddContractWorker = ({ onclose, onSuccess }) => {
  const { tender_id } = useParams();
  const [contractWorkers, setContractWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contractWorker_id: "",
      contractWorker_name: "",
      contractStatus: "",
    },
  });

  const workerId = watch("contractWorker_id");
  const workerName = watch("contractWorker_name");

  useEffect(() => {
    axios
      .get(`${API}/contractor/getallselect`) 
      .then((res) => {
        setContractWorkers(res.data.data || []);
      })
      .catch(() => setContractWorkers([]));
  }, []);

  // Sync worker name when ID changes
  useEffect(() => {
    if (workerId) {
      const found = contractWorkers.find((cw) => cw.contractor_id === workerId);
      if (found && found.company_name !== workerName) {
        setValue("contractWorker_name", found.company_name);
      }
    }
  }, [ workerId,  setValue]);

  // Sync worker ID when name changes
  useEffect(() => {
    if (workerName) {
      const found = contractWorkers.find((cw) => cw.company_name === workerName);
      if (found && found.contractor_id !== workerId) {
        setValue("contractWorker_id", found.contractor_id);
      }
    }
  }, [ workerName, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        tender_id,
        workers: [
          {
            contractWorker_id: data.contractWorker_id,
            contractWorker_name: data.contractWorker_name,
            contractStart_date: data.contractStart_date,
            contractEnd_date: data.contractEnd_date,
            contratctSite: data.contratctSite,
            contractStatus: data.contractStatus,
          }
        ]
      };
      await axios.post(`${API}/permittedcontractor/add`, payload);
      if (onSuccess) onSuccess();
      setLoading(false);
      reset();
      onclose();
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Failed to add contract worker");
    }
  };

  return (
    <Modal
      title="Add Contract Worker"
      widthClassName="lg:w-[600px] md:w-[500px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-5 px-6 py-6">
            <InputField
              label="Contract Worker ID"
              type="select"
              name="contractWorker_id"
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              options={contractWorkers.map((cw) => ({
                label: cw.contractor_id,
                value: cw.contractor_id,
              }))}
              onChange={(e) => {
                const selectedId = e.target.value;
                setValue("contractWorker_id", selectedId);
                const found = contractWorkers.find((cw) => cw.contractor_id === selectedId);
                if (found)
                  setValue("contractWorker_name", found.company_name, { shouldValidate: true });
              }}
            />
            <InputField
              label="Contract Worker Name"
              type="select"
              name="contractWorker_name"
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              options={contractWorkers.map((cw) => ({
                label: cw.company_name,
                value: cw.company_name,
              }))}
              onChange={(e) => {
                const selectedName = e.target.value;
                setValue("contractWorker_name", selectedName);
                const found = contractWorkers.find(
                  (cw) => cw.company_name === selectedName
                );
                if (found)
                  setValue("contractWorker_id", found.contractor_id, { shouldValidate: true });
              }}
            />
            <InputField
              label="Contract Start Date"
              name="contractStart_date"
              type="date"
              register={register}
              errors={errors}
            />
            <InputField
              label="Contract End Date"
              name="contractEnd_date"
              type="date"
              register={register}
              errors={errors}
            />
            <InputField
              label="Contract Site"
              name="contratctSite"
              register={register}
              errors={errors}
              placeholder="Enter contract site"
            />
            <InputField
              label="Contract Status"
              name="contractStatus"
              type="select"
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Completed", label: "Completed" },
                { value: "Terminated", label: "Terminated" }
              ]}
            />
          </div>
          <div className="mx-5 text-xs flex justify-end gap-2 mb-4">
            <button
              type="button"
              onClick={onclose}
              className="border px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 bg-darkest-blue text-white rounded"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      }
    />
  );
};

export default AddContractWorker;
