import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// --- Paginated List ---
const fetchContractors = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await api.get("/contractor/contractorlist", {
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

export const useContractors = (queryParams) => {
  return useQuery({
    queryKey: ["contractors", queryParams],
    queryFn: fetchContractors,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// --- Dropdown (select list) — returns full objects with assigned_projects & wage_fixing ---
export const useContractorsDropdown = () => {
  return useQuery({
    queryKey: ["contractors-dropdown"],
    queryFn: async () => {
      const { data } = await api.get("/contractor/getallselect");
      return (data?.data || []).map((c) => ({
        value: c.contractor_id,
        label: `${c.contractor_name || c.company_name || ""} (${c.contractor_id})`,
        assigned_projects: c.assigned_projects || [],
        wage_fixing: c.wage_fixing || [],
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useContractorsDropdownTenderWise = (tenderId) => {
  return useQuery({
    queryKey: ["contractors-dropdown-tender-wise", tenderId],
    queryFn: async () => {
      const { data } = await api.get(`/contractor/getallselectbyproject/${tenderId}`);
      return (data?.data || []).map((c) => ({
        value: c.contractor_id,
        label: `${c.contractor_name || c.company_name || ""} (${c.contractor_id})`,
        assigned_projects: c.assigned_projects || [],
        wage_fixing: c.wage_fixing || [],
      }));
    },
    enabled: !!tenderId,
    staleTime: 0.1 * 60 * 1000, // 6 seconds
  });
};


// --- Create Contractor ---
export const useCreateContractor = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/contractor/add", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Contractor created successfully!");
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create contractor");
    },
  });
};

// --- Edit Contractor ---
export const useEditContractor = ({ contractorId, onUpdated, onclose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/contractor/update/${contractorId}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Contractor updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      if (onUpdated) onUpdated();
      if (onclose) {
        onclose();
      } else {
        navigate(-1);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update contractor");
    },
  });
};

// --- Delete Contractor ---
export const useDeleteContractor = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractorId) => {
      const { data } = await api.delete(`/contractor/delete/${contractorId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Contractor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete contractor");
    },
  });
};

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
