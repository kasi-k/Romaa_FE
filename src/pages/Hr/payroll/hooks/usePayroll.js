import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../../../../services/api";
import { toast } from "react-toastify";

export const usePayrollList = (queryParams = {}) => {
  return useQuery({
    queryKey: ["payroll-list", queryParams],
    queryFn: async () => {
      const { data } = await api.get("/payroll/monthly-run", {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
          fromdate: queryParams.fromdate,
          todate: queryParams.todate,
          month: queryParams.month,
          year: queryParams.year,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    enabled: !!(queryParams.month && queryParams.year),
  });
};

export const useEmployeePayslips = (employeeId, queryParams = {}) => {
  return useQuery({
    queryKey: ["payslips", employeeId, queryParams],
    queryFn: async () => {
      const { data } = await api.get(`/payroll/employee/${employeeId}`, {
        params: {
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
          fromdate: queryParams.fromdate,
          todate: queryParams.todate,
          year: queryParams.year,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    enabled: !!employeeId,
  });
};

export const useGeneratePayroll = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/payroll/generate", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Payroll generated successfully!");
      queryClient.invalidateQueries(["payroll-list"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to generate payroll");
    },
  });
};

export const useBulkGeneratePayroll = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/payroll/bulk-generate", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Bulk payroll generation initiated!");
      queryClient.invalidateQueries(["payroll-list"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to bulk generate payroll");
    },
  });
};

export const useUpdatePayrollStatus = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/payroll/status/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Payroll status updated!");
      queryClient.invalidateQueries(["payroll-list"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update payroll status");
    },
  });
};

export const useSetPayrollTDS = ({ onSuccess, onclose }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, taxAmount }) => {
      const { data } = await api.put(`/payroll/tax/${id}`, { taxAmount });
      return data;
    },
    onSuccess: () => {
      toast.success("TDS updated. Net pay recalculated.");
      queryClient.invalidateQueries(["payroll-list"]);
      if (onSuccess) onSuccess();
      if (onclose) onclose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update TDS");
    },
  });
};

export const useExportPayrollExcel = () => {
  return useMutation({
    mutationFn: async ({ month, year }) => {
      const response = await api.get("/payroll/export-excel", {
        params: { month, year },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payroll-${month}-${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success("Payroll exported successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to export payroll");
    },
  });
};
