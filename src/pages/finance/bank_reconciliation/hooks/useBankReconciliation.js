import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "bank-reconciliation";

/* ── Next BR number ─────────────────────────────────────────────── */
export const useNextBRNo = () =>
  useQuery({
    queryKey: ["next-br-no"],
    queryFn: async () => {
      const { data } = await api.get("/bankreconciliation/next-no");
      return data?.data?.statement_no || "";
    },
    staleTime: 0,
    refetchOnMount: true,
  });

/* ── List ────────────────────────────────────────────────────────── */
export const useBRList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/bankreconciliation/list", { params: p });
      return { data: data?.data || [], currentPage: data?.currentPage, totalPages: data?.totalPages, totalCount: data?.totalCount };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/* ── Single statement ────────────────────────────────────────────── */
export const useBRStatement = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/bankreconciliation/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

/* ── Unreconciled JE lines for manual match picker ──────────────── */
export const useUnreconciled = (params = {}) =>
  useQuery({
    queryKey: [QK, "unreconciled", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/bankreconciliation/unreconciled", { params: p });
      return data?.data || [];
    },
    enabled: !!params.bank_account_code,
    staleTime: 15_000,
  });

/* ── Account summary card ────────────────────────────────────────── */
export const useBRSummary = (params = {}) =>
  useQuery({
    queryKey: [QK, "summary", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/bankreconciliation/summary", { params: p });
      return data?.data;
    },
    enabled: !!params.bank_account_code,
    staleTime: 30_000,
  });

/* ── Create ──────────────────────────────────────────────────────── */
export const useCreateBR = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/bankreconciliation/create", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Statement created");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: ["next-br-no"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to create statement")),
  });
};

/* ── Append bank statement lines to an existing statement ───────── */
export const useAppendBRLines = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lines }) =>
      api.post(`/bankreconciliation/${id}/lines`, { lines }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Lines appended");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to append lines")),
  });
};

/* ── Auto-match ──────────────────────────────────────────────────── */
export const useAutoMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, window_days = 5 }) =>
      api.post(`/bankreconciliation/${id}/auto-match`, null, { params: { window_days } }).then((r) => r.data?.data),
    onSuccess: (result, { id }) => {
      toast.success(`Auto-matched ${result?.auto_matched ?? 0} line(s)`);
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Auto-match failed")),
  });
};

/* ── Manual match ────────────────────────────────────────────────── */
export const useManualMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lineId, je_id, je_line_index }) =>
      api.patch(`/bankreconciliation/${id}/lines/${lineId}/match`, { je_id, je_line_index }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Line matched");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Match failed")),
  });
};

/* ── Unmatch ─────────────────────────────────────────────────────── */
export const useUnmatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lineId }) =>
      api.patch(`/bankreconciliation/${id}/lines/${lineId}/unmatch`).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Unmatch failed")),
  });
};

/* ── Ignore ──────────────────────────────────────────────────────── */
export const useIgnoreLine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lineId, note }) =>
      api.patch(`/bankreconciliation/${id}/lines/${lineId}/ignore`, { note }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Line ignored");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Failed")),
  });
};

/* ── Close statement ─────────────────────────────────────────────── */
export const useCloseBR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/bankreconciliation/${id}/close`).then((r) => r.data),
    onSuccess: (_, id) => {
      toast.success("Statement closed & locked");
      qc.invalidateQueries({ queryKey: [QK] });
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
    },
    onError: (err) => toast.error(extractApiError(err, "Close failed")),
  });
};

/* ── Delete ──────────────────────────────────────────────────────── */
export const useDeleteBR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/bankreconciliation/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Statement deleted");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Delete failed")),
  });
};
