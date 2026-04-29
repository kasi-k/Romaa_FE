import { useQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// User.jsx (paginated)
export const useUsers = (queryParams = {}) => {
  return useQuery({
    queryKey: ["users", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/employee/with-roles`, {
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


// AddUser.jsx

// --- 1. Fetch Unassigned Employees (paginated) ---
export const useUnassignedEmployees = (queryParams = {}) => {
  return useQuery({
    queryKey: ["unassigned-employees", queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/employee/unassigned`, {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// --- 2. Fetch Roles ---
export const useRolesDropdown = () => {
  return useQuery({
    queryKey: ["roles-dropdown"],
    queryFn: async () => {
      const { data } = await api.get(`/role/listForDropdown`);
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// --- 3. Mutation: Grant User Access ---
export const useGrantUserAccess = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, payload }) => {
      const { data } = await api.put(`/employee/update-access/${employeeId}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("User access granted successfully!");
      // Invalidate both the users list and unassigned employees so UI updates automatically
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["unassigned-employees"]);
      
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to grant access");
    },
  });
};

// EditUser.jsx

// --- 1. Mutation: Reassign User Role ---
export const useReassignUserRole = ({ onUpdated, onclose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/employee/role/re-assign`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("User access updated successfully!");
      // Invalidate the users table data so it refreshes instantly
      queryClient.invalidateQueries(["users"]);
      
      if (onUpdated) onUpdated();
      if (onclose) onclose();
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update access");
    },
  });
};

// --- 4. Mutation: Delete User ---
export const useRevokeUserAccess = ({ onDelete, onclose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/employee/role/re-assign`, payload);
      return data;
    },
    onSuccess: () => {
      // Refresh the tables
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["unassigned-employees"]);
      
      if (onDelete) onDelete();
      if (onclose) onclose();
    },
    onError: (error) => {
      console.error("Error revoking role:", error);
      toast.error(error.response?.data?.message || "Failed to revoke access");
    },
  });
};

// AssignSiteModal.jsx

export const useTendersForAssignment = () => {
  return useQuery({
    queryKey: ["tenders-list-minimal"], // Unique key for this specific dropdown data
    queryFn: async () => {
      const { data } = await api.get(`/tender/gettendersid`);
      return data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// viewUser.jsx


// --- 1. Fetch User Data ---
export const useUserData = (employeeId) => {
  return useQuery({
    queryKey: ["user-details", employeeId],
    queryFn: async () => {
      const { data } = await api.get(`/employee/getbyId/${employeeId}`);
      return data?.data || null;
    },
    enabled: !!employeeId, // Only fetch if an employeeId is present
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// --- 2. Mutation: Assign Sites to User ---
export const useAssignSitesToUser = (employeeId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedSiteIds) => {
      const { data } = await api.put(`/employee/assign-projects`, {
        employeeId: employeeId,
        assignedProject: selectedSiteIds,
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate the cache to instantly refresh the UI with new sites
      queryClient.invalidateQueries(["user-details", employeeId]);
      queryClient.invalidateQueries(["users"]); // Also refresh the main table if needed
      toast.success("Sites assigned successfully!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to assign sites");
    },
  });
};