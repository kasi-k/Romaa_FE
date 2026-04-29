import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../services/api";


const fetchPenaltiesApi = async ({ queryKey }) => {
  const [_, tenderId] = queryKey;
  const response = await api.get(`/penalty/gettender/${tenderId}`);
  // Return the specific array from the nested response structure
  return response.data?.data?.penalties || [];
};

export const useTenderPenalties = (tenderId) => {
  return useQuery({
    queryKey: ["tender-penalties", tenderId], // Unique cache key
    queryFn: fetchPenaltiesApi,
    enabled: !!tenderId, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};