import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../services/api";

const QK = "finance-metrics";

export const useFinanceMetrics = ({ refetchMs } = {}) =>
  useQuery({
    queryKey: [QK],
    queryFn: async () => {
      const { data } = await api.get("/finance/metrics");
      return data?.data || {};
    },
    refetchInterval: refetchMs ?? 30_000,
    staleTime: 15_000,
  });
