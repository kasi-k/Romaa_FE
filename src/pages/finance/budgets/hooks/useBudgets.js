import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "budgets";

/* ── List ────────────────────────────────────────────────────────── */
export const useBudgetList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/budget/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/* ── Single ──────────────────────────────────────────────────────── */
export const useBudgetDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/budget/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

/* ── Variance by ID ──────────────────────────────────────────────── */
export const useBudgetVariance = (id, as_of) =>
  useQuery({
    queryKey: [QK, "variance", id, as_of],
    queryFn: async () => {
      const { data } = await api.get(`/budget/variance/${id}`, { params: as_of ? { as_of } : {} });
      return data?.data;
    },
    enabled: !!id,
    staleTime: 60_000,
  });

/* ── Variance by tender ──────────────────────────────────────────── */
export const useBudgetVarianceByTender = (params = {}) =>
  useQuery({
    queryKey: [QK, "variance-by-tender", params],
    queryFn: async ({ queryKey }) => {
      const [, , , p] = queryKey;
      const { data } = await api.get("/budget/variance/by-tender", { params: p });
      return data?.data;
    },
    enabled: !!params.tender_id && !!params.financial_year,
    staleTime: 60_000,
  });

/* ── Create ──────────────────────────────────────────────────────── */
export const useCreateBudget = ({ onSuccess, onClose } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/budget/create", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Budget created");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to create budget")),
  });
};

/* ── Update (draft only) ─────────────────────────────────────────── */
export const useUpdateBudget = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/budget/update/${id}`, payload).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Budget updated");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Update failed")),
  });
};

/* ── Approve ─────────────────────────────────────────────────────── */
export const useApproveBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/budget/${id}/approve`).then((r) => r.data),
    onSuccess: (_, id) => {
      toast.success("Budget approved");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Approval failed")),
  });
};

/* ── Archive ─────────────────────────────────────────────────────── */
export const useArchiveBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/budget/${id}/archive`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Budget archived");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Archive failed")),
  });
};

/* ── Delete (draft only) ─────────────────────────────────────────── */
export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/budget/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Budget deleted");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Delete failed")),
  });
};
