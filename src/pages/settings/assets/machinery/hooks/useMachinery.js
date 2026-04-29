import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../../services/api";
import { toast } from "react-toastify";

export const useMachineryList = (queryParams = {}) => {
  return useQuery({
    queryKey: ["machinery-list", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/machineryasset/getall/assets`, {
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

export const useTendersApproved = () => {
  return useQuery({
    queryKey: ["tenders-approved-for-transfer"],
    queryFn: async () => {
      const { data } = await api.get(`/tender/gettenders`, { params: { page: 1, limit: 1000 } });
      return (data?.data || []).filter((t) => t.tender_status === "APPROVED");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateMachineryStatus = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assetId, payload }) => {
      const { data } = await api.put(`/machineryasset/status/${assetId}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      qc.invalidateQueries({ queryKey: ["machinery-list"] });
      if (onDone) onDone();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });
};

export const useTransferMachinery = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assetId, payload }) => {
      const { data } = await api.put(`/machineryasset/transfer/${assetId}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Asset transferred successfully");
      qc.invalidateQueries({ queryKey: ["machinery-list"] });
      if (onDone) onDone();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Transfer failed"),
  });
};
