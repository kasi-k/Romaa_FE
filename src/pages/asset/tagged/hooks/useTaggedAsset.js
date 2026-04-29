import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, extractApiError } from "../../../../services/api";

const KEY = {
  list: "tagged-assets",
  detail: "tagged-asset-detail",
  summary: "tagged-asset-summary",
  calibrationDue: "tagged-asset-calibration-due",
};

export const useTaggedAssetList = (params = {}) =>
  useQuery({
    queryKey: [KEY.list, params],
    queryFn: async () => {
      const { data } = await api.get("/taggedasset/getall", { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useTaggedAssetDetail = (assetId) =>
  useQuery({
    queryKey: [KEY.detail, assetId],
    queryFn: async () => {
      const { data } = await api.get(`/taggedasset/getbyid/${assetId}`);
      return data?.data || null;
    },
    enabled: !!assetId,
    staleTime: 30 * 1000,
  });

export const useTaggedAssetSummary = () =>
  useQuery({
    queryKey: [KEY.summary],
    queryFn: async () => {
      const { data } = await api.get("/taggedasset/summary");
      return data?.data || data || {};
    },
    staleTime: 60 * 1000,
  });

export const useTaggedAssetCalibrationDue = (days = 30) =>
  useQuery({
    queryKey: [KEY.calibrationDue, days],
    queryFn: async () => {
      const { data } = await api.get("/taggedasset/calibration-due", {
        params: { days },
      });
      return data?.data || data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: [KEY.list] });
  qc.invalidateQueries({ queryKey: [KEY.summary] });
};

export const useCreateTaggedAsset = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/taggedasset/create", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Asset registered");
      invalidateAll(qc);
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to register asset")),
  });
};

export const useUpdateTaggedAsset = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assetId, payload }) => {
      const { data } = await api.put(`/taggedasset/update/${assetId}`, payload);
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Asset updated");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, vars.assetId] });
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to update asset")),
  });
};

export const useUpdateTaggedAssetStatus = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assetId, payload }) => {
      const { data } = await api.patch(`/taggedasset/status/${assetId}`, payload);
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Status updated");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, vars.assetId] });
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to update status")),
  });
};

export const useTransferTaggedAsset = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assetId, payload }) => {
      const { data } = await api.put(`/taggedasset/transfer/${assetId}`, payload);
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Asset transferred");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, vars.assetId] });
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to transfer asset")),
  });
};

export const useDeleteTaggedAsset = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assetId) => {
      const { data } = await api.delete(`/taggedasset/delete/${assetId}`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Asset retired");
      invalidateAll(qc);
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to delete asset")),
  });
};
