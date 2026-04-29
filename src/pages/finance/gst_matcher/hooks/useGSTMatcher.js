import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "gst-matcher";

export const useGSTMatcherList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/gst-matcher/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useGSTMatcherDetail = (id) =>
  useQuery({
    queryKey: [QK, "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/gst-matcher/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });

/* GSTR-2B upload — multipart/form-data. Optional from_date/to_date as query. */
export const useUploadGSTEntries = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, from_date, to_date }) => {
      const fd = new FormData();
      if (file) fd.append("file", file);
      return api
        .post("/gst-matcher/upload", fd, {
          params: { from_date, to_date },
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data?.data);
    },
    onSuccess: (data) => {
      toast.success(
        `Uploaded ${data?.rows_processed ?? data?.summary?.entry_count ?? 0} entries`
      );
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Upload failed")),
  });
};

export const useRunGSTMatch = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/gst-matcher/match", payload).then((r) => r.data?.data),
    onSuccess: (data) => {
      toast.success(`Match complete — ${data?.matched || 0} matched, ${data?.ambiguous || 0} ambiguous`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Match run failed")),
  });
};

/* Link: body is pass-through so both the spec shape { supplier_invoice_id, gstr2b_item_id }
   and the legacy shape { entry_index, bill_id } work. */
export const useLinkGSTEntry = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      api.post(`/gst-matcher/${id}/link`, body).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Entry linked to bill");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Link failed")),
  });
};

/* Unlink: pass { id, link_id } per spec or legacy { id, entry_index }. */
export const useUnlinkGSTEntry = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      api.post(`/gst-matcher/${id}/unlink`, body).then((r) => r.data),
    onSuccess: (_, { id }) => {
      toast.success("Entry unlinked");
      qc.invalidateQueries({ queryKey: [QK, "detail", id] });
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => toast.error(extractApiError(err, "Unlink failed")),
  });
};

export const useDeleteGSTUpload = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/gst-matcher/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Upload deleted");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Delete failed")),
  });
};
