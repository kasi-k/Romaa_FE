import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, extractApiError } from "../../../../services/api";

const KEY = {
  list: "issuances",
  detail: "issuance-detail",
  overdue: "issuances-overdue",
};

export const useIssuanceList = (params = {}) =>
  useQuery({
    queryKey: [KEY.list, params],
    queryFn: async () => {
      const { data } = await api.get("/assetissuance/getall", { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useIssuanceDetail = (issueId) =>
  useQuery({
    queryKey: [KEY.detail, issueId],
    queryFn: async () => {
      const { data } = await api.get(`/assetissuance/getbyid/${issueId}`);
      return data?.data || null;
    },
    enabled: !!issueId,
    staleTime: 30 * 1000,
  });

export const useIssuanceOverdue = () =>
  useQuery({
    queryKey: [KEY.overdue],
    queryFn: async () => {
      const { data } = await api.get("/assetissuance/overdue");
      return data?.data || data || [];
    },
    staleTime: 60 * 1000,
  });

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: [KEY.list] });
  qc.invalidateQueries({ queryKey: [KEY.overdue] });
};

export const useCreateIssuance = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/assetissuance/create", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Issuance created");
      invalidateAll(qc);
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to create issuance")),
  });
};

export const useReturnIssuance = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, payload }) => {
      const { data } = await api.post(`/assetissuance/return/${issueId}`, payload);
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Return recorded");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, vars.issueId] });
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to record return")),
  });
};

export const useMarkLost = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, notes }) => {
      const { data } = await api.post(`/assetissuance/lost/${issueId}`, { notes });
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Marked as lost");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, vars.issueId] });
      onDone?.();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to mark lost")),
  });
};

export const useSweepOverdue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/assetissuance/sweep-overdue");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Overdue sweep complete");
      invalidateAll(qc);
    },
    onError: (err) => toast.error(extractApiError(err, "Sweep failed")),
  });
};
