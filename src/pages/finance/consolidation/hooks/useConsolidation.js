import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../services/api";

const QK = "consolidation";

export const useConsolidationEntities = () =>
  useQuery({
    queryKey: [QK, "entities"],
    queryFn: async () => {
      const { data } = await api.get("/consolidation/entities");
      return data?.data || [];
    },
    staleTime: 300_000,
  });

export const useConsolidationTrialBalance = (params = {}) =>
  useQuery({
    queryKey: [QK, "trial-balance", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/consolidation/trial-balance", { params: p });
      return data?.data || [];
    },
    enabled: !!params.as_of_date,
    staleTime: 60_000,
  });

export const useConsolidationPnL = (params = {}) =>
  useQuery({
    queryKey: [QK, "pnl", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/consolidation/pnl", { params: p });
      return data?.data;
    },
    enabled: !!params.financial_year || !!(params.from_date && params.to_date),
    staleTime: 60_000,
  });

export const useConsolidationBalanceSheet = (params = {}) =>
  useQuery({
    queryKey: [QK, "balance-sheet", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/consolidation/balance-sheet", { params: p });
      return data?.data || [];
    },
    enabled: !!params.as_of_date,
    staleTime: 60_000,
  });

export const useConsolidationInterEntity = (params = {}) =>
  useQuery({
    queryKey: [QK, "inter-entity", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/consolidation/inter-entity", { params: p });
      return data?.data || [];
    },
    enabled: !!params.financial_year || !!(params.from_date && params.to_date),
    staleTime: 60_000,
  });
