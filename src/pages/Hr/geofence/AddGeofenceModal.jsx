import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { MapPin } from "lucide-react";
import { useCreateGeofence, useUpdateGeofence } from "./hooks/useGeofence";

const AddGeofenceModal = ({ onclose, onSuccess, item }) => {
  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      latitude: "",
      longitude: "",
      radiusMeters: 200,
      description: "",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name || "",
        latitude: item.latitude || "",
        longitude: item.longitude || "",
        radiusMeters: item.radiusMeters || 200,
        description: item.description || "",
      });
    }
  }, [item, reset]);

  const createMutation = useCreateGeofence({ onSuccess, onclose });
  const updateMutation = useUpdateGeofence({ id: item?._id, onSuccess, onclose });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      radiusMeters: parseInt(data.radiusMeters),
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const Field = ({ label, name, type = "text", step, min, max, required, placeholder }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
      <input
        type={type}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        {...register(name, {
          required: required ? `${label} is required` : false,
          ...(type === "number" ? { valueAsNumber: true } : {}),
        })}
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
          errors[name] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      />
      {errors[name] && <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-layout-font">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">
              {isEdit ? "Edit Geofence" : "Add Geofence Zone"}
            </h2>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Field label="Zone Name" name="name" required placeholder="e.g. Site A - Main Gate" />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Latitude"
              name="latitude"
              type="number"
              step="any"
              required
              placeholder="e.g. 19.0760"
            />
            <Field
              label="Longitude"
              name="longitude"
              type="number"
              step="any"
              required
              placeholder="e.g. 72.8777"
            />
          </div>

          <Field
            label="Radius (meters)"
            name="radiusMeters"
            type="number"
            min={10}
            max={5000}
            required
            placeholder="e.g. 200"
          />

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Enter zone description..."
              {...register("description")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> Radius must be between 10m and 5000m. Employees punching in via mobile app must be within this radius.
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onclose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-darkest-blue hover:bg-blue-900 text-white rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
              )}
              {isEdit ? "Save Changes" : "Create Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGeofenceModal;
