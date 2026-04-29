import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "finance-attachments";

/* Build FormData from a plain object plus files. */
const buildFormData = ({ files = [], file, ...fields } = {}) => {
  const fd = new FormData();
  (Array.isArray(files) ? files : []).forEach((f) => fd.append("files", f));
  if (file) fd.append("file", file);
  Object.entries(fields).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
    else fd.append(k, v);
  });
  return fd;
};

/* Multi-file upload */
export const useUploadAttachments = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api
        .post("/finance/attachments/upload", buildFormData(payload), {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data?.data),
    onSuccess: (data, vars) => {
      toast.success("Files uploaded");
      qc.invalidateQueries({ queryKey: [QK] });
      if (vars?.source_type && (vars?.source_ref || vars?.source_no)) {
        qc.invalidateQueries({
          queryKey: [QK, "for-source", vars.source_type, vars.source_ref ?? vars.source_no],
        });
      }
      if (onSuccess) onSuccess(data);
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Upload failed")),
  });
};

/* Single-file upload */
export const useUploadAttachmentOne = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api
        .post("/finance/attachments/upload-one", buildFormData(payload), {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data?.data),
    onSuccess: (data, vars) => {
      toast.success("File uploaded");
      qc.invalidateQueries({ queryKey: [QK] });
      if (vars?.source_type && (vars?.source_ref || vars?.source_no)) {
        qc.invalidateQueries({
          queryKey: [QK, "for-source", vars.source_type, vars.source_ref ?? vars.source_no],
        });
      }
      if (onSuccess) onSuccess(data);
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Upload failed")),
  });
};

/* Attachments attached to a specific voucher/document */
export const useAttachmentsForSource = ({ source_type, source_ref, source_no, include_deleted = false }) =>
  useQuery({
    queryKey: [QK, "for-source", source_type, source_ref ?? source_no, include_deleted],
    queryFn: async () => {
      const { data } = await api.get("/finance/attachments/for-source", {
        params: { source_type, source_ref, source_no, include_deleted },
      });
      return data?.data || [];
    },
    enabled: !!source_type && (!!source_ref || !!source_no),
    staleTime: 30_000,
  });

/* Paginated global attachments list */
export const useAttachmentsList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/finance/attachments/list", { params: p });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

/* Generate a pre-signed S3 download URL */
export const useAttachmentDownloadUrl = () =>
  useMutation({
    mutationFn: async ({ id, expires_seconds = 3600 }) => {
      const { data } = await api.get(`/finance/attachments/${id}/download`, {
        params: { expires_seconds },
      });
      return data?.data;
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Failed to get download URL")),
  });

export const useAttachment = (id) =>
  useQuery({
    queryKey: [QK, "one", id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/attachments/${id}`);
      return data?.data;
    },
    enabled: !!id,
  });

export const useUpdateAttachment = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(`/finance/attachments/${id}`, payload).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Attachment updated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Update failed")),
  });
};

export const useDeleteAttachment = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hard_delete = false, reason }) =>
      api
        .delete(`/finance/attachments/${id}`, {
          params: { hard_delete },
          data: reason ? { reason } : undefined,
        })
        .then((r) => r.data),
    onSuccess: () => {
      toast.success("Attachment deleted");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Delete failed")),
  });
};

export const useRestoreAttachment = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.post(`/finance/attachments/${id}/restore`).then((r) => r.data?.data),
    onSuccess: () => {
      toast.success("Attachment restored");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Restore failed")),
  });
};
