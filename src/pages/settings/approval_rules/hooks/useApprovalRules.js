import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, extractApiError } from "../../../../services/api";

const QK = "approval-rules-v2";

// --- 1. List all rules (optionally filter by source_type) ---
export const useApprovalRulesList = (source_type) =>
  useQuery({
    queryKey: [QK, "list", source_type || "all"],
    queryFn: async () => {
      const { data } = await api.get("/approval/rules", {
        params: source_type ? { source_type } : undefined,
      });
      return data?.data || [];
    },
    staleTime: 60_000,
  });

// --- 2. Get a single rule by source_type ---
export const useApprovalRule = (source_type) =>
  useQuery({
    queryKey: [QK, "one", source_type],
    queryFn: async () => {
      const { data } = await api.get(`/approval/rules/${source_type}`);
      return data?.data || null;
    },
    enabled: !!source_type,
    staleTime: 60_000,
  });

// --- 3. Upsert rule (POST /approval/rules) ---
export const useSaveApprovalRule = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/approval/rules", payload);
      return data?.data;
    },
    onSuccess: () => {
      toast.success("Approval rule saved");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to save rule")),
  });
};

// --- 4. Soft-deactivate a rule ---
export const useDeactivateApprovalRule = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (source_type) => {
      const { data } = await api.delete(`/approval/rules/${source_type}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Approval rule deactivated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to deactivate rule")),
  });
};

// --- 5. Simulator (dry-run) ---
export const useSimulateApproval = ({ onSuccess } = {}) =>
  useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/approval/rules/simulate", payload);
      return data?.data;
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Simulation failed")),
  });

// --- 6. Employee list (for USERS strategy picker) ---
export const useEmployeesForApproval = (queryParams = {}) =>
  useQuery({
    queryKey: ["employees-approval", queryParams],
    queryFn: async () => {
      const { data } = await api.get("/employee/with-roles", {
        params: {
          page: queryParams.page || 1,
          limit: queryParams.limit || 20,
          search: queryParams.search || "",
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

// --- 7. Role dropdown (for ROLE strategy picker) ---
export const useRolesForApproval = () =>
  useQuery({
    queryKey: ["roles-approval-dropdown"],
    queryFn: async () => {
      const { data } = await api.get("/role/listForDropdown");
      return data?.data || [];
    },
    staleTime: 5 * 60_000,
  });
