import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../../../services/api"; // Adjust path to your axios instance
import { toast } from "react-toastify";

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

export const QUERY_KEYS = {
  TENDERS: "tenders",
  TENDER_SUMMARY: "tender-summary",
  EMD_LIST: "emd-list",
  EMD_TRACKING: "emd-tracking",
  SECURITY_DEPOSIT_LIST: "security-deposit-list",
  SD_TRACKING: "sd-tracking",
  PROJECT_PENALTY: "project-penalty",
};

const getErrorMessage = (error, defaultMsg) =>
  error?.response?.data?.message || defaultMsg;

const fetchEmdSdList = async (params) => {
  const { data } = await api.get("/tender/gettendersemdsd", {
    params: {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      fromdate: params?.fromdate,
      todate: params?.todate,
    },
  });
  return data;
};

// ============================================================================
// RATE ANALYSIS & SUMMARY MODULE
// ============================================================================

export const useTenderSummary = (tenderId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TENDER_SUMMARY, tenderId],
    queryFn: async () => {
      const { data } = await api.get(`/rateanalysis/getsummary/${tenderId}`);
      return data.data;
    },
    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinalizeEstimate = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenderId) => {
      const response = await api.put(`/rateanalysis/freeze/${tenderId}`);
      return response.data;
    },
    onSuccess: (data, tenderId) => {
      // 1. Close modal instantly for a snappy UI
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();

      // 2. Show success toast
      toast.success("Zero Cost Estimate finalized successfully ✅");

      // 3. Update the cache to reflect the locked state
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENDER_SUMMARY, tenderId] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to finalize estimate ❌")),
  });
};

// ============================================================================
// TENDER CRUD MODULE
// ============================================================================

export const useTenders = (queryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TENDERS, queryParams],
    queryFn: async () => {
      const { data } = await api.get("/tender/gettenders", { params: queryParams });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useAddTender = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenderData) => {
      const { data } = await api.post("/tender/addtender", tenderData);
      return data;
    },
    onSuccess: () => {
      toast.success("Tender created successfully ✅");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENDERS] });
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create tender")),
  });
};

export const useEditTender = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/tender/updatetender/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tender updated successfully ✅");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENDERS] });
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update tender")),
  });
};

// ============================================================================
// EMD & SECURITY DEPOSIT MODULE
// ============================================================================

export const useEMD = (queryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMD_LIST, queryParams],
    queryFn: () => fetchEmdSdList(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useEditEMD = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenderId, data }) => {
      const response = await api.post(`/tender/updateemdamount/${tenderId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("EMD updated successfully ✅");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMD_LIST] });
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update EMD")),
  });
};

export const useEMDTracking = (tenderId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMD_TRACKING, tenderId],
    queryFn: async () => {
      const { data } = await api.get(`/tender/emdtracking/${tenderId}`);
      return data; 
    },
    select: (response) => {
      // Just extract the array, keep the raw snake_case keys for the Table
      return response?.data || [];
    },
    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSecurityDeposit = (queryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SECURITY_DEPOSIT_LIST, queryParams],
    queryFn: () => fetchEmdSdList(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useEditSecurityDeposit = ({ onSuccess, onClose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenderId, data }) => {
      const response = await api.post(`/tender/securitydepositamount/${tenderId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Security Deposit updated successfully ✅");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SECURITY_DEPOSIT_LIST] });
      if (typeof onSuccess === 'function') onSuccess();
      if (typeof onClose === 'function') onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update Security Deposit")),
  });
};

export const useSecurityDepositTracking = (tenderId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SD_TRACKING, tenderId],
    queryFn: async () => {
      const { data } = await api.get(`/tender/securitydeposittracking/${tenderId}`);
      return data || [];
    },
    select: (response) => {
      // Just extract the array, keep the raw snake_case keys for the Table
      return response?.data || [];
    },
    enabled: !!tenderId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// PENALTY MODULE
// ============================================================================

export const useProjectPenalty = (queryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROJECT_PENALTY, queryParams],
    queryFn: async () => {
      const { data } = await api.get("/tender/gettendersworkorder", { params: queryParams });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};