import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "retention";

export const useRetentionPayableOutstanding = (params = {}) =>
  useQuery({
    queryKey: [QK, "payable-outstanding", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/retention/payable/outstanding", { params: p });
      return data?.data || [];
    },
    staleTime: 30_000,
  });

export const useRetentionReceivableOutstanding = (params = {}) =>
  useQuery({
    queryKey: [QK, "receivable-outstanding", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/retention/receivable/outstanding", { params: p });
      return data?.data || [];
    },
    staleTime: 30_000,
  });

export const useRetentionSummary = (params = {}) =>
  useQuery({
    queryKey: [QK, "summary", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/retention/summary", { params: p });
      return data?.data;
    },
    staleTime: 30_000,
  });

/* Retention releases against a specific bill */
export const useRetentionByBill = (billId) =>
  useQuery({
    queryKey: [QK, "bill", billId],
    queryFn: async () => {
      const { data } = await api.get(`/retention/bill/${billId}`);
      return data?.data || [];
    },
    enabled: !!billId,
    staleTime: 30_000,
  });

export const useRetentionReleaseList = (params = {}) =>
  useQuery({
    queryKey: [QK, "release-list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/retention/release/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useRetentionReleaseDetail = (id) =>
  useQuery({
    queryKey: [QK, "release-detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/retention/release/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useCreateRetentionRelease = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/retention/release", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`Release created: ${data?.rr_no || ""}`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to create release")),
  });
};

export const useApproveRetentionRelease = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/retention/release/${id}/approve`).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Release approved — JE posted");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Approval failed")),
  });
};

export const useCancelRetentionRelease = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => api.post(`/retention/release/${id}/cancel`, { reason }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Release cancelled");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Cancel failed")),
  });
};
