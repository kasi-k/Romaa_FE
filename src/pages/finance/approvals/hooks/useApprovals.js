import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "approvals";

export const useApprovalRules = () =>
  useQuery({
    queryKey: [QK, "rules"],
    queryFn: async () => {
      const { data } = await api.get("/approvals/rules");
      return data?.data || [];
    },
    staleTime: 120_000,
  });

export const useApprovalRuleBySourceType = (source_type) =>
  useQuery({
    queryKey: [QK, "rule", source_type],
    queryFn: async () => {
      const { data } = await api.get(`/approvals/rules/${source_type}`);
      return data?.data;
    },
    enabled: !!source_type,
    staleTime: 120_000,
  });

export const useApprovalPendingForMe = (params = {}) =>
  useQuery({
    queryKey: [QK, "pending-for-me", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/approvals/requests/pending-for-me", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useApprovalRequests = (params = {}) =>
  useQuery({
    queryKey: [QK, "requests", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/approvals/requests", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useApprovalRequestDetail = (id) =>
  useQuery({
    queryKey: [QK, "request-detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/approvals/requests/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useApproveRequest = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }) => api.post(`/approvals/requests/${id}/approve`, { comment }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Request approved");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Approval failed")),
  });
};

export const useRejectRequest = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }) => api.post(`/approvals/requests/${id}/reject`, { comment }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Request rejected");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Rejection failed")),
  });
};

export const useWithdrawRequest = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }) => api.post(`/approvals/requests/${id}/withdraw`, { comment }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Request withdrawn");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Withdraw failed")),
  });
};

export const useCreateApprovalRule = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/approvals/rules", payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Approval rule saved");
      qc.invalidateQueries({ queryKey: [QK, "rules"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to save rule")),
  });
};
