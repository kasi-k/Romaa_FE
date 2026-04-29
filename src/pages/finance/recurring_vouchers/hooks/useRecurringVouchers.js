import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "recurring-vouchers";

/* ── List ────────────────────────────────────────────────────────── */
export const useRVList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/recurringvoucher/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/* ── Single ──────────────────────────────────────────────────────── */
export const useRVDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/recurringvoucher/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

/* ── Create ──────────────────────────────────────────────────────── */
export const useCreateRV = ({ onSuccess, onClose } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/recurringvoucher/create", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Recurring voucher template created");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to create template")),
  });
};

/* ── Update ──────────────────────────────────────────────────────── */
export const useUpdateRV = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/recurringvoucher/update/${id}`, payload).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Template updated");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Update failed")),
  });
};

/* ── Pause ───────────────────────────────────────────────────────── */
export const usePauseRV = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/recurringvoucher/${id}/pause`).then((r) => r.data),
    onSuccess: (_, id) => {
      toast.success("Template paused");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to pause")),
  });
};

/* ── Resume ──────────────────────────────────────────────────────── */
export const useResumeRV = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/recurringvoucher/${id}/resume`).then((r) => r.data),
    onSuccess: (_, id) => {
      toast.success("Template resumed");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to resume")),
  });
};

/* ── End ─────────────────────────────────────────────────────────── */
export const useEndRV = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/recurringvoucher/${id}/end`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Template ended — no further runs");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to end template")),
  });
};

/* ── Run Now ─────────────────────────────────────────────────────── */
export const useRunNowRV = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/recurringvoucher/${id}/run-now`).then((r) => r.data),
    onSuccess: (_, id) => {
      toast.success("Voucher fired manually");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Run failed")),
  });
};

/* ── Delete ──────────────────────────────────────────────────────── */
export const useDeleteRV = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/recurringvoucher/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Template deleted");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Delete failed")),
  });
};
