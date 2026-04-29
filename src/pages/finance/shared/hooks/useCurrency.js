import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "finance-currency";

export const useCurrencyList = () =>
  useQuery({
    queryKey: [QK, "list"],
    queryFn: async () => {
      const { data } = await api.get("/finance/currency/list");
      return data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

export const useCurrencyRates = (currency, limit = 50) =>
  useQuery({
    queryKey: [QK, "rates", currency, limit],
    queryFn: async () => {
      const { data } = await api.get("/finance/currency/rates", {
        params: { currency, limit },
      });
      return data?.data || [];
    },
    enabled: !!currency,
    staleTime: 60_000,
  });

export const useCurrency = (code) =>
  useQuery({
    queryKey: [QK, "one", code],
    queryFn: async () => {
      const { data } = await api.get(`/finance/currency/${code}`);
      return data?.data;
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });

export const useUpsertCurrency = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.post("/finance/currency/upsert", payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Currency saved");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to save currency")),
  });
};

export const useUpsertExchangeRate = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.post("/finance/currency/rates/upsert", payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Exchange rate saved");
      qc.invalidateQueries({ queryKey: [QK, "rates"] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to save exchange rate")),
  });
};

export const useDeactivateCurrency = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code) =>
      api.patch(`/finance/currency/${code}/inactive`).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Currency deactivated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to deactivate")),
  });
};
