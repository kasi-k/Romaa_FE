import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "finance-archival";

export const useArchivalJobs = () =>
  useQuery({
    queryKey: [QK, "jobs"],
    queryFn: async () => {
      const { data } = await api.get("/finance/archival/jobs");
      return data?.data || [];
    },
    staleTime: 30_000,
  });

export const useArchivalStatus = (fin_year, { pollMs } = {}) =>
  useQuery({
    queryKey: [QK, "status", fin_year],
    queryFn: async () => {
      const { data } = await api.get(`/finance/archival/${fin_year}`);
      return data?.data;
    },
    enabled: !!fin_year,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      if (s === "running" || s === "pending") return pollMs || 3000;
      return false;
    },
  });

export const useStartArchival = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fin_year) =>
      api.post("/finance/archival/start", { fin_year }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Archival started");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to start archival")),
  });
};
