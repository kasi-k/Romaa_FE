import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "year-end-close";

export const useYearEndCloseList = () =>
  useQuery({
    queryKey: [QK, "list"],
    queryFn: async () => {
      const { data } = await api.get("/year-end-close/list");
      return data?.data || [];
    },
    staleTime: 60_000,
  });

export const useYearEndCloseDetail = (financial_year) =>
  useQuery({
    queryKey: [QK, "detail", financial_year],
    queryFn: async () => {
      const { data } = await api.get(`/year-end-close/${financial_year}`);
      return data?.data;
    },
    enabled: !!financial_year,
    staleTime: 30_000,
  });

export const useYearEndClosePreview = (financial_year) =>
  useQuery({
    queryKey: [QK, "preview", financial_year],
    queryFn: async () => {
      const { data } = await api.get("/year-end-close/preview", { params: { financial_year } });
      return data?.data;
    },
    enabled: !!financial_year,
    staleTime: 30_000,
  });

export const useYearEndCloseOpeningBalances = (financial_year) =>
  useQuery({
    queryKey: [QK, "opening-balances", financial_year],
    queryFn: async () => {
      const { data } = await api.get("/year-end-close/opening-balances", { params: { financial_year } });
      return data?.data || [];
    },
    enabled: !!financial_year,
    staleTime: 60_000,
  });

export const usePerformYearEndClose = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/year-end-close/close", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`FY closed — Closing JE: ${data?.closing_je_no || ""}`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Year-end close failed")),
  });
};

export const useReopenYearEnd = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/year-end-close/reopen", payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("FY reopened — reversing JE posted");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Reopen failed")),
  });
};
