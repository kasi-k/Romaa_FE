import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

// --- Fetch contractor with employees list ---
const fetchContractorWithEmployees = async (contractorId, tenderId) => {
  const { data } = await api.get(`/contractor/get/${contractorId}/employees/${tenderId}`);
  return data?.data || null;
};

export const useContractorEmployees = (contractorId, tenderId) => {
  return useQuery({
    queryKey: ["contractor-employees", contractorId, tenderId],
    queryFn: () => fetchContractorWithEmployees(contractorId, tenderId),
    enabled: !!contractorId && !!tenderId,
    staleTime: 0.1 * 60 * 1000,
  });
};

// --- DLP Summary (date-wise, paginated) ---
export const useDLPSummary = (projectId, queryParams = {}) => {
  return useQuery({
    queryKey: ["dlp-summary", projectId, queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/dlp/api/summary/${projectId}`, {
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
    enabled: !!projectId,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// --- DLP Reports by date ---
export const useDLPByDate = (projectId, reportDate) => {
  return useQuery({
    queryKey: ["dlp-by-date", projectId, reportDate],
    queryFn: async () => {
      const { data } = await api.get(`/dlp/api/report-date/${projectId}/${reportDate}`);
      return data?.data || [];
    },
    enabled: !!projectId && !!reportDate,
    staleTime: 60 * 1000,
  });
};

// --- DLP List for a project ---
export const useDLPList = (projectId, queryParams = {}) => {
  return useQuery({
    queryKey: ["dlp-list", projectId, queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/dlp/api/list/${projectId}`, {
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
    enabled: !!projectId,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// --- Create DLP Report ---
export const useCreateDLP = ({ onSuccess, onclose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/dlp/api/create", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Daily Labour Report created!");
      queryClient.invalidateQueries({ queryKey: ["dlp-list"] });
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create report");
    },
  });
};

// --- BOQ Items for work description dropdown ---
export const useBOQItems = (projectId) => {
  return useQuery({
    queryKey: ["boq-items", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/bid/getitemslite/${projectId}`);
      return data?.data?.items || [];
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// --- Bulk Create DLP Reports (multiple contractors) ---
export const useCreateBulkDLP = ({ onSuccess, onclose } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/dlp/api/bulk-create", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Daily Labour Reports submitted!");
      queryClient.invalidateQueries({ queryKey: ["dlp-list"] });
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit reports");
    },
  });
};
