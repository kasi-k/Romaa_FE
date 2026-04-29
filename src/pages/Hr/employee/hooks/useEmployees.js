import { useQuery, keepPreviousData,useMutation, useQueryClient} from "@tanstack/react-query";
import { api } from "../../../../services/api"; 
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const fetchEmployees = async ({ queryKey }) => {
  const [_, params] = queryKey;

  const { data } = await api.get("/employee/list", {
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

export const useEmployees = (queryParams) => {
  return useQuery({
    queryKey: ["employees", queryParams],
    queryFn: fetchEmployees,
    placeholderData: keepPreviousData, // Keeps table stable while loading next page
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};



// --- 1. Fetch Managers for Dropdown ---
export const useManagersDropdown = () => {
  return useQuery({
    queryKey: ["managers-dropdown"],
    queryFn: async () => {
      const { data } = await api.get(`/employee/assigned`);
      // Format the data for the SearchableSelect immediately
      return (data?.data || []).map((emp) => ({
        value: emp._id,
        label: `${emp.name} (${emp.employeeId})`
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// --- 2. Mutation: Create Employee ---
export const useCreateEmployee = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/employee/register`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Employee onboarded successfully!");
      // Invalidate the employees list so the main table updates automatically
      queryClient.invalidateQueries(["employees"]);
      
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create employee");
    },
  });
};

//Edit Employee

// --- 1. Mutation: Edit Employee ---
export const useEditEmployee = ({ employeeId, onUpdated, onclose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/employee/update/${employeeId}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Employee details updated successfully");
      
      // Invalidate the employees list so tables update instantly
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["user-details"]); // If you have a detail view cached

      if (onUpdated) onUpdated();
      if (onclose) {
          onclose();
      } else {
          navigate(-1); 
      }
    },
    onError: (error) => {
      console.error("Update failed", error);
      toast.error(error.response?.data?.message || "Failed to update employee.");
    },
  });
};