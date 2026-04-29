import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "advance";

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export const useAdvanceOutstandingPaid = (params = {}) =>
  useQuery({
    queryKey: [QK, "outstanding-paid", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/advance/outstanding/paid", { params: p });
      return toArray(data?.data ?? data?.rows ?? data?.advances);
    },
    staleTime: 30_000,
  });

export const useAdvanceOutstandingReceived = (params = {}) =>
  useQuery({
    queryKey: [QK, "outstanding-received", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/advance/outstanding/received", { params: p });
      return toArray(data?.data ?? data?.rows ?? data?.advances);
    },
    staleTime: 30_000,
  });

export const useAdvanceSummary = (params = {}) =>
  useQuery({
    queryKey: [QK, "summary", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/advance/summary", { params: p });
      const raw = data?.data ?? data;
      return Array.isArray(raw) ? raw[0] : raw;
    },
    staleTime: 30_000,
  });

export const useAdvanceOnVoucher = (id) =>
  useQuery({
    queryKey: [QK, "voucher", id],
    queryFn: async () => {
      const { data } = await api.get(`/advance/voucher/${id}`);
      return data?.data || [];
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useAdvanceOnBill = (id) =>
  useQuery({
    queryKey: [QK, "bill", id],
    queryFn: async () => {
      const { data } = await api.get(`/advance/bill/${id}`);
      return data?.data || [];
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useAllocateAdvance = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/advance/allocate", payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Advance allocated successfully");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Allocation failed")),
  });
};

export const useUnallocateAdvance = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ allocation_id }) => api.post("/advance/unallocate", { allocation_id }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Allocation reversed");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Unallocate failed")),
  });
};
