import { useQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../../../services/api";
import { useNavigate } from "react-router-dom";

// --- 1. Fetch Roles (paginated) ---
export const useRolesList = (queryParams = {}) => {
  return useQuery({
    queryKey: ["roles-list", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/role/list`, {
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

// --- 2. Mutation: Delete Role ---
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role_id) => {
      const { data } = await api.delete(`/role/delete/${role_id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Role deleted successfully");
      // Invalidate the cache to instantly update the table
      queryClient.invalidateQueries(["roles-list"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete role");
    },
  });
};

// AddRole.jsx

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/role/create`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Role created successfully!");
      // Invalidate roles list so the settings page shows the new role immediately
      queryClient.invalidateQueries(["roles-list"]);
      navigate("/settings/roles");
    },
    onError: (error) => {
      console.error("Payload Error:", error);
      toast.error(error.response?.data?.message || "Failed to create role");
    },
  });
};

//Edit Roles

// --- 1. Fetch Role Details ---
export const useRoleDetails = (roleId) => {
  return useQuery({
    queryKey: ["role-details", roleId],
    queryFn: async () => {
      const { data } = await api.get(`/role/getbyId/${roleId}`);
      return data?.data || null;
    },
    enabled: !!roleId, // Only fetch if a valid roleId exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// --- 2. Mutation: Update Role ---
export const useUpdateRole = (roleId) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/role/update/${roleId}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Role updated successfully!");
      // Invalidate both the list and this specific role's details
      queryClient.invalidateQueries(["roles-list"]);
      queryClient.invalidateQueries(["role-details", roleId]);
      navigate("/settings/roles");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });
};