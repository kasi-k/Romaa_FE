import { useQuery, keepPreviousData, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

const fetchAllClients = async () => {
  const { data } = await api.get("/client/getallclientsdetails");
  return data.data || []; // Ensure it always returns an array
};

export const useAllClients = () => {
  return useQuery({
    queryKey: ["all-clients"], // Unique key for caching
    queryFn: fetchAllClients,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });
};

const fetchClients = async ({ queryKey }) => {
  const [_, params] = queryKey;

  const { data } = await api.get("/client/getclients", {
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

export const useClients = (queryParams) => {
  return useQuery({
    queryKey: ["clients", queryParams],
    queryFn: fetchClients,
    placeholderData: keepPreviousData, // Keeps table stable while loading next page
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};


const updateClientApi = async ({ id, payload }) => {
  // Use the centralized 'api' instance
  const { data } = await api.put(`/client/updateclient/${id}`, payload);
  return data;
};

export const useEditClient = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientApi,
    onSuccess: () => {
      toast.success("Client updated successfully ✅");
      // 1. Invalidate 'clients' to auto-refresh the table
      queryClient.invalidateQueries(["clients"]); 
      // 2. Trigger callbacks
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Update failed", error);
      toast.error(error.response?.data?.message || "Failed to update client");
    },
  });
};

const addClientApi = async (payload) => {
  const { data } = await api.post("/client/addclient", payload);
  return data;
};

export const useAddClient = ({ onSuccess, onClose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addClientApi,
    onSuccess: () => {
      toast.success("Client added successfully ✅");
      // Refresh the client list automatically
      queryClient.invalidateQueries(["clients"]); 
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Add failed", error);
      toast.error(error.response?.data?.message || "Failed to add client ❌");
    },
  });
};