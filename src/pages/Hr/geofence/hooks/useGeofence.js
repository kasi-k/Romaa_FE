import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

const fetchGeofences = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/geofence/list", {
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

export const useGeofences = (queryParams = {}) => {
  return useQuery({
    queryKey: ["geofences", queryParams],
    queryFn: fetchGeofences,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useCreateGeofence = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/geofence/create", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Geofence created successfully!");
      queryClient.invalidateQueries(["geofences"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create geofence");
    },
  });
};

export const useUpdateGeofence = ({ id, onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/geofence/update/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Geofence updated successfully!");
      queryClient.invalidateQueries(["geofences"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update geofence");
    },
  });
};

export const useDeleteGeofence = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/geofence/delete/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Geofence deleted successfully!");
      queryClient.invalidateQueries(["geofences"]);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete geofence");
    },
  });
};

export const useToggleGeofence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/geofence/toggle/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["geofences"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to toggle geofence");
    },
  });
};
