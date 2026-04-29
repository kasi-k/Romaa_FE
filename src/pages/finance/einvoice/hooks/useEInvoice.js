import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "einvoice";

export const useEInvoiceList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/einvoice/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useEInvoiceDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/einvoice/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useGenerateEInvoice = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/einvoice/generate", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(data?.already_generated ? "E-Invoice already exists — IRN retrieved" : "E-Invoice generated successfully");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to generate E-Invoice")),
  });
};

export const useCancelEInvoice = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => api.post(`/einvoice/${id}/cancel`, { reason }).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("E-Invoice cancelled");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Cancellation failed")),
  });
};

export const useEInvoiceByIRN = (irn) =>
  useQuery({
    queryKey: [QK, "by-irn", irn],
    queryFn: async () => {
      const { data } = await api.get(`/einvoice/by-irn/${irn}`);
      return data?.data;
    },
    enabled: !!irn,
    staleTime: 60_000,
  });

export const useEInvoiceQR = (id) =>
  useQuery({
    queryKey: [QK, "qr", id],
    queryFn: async () => {
      const { data } = await api.get(`/einvoice/${id}/qr`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 300_000,
  });
