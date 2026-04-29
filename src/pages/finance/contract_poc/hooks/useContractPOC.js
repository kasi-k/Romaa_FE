import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "contract-poc";

export const useContractPOCList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/contract-poc/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useContractPOCDetail = (tender_id) =>
  useQuery({
    queryKey: [QK, "detail", tender_id],
    queryFn: async () => {
      const { data } = await api.get(`/contract-poc/${tender_id}`);
      return data?.data;
    },
    enabled: !!tender_id,
    staleTime: 15_000,
  });

export const useContractPOCCompute = (tender_id, params = {}) =>
  useQuery({
    queryKey: [QK, "compute", tender_id, params],
    queryFn: async ({ queryKey }) => {
      const [, , tid, p] = queryKey;
      const { data } = await api.get(`/contract-poc/${tid}/compute`, { params: p });
      return data?.data;
    },
    enabled: !!tender_id,
    staleTime: 30_000,
  });

export const useContractPOCComputeAll = (params = {}) =>
  useQuery({
    queryKey: [QK, "compute-all", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/contract-poc/compute-all", { params: p });
      return data?.data || [];
    },
    enabled: !!params.as_of,
    staleTime: 60_000,
  });

export const useUpsertContractPOC = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/contract-poc", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success("POC baseline saved");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to save POC baseline")),
  });
};

export const useSnapshotContractPOC = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tender_id, ...payload }) =>
      api.post(`/contract-poc/${tender_id}/snapshot`, payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`POC snapshot posted — JE: ${data?.je_no || ""}`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Snapshot failed")),
  });
};
