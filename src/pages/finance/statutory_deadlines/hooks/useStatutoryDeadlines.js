import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "statutory-deadlines";

export const useStatutoryCalendar = (params = {}) =>
  useQuery({
    queryKey: [QK, "calendar", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/statutory-deadlines/calendar", { params: p });
      return data?.data || [];
    },
    enabled: !!params.financial_year,
    staleTime: 60_000,
  });

export const useStatutoryUpcoming = (params = {}) =>
  useQuery({
    queryKey: [QK, "upcoming", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/statutory-deadlines/upcoming", { params: p });
      return data?.data || [];
    },
    staleTime: 60_000,
  });

export const useStatutoryFilings = (params = {}) =>
  useQuery({
    queryKey: [QK, "filings", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/statutory-deadlines/filings", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useMarkFiled = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/statutory-deadlines/filings", payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Filing recorded");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to record filing")),
  });
};

export const useDeleteFiling = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/statutory-deadlines/filings/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Filing removed");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Delete failed")),
  });
};
