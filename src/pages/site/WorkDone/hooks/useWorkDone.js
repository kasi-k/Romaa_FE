import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// ── Fetchers ────────────────────────────────────────────────────────────────

const fetchWorkDoneList = async (tenderId, params) => {
  const { data } = await api.get(`/workdone/api/list/${tenderId}`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
};

const fetchWorkDoneDetail = async (id) => {
  const { data } = await api.get(`/workdone/api/details/${id}`);
  return data?.data || null;
};

const createWorkDone = async (payload) => {
  const { data } = await api.post("/workdone/api/create", payload);
  return data;
};

const deleteWorkDone = async (id) => {
  const { data } = await api.delete(`/workdone/api/delete/${id}`);
  return data;
};

// ── Hooks ───────────────────────────────────────────────────────────────────

export const useWorkDoneList = (tenderId, queryParams = {}) => {
  return useQuery({
    queryKey: ["workdone-list", tenderId, queryParams],
    queryFn: () => fetchWorkDoneList(tenderId, queryParams),
    enabled: !!tenderId,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useWorkDoneDetail = (id) => {
  return useQuery({
    queryKey: ["workdone-detail", id],
    queryFn: () => fetchWorkDoneDetail(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};

export const useAddWorkDone = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workdone-list"] });
      toast.success("Work Done report created");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create report");
    },
  });
};

export const useDeleteWorkDone = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workdone-list"] });
      toast.success("Report deleted");
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete report");
    },
  });
};

export const useBOQItems = (projectId) => {
  return useQuery({
    queryKey: ["boq-items", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/bid/getitemslite/${projectId}`);
      return data?.data?.items || [];
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
