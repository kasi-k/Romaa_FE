import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";

export const useGRNProjects = (queryParams = {}) => {
  return useQuery({
    queryKey: ["grn-projects", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/material/grn/projects`, {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
          fromdate: queryParams.fromdate,
          todate: queryParams.todate,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};
