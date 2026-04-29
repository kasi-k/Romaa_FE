import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "form26as";

export const useForm26ASList = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/form26as/list", { params: p });
      return { data: data?.data || [], totalPages: data?.totalPages || 1 };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useForm26ASReconcile = (params = {}) =>
  useQuery({
    queryKey: [QK, "reconcile", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/form26as/reconcile", { params: p });
      return data?.data;
    },
    enabled: !!params.financial_year,
    staleTime: 30_000,
  });

/* Upload is multipart/form-data: fields { file, financial_year, section } */
export const useUploadForm26AS = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, financial_year, section }) => {
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (financial_year) fd.append("financial_year", financial_year);
      if (section) fd.append("section", section);
      return api
        .post("/form26as/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data?.data);
    },
    onSuccess: (data) => {
      toast.success(`Uploaded: ${data?.inserted || 0} new, ${data?.skipped || 0} skipped`);
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Upload failed")),
  });
};

export const useDeleteForm26AS = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/form26as/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Entry deleted");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractApiError(err, "Delete failed")),
  });
};
