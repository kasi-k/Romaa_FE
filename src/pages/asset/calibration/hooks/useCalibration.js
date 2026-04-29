import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, extractApiError } from "../../../../services/api";

const KEY = {
  list: "calibrations",
  detail: "calibration-detail",
  history: "calibration-history",
  due: "calibration-due",
};

export const useCalibrationList = (params = {}) =>
  useQuery({
    queryKey: [KEY.list, params],
    queryFn: async () => {
      const { data } = await api.get("/assetcalibration/getall", { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useCalibrationDetail = (id) =>
  useQuery({
    queryKey: [KEY.detail, id],
    queryFn: async () => {
      const { data } = await api.get(`/assetcalibration/getbyid/${id}`);
      return data?.data || null;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });

export const useCalibrationHistory = (assetIdLabel) =>
  useQuery({
    queryKey: [KEY.history, assetIdLabel],
    queryFn: async () => {
      const { data } = await api.get(`/assetcalibration/history/${assetIdLabel}`);
      return data?.data || data || [];
    },
    enabled: !!assetIdLabel,
    staleTime: 60 * 1000,
  });

export const useCalibrationDueReport = (days = 30) =>
  useQuery({
    queryKey: [KEY.due, days],
    queryFn: async () => {
      const { data } = await api.get("/assetcalibration/due-report", {
        params: { days },
      });
      return data?.data || data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: [KEY.list] });
  qc.invalidateQueries({ queryKey: [KEY.history] });
  qc.invalidateQueries({ queryKey: [KEY.due] });
  qc.invalidateQueries({ queryKey: ["tagged-asset-detail"] });
};

export const useCreateCalibration = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/assetcalibration/create", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Calibration recorded");
      invalidateAll(qc);
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to record calibration")),
  });
};

export const useUpdateCalibration = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/assetcalibration/update/${id}`, payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Calibration updated");
      invalidateAll(qc);
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to update calibration")),
  });
};

export const useDeleteCalibration = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/assetcalibration/delete/${id}`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Calibration deleted");
      invalidateAll(qc);
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to delete calibration")),
  });
};
