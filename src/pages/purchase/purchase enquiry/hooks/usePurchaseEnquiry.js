import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";

export const usePurchaseEnquiries = (queryParams = {}) => {
  return useQuery({
    queryKey: ["purchase-enquiries", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/purchaseorderrequest/api/getbyIdQuotationRequested`, {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
          fromdate: queryParams.fromdate,
          todate: queryParams.todate,
          ...(queryParams.approval_type ? { approval_type: queryParams.approval_type } : {}),
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};
