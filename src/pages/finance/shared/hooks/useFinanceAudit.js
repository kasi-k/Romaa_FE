import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";

const QK = "finance-audit";

/* Global audit trail — paginated */
export const useFinanceAuditList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/finance/audit", { params: p });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/* Change history for a specific voucher / document */
export const useFinanceAuditForEntity = (entity_type, entity_id) =>
  useQuery({
    queryKey: [QK, "entity", entity_type, entity_id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/audit/${entity_type}/${entity_id}`);
      return data?.data || [];
    },
    enabled: !!entity_type && !!entity_id,
    staleTime: 30_000,
  });
