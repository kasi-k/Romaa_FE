import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";

export const useHsnList = (queryParams = {}) => {
  return useQuery({
    queryKey: ["hsn-list", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/hsn/getall`, {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};
