import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

const fetchDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data.data;
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 0.1 * 60 * 1000, // 6 seconds
    refetchOnWindowFocus: true,
  });
};
