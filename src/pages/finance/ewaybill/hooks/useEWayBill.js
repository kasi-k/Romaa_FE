import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "ewaybill";

export const useEWayBillList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/ewaybill/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1, totalCount: data?.totalCount || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useEWayBillDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/ewaybill/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

export const useGenerateEWayBill = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/ewaybill/generate", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`E-Way Bill generated: ${data?.ewb_no || ""}`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Failed to generate E-Way Bill")),
  });
};

export const useUpdatePartB = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.post(`/ewaybill/${id}/part-b`, payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Part B (vehicle) updated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Part B update failed")),
  });
};

export const useCancelEWayBill = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => api.post(`/ewaybill/${id}/cancel`, { reason }).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("E-Way Bill cancelled");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Cancellation failed")),
  });
};

/* Mark an E-Way Bill as expired (moves to expired state without cancel). */
export const useMarkEWayBillExpired = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ewb_id, reason }) =>
      api.post("/ewaybill/mark-expired", { ewb_id, reason }).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("E-Way Bill marked expired");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Mark expired failed")),
  });
};

/* Lookup by the public EWB number. */
export const useEWayBillByNo = (ewb_no) =>
  useQuery({
    queryKey: [QK, "by-ewb-no", ewb_no],
    queryFn: async () => {
      const { data } = await api.get(`/ewaybill/by-ewb-no/${ewb_no}`);
      return data?.data;
    },
    enabled: !!ewb_no,
    staleTime: 60_000,
  });
