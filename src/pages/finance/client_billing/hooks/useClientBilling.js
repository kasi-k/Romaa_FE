import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "client-billing";

/* Multipart FormData builder for CSV-upload flows */
const buildCsvFormData = (payload = {}) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === "file" && v instanceof File) fd.append("file", v);
    else if (Array.isArray(v) || typeof v === "object") fd.append(k, JSON.stringify(v));
    else fd.append(k, v);
  });
  return fd;
};

export const useClientBillingHistory = (tenderId) =>
  useQuery({
    queryKey: [QK, "history", tenderId],
    queryFn: async () => {
      const { data } = await api.get(`/clientbilling/history/${tenderId}`);
      return data?.data || [];
    },
    enabled: !!tenderId,
    staleTime: 30_000,
  });

export const useClientBillDetails = (tenderId, billId) =>
  useQuery({
    queryKey: [QK, "details", tenderId, billId],
    queryFn: async () => {
      const { data } = await api.get("/clientbilling/api/details", {
        params: { tender_id: tenderId, bill_id: billId },
      });
      return data?.data;
    },
    enabled: !!tenderId && !!billId,
    staleTime: 30_000,
  });

export const useClientBill = (tenderId, billId) =>
  useQuery({
    queryKey: [QK, "bill", tenderId, billId],
    queryFn: async () => {
      const { data } = await api.get("/clientbilling/api/bill", {
        params: { tender_id: tenderId, bill_id: billId },
      });
      return data?.data;
    },
    enabled: !!tenderId && !!billId,
    staleTime: 30_000,
  });

export const useUploadClientBillCsv = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api
        .post("/clientbilling/upload-csv", buildCsvFormData(payload), {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
    onSuccess: (_, vars) => {
      toast.success("Client bill uploaded");
      qc.invalidateQueries({ queryKey: [QK, "history", vars?.tender_id] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Upload failed")),
  });
};

export const useUpdateClientBillCsv = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bill_id, ...payload }) =>
      api
        .patch("/clientbilling/update-csv", buildCsvFormData(payload), {
          params: { bill_id },
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
    onSuccess: (_, vars) => {
      toast.success("Client bill updated");
      qc.invalidateQueries({ queryKey: [QK, "history", vars?.tender_id] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Update failed")),
  });
};

export const useDeleteClientBill = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bill_id }) =>
      api
        .delete("/clientbilling/api/delete", { params: { bill_id } })
        .then((r) => r.data),
    onSuccess: () => {
      toast.success("Client bill deleted");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Delete failed")),
  });
};

export const useApproveClientBill = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.patch(`/clientbilling/api/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Client bill approved");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to approve client bill")),
  });
};
