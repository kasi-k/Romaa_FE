import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api, extractApiError } from "../../../../services/api";

const KEY = {
  list: "bulk-inventory",
  detail: "bulk-inventory-detail",
  lowStock: "bulk-inventory-low-stock",
  txns: "bulk-inventory-txns",
};

export const useBulkInventoryList = (params = {}) =>
  useQuery({
    queryKey: [KEY.list, params],
    queryFn: async () => {
      const { data } = await api.get("/bulkinventory/getall", { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useBulkInventoryDetail = (itemId) =>
  useQuery({
    queryKey: [KEY.detail, itemId],
    queryFn: async () => {
      const { data } = await api.get(`/bulkinventory/getbyid/${itemId}`);
      return data?.data || null;
    },
    enabled: !!itemId,
    staleTime: 30 * 1000,
  });

export const useBulkLowStock = () =>
  useQuery({
    queryKey: [KEY.lowStock],
    queryFn: async () => {
      const { data } = await api.get("/bulkinventory/low-stock");
      return data?.data || data || [];
    },
    staleTime: 60 * 1000,
  });

export const useBulkTransactions = (params = {}) =>
  useQuery({
    queryKey: [KEY.txns, params],
    queryFn: async () => {
      const { data } = await api.get("/bulkinventory/transactions", { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: [KEY.list] });
  qc.invalidateQueries({ queryKey: [KEY.lowStock] });
  qc.invalidateQueries({ queryKey: [KEY.txns] });
};

export const useCreateBulkItem = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/bulkinventory/create", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Item created");
      invalidateAll(qc);
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to create item")),
  });
};

export const useUpdateBulkItem = ({ onDone } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, payload }) => {
      const { data } = await api.put(`/bulkinventory/update/${itemId}`, payload);
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Item updated");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, vars.itemId] });
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to update item")),
  });
};

export const useToggleBulkItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId) => {
      const { data } = await api.patch(`/bulkinventory/toggle-active/${itemId}`);
      return data;
    },
    onSuccess: (data, itemId) => {
      toast.success(data?.message || "Item toggled");
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: [KEY.detail, itemId] });
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to toggle item")),
  });
};

// Movement endpoints (one hook factory; just pass the kind)
const MOVEMENT_KINDS = [
  "receive",
  "issue",
  "return",
  "transfer",
  "damage",
  "scrap",
  "adjustment",
];

export const useBulkMovement = (kind, { onDone } = {}) => {
  if (!MOVEMENT_KINDS.includes(kind)) {
    throw new Error(`Invalid movement kind: ${kind}`);
  }
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/bulkinventory/movement/${kind}`, payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Movement posted");
      invalidateAll(qc);
      // refresh detail too — caller can pass itemId via the payload
      qc.invalidateQueries({ queryKey: [KEY.detail] });
      onDone?.(data?.data);
    },
    onError: (err) => toast.error(extractApiError(err, "Movement failed")),
  });
};
