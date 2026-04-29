import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, extractApiError } from "../../../../services/api";
import { toast } from "react-toastify";

const QK = "client-credit-note";

export const useClientCreditNotes = (params = {}) =>
  useQuery({
    queryKey: [QK, "list", params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const { data } = await api.get("/clientcreditnote/list", { params: p });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useClientCreditNote = (id) =>
  useQuery({
    queryKey: [QK, "one", id],
    queryFn: async () => {
      const { data } = await api.get(`/clientcreditnote/${id}`);
      return data?.data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });

export const useCreateClientCreditNote = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.post("/clientcreditnote/create", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Client credit note created");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Create failed")),
  });
};

export const useUpdateClientCreditNote = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(`/clientcreditnote/update/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Client credit note updated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Update failed")),
  });
};

export const useDeleteClientCreditNote = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.delete(`/clientcreditnote/delete/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Client credit note deleted");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Delete failed")),
  });
};

export const useApproveClientCreditNote = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.patch(`/clientcreditnote/approve/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Client credit note approved");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Approval failed")),
  });
};

export const useUpdateClientCreditNoteStatus = ({ onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/clientcreditnote/status/${id}`, { status }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: [QK] });
      if (onSuccess) onSuccess();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Status update failed")),
  });
};
