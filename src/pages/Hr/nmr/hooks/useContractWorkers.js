import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// --- Paginated List ---
const fetchContractWorkers = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/contractworker/getcontractworker", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      fromdate: params.fromdate,
      todate: params.todate,
    },
  });
  return data;
};

export const useContractWorkers = (queryParams) => {
  return useQuery({
    queryKey: ["contract-workers", queryParams],
    queryFn: fetchContractWorkers,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// --- Create Worker ---
export const useCreateContractWorker = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/contractworker/addworker", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Contract worker created successfully!");
      queryClient.invalidateQueries({ queryKey: ["contract-workers"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create contract worker");
    },
  });
};

// --- Edit Worker ---
export const useEditContractWorker = ({ workerId, onUpdated, onclose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/contractworker/updateworker/${workerId}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Contract worker updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contract-workers"] });
      if (onUpdated) onUpdated();
      if (onclose) {
        onclose();
      } else {
        navigate(-1);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update contract worker");
    },
  });
};

// --- Delete Worker ---
export const useDeleteContractWorker = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workerId) => {
      const { data } = await api.delete(`/contractworker/deleteworker/${workerId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Contract worker deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contract-workers"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete contract worker");
    },
  });
};
